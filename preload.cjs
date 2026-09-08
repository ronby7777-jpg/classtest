const {contextBridge,ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('petAPI', {
  pomodoroGet:()=>ipcRenderer.invoke('pomodoro:get'),
  pomodoroCommand:(action,value)=>ipcRenderer.invoke('pomodoro:command',action,value),
  onPomodoro:fn=>{ipcRenderer.on('pomodoro',(_,s)=>fn(s));},
  dragStart:point=>ipcRenderer.invoke('drag-start',point),dragEnd:()=>ipcRenderer.invoke('drag-end'),
  returnFloor:()=>ipcRenderer.invoke('return-floor'),topmost:value=>ipcRenderer.invoke('topmost',value),
  visibility:()=>ipcRenderer.invoke('visibility'),
  get:()=>ipcRenderer.invoke('get'), save:data=>ipcRenderer.invoke('save',data),
  pick:(kind,id)=>ipcRenderer.invoke('pick',kind,id), record:bytes=>ipcRenderer.invoke('record',bytes),
  pat:()=>ipcRenderer.send('pat'), settings:()=>ipcRenderer.send('settings'),
  pause:()=>ipcRenderer.invoke('pause'), quit:()=>ipcRenderer.send('quit'),
  onState:fn=>{ipcRenderer.on('state',(_,s)=>fn(s));},
  onAction:fn=>{ipcRenderer.on('action',(_,a)=>fn(a));}
});
