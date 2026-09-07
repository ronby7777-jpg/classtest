const {app,BrowserWindow,ipcMain,dialog,screen,Menu,Tray,nativeImage,session,protocol,net,Notification} = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {randomUUID} = require('node:crypto');
const {normalize,bounds} = require('./model.cjs');
const {Pomodoro} = require('./pomodoro.cjs');
let pomodoro,pomodoroStore,pomodoroTimer;
function savePomodoro(){fs.writeFileSync(pomodoroStore+'.tmp',JSON.stringify(pomodoro.snapshot()));fs.renameSync(pomodoroStore+'.tmp',pomodoroStore);}
function updatePomodoro(){
  if(pomodoro.tick()){
    savePomodoro();
    if(Notification.isSupported()){const note=new Notification({title:'Pocket Pet · 番茄鐘',body:pomodoro.notice});note.on('click',openSettings);note.show();}
  }
  const state=pomodoro.snapshot();send('pomodoro',state);
  const seconds=Math.ceil(state.remainingMs/1000);
  tray?.setToolTip('Pocket Pet · '+({focus:'專注',short:'短休息',long:'長休息'}[state.phase])+' '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+(state.running?'':'（已暫停）'));
}
protocol.registerSchemesAsPrivileged([{scheme:'pet-asset',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
let pet,settings,tray,config,store,assetsDir,timer,paused=false,x=0,direction=1,mode='idle',until=0,last=0;
if(process.platform==='win32')app.setAppUserModelId('com.classtest.pocketpet');
const single=app.requestSingleInstanceLock();
if(!single) app.quit();
app.on('second-instance',()=>openSettings());
const send=(channel,data)=>[pet,settings].forEach(w=>{if(w&&!w.isDestroyed())w.webContents.send(channel,data);});
const assetURL = file => file ? 'pet-asset://local/'+encodeURIComponent(path.basename(file)) : null;
function snapshot(){return {...config,assets:Object.fromEntries(Object.entries(config.assets).map(([k,v])=>[k,assetURL(v)])),random:config.random.map(r=>({...r,file:assetURL(r.file)})),paused,displays:screen.getAllDisplays().map((d,i)=>({id:d.id,name:d.label||`螢幕 ${i+1}`,width:d.workArea.width,height:d.workArea.height}))};}
function persist(){fs.mkdirSync(path.dirname(store),{recursive:true});fs.writeFileSync(store+'.tmp',JSON.stringify(config,null,2));fs.renameSync(store+'.tmp',store);send('state',snapshot());}
function area(){const d=screen.getAllDisplays().find(d=>d.id===config.displayId)||screen.getPrimaryDisplay();return bounds(config,d.workArea);}
function place(reset=false){if(!pet)return;const b=area();x=reset?(b.left+b.right)/2:Math.max(b.left,Math.min(b.right,x));pet.setBounds({x:Math.round(x),y:b.y,width:b.size,height:b.size});}
function action(name,duration,file=null){mode=name;until=Date.now()+duration;send('action',{name,direction,file:assetURL(file),sound:(name==='pat'||name==='random')&&Math.random()*100<config.soundChance});}
function tick(){const now=Date.now(),dt=Math.min(.1,(now-last)/1000);last=now;if(paused){if(mode==='pat'&&now>=until)action('idle',2000);return;}
  if(now>=until){if(mode==='walk'){const choices=config.random.filter(r=>r.file);if(choices.length&&Math.random()<.45){const r=choices[Math.floor(Math.random()*choices.length)];action('random',r.duration*1000,r.file);}else action('idle',1500+Math.random()*2500);}else {direction=Math.random()<.5?-1:1;action('walk',2500+Math.random()*5500);}}
  if(mode==='walk'){const b=area();x+=direction*config.speed*dt;if(x<=b.left||x>=b.right){direction*=-1;x=Math.max(b.left,Math.min(b.right,x));send('action',{name:'walk',direction});}place();}
}
function windowOptions(extra){return {...extra,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}};}
function openSettings(){if(settings&&!settings.isDestroyed()){settings.show();settings.focus();return;}settings=new BrowserWindow(windowOptions({width:1060,height:840,minWidth:780,minHeight:640,backgroundColor:'#f5f3ee',title:'Pocket Pet · 桌寵工作室',autoHideMenuBar:true}));settings.loadFile(path.join(__dirname,'ui/settings.html'));settings.on('closed',()=>settings=null);}
function trusted(event){return [pet,settings].some(w=>w&&!w.isDestroyed()&&w.webContents===event.sender);}
const handle=(name,fn)=>ipcMain.handle(name,async(e,...args)=>{if(!trusted(e))throw Error('Unauthorized');return fn(...args);});
function safeFile(value){if(typeof value!=='string')return null;const name=value.startsWith('pet-asset://local/')?decodeURIComponent(value.slice(18)):path.basename(value);const full=path.join(assetsDir,path.basename(name));return fs.existsSync(full)?full:null;}
app.whenReady().then(()=>{
  pomodoroStore=path.join(app.getPath('userData'),'pomodoro.json');
  try{pomodoro=new Pomodoro(JSON.parse(fs.readFileSync(pomodoroStore,'utf8')));}catch{pomodoro=new Pomodoro();}
  store=path.join(app.getPath('userData'),'settings.json');assetsDir=path.join(app.getPath('userData'),'assets');fs.mkdirSync(assetsDir,{recursive:true});
  try{config=normalize(JSON.parse(fs.readFileSync(store,'utf8')));}catch{config=normalize();}
  protocol.handle('pet-asset',request=>{const u=new URL(request.url);const name=decodeURIComponent(u.pathname.slice(1));if(u.hostname!=='local'||name!==path.basename(name))return new Response('Forbidden',{status:403});return net.fetch(pathToFileURL(path.join(assetsDir,name)).href);});
  session.defaultSession.setPermissionRequestHandler((contents,permission,callback)=>callback(contents===settings?.webContents&&permission==='media'));
  session.defaultSession.setPermissionCheckHandler((contents,permission)=>contents===settings?.webContents&&permission==='media');
  app.on('web-contents-created',(_,contents)=>{contents.setWindowOpenHandler(()=>({action:'deny'}));contents.on('will-navigate',e=>e.preventDefault());});
  pet=new BrowserWindow(windowOptions({width:150,height:150,frame:false,transparent:true,alwaysOnTop:true,resizable:false,skipTaskbar:true,hasShadow:false,focusable:false}));
  pet.setAlwaysOnTop(true,'screen-saver');pet.loadFile(path.join(__dirname,'ui/pet.html'));place(true);
  pet.webContents.on('did-finish-load',()=>{send('state',snapshot());action('idle',2000);});
  pet.on('closed',()=>{pet=null;app.quit();});
  const icon=nativeImage.createFromPath(path.join(__dirname,'ui/tray.png'));
  tray=new Tray(icon);tray.setToolTip('Pocket Pet · 你的桌面小夥伴');
  const toggle=()=>{paused=!paused;action('idle',2000);send('state',snapshot());return paused;};
  tray.setContextMenu(Menu.buildFromTemplate([{label:'開啟桌寵工作室',click:openSettings},{label:'暫停／繼續散步',click:toggle},{type:'separator'},{label:'結束桌寵',click:()=>app.quit()}]));tray.on('double-click',openSettings);
  handle('pomodoro:get',()=>{updatePomodoro();return pomodoro.snapshot();});
  handle('pomodoro:command',(action,value)=>{updatePomodoro();const state=pomodoro.command(action,value);savePomodoro();send('pomodoro',state);return state;});
  pomodoroTimer=setInterval(updatePomodoro,250);
  handle('get',()=>snapshot());handle('pause',toggle);
  handle('save',raw=>{const next=normalize(raw);next.assets=Object.fromEntries(Object.entries(next.assets).map(([k,v])=>[k,safeFile(v)]));next.random=next.random.map(r=>({...r,file:safeFile(r.file)}));config=next;persist();place();return snapshot();});
  handle('pick',async(kind,id)=>{if(!['idle','walk','pat','random','sound'].includes(kind))throw Error('不支援的素材欄位');const sound=kind==='sound';const result=await dialog.showOpenDialog(settings,{title:sound?'選擇叫聲':'選擇桌寵圖片或 GIF',filters:[{name:sound?'音訊':'圖片與動畫',extensions:sound?['webm','mp3','wav','ogg','m4a','flac']:['gif','png','apng','jpg','jpeg','webp','avif','bmp','svg','ico']}],properties:['openFile']});if(result.canceled)return null;
    const file=result.filePaths[0];if(fs.statSync(file).size>50*1024*1024)throw Error('素材請小於 50 MB');const dest=path.join(assetsDir,randomUUID()+path.extname(file).toLowerCase());fs.copyFileSync(file,dest);
    if(kind==='random'){const r=config.random.find(r=>r.id===id);if(r)r.file=dest;}else config.assets[kind]=dest;persist();return snapshot();});
  handle('record',bytes=>{if(!(bytes instanceof Uint8Array)||bytes.length>15*1024*1024)throw Error('錄音太大');const file=path.join(assetsDir,randomUUID()+'.webm');fs.writeFileSync(file,bytes);config.assets.sound=file;persist();return snapshot();});
  ipcMain.on('pat',e=>{if(trusted(e))action('pat',2200);});ipcMain.on('settings',e=>{if(trusted(e))openSettings();});ipcMain.on('quit',e=>{if(trusted(e))app.quit();});
  screen.on('display-metrics-changed',()=>{place();send('state',snapshot());});screen.on('display-removed',()=>{place();send('state',snapshot());});screen.on('display-added',()=>send('state',snapshot()));
  last=Date.now();timer=setInterval(tick,33);openSettings();
});
app.on('window-all-closed',()=>{});app.on('before-quit',()=>{clearInterval(timer);clearInterval(pomodoroTimer);if(pomodoro&&pomodoroStore)savePomodoro();});
