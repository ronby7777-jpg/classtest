let state, current={name:'idle',direction:1};const button=document.querySelector('#pet'),sprite=document.querySelector('#sprite');
function render(){if(!state)return;const file=current.name==='random'?current.file:state.assets[current.name];const next=file||state.assets.idle||'cat.svg';if(sprite.getAttribute('src')!==next)sprite.src=next;button.className=current.name;button.style.setProperty('--direction',current.direction||1);}
sprite.onerror=()=>{sprite.src='cat.svg';};
window.petAPI.onState(s=>{state=s;render();});window.petAPI.get().then(s=>{state=s;render();});
let voice;window.petAPI.onAction(a=>{current=a;render();if(a.sound&&state?.assets.sound){voice?.pause();voice=new Audio(state.assets.sound);voice.volume=state.volume/100;voice.play().catch(()=>{});}});
button.onclick=()=>window.petAPI.pat();button.oncontextmenu=e=>{e.preventDefault();window.petAPI.settings();};
