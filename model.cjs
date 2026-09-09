const defaults = { size: 150, speed: 85, rangeStart: 0, rangeEnd: 100, volume: 65, soundChance: 25, displayId: null, alwaysOnTop: true, placement: null, assets: {idle:null, walk:null, pat:null}, random: [] };
function normalize(raw = {}) {
  const num = (key, min, max) => Math.min(max, Math.max(min, Number.isFinite(Number(raw[key])) ? Number(raw[key]) : defaults[key]));
  const start = num('rangeStart',0,95);
  const path = v => typeof v === 'string' ? v : null;
  return {size:num('size',64,360), speed:num('speed',10,240), rangeStart:start, rangeEnd:Math.max(start+5,num('rangeEnd',5,100)), volume:num('volume',0,100), soundChance:num('soundChance',0,100), displayId:raw.displayId ?? null, alwaysOnTop:raw.alwaysOnTop !== false, paused:raw.paused === true,
    placement:raw.placement && Number.isFinite(raw.placement.x) && Number.isFinite(raw.placement.y) ? {x:Math.round(raw.placement.x),y:Math.round(raw.placement.y)} : null,
    assets: {idle:path(raw.assets?.idle), walk:path(raw.assets?.walk), pat:path(raw.assets?.pat), sound:path(raw.assets?.sound)},
    random:Array.isArray(raw.random) ? raw.random.slice(0,50).map((r,i)=>({id:typeof r.id==='string'?r.id:String(i),name:String(r.name||'神秘小動作').slice(0,60),file:path(r.file),duration:Math.min(15,Math.max(1,Number(r.duration)||3))})) : []};
}
function bounds(config, work) {
  const size = Math.min(config.size,work.width,work.height);
  if(config.placement)return {size,left:work.x,right:work.x+work.width-size,y:Math.max(work.y,Math.min(work.y+work.height-size,config.placement.y))};
  const left = work.x + Math.round((work.width-size)*config.rangeStart/100);
  return {size,left,right:work.x+Math.round((work.width-size)*config.rangeEnd/100),y:work.y+work.height-size};
}
module.exports = {defaults, normalize, bounds};
