const {contextBridge,ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('petAPI', {
  get:()=>ipcRenderer.invoke('get'), save:data=>ipcRenderer.invoke('save',data),
  pick:(kind,id)=>ipcRenderer.invoke('pick',kind,id), record:bytes=>ipcRenderer.invoke('record',bytes),
  pat:()=>ipcRenderer.send('pat'), settings:()=>ipcRenderer.send('settings'),
  pause:()=>ipcRenderer.invoke('pause'), quit:()=>ipcRenderer.send('quit'),
  onState:fn=>{ipcRenderer.on('state',(_,s)=>fn(s));},
  onAction:fn=>{ipcRenderer.on('action',(_,a)=>fn(a));}
});
