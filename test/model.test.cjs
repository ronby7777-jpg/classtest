const {test}=require('node:test');const assert=require('node:assert/strict');const {normalize,bounds}=require('../model.cjs');
test('invalid settings stay within supported limits',()=>{const c=normalize({size:999,speed:-4,rangeStart:95,rangeEnd:10,random:[{duration:0}]});assert.equal(c.size,360);assert.equal(c.speed,10);assert.equal(c.rangeEnd,100);assert.ok(c.random[0].duration>=1);});
test('bottom stays inside working area with negative monitor coordinates',()=>{const b=bounds(normalize({size:150}),{x:-1920,y:-200,width:1920,height:1040});assert.equal(b.left,-1920);assert.equal(b.right,-150);assert.equal(b.y+b.size,840);});
test('restricted walking range keeps the entire pet inside monitor',()=>{const b=bounds(normalize({size:200,rangeStart:25,rangeEnd:75}),{x:0,y:0,width:1000,height:700});assert.deepEqual(b,{size:200,left:200,right:600,y:500});});
test('oversized pet fits tiny work area',()=>{const b=bounds(normalize({size:360}),{x:0,y:0,width:200,height:100});assert.equal(b.size,100);assert.equal(b.y,0);});
test('arbitrary nested input is normalized',()=>{assert.deepEqual(normalize({assets:{idle:42},random:'oops'}).random,[]);assert.equal(normalize({assets:{idle:42}}).assets.idle,null);});

test('topmost defaults on and explicit false survives normalization',()=>{assert.equal(normalize().alwaysOnTop,true);assert.equal(normalize({alwaysOnTop:false}).alwaysOnTop,false);});
test('free placement is validated and clamped to the available display',()=>{const c=normalize({placement:{x:-1800,y:-900},size:150});assert.deepEqual(c.placement,{x:-1800,y:-900});assert.equal(bounds(c,{x:-1920,y:-200,width:1920,height:1040}).y,-200);assert.equal(normalize({placement:{x:Infinity,y:2}}).placement,null);});
