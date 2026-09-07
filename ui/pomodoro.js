(()=>{
  const $=id=>document.getElementById(id),labels={focus:'專注',short:'短休息',long:'長休息'};
  let state,busy=false,initialized=false;
  function render(next){
    state=next;const seconds=Math.ceil(next.remainingMs/1000);
    $('pomo-time').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
    $('pomo-phase').textContent=labels[next.phase];
    $('pomo-count').textContent='已完成 '+next.completed+' 次專注';
    $('pomo-notice').textContent=next.notice||(next.running?'小夥伴正在陪你'+labels[next.phase]+'。':'準備好就開始吧。');
    $('pomo-start').textContent=next.running?'暫停':'開始／繼續'+labels[next.phase];
    $('pomo-start').disabled=busy;$('pomo-reset').disabled=busy;
    $('pomo-fields').disabled=next.running||busy;
    if(!initialized){for(const k of Object.keys(labels))$('pomo-'+k).value=next.durations[k];initialized=true;}
  }
  async function command(action,value){
    if(busy)return;busy=true;render(state);
    try{render(await window.petAPI.pomodoroCommand(action,value));}
    catch(e){toast(e.message||String(e));}
    finally{busy=false;render(state);}
  }
  $('pomo-start').onclick=()=>command(state.running?'pause':'start');
  $('pomo-reset').onclick=()=>command('reset');
  $('pomo-form').onsubmit=e=>{e.preventDefault();command('configure',Object.fromEntries(Object.keys(labels).map(k=>[k,Number($('pomo-'+k).value)])));};
  window.petAPI.onPomodoro(render);
  window.petAPI.pomodoroGet().then(render).catch(e=>toast('番茄鐘載入失敗：'+e.message));
})();

