const test=require('node:test');
const assert=require('node:assert/strict');
const {Pomodoro}=require('../pomodoro.cjs');
test('pause and resume retain elapsed time without timer drift',()=>{
 const p=new Pomodoro();p.command('start',null,1000);p.command('start',null,2000);
 assert.equal(p.snapshot(61000).remainingMs,24*60000);
 p.command('pause',null,61000);assert.equal(p.snapshot(999999).remainingMs,24*60000);
 p.command('start',null,1000000);assert.equal(p.tick(1000000+24*60000-1),false);
 assert.equal(p.tick(1000000+24*60000),true);assert.equal(p.phase,'short');assert.equal(p.completed,1);
 assert.equal(p.tick(999999999),false);assert.equal(p.completed,1);assert.equal(p.running,false);
});
test('four focus sessions lead to long break, then focus',()=>{
 const p=new Pomodoro();let now=0;
 for(let n=1;n<=4;n++){
   p.command('start',null,now);now+=25*60000;p.tick(now);
   assert.equal(p.completed,n);assert.equal(p.phase,n===4?'long':'short');
   p.command('start',null,now);now+=(n===4?15:5)*60000;p.tick(now);assert.equal(p.phase,'focus');
 }
});
test('late wake finishes only the current phase',()=>{
 const p=new Pomodoro();p.command('start',null,0);assert.equal(p.tick(8*3600000),true);
 assert.equal(p.completed,1);assert.equal(p.remainingMs,5*60000);assert.equal(p.running,false);
});
test('reset and settings validate input without adding completed sessions',()=>{
 const p=new Pomodoro();p.command('start',null,0);
 assert.throws(()=>p.command('configure',{focus:1,short:1,long:1},1000));
 p.command('reset',null,2000);assert.equal(p.completed,0);assert.equal(p.remainingMs,25*60000);
 for(const value of [null,{}, {focus:0,short:5,long:15},{focus:1.5,short:5,long:15},{focus:181,short:5,long:15}])assert.throws(()=>p.command('configure',value,2000));
 p.command('configure',{focus:1,short:2,long:3},2000);assert.equal(p.remainingMs,60000);
 assert.throws(()=>p.command('invalid',null,2000));
});
test('saved running session reopens paused with remaining time and cycle',()=>{
 const p=new Pomodoro({completed:3});p.command('start',null,0);
 const restored=new Pomodoro(p.snapshot(60000));assert.equal(restored.running,false);assert.equal(restored.remainingMs,24*60000);
 restored.command('start',null,0);restored.tick(24*60000);assert.equal(restored.phase,'long');
 for(const value of [null,[],{phase:'bad',remainingMs:-1,durations:{focus:Infinity},completed:-4}]){
   const clean=new Pomodoro(value);assert.equal(clean.phase,'focus');assert.equal(clean.remainingMs,25*60000);assert.equal(clean.completed,0);
 }
});
