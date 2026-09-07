const DEFAULTS = Object.freeze({focus:25,short:5,long:15});
function durations(raw={}) {
  return Object.fromEntries(Object.entries(DEFAULTS).map(([key,fallback])=>{
    const n=Number(raw?.[key]);
    return [key,Number.isFinite(n)&&n>=1&&n<=180?Math.round(n):fallback];
  }));
}
class Pomodoro {
  constructor(saved={}) {
    saved=saved&&typeof saved==='object'?saved:{};
    this.durations=durations(saved.durations);
    this.phase=['focus','short','long'].includes(saved.phase)?saved.phase:'focus';
    this.completed=Number.isSafeInteger(saved.completed)&&saved.completed>=0?saved.completed:0;
    const remaining=Number(saved.remainingMs);
    this.remainingMs=Number.isFinite(remaining)&&remaining>0&&remaining<=this.duration()?remaining:this.duration();
    this.running=false;this.deadline=null;this.notice='';
  }
  duration(){return this.durations[this.phase]*60000;}
  snapshot(now=Date.now()) {
    return {durations:{...this.durations},phase:this.phase,completed:this.completed,running:this.running,
      remainingMs:this.running?Math.max(0,this.deadline-now):this.remainingMs,notice:this.notice};
  }
  tick(now=Date.now()) {
    if(!this.running||now<this.deadline)return false;
    const finished=this.phase;
    if(finished==='focus')this.completed++;
    this.phase=finished==='focus'?(this.completed%4===0?'long':'short'):'focus';
    this.remainingMs=this.duration();this.running=false;this.deadline=null;
    this.notice=finished==='focus'?'專注完成，休息一下吧！':'休息結束，準備好再開始專注。';
    return true;
  }
  command(action,value,now=Date.now()) {
    this.tick(now);
    if(action==='start'){if(!this.running){this.deadline=now+this.remainingMs;this.running=true;this.notice='';}}
    else if(action==='pause'){if(this.running){this.remainingMs=Math.max(0,this.deadline-now);this.running=false;this.deadline=null;}}
    else if(action==='reset'){this.running=false;this.deadline=null;this.remainingMs=this.duration();this.notice='';}
    else if(action==='configure'){
      if(this.running)throw Error('請先暫停，再調整時間。');
      if(!value||Object.keys(DEFAULTS).some(k=>!Number.isInteger(value[k])||value[k]<1||value[k]>180))throw Error('時間請輸入 1–180 的整數分鐘。');
      this.durations=durations(value);this.remainingMs=this.duration();this.notice='';
    } else throw Error('不支援的番茄鐘操作');
    return this.snapshot(now);
  }
}
module.exports={Pomodoro,durations};
