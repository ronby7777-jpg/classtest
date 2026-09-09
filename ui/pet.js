let state, current={name:'idle',direction:1};const button=document.querySelector('#pet'),sprite=document.querySelector('#sprite');
function render(){if(!state)return;const file=current.name==='random'?current.file:state.assets[current.name];const next=file||state.assets.idle||(current.name==='walk'?'default-walk.gif':'default-idle.png');if(sprite.getAttribute('src')!==next)sprite.src=next;button.className=current.name;button.style.setProperty('--direction',current.direction||1);}
sprite.onerror=()=>{sprite.src='default-idle.png';};
window.petAPI.onState(s=>{state=s;render();});window.petAPI.get().then(s=>{state=s;render();});
let voice;window.petAPI.onAction(a=>{current=a;render();if(a.sound&&state?.assets.sound){voice?.pause();voice=new Audio(state.assets.sound);voice.volume=state.volume/100;voice.play().catch(()=>{});}});
let pointer=null,dragReady;
button.onpointerdown=e=>{if(e.button!==0||pointer!==null)return;pointer=e.pointerId;button.setPointerCapture(pointer);dragReady=window.petAPI.dragStart({x:e.screenX,y:e.screenY}).catch(()=>{});};
async function releasePointer(e,pat){if(e.pointerId!==pointer)return;pointer=null;await dragReady;const moved=await window.petAPI.dragEnd();if(pat&&!moved)window.petAPI.pat();}
button.onpointerup=e=>{releasePointer(e,true).catch(()=>{});};
button.onpointercancel=e=>{releasePointer(e,false).catch(()=>{});};
button.onlostpointercapture=e=>{releasePointer(e,false).catch(()=>{});};
button.onclick=e=>{if(e.detail===0)window.petAPI.pat();};button.oncontextmenu=e=>{e.preventDefault();window.petAPI.menu();};

function renderPomodoro(s){const badge=document.querySelector('#pomo-badge');const seconds=Math.ceil(s.remainingMs/1000);badge.hidden=!s.running&&!s.notice;badge.textContent=s.notice?'時間到！':({focus:'專注',short:'休息',long:'長休息'}[s.phase])+' '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');button.title=s.notice||'右鍵：繼續／暫停散步、開啟工作室';}
window.petAPI.onPomodoro(renderPomodoro);window.petAPI.pomodoroGet().then(renderPomodoro).catch(()=>{});
