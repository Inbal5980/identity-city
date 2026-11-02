
(function(){
'use strict';
var KEY0='identity-city-v1', KEYT='identity-city-teacher', TEACHER=false; try{TEACHER=localStorage.getItem('idc-teacher-mode')==='1';}catch(e){} var KEY=TEACHER?KEYT:KEY0; // teacher preview keeps its own progress, never the student's
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function h(tag,attrs,html){var e=document.createElement(tag);if(attrs)for(var k in attrs){if(k==='cls')e.className=attrs[k];else e.setAttribute(k,attrs[k]);}if(html!=null)e.innerHTML=html;return e;}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}

// ---------- state ----------
var S;
function fresh(){return {v:1,mode:'points',name:'',born:false,sex:'f',skin:0,hair:'long',hairColor:'#3b2416',built:false,eyes:'dot',eyeColor:'#2b2b2b',mouth:'smile',details:['blush'],top:'tee',topColor:null,acc:'none',char:null,form:'',student:{name:'',cls:''},sent:{},inborn:null,changeAns:{},traits:[],group:'',places:{},s4:{},s5:{},texts:{greta:[]},unlocked:[1],done:{},coins:0,earned:{},owned:[],worn:{},quiz:{},started:false};}
function load(){try{S=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){S=null;} if(!S||S.v!==1)S=fresh(); var d=fresh(); for(var k in d) if(S[k]===undefined) S[k]=d[k];}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
load();
// mode from link
(function(){var q=new URLSearchParams(location.search); var m=q.get('mode'); if(m==='free'||m==='points'){S.mode=m;save();} var f=q.get('f'); if(f&&/^(e\/)?[A-Za-z0-9_-]{20,}$/.test(f)){S.form=f;save();}})();
function points(){return S.mode!=='free';}
function g(m,f){return S.sex==='m'?m:f;}
function earn(key,n){if(S.earned[key])return 0;S.earned[key]=1;S.coins+=n;save();updateHud();if(points()&&n>0)coinPop(n);return n;}

// ---------- codes ----------
function norm(s){s=String(s||'').trim().toLowerCase().replace(/[\u0591-\u05C7]/g,'').replace(/[\s'"׳״\-._]/g,'');var m={'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'};return s.replace(/[ךםןףץ]/g,function(c){return m[c]});}
function fnv(s){s='idc|'+s;var h=0x811c9dc5;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h>>>0;}
function stationForCode(c){return G.codeHash[String(fnv(norm(c)))]||0;}
function openBox(t){var k=norm(t);var out='';for(var i=0;i<G.codeBox.length;i++)out+=String.fromCharCode(G.codeBox[i]^k.charCodeAt(i%k.length));try{return JSON.parse(out);}catch(e){return null;}}

// ---------- avatar ----------
var HAIRC=['#2b1a10','#5a3420','#a0522d','#e0b04a','#1b1b1b','#b23a48','#5b6ee1','#b9b9c3','#ff8fc8'];
var EYEC=['#2b2b2b','#6b3e1f','#3a7bd5','#2f9e5b'];
var TOPC=['#ff8fab','#2ec4b6','#ffd166','#8b5cf6','#ef476f','#118ab2','#06d6a0','#ff8a3d','#1d2340','#ffffff'];
var TOPS={tee:1,stripes:1,hood:1,polo:1,overall:1,vneck:1};
function hasChar(){return !!chr();}
function look(ov){var L={sex:S.sex,skin:S.skin,hair:S.hair,hairColor:S.hairColor,eyes:S.eyes||'dot',eyeColor:S.eyeColor||'#2b2b2b',mouth:S.mouth||'smile',details:S.details||['blush'],top:S.top||'tee',topColor:S.topColor,acc:S.acc||'none'};if(ov)for(var k in ov)L[k]=ov[k];return L;}
var CV='10';
function chr(){var id=S.char;for(var i=0;i<G.chars.length;i++)if(G.chars[i].id===id)return G.chars[i];return null;}
function itemById(id){for(var i=0;i<G.shop.length;i++)if(G.shop[i].id===id)return G.shop[i];return null;}
var OUTFIT_IC={suit:'🤵',hoodie:'🧥',festive:'👔',pajama:'🛌',sequin:'✨'};
function chImg(c,thumb){return '<img src="img/c/'+c.id+(thumb?'-t':'')+'.webp?v='+CV+'" alt="" draggable="false">';}
// character picture + stickers (shop items / stage props) around it
function avatarSVG(o){
 o=o||{}; var c=o.ch||chr();
 if(o.baby||!c) return '<span class="pic baby"><span>👶</span></span>';
 var st=[];
 if(o.stage){ if(o.outfit) st.push({i:OUTFIT_IC[o.outfit]||'👕',t:o.outfitT}); if(o.prop) st.push({i:o.prop,t:o.propT}); }
 else if(!o.noWorn){ var worn=o.only?(o.worn||{}):Object.assign({},S.worn,o.worn||{}); Object.keys(G.slotNames).forEach(function(k){var it=worn[k]&&itemById(worn[k]); if(it) st.push({i:it.icon,t:it.name+' – '+it.comp});}); if(o.prop) st.push({i:o.prop}); }
 var stk=st.map(function(s,k){return '<span class="stk s'+k+'" title="'+esc(s.t||'')+'">'+s.i+'</span>';}).join('');
 return '<span class="pic'+(st.length?' has-stk':'')+'"><span class="pic-in">'+chImg(c,o.thumb)+'</span>'+stk+'</span>';
}
// the explanation list of the symbols beside the character
function wornTags(empty){
 var rows=Object.keys(G.slotNames).map(function(k){var it=S.worn[k]&&itemById(S.worn[k]);return it?'<li>'+it.icon+' '+it.name+' → <b>'+it.comp+'</b></li>':'';}).join('');
 return rows?'<ul class="tags wtags">'+rows+'</ul>':(empty||'');
}

// ---------- short situation clips (station 4) ----------
var VV='?v=13';
function clip(name,o){
 o=o||{}; var f=h('figure',{cls:'clip'+(o.cls?' '+o.cls:'')});
 var v=document.createElement('video'); v.poster='vid/'+name+'.webp'+VV; v.preload='auto';
 ['mp4'].forEach(function(x){ var s=document.createElement('source'); s.src='vid/'+name+'.'+x+VV; s.type='video/'+x; v.appendChild(s); });
 v.muted=true; v.defaultMuted=true; v.playsInline=true; v.autoplay=true; if(o.loop)v.loop=true;
 v.setAttribute('muted',''); v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline',''); v.setAttribute('autoplay',''); v.setAttribute('disablepictureinpicture','');
 if(o.label)v.setAttribute('aria-label',o.label);
 function play(){ var p=v.play(); if(p&&p.catch)p.catch(function(){f.classList.add('ended');}); }
 var rb=h('button',{cls:'replay',type:'button','aria-label':'הפעלה מחדש'},'↻ שוב');
 rb.addEventListener('click',function(e){e.stopPropagation(); v.currentTime=0; play();});
 v.addEventListener('click',function(){ if(v.paused)play(); else v.pause(); });
 v.addEventListener('ended',function(){f.classList.add('ended');});
 v.addEventListener('play',function(){f.classList.remove('ended');});
 f.appendChild(v); f.appendChild(rb);
 if(o.me){ var c=chr(); if(c) f.appendChild(h('span',{cls:'me'},chImg(c,true)+'<b>'+g('אתה','את')+'</b>')); }
 if(o.cap) f.appendChild(h('figcaption',null,o.cap));
 setTimeout(play,60);
 return f;
}

// ---------- teacher: free navigation between stations (own sandbox progress) ----------
function teacherPrep(){
 var c=chr()||G.chars[0]; if(!S.char&&c) applyChar(c); if(!S.name) S.name='המורה';
 S.started=true; S.born=true; S.form='';
 if(!S.inborn&&c){ var pool=c.pool.map(function(i){return G.s1.profiles[i];}); if(!pool.length)pool=G.s1.profiles; var pr=pick(pool); S.inborn={origin:pr.origin,religion:pr.religion,city:pr.city,cit:pr.cit,ses:pick(G.s1.ses)}; }
 S.unlocked=[1,2,3,4,5,6]; save();
}
function enterTeacher(openId){
 try{localStorage.setItem('idc-teacher-mode','1');}catch(e){}
 TEACHER=true; KEY=KEYT; load(); teacherPrep();
 closeSheet(); var s=$('.station'); if(s){s.remove(); document.body.classList.remove('noscroll'); CUR=null;}
 renderMap(); teacherFab(); if(openId) openStation(openId); else toast('🧑‍🏫 מצב מורה: כל התחנות פתוחות לבחירה');
}
function exitTeacher(){ try{localStorage.removeItem('idc-teacher-mode');}catch(e){} location.reload(); }
function teacherJumpList(){
 return '<div class="tjump">'+G.stations.map(function(st){return '<button class="tj" data-id="'+st.id+'" style="--c:'+st.color+'"><span>'+st.icon+'</span><b>'+st.id+'. '+st.name+'</b><small>'+st.sub+'</small><em>פתיחה ›</em></button>';}).join('')+'</div>';
}
function bindJump(root){ $$('.tj',root).forEach(function(b){b.addEventListener('click',function(){ var id=+b.dataset.id; if(TEACHER){ closeSheet(); var s=$('.station'); if(s){s.remove(); document.body.classList.remove('noscroll'); CUR=null; renderMap();} openStation(id);} else enterTeacher(id); });}); }
function teacherSwitcher(){
 var bd=sheet('🧑‍🏫 מעבר בין תחנות','tall');
 bd.innerHTML='<p class="small">מצב מורה: אפשר לקפוץ לכל תחנה. בתוך תחנה, כפתור ⏭ מדלג לחלק הבא. ההתקדמות כאן נפרדת ולא משפיעה על התלמידים.</p>'+teacherJumpList()+
  '<div class="row wrap"><button class="btn ghost" id="tjMap">🗺️ חזרה למפה</button><button class="btn ghost danger" id="tjExit">יציאה ממצב מורה</button></div>';
 bindJump(bd);
 $('#tjMap',bd).addEventListener('click',function(){ closeSheet(); var s=$('.station'); if(s){s.remove(); document.body.classList.remove('noscroll'); CUR=null;} renderMap(); });
 $('#tjExit',bd).addEventListener('click',exitTeacher);
}
function teacherFab(){
 if(!TEACHER||$('#tFab'))return;
 var f=h('button',{cls:'tfab',id:'tFab','aria-label':'מעבר בין תחנות (מורה)'},'🧑‍🏫 תחנות'); document.body.appendChild(f);
 f.addEventListener('click',teacherSwitcher);
}

// ---------- HUD / shell ----------
var app=$('#app');
function updateHud(){
 var c=$('#coins'); if(c){c.hidden=!points(); $('#coinN').textContent=S.coins;} $$('.cN').forEach(function(e){e.textContent=S.coins});
 var a=$('#hudAv'); if(a) a.innerHTML=avatarSVG({bgc:'#fff'});
 var n=$('#hudName'); if(n) n.textContent=hasChar()?(S.name||'הדמות שלי'):'עוד לא נולדה';
}
function coinPop(n){var e=h('div',{cls:'coinpop'},'+'+n+' 🪙');document.body.appendChild(e);setTimeout(function(){e.remove()},1400);}
function toast(t,ok){$$('.toast').forEach(function(x){x.remove()});var e=h('div',{cls:'toast'+(ok===false?' bad':'')},t);document.body.appendChild(e);setTimeout(function(){e.classList.add('show')},10);setTimeout(function(){e.classList.remove('show');setTimeout(function(){e.remove()},400)},2600);}

function sheet(title,cls){
 closeSheet();
 var ov=h('div',{cls:'overlay'}); var sh=h('div',{cls:'sheet '+(cls||'')});
 var hd=h('div',{cls:'sheet-h'},'<h2>'+title+'</h2>'); var x=h('button',{cls:'x','aria-label':'סגירה'},'✕'); x.addEventListener('click',closeSheet); hd.appendChild(x);
 var bd=h('div',{cls:'sheet-b'}); sh.appendChild(hd); sh.appendChild(bd); ov.appendChild(sh);
 ov.addEventListener('click',function(e){if(e.target===ov)closeSheet();});
 document.body.appendChild(ov); setTimeout(function(){ov.classList.add('open')},10); return bd;
}
function closeSheet(){$$('.overlay').forEach(function(o){o.remove();});}

// ---------- start screen ----------
function renderStart(){
 app.innerHTML='';
 var s=h('section',{cls:'start'});
 s.innerHTML='<div class="start-card"><div class="start-badge">🏙️</div><h1>עיר הזהויות</h1><p class="lead">משחק לפרק <b>"זהות"</b> בסוציולוגיה</p>'+
 '<p>בעיר הזאת לכל אחד יש דמות – והזהות שלה <b>נבנית תוך כדי משחק</b>. נולדים בבית החולים, נרשמים במרשם, מסתובבים בעיר, נפגשים בבית הקפה ועולים על הבמה בתיאטרון.</p>'+
 '<ul class="feat"><li>🎨 בוחרים דמות משלכם</li><li>🗺️ 6 תחנות שנפתחות לאורך הלמידה</li><li>🧑‍🏫 בעלי תחנות שמסבירים את המושגים</li><li>✅ בדיקת ידע בסוף כל תחנה</li><li>🛍️ חנות – וכל פריט מבטא מרכיב זהות</li><li>🪪 בסוף: תעודת זהות של הדמות</li></ul>'+
 '<button class="btn big" id="go">'+(S.started?'ממשיכים ▶':'מתחילים ▶')+'</button>'+
 '<p class="small">ההתקדמות נשמרת במכשיר הזה.</p></div>';
 app.appendChild(s);
 $('#go').addEventListener('click',function(){ if(!hasChar()){openBuilder({first:true,legacy:!!(S.built||S.born)});return;} S.started=true;save();renderMap();});
}

// ---------- map ----------
function nextStation(){for(var i=1;i<=6;i++){if(!S.done[i])return i;}return 0;}
function renderMap(){
 app.innerHTML='';
 var top=h('header',{cls:'hud'});
 top.innerHTML='<div class="me" id="meBtn"><div class="hud-av" id="hudAv"></div><div><div class="hud-name" id="hudName"></div><div class="hud-sub">'+Object.keys(S.done).length+'/6 תחנות</div></div></div>'+
  '<div class="coins" id="coins"><span>🪙</span><b id="coinN">0</b></div><img class="logo" src="img/logo.png?v=8" alt="לוגו">';
 app.appendChild(top);
 var wrap=h('div',{cls:'mapwrap'}); var map=h('div',{cls:'map'});
 map.innerHTML='<img src="img/map.webp?v=8" alt="מפת עיר הזהויות" class="mapimg">';
 var nx=nextStation();
 G.stations.forEach(function(st){
  var open=S.unlocked.indexOf(st.id)>=0, done=!!S.done[st.id];
  var b=h('button',{cls:'pin'+(open?'':' locked')+(done?' done':'')+(open&&st.id===nx?' next':''),'data-id':st.id,'aria-label':st.name});
  b.style.left=st.x+'%'; b.style.top=st.y+'%'; b.style.setProperty('--c',st.color);
  b.innerHTML='<span class="pin-ic">'+(open?st.icon:'🔒')+'<i>'+st.id+'</i>'+(done?'<em>✓</em>':'')+'</span><span class="pin-l">'+st.name+'</span>';
  b.addEventListener('click',function(){ if(open) openStation(st.id); else askCode(st.id); });
  map.appendChild(b);
 });
 wrap.appendChild(map); app.appendChild(wrap);
 var tip=h('div',{cls:'maptip'});
 tip.innerHTML= nx===0?'🎉 סיימתם את כל התחנות! אפשר לחזור לכל תחנה, לבקר בחנות ולהציץ בתעודה.':
   (S.unlocked.indexOf(nx)>=0?'👉 התחנה הבאה: <b>'+G.stations[nx-1].name+'</b> – הקישו עליה במפה.':'🔒 התחנה הבאה תיפתח בכיתה. קיבלתם קוד מהמורה? הקישו "קוד תחנה".');
 app.appendChild(tip);
 var nav=h('nav',{cls:'dock'});
 nav.innerHTML='<button id="bShop"><span>🛍️</span>חנות</button><button id="bCard"><span>🪪</span>הזהות שלי</button><button id="bCode"><span>🔑</span>קוד תחנה</button>';
 app.appendChild(nav);
 var ft=h('footer',{cls:'foot'},'<button class="linkbtn" id="bTeacher">כניסת מורה</button>'); app.appendChild(ft);
 $('#bShop').addEventListener('click',openShop); $('#bCard').addEventListener('click',function(){openCard()}); $('#meBtn').addEventListener('click',function(){openCard()});
 $('#bCode').addEventListener('click',function(){askCode()}); $('#bTeacher').addEventListener('click',openTeacher);
 updateHud();
}

// ---------- code entry ----------
function askCode(forId){
 var bd=sheet(forId?('🔒 '+G.stations[forId-1].name):'🔑 קוד תחנה','small');
 bd.innerHTML='<p>'+(forId?'התחנה הזאת עוד סגורה. ':'')+'הקלידו את הקוד שהמורה נתנה בכיתה:</p><form id="cf" class="codef"><input id="ci" autocomplete="off" inputmode="text" placeholder="הקוד כאן" aria-label="קוד"><button class="btn" type="submit">פתיחה</button></form><p class="err" id="cerr"></p>';
 var inp=$('#ci'); setTimeout(function(){inp.focus()},200);
 $('#cf').addEventListener('submit',function(e){e.preventDefault();
  var id=stationForCode(inp.value);
  if(!id){$('#cerr').textContent='הקוד לא נכון. נסו שוב 🙂';inp.classList.add('shake');setTimeout(function(){inp.classList.remove('shake')},500);return;}
  if(S.unlocked.indexOf(id)<0)S.unlocked.push(id); save(); closeSheet(); renderMap();
  toast('🎉 נפתחה תחנה '+id+': '+G.stations[id-1].name);
  var pin=$('.pin[data-id="'+id+'"]'); if(pin){pin.classList.add('flash');}
 });
}

// ---------- station engine ----------
var CUR=null;
function openStation(id){
 var st=G.stations[id-1];
 if(id>1&&!S.born){ toast('קודם הדמות צריכה להיוולד בבית החולים 👶',false); return; }
 CUR={id:id,st:st,steps:buildSteps(id),i:0,coins0:S.coins};
 var scr=h('div',{cls:'station'}); scr.style.setProperty('--c',st.color);
 scr.innerHTML='<div class="st-h"><button class="x" id="stX" aria-label="חזרה למפה">✕</button><div class="st-t"><span class="st-ic">'+st.icon+'</span><div><b>תחנה '+id+': '+st.name+'</b><small>'+st.sub+'</small></div></div><div class="coins mini" '+(points()?'':'hidden')+'><span>🪙</span><b class="cN">'+S.coins+'</b></div></div><div class="prog"><i></i></div><div class="st-b" id="stB"></div>';
 document.body.appendChild(scr); document.body.classList.add('noscroll');
 if(TEACHER){ var sk=h('button',{cls:'tskip',type:'button','aria-label':'דילוג לחלק הבא'},'⏭'); $('.st-h',scr).insertBefore(sk,$('.st-t',scr).nextSibling); sk.addEventListener('click',function(){ if(CUR&&CUR.i<CUR.steps.length-1){CUR.i++;runStep();} }); }
 $('#stX').addEventListener('click',closeStation);
 runStep();
}
function closeStation(){var s=$('.station'); if(s)s.remove(); document.body.classList.remove('noscroll'); CUR=null; renderMap();}
function runStep(){
 var b=$('#stB'); if(!b)return; b.innerHTML=''; b.scrollTop=0;
 var pr=$('.station .prog i'); if(pr) pr.style.width=Math.round(100*CUR.i/CUR.steps.length)+'%';
 $$('.station .cN').forEach(function(e){e.textContent=S.coins});
 var step=CUR.steps[CUR.i]; if(!step){return;}
 step(b,function(){CUR.i++;runStep();});
}
function host(text,opts){
 opts=opts||{}; var st=CUR.st;
 var d=h('div',{cls:'host'+(opts.big?' big':'')});
 d.innerHTML='<img src="'+st.host.img+'?v=8" alt="'+st.host.name+'"><div class="bubble"><div class="hn">'+st.host.name+'</div><div class="ht">'+text+'</div></div>';
 return d;
}
function talk(lines,after){ // step factory
 return function(b,next){
  var i=0; var hst=host(lines[0],{big:true}); b.appendChild(hst);
  var btn=h('button',{cls:'btn next'},'המשך ›'); b.appendChild(btn);
  var dots=h('div',{cls:'dots'}); lines.forEach(function(_,k){dots.appendChild(h('i',{cls:k===0?'on':''}))}); if(lines.length>1)b.insertBefore(dots,btn);
  btn.addEventListener('click',function(){ i++; if(i>=lines.length){next();return;} $('.ht',hst).innerHTML=lines[i]; hst.classList.remove('pop'); void hst.offsetWidth; hst.classList.add('pop'); $$('i',dots).forEach(function(e,k){e.className=k===i?'on':''}); });
 };
}
function nextBtn(b,label,fn){var x=h('button',{cls:'btn next'},label||'המשך ›');x.addEventListener('click',fn);b.appendChild(x);return x;}
function card(cls,html){return h('div',{cls:'panel '+(cls||'')},html);}

// ---------- quiz ----------
function quizStep(id){
 return function(b,next){
  var qs=G.quiz[id]; var qi=0, score=0;
  function show(){
   b.innerHTML=''; var q=qs[qi];
   b.appendChild(h('div',{cls:'quiz-h'},'✅ בדיקת ידע · שאלה '+(qi+1)+' מתוך '+qs.length));
   b.appendChild(h('div',{cls:'panel q'},'<p class="qq">'+q.q+'</p>'));
   var order=shuffle(q.o.map(function(t,k){return {t:t,k:k}}));
   var box=h('div',{cls:'opts'}); b.appendChild(box); var answered=false;
   order.forEach(function(o){var bt=h('button',{cls:'opt'},o.t); box.appendChild(bt);
    bt.addEventListener('click',function(){ if(answered)return; answered=true;
     var ok=o.k===q.a; if(ok){score++; earn('q'+id+'-'+qi,10);}
     $$('.opt',box).forEach(function(x){x.disabled=true}); bt.classList.add(ok?'ok':'no');
     if(!ok){ $$('.opt',box).forEach(function(x,ix){ if(order[ix].k===q.a) x.classList.add('ok'); }); }
     var ex=h('div',{cls:'panel ex '+(ok?'good':'bad')},'<b>'+(ok?'נכון! 🎉':'לא בדיוק 🙃')+'</b><p>'+q.ex+'</p>'); b.appendChild(ex);
     nextBtn(b,qi<qs.length-1?'לשאלה הבאה ›':'סיום הבדיקה ›',function(){qi++; if(qi<qs.length)show(); else {S.quiz[id]=Math.max(S.quiz[id]||0,score);save(); next();}});
     ex.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
   });
  }
  show();
 };
}

// ---------- answers to the teacher's Google Form ----------
function formUrl(f){f=f||S.form; return 'https://docs.google.com/forms/d/'+f+'/formResponse';}
function parseForm(t){t=String(t||'').trim(); var m=t.match(/\/forms\/d\/(e\/)?([A-Za-z0-9_-]{20,})/); if(m) return (m[1]?'e/':'')+m[2]; if(/^(e\/)?[A-Za-z0-9_-]{25,}$/.test(t)) return t; return '';}
function postRow(f,r){
 var E=G.formEntries, d=new URLSearchParams();
 d.append('entry.'+E.student,r.student||'');
 d.append('entry.'+E.cls,r.cls||''); d.append('entry.'+E.station,r.station||''); d.append('entry.'+E.q,r.q||''); d.append('entry.'+E.a,r.a||'');
 try{ return fetch(formUrl(f),{method:'POST',mode:'no-cors',body:d,keepalive:true}).then(function(){return true},function(){return false}); }catch(e){ return Promise.resolve(false); }
}
function sendRows(f,rows){ var p=Promise.resolve(true), ok=true; rows.forEach(function(r){ p=p.then(function(){return postRow(f,r).then(function(x){ if(!x) ok=false; return new Promise(function(res){setTimeout(res,350)}); });}); }); return p.then(function(){return ok;}); }
function stationRows(id){
 var st=G.stations[id-1], T=S.texts||{}, rows=[], who={student:S.student.name,cls:S.student.cls,station:'תחנה '+id+' – '+st.name};
 function add(q,a){ if(a&&String(a).trim()) rows.push(Object.assign({q:q,a:String(a).trim()},who)); }
 if(id===1) add('מה מהמרכיבים המולדים אפשר לשנות?',T.s1think);
 if(id===2) add('זהות אישית וחברתית (בחירות)','תכונות: '+(S.traits||[]).join(', ')+' · קבוצה: '+(S.group||'—'));
 if(id===3) add('מרכיבים מתנגשים – רפלקציה',T.s3reflect);
 if(id===4) add('בית הקפה – הדימוי העצמי והתגובה',(S.s4.selfImage||'—')+' · '+(S.s4.act||'—'));
 if(id===5) add('התיאטרון – ניהול רושם (כוכבים)',G.s5.scenes.map(function(sc){var r=S.s5[sc.id]||{};return sc.name+': '+(r.stars||0)+'/3';}).join(' · '));
 if(id===6){ add('ג׳וני דפ – האם גם אני מציג/ה את עצמי אחרת?',T.depp); (G.s6.greta.qs||[]).forEach(function(q,k){ add('גרטה טונברג – '+String(q.q).replace(/<[^>]+>/g,''),(T.greta||[])[k]); }); }
 rows.push(Object.assign({q:'✅ סיימתי את התחנה',a:'בדיקת ידע: '+(S.quiz[id]!=null?S.quiz[id]:0)+'/'+G.quiz[id].length+' · דמות: '+(S.name||'')},who));
 return rows;
}
function sendStation(id,box){
 if(!S.form) return;
 box.innerHTML='';
 if(!S.student.name){
  box.innerHTML='<div class="panel send"><b>📤 שליחת התשובות למורה</b><p class="small">כדי שהמורה תדע מי שלח – השם האמיתי שלך (לא של הדמות) והכיתה:</p><div class="srow"><input id="stN" maxlength="30" placeholder="שם ושם משפחה" aria-label="שם התלמיד"><input id="stC" maxlength="10" placeholder="כיתה" aria-label="כיתה"></div><button class="btn" id="stGo">שליחה למורה 📤</button></div>';
  $('#stGo',box).addEventListener('click',function(){ var n=$('#stN',box).value.trim(), c=$('#stC',box).value.trim(); if(!n){toast('כתבו את השם שלכם ✍️',false);return;} S.student={name:n.slice(0,30),cls:c.slice(0,10)}; save(); sendStation(id,box); });
  return;
 }
 box.innerHTML='<div class="panel send"><b>📤 שולח את התשובות למורה…</b></div>';
 sendRows(S.form,stationRows(id)).then(function(ok){ S.sent[id]=Date.now(); save();
  box.innerHTML='<div class="panel send ok"><b>'+(ok?'✓ התשובות נשלחו למורה':'⚠️ לא הצלחתי לשלוח – בדקו חיבור לאינטרנט')+'</b><p class="small">'+esc(S.student.name)+(S.student.cls?' · '+esc(S.student.cls):'')+'</p><button class="linkbtn" id="stAgain">שליחה חוזרת</button></div>';
  $('#stAgain',box).addEventListener('click',function(){sendStation(id,box);});
 });
}

// ---------- end of station ----------
function finishStep(id,gainsFn){
 return function(b,next){
  var first=!S.done[id]; S.done[id]=1; earn('done'+id,20); save();
  var q=S.quiz[id]||0;
  b.appendChild(h('div',{cls:'upd'},'<div class="upd-av">'+avatarSVG({bgc:'#fff'})+'</div><h3>✨ הזהות התעדכנה!</h3>'));
  var list=h('ul',{cls:'gains'}); (gainsFn()||[]).forEach(function(t){list.appendChild(h('li',null,t))}); b.appendChild(list);
  b.appendChild(h('p',{cls:'center'},'בבדיקת הידע: <b>'+q+'/'+G.quiz[id].length+'</b>'+(points()?' · סה"כ מטבעות: <b>'+S.coins+'</b> 🪙':'')));
  var row=h('div',{cls:'row'}); var c=h('button',{cls:'btn ghost'},'🪪 לתעודה'); var m=h('button',{cls:'btn'},'🗺️ חזרה למפה');
  row.appendChild(c); row.appendChild(m); b.appendChild(row);
  c.addEventListener('click',function(){openCard()}); m.addEventListener('click',closeStation);
  if(S.form){ var sb=h('div'); b.insertBefore(sb,row); sendStation(id,sb); }
  if(first) confetti();
  var pr=$('.station .prog i'); if(pr) pr.style.width='100%';
 };
}
function confetti(){var cs=['#ef476f','#ffd166','#06d6a0','#118ab2','#9b5de5'];for(var i=0;i<40;i++){var e=h('i',{cls:'cf'});e.style.left=Math.random()*100+'vw';e.style.background=pick(cs);e.style.animationDelay=Math.random()*0.6+'s';e.style.transform='rotate('+Math.random()*360+'deg)';document.body.appendChild(e);(function(e){setTimeout(function(){e.remove()},2600)})(e);}}

// ---------- generic sort activity ----------
function sortStep(sayText,cards,cats,coinKey,afterFb){
 return function(b,next){
  b.appendChild(host(sayText));
  var deck=shuffle(cards); var i=0, right=0;
  var area=h('div',{cls:'sortarea'}); b.appendChild(area);
  function show(){
   area.innerHTML='';
   if(i>=deck.length){ area.appendChild(h('div',{cls:'panel good center'},'<b>מיינתם '+right+' מתוך '+deck.length+' נכון!</b>'+(afterFb?'<p>'+afterFb+'</p>':''))); earn(coinKey,Math.round(20*right/deck.length)); nextBtn(area,'המשך ›',next); return; }
   var c=deck[i];
   area.appendChild(h('div',{cls:'counter'},(i+1)+' / '+deck.length));
   area.appendChild(h('div',{cls:'sortcard'},c.t));
   var row=h('div',{cls:'row cats'}); cats.forEach(function(ct){var bt=h('button',{cls:'btn cat'},ct.label); bt.style.setProperty('--c',ct.color); row.appendChild(bt);
    bt.addEventListener('click',function(){ $$('.cat',row).forEach(function(x){x.disabled=true});
     var ok=ct.k===c.a; if(ok)right++; bt.classList.add(ok?'ok':'no');
     var name=cats.filter(function(x){return x.k===c.a})[0].label;
     var fb=h('div',{cls:'panel ex '+(ok?'good':'bad')},'<b>'+(ok?'נכון!':'זה בעצם: '+name)+'</b>'+(c.ex?'<p>'+c.ex+'</p>':''));
     area.appendChild(fb); nextBtn(area,'הבא ›',function(){i++;show();});
    });}); area.appendChild(row);
  }
  show();
 };
}
function choiceStep(sayText,opts,onPick,fbFn){
 return function(b,next){
  b.appendChild(host(sayText));
  var box=h('div',{cls:'opts'}); b.appendChild(box);
  opts.forEach(function(o,k){var bt=h('button',{cls:'opt'},o); box.appendChild(bt); bt.addEventListener('click',function(){
   $$('.opt',box).forEach(function(x){x.classList.remove('sel')}); bt.classList.add('sel'); onPick(k); save();
   var old=$('.fbx',b); if(old)old.remove(); var nb=$('.next',b); if(nb)nb.remove();
   if(fbFn){var f=h('div',{cls:'panel ex good fbx'},fbFn(k)); b.appendChild(f);} nextBtn(b,'המשך ›',next).scrollIntoView({behavior:'smooth',block:'nearest'});
  });});
 };
}
function textStep(sayText,key,ph,extraHtml){
 return function(b,next){
  b.appendChild(host(sayText)); if(extraHtml) b.appendChild(card('',extraHtml));
  var ta=h('textarea',{rows:'5',placeholder:ph||'כתבו כאן…','aria-label':'תשובה'}); ta.value=S.texts[key]||''; b.appendChild(ta);
  ta.addEventListener('input',function(){S.texts[key]=ta.value;save();});
  nextBtn(b,'המשך ›',function(){ if((ta.value||'').trim().length>5) earn('t-'+key,10); next(); });
 };
}

// ---------- station builders ----------
function buildSteps(id){ return ({1:steps1,2:steps2,3:steps3,4:steps4,5:steps5,6:steps6})[id](); }

function steps1(){
 var D=G.s1;
 return [
  talk(D.intro),
  function(b,next){ // name & looks were chosen in the builder
   if(!hasChar()||!S.name){
    b.appendChild(host('בחרו שם לדמות. השם הפרטי הוא דוגמה ראשונה לייחוד האישי של כל אדם – וגם אותו לא בוחרים בעצמנו: ההורים בוחרים אותו בשבילנו.'));
    var f=h('div',{cls:'panel'}); f.innerHTML='<label class="lbl" for="nm">שם הדמות</label><input id="nm" maxlength="14" placeholder="למשל: נוי, עומר, לין…" value="'+esc(S.name)+'">'; b.appendChild(f);
    nextBtn(b,'המשך ›',function(){var v=$('#nm').value.trim(); if(!v){$('#nm').classList.add('shake');setTimeout(function(){$('#nm').classList.remove('shake')},500);return;} S.name=v.slice(0,14); save(); next();});
    return;
   }
   b.appendChild(host('הנה <b>'+esc(S.name)+'</b> – הדמות שבחרתם! 🎨 את השם ואת הדמות בחרתם בעצמכם. בחיים האמיתיים זה עובד אחרת: את השם הפרטי בוחרים לנו <b>ההורים</b>, וחלק מהמראה שלנו אנחנו מקבלים כבר <b>בלידה</b>.'));
   var pv=h('div',{cls:'av-prev'}); pv.innerHTML=avatarSVG(); b.appendChild(pv);
   nextBtn(b,'המשך ›',next);
  },
  function(b,next){ // birth: sex & skin from the builder, the rest drawn
   var built=hasChar();
   b.appendChild(host(built?
    'ועכשיו – הלידה! 👶 בפרק: <q>זהותו של האדם מורכבת הן ממרכיבים מולדים – כמו מוצא, מין ולאומיות אתנית…</q> <b>מין</b> ו<b>צבע עור</b> הם מרכיבים מולדים – בחיים האמיתיים לא בוחרים אותם. במשחק ניקח אותם מהדמות שבחרתם ✋. את שאר המרכיבים המולדים נגריל 🎲 – כי גם אותם אף אחד לא בוחר. לחצו כדי לגלות עם מה '+esc(S.name)+' '+g('נולד','נולדה')+'.'
    :'ועכשיו – הלידה! 🎲 את המרכיבים האלה הדמות לא בוחרת. לחצו כדי לגלות עם מה '+esc(S.name)+' נולד/ה.'));
   var stage=h('div',{cls:'birth'}); stage.innerHTML='<div class="crib" id="crib">'+avatarSVG({baby:true})+'</div><div class="slots" id="slots"></div>'; b.appendChild(stage);
   var go=nextBtn(b,'🎲 הלידה!',function(){
    go.disabled=true;
    if(!S.inborn){
     var cc=chr(); var pool=cc?cc.pool.map(function(i){return D.profiles[i];}):D.profiles.filter(function(x){return x.skin==null||x.skin===S.skin;}); if(!pool.length)pool=D.profiles;
     var pr=pick(pool);
     if(!built){ S.sex=Math.random()<0.5?'f':'m'; S.skin= pr.skin!=null?pr.skin:Math.floor(Math.random()*3);
      S.hair=S.sex==='f'?'long':'short'; S.hairColor= S.skin>=2?'#1b1b1b':pick(['#2b1a10','#5a3420','#1b1b1b','#a0522d']); }
     S.inborn={origin:pr.origin,religion:pr.religion,city:pr.city,cit:pr.cit,ses:pick(D.ses)};
    }
    S.born=true; save();
    var rows=bornRows(); var sl=$('#slots'); sl.innerHTML='';
    rows.forEach(function(r,k){var mine=built&&(r.k==='sex'||r.k==='skin'); var e=h('div',{cls:'slot'+(mine?' mine':'')},'<span>'+r.label+'</span><b>'+r.val+'</b>'+(built?'<i>'+(mine?'✋':'🎲')+'</i>':'')); e.style.animationDelay=(k*0.25)+'s'; sl.appendChild(e);});
    $('#crib').innerHTML=avatarSVG(); $('#crib').classList.add('born');
    setTimeout(function(){go.remove(); if(built) b.appendChild(h('p',{cls:'legend'},'✋ מהדמות שבחרתם · 🎲 הוגרל בלידה (ומתאים לדמות)')); if(built) b.appendChild(h('div',{cls:'panel tip'},'💡 במשחק בחרתם מין וצבע עור כשבחרתם את הדמות – אבל אלה <b>מרכיבים מולדים</b>: אדם מקבל אותם עם לידתו, בלי לבחור.')); nextBtn(b,'המשך ›',next).scrollIntoView({behavior:'smooth'});}, rows.length*250+300);
   });
  },
  function(b,next){ // what can change
   b.appendChild(host(D.changeIntro));
   var rows=bornRows(); var list=h('div',{cls:'chg'}); b.appendChild(list); var answered=0,right=0;
   rows.forEach(function(r){
    var it=h('div',{cls:'chg-i'}); it.innerHTML='<div class="chg-t"><span>'+r.label+'</span><b>'+r.val+'</b></div><div class="chg-b"><button data-v="1">🔒 קבוע</button><button data-v="0">🔄 אפשר לשנות</button></div><div class="chg-ex"></div>';
    list.appendChild(it);
    $$('button',it).forEach(function(bt){bt.addEventListener('click',function(){
     if(it.dataset.done)return; it.dataset.done=1; answered++;
     var fixed=D.change[r.k].fixed; var ok=(bt.dataset.v==='1')===fixed; if(ok)right++;
     S.changeAns[r.k]=fixed; save(); bt.classList.add(ok?'ok':'no');
     $('.chg-ex',it).innerHTML='<b>'+(ok?'נכון – ':'בעצם – ')+(fixed?'קבוע 🔒':'אפשר לשנות 🔄')+'.</b> '+D.change[r.k].ex; it.classList.add(fixed?'fixed':'chg');
     if(answered===rows.length){ earn('s1chg',Math.round(20*right/rows.length)); nextBtn(b,'המשך ›',next).scrollIntoView({behavior:'smooth',block:'nearest'}); }
    });});
   });
  },
  textStep(D.think,'s1think','לדעתי…'),
  talk(D.outro),
  quizStep(1),
  finishStep(1,function(){return ['👶 '+esc(S.name)+' '+g('נולד','נולדה')+' ב'+S.inborn.city,'🔒 מרכיבים מולדים קבועים: צבע עור, מוצא ('+S.inborn.origin+')','🔄 מרכיבים מולדים שאפשר לשנות: מין, דת, מקום מגורים, אזרחות, מעמד חברתי-כלכלי'];})
 ];
}
function bornRows(){var I=S.inborn||{};return [
 {k:'sex',label:'מין',val:S.sex==='m'?'זכר':'נקבה'},
 {k:'skin',label:'צבע עור',val:G.s1.skinNames[S.skin]},
 {k:'origin',label:'מוצא',val:I.origin},
 {k:'religion',label:'דת המשפחה',val:I.religion},
 {k:'city',label:'מקום מגורים',val:I.city},
 {k:'cit',label:'אזרחות',val:I.cit},
 {k:'ses',label:'מעמד חברתי-כלכלי',val:I.ses}];}

function steps2(){
 var D=G.s2;
 return [
  talk(D.intro),
  sortStep('מיינו: זהות אישית או זהות חברתית?',D.cards,[{k:'p',label:'🙋 זהות אישית',color:'#ff8fab'},{k:'s',label:'👥 זהות חברתית',color:'#4cc9f0'}],'s2sort'),
  function(b,next){ // personal identity form
   b.appendChild(host('עכשיו נמלא את <b>תעודת התושב</b> של '+esc(S.name)+'. זהות אישית כוללת גם <b>מאפיינים פיזיים</b> – את המראה כבר בחרתם בתחילת המשחק – וגם <b>תכונות אופי</b> – בחרו שתיים.'));
   var f=h('div',{cls:'panel form'}); b.appendChild(f);
   var prev=h('div',{cls:'av-prev'}); f.appendChild(prev);
   function rp(){prev.innerHTML=avatarSVG();}
   rp();
   var er=h('div',{cls:'row'}); var eb=h('button',{cls:'btn ghost sm'},'✏️ לשנות מראה'); er.appendChild(eb); f.appendChild(er);
   eb.addEventListener('click',function(){openBuilder({onDone:rp});});
   f.appendChild(h('div',{cls:'lbl'},'תכונות אופי (2)')); var ts=h('div',{cls:'chips'}); f.appendChild(ts);
   D.traits.forEach(function(t){var lab=g(t[0],t[1]); var c=h('button',{cls:'chip'+(S.traits.indexOf(lab)>=0?' sel':'')},lab); ts.appendChild(c);
    c.addEventListener('click',function(){var i=S.traits.indexOf(lab); if(i>=0)S.traits.splice(i,1); else {if(S.traits.length>=2)S.traits.shift(); S.traits.push(lab);} save(); $$('.chip',ts).forEach(function(x){x.classList.toggle('sel',S.traits.indexOf(x.textContent)>=0)});});});
   nextBtn(b,'המשך ›',function(){ if(S.traits.length<2){toast('בחרו שתי תכונות 🙂',false);return;} next(); });
  },
  function(b,next){
   b.appendChild(host('ועכשיו הזהות החברתית: לאיזו קבוצה '+esc(S.name)+' '+g('מרגיש','מרגישה')+' שייכות?'));
   var box=h('div',{cls:'opts'}); b.appendChild(box);
   D.groups.forEach(function(gp){var bt=h('button',{cls:'opt'+(S.group===gp?' sel':'')},gp); box.appendChild(bt); bt.addEventListener('click',function(){S.group=gp;save();$$('.opt',box).forEach(function(x){x.classList.remove('sel')});bt.classList.add('sel');
    var o=$('.fbx',b); if(o)o.remove(); var nb=$('.next',b); if(nb)nb.remove();
    b.appendChild(h('div',{cls:'panel ex good fbx'},D.pride)); nextBtn(b,'המשך ›',next).scrollIntoView({behavior:'smooth',block:'nearest'});});});
  },
  talk(D.outro),
  quizStep(2),
  finishStep(2,function(){return ['🙋 זהות אישית: '+S.traits.join(', ')+' · מראה שנבחר','👥 זהות חברתית: שייכות ל'+S.group];})
 ];
}

function steps3(){
 var D=G.s3; var steps=[talk(D.intro)];
 steps.push(function(b,next){
  b.appendChild(host('בחרו מקום בעיר. כשאוספים את כל ששת התגים – ממשיכים. 🏅'));
  var grid=h('div',{cls:'tour'}); b.appendChild(grid);
  D.places.forEach(function(p){var got=S.places[p.id]!=null; var c=h('button',{cls:'place'+(got?' got':'')}); c.style.setProperty('--c',p.color);
   c.innerHTML='<span class="pl-ic">'+p.icon+'</span><b>'+p.name+'</b><small>'+(got?'🏅 '+p.badge:'תג: ???')+'</small>'; grid.appendChild(c);
   c.addEventListener('click',function(){placeVisit(p,function(){ CUR.i=CUR.steps.indexOf(tourStep); runStep(); });});
  });
  var all=D.places.every(function(p){return S.places[p.id]!=null});
  if(all) nextBtn(b,'אספתי הכול! המשך ›',next);
 });
 var tourStep=steps[1];
 steps.push(sortStep(D.sortIntro,D.sort,[{k:'b',label:'🍼 מולד',color:'#ffd166'},{k:'a',label:'🎒 נרכש',color:'#06d6a0'}],'s3sort'));
 steps.push(textStep(D.reflect,'s3reflect','למשל…'));
 steps.push(talk(D.outro)); steps.push(quizStep(3));
 steps.push(finishStep(3,function(){return D.places.map(function(p){return '🏅 '+p.badge+': '+clean(p.opts[S.places[p.id]]);});}));
 return steps;
}
function gz(t){return String(t||'').replace(/([\u05D0-\u05EA]+)\/(ית|ת|ה)/g,function(m,w,suf){if(S.sex==='m')return w;var f={'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'};var l=w.slice(-1);if(f[l])w=w.slice(0,-1)+f[l];return w+suf;});}
function clean(t){t=gz(t);return String(t||'').replace(/\s*[\u{1F000}-\u{1FFFF}\u2600-\u27BF]\uFE0F?/gu,'').trim();}
function placeVisit(p,back){
 var b=$('#stB'); b.innerHTML='';
 var hd=h('div',{cls:'placehd'},'<span>'+p.icon+'</span><b>'+p.name+'</b>'); hd.style.setProperty('--c',p.color); b.appendChild(hd);
 b.appendChild(host(p.talk));
 b.appendChild(card('scene','🎬 '+p.scene));
 var box=h('div',{cls:'opts'}); b.appendChild(box);
 p.opts.forEach(function(o,k){var bt=h('button',{cls:'opt'+(S.places[p.id]===k?' sel':'')},gz(o)); box.appendChild(bt);
  bt.addEventListener('click',function(){ S.places[p.id]=k; save(); earn('pl-'+p.id,10); $$('.opt',box).forEach(function(x){x.classList.remove('sel')}); bt.classList.add('sel');
   var o2=$('.fbx',b); if(o2)o2.remove(); var nb=$('.next',b); if(nb)nb.remove();
   var f=h('div',{cls:'panel ex good fbx'},'<div class="badge-got" style="--c:'+p.color+'">🏅 קיבלתם תג: '+p.badge+'</div><p>'+p.fb+'</p>'); b.appendChild(f);
   nextBtn(b,'חזרה לסיבוב ›',back).scrollIntoView({behavior:'smooth',block:'nearest'});
  });});
}

function steps4(){
 var D=G.s4;
 return [
  function(b,next){ b.appendChild(clip(D.introClip.v,{cap:D.introClip.cap,cls:'wide'})); talk(D.intro)(b,next); },
  function(b,next){ // symbols
   b.appendChild(host('בואו נבדוק שאתם יודעים "לקרוא" סמלים. מה המשמעות של כל אחד?'));
   var i=0,right=0; var area=h('div'); b.appendChild(area);
   function show(){ area.innerHTML='';
    if(i>=D.symbols.length){ area.appendChild(card('good center','<b>'+right+'/'+D.symbols.length+'</b><p>'+D.symbolsFb+'</p>')); earn('s4sym',Math.round(15*right/D.symbols.length)); nextBtn(area,'המשך ›',next); return; }
    var s=D.symbols[i]; if(s.v){ var sw=h('div',{cls:'symbol has-clip'}); sw.appendChild(clip(s.v,{loop:true,label:s.q})); sw.appendChild(h('b',null,s.q)); area.appendChild(sw); } else area.appendChild(h('div',{cls:'symbol'},'<span>'+s.s+'</span><b>'+s.q+'</b>'));
    var box=h('div',{cls:'opts'}); area.appendChild(box);
    shuffle(s.opts.map(function(t,k){return {t:t,k:k}})).forEach(function(o){var bt=h('button',{cls:'opt'},o.t); box.appendChild(bt); bt.addEventListener('click',function(){ $$('.opt',box).forEach(function(x){x.disabled=true}); var ok=o.k===s.a; if(ok)right++; bt.classList.add(ok?'ok':'no'); setTimeout(function(){i++;show();},ok?650:1300); if(!ok){$$('.opt',box).forEach(function(x){if(x.textContent===s.opts[s.a])x.classList.add('ok')});} });});
   }
   show();
  },
  function(b,next){ // definition of situation
   var D2=D.date; b.appendChild(D2.clip?clip(D2.clip,{label:'נועה ויואב בשולחן 4'}):h('div',{cls:'cafe-scene'},'<div class="tbl"><span>👩‍💼</span><span class="tb">☕</span><span>🧑‍🦱</span></div>'));
   b.appendChild(card('scene','🎬 '+D2.setup));
   var stage=h('div'); b.appendChild(stage);
   function ask(q,opts,a,ex,cb){ stage.appendChild(h('p',{cls:'qq'},q)); var box=h('div',{cls:'opts'}); stage.appendChild(box);
    opts.forEach(function(t,k){var bt=h('button',{cls:'opt'},t); box.appendChild(bt); bt.addEventListener('click',function(){ $$('.opt',box).forEach(function(x){x.disabled=true}); var ok=k===a; if(ok)earn('s4d'+q.length,5); bt.classList.add(ok?'ok':'no'); if(!ok)$$('.opt',box)[a].classList.add('ok'); var f=card('ex '+(ok?'good':'bad'),ex); stage.appendChild(f); f.scrollIntoView({behavior:'smooth',block:'nearest'}); setTimeout(cb,300); });}); }
   ask(D2.q1,D2.q1opts,D2.q1a,D2.ex1,function(){ var bb=nextBtn(stage,'המשך ›',function(){bb.remove(); ask(D2.q2,D2.q2opts,D2.q2a,D2.ex2,function(){ nextBtn(stage,'המשך ›',next).scrollIntoView({behavior:'smooth',block:'nearest'}); }); }); });
  },
  function(b,next){ // waiter task
   var D2=D.date; b.appendChild(host(D2.task)); var sel=[];
   var tray=h('div',{cls:'tray'},'<span>🍽️ המגש:</span><b id="trayv">ריק</b>'); b.appendChild(tray);
   var grid=h('div',{cls:'chips big'}); b.appendChild(grid);
   D2.items.forEach(function(it,k){var c=h('button',{cls:'chip'},it.t); grid.appendChild(c); c.addEventListener('click',function(){var i=sel.indexOf(k); if(i>=0){sel.splice(i,1);c.classList.remove('sel');} else if(sel.length<3){sel.push(k);c.classList.add('sel');} $('#trayv').textContent=sel.length?sel.map(function(x){return D2.items[x].t}).join(' · '):'ריק';});});
   var fb=h('div'); b.appendChild(fb);
   nextBtn(b,'הגישו לשולחן 🛎️',function(){ if(sel.length<3){toast('בחרו 3 סמלים',false);return;}
    var good=sel.every(function(k){return D2.items[k].ok}); fb.innerHTML=''; fb.appendChild(card('ex '+(good?'good':'bad'),good?D2.fbGood:D2.fbBad));
    if(good){ earn('s4tray',15); this.remove(); nextBtn(b,'המשך ›',next).scrollIntoView({behavior:'smooth',block:'nearest'}); }
   });
  },
  function(b,next){ // mirror
   var M=D.mirror; b.appendChild(M.clip?clip(M.clip,{loop:true,me:true,label:'מיקרופון פתוח'}):h('div',{cls:'mic'},'<div class="av-sm">'+avatarSVG({prop:'🎤'})+'</div>'));
   b.appendChild(card('scene','🎬 '+M.setup)); var st=h('div'); b.appendChild(st);
   st.appendChild(h('p',{cls:'qq'},M.q1)); var box=h('div',{cls:'opts'}); st.appendChild(box);
   M.reactions.forEach(function(r,k){var bt=h('button',{cls:'opt'},r.t); box.appendChild(bt); bt.addEventListener('click',function(){ if(box.dataset.done)return; box.dataset.done=1; S.s4.reaction=k; bt.classList.add('sel'); $$('.opt',box).forEach(function(x){x.disabled=true});
    S.s4.selfImage=g(r.img[0],r.img[1]); save();
    if(r.v){ var rc=clip(r.v,{me:true,label:r.t}); st.appendChild(rc); setTimeout(function(){rc.scrollIntoView({behavior:'smooth',block:'nearest'});},80); }
    st.appendChild(card('think','💭 '+esc(S.name)+' '+g('חושב','חושבת')+': "'+S.s4.selfImage+'"'));
    st.appendChild(h('p',{cls:'qq'},M.q2)); var b2=h('div',{cls:'opts'}); st.appendChild(b2);
    M.acts.forEach(function(a,j){var bb=h('button',{cls:'opt'},a); b2.appendChild(bb); bb.addEventListener('click',function(){ if(b2.dataset.done)return; b2.dataset.done=1; S.s4.act=a; save(); bb.classList.add('sel'); $$('.opt',b2).forEach(function(x){x.disabled=true}); earn('s4mirror',15);
     st.appendChild(card('ex good','<p>'+M.ex+'</p><p>'+M.ex2+'</p>')); nextBtn(st,'המשך ›',next).scrollIntoView({behavior:'smooth',block:'nearest'}); });});
    b2.scrollIntoView({behavior:'smooth',block:'nearest'});
   });});
  },
  talk(D.outro),
  quizStep(4),
  finishStep(4,function(){return ['☕ למדת לקרוא סמלים ולהגיע להגדרת מצב משותפת','🪞 דימוי עצמי חדש: "'+(S.s4.selfImage||'')+'"','💪 בחירה פעילה: '+(S.s4.act||'')];})
 ];
}

function steps5(){
 var D=G.s5; var steps=[talk(D.intro)];
 D.scenes.forEach(function(sc){
  steps.push(function(b,next){
   var ch=S.s5[sc.id]&&S.s5[sc.id].ch?S.s5[sc.id].ch.slice():[]; 
   b.appendChild(h('div',{cls:'stagehd'},'<span>'+sc.icon+'</span><div><b>סצנה: '+sc.name+'</b><small>🎯 המטרה: '+gz(sc.goal)+'</small></div>'));
   var stage=h('div',{cls:'stage'}); b.appendChild(stage);
   function draw(){var o=sc.parts[0].opts[ch[0]]; var pp=sc.parts[1].opts[ch[1]]; stage.innerHTML='<div class="curtain l"></div><div class="curtain r"></div><div class="spot"></div><div class="st-av">'+avatarSVG({stage:true,outfit:o?o.v:null,outfitT:o?o.t:'',prop:pp?pp.v:null,propT:pp?pp.t:''})+'</div><div class="st-tags">'+(o?'<span>'+(OUTFIT_IC[o.v]||'👕')+' '+gz(o.t)+'</span>':'<span class="ph">👕 בחרו בגדים</span>')+(pp?'<span>'+gz(pp.t)+'</span>':'<span class="ph">🎒 בחרו אביזר</span>')+'</div>';}
   draw();
   sc.parts.forEach(function(pt,pi){
    b.appendChild(h('div',{cls:'lbl'},pt.label)); var row=h('div',{cls:'chips'}); b.appendChild(row);
    pt.opts.forEach(function(o,oi){var c=h('button',{cls:'chip'+(ch[pi]===oi?' sel':'')},gz(o.t)); row.appendChild(c); c.addEventListener('click',function(){ch[pi]=oi; $$('.chip',row).forEach(function(x){x.classList.remove('sel')}); c.classList.add('sel'); draw();});});
   });
   var fb=h('div'); b.appendChild(fb);
   var go=nextBtn(b,'🎬 אקשן!',function(){
    for(var i=0;i<sc.parts.length;i++) if(ch[i]==null){toast('בחרו בכל השורות',false);return;}
    var sc2=0; var lines=sc.parts.map(function(pt,pi){var o=pt.opts[ch[pi]]; sc2+=o.s; return '<li>'+(o.s===2?'✅':o.s===1?'🟡':'❌')+' '+pt.label.replace(/^\S+\s/,'')+': '+gz(o.t)+'</li>';});
    var stars=sc2>=7?3:sc2>=4?2:1; S.s5[sc.id]={ch:ch.slice(),stars:stars,outfit:sc.parts[0].opts[ch[0]].v,prop:sc.parts[1].opts[ch[1]].v}; save();
    earn('s5-'+sc.id,stars*5);
    var msg=stars===3?'רושם מצוין! הדמות התאימה את "אביזרי התחפושת" למצב.':stars===2?'רושם סביר – חלק מהבחירות לא התאימו להגדרת המצב.':'אוי… הקהל קרא את הסמלים אחרת ממה שרציתם.';
    fb.innerHTML=''; fb.appendChild(card('ex '+(stars>1?'good':'bad'),'<div class="stars">'+'⭐'.repeat(stars)+'<span>'+'☆'.repeat(3-stars)+'</span></div><b>'+msg+'</b><ul class="mini">'+lines.join('')+'</ul><p>'+D.imp+'</p><p class="small">אפשר לשנות בחירות וללחוץ שוב "אקשן!", או להמשיך.</p>'));
    var nb=$('.next.cont',b); if(!nb){nb=nextBtn(b,'לסצנה הבאה ›',next); nb.classList.add('cont');} fb.scrollIntoView({behavior:'smooth',block:'start'});
   });
  });
 });
 steps.push(sortStep(D.backIntro,D.back,[{k:'f',label:'🎭 במה קדמית',color:'#9b5de5'},{k:'b',label:'🛋️ מאחורי הקלעים',color:'#00bbf9'}],'s5back','<q>כשאנו על הבמה הקדמית, רמת המשחק שלנו גבוהה הרבה יותר מאשר מאחורי הקלעים.</q>'));
 steps.push(talk(D.outro)); steps.push(quizStep(5));
 steps.push(finishStep(5,function(){return D.scenes.map(function(sc){var r=S.s5[sc.id]||{};return '🎭 '+sc.name+': '+'⭐'.repeat(r.stars||0);}).concat(['💡 במה קדמית מול מאחורי הקלעים · ניהול רושם']);}));
 return steps;
}

function steps6(){
 var D=G.s6;
 return [
  talk(D.intro),
  function(b,next){
   b.appendChild(host(D.depp.text));
   var shows=h('div',{cls:'shows'}); b.appendChild(shows);
   G.s5.scenes.forEach(function(sc){var r=S.s5[sc.id]; shows.appendChild(h('div',{cls:'show'},'<div class="av-sm">'+avatarSVG({stage:true,outfit:r?r.outfit:null,prop:r?r.prop:null})+'</div><small>'+sc.icon+' '+sc.name+'</small>'));});
   b.appendChild(h('p',{cls:'center small'},'ה"מופעים" של '+esc(S.name)+' מהתיאטרון'));
   b.appendChild(card('scene','🤔 <b>'+D.depp.title+'</b><br>'+D.depp.q));
   var ta=h('textarea',{rows:'5',placeholder:'כן/לא, למשל…','aria-label':'תשובה'}); ta.value=S.texts.depp||''; b.appendChild(ta);
   ta.addEventListener('input',function(){S.texts.depp=ta.value;save();});
   nextBtn(b,'המשך ›',function(){ if(ta.value.trim().length>5)earn('t-depp',15); next(); });
  },
  function(b,next){
   var R=D.greta; b.appendChild(host(R.text));
   b.appendChild(card('tip','📝 '+R.tip));
   R.qs.forEach(function(q,k){var d=h('details',{cls:'gq'}); d.innerHTML='<summary>'+q.q+'</summary>'; var hint=h('p',{cls:'hint'},'💡 תזכורת מהפרק: '+q.hint); var ta=h('textarea',{rows:'4',placeholder:'התשובה שלי…','aria-label':'תשובה'}); ta.value=S.texts.greta[k]||''; ta.addEventListener('input',function(){S.texts.greta[k]=ta.value;save(); d.classList.toggle('has',!!ta.value.trim());}); if(ta.value.trim())d.classList.add('has'); d.appendChild(hint); d.appendChild(ta); b.appendChild(d);});
   nextBtn(b,'המשך ›',function(){ var n=S.texts.greta.filter(function(t){return t&&t.trim().length>5}).length; if(n<2){toast('ענו לפחות על שני סעיפים ✍️',false);return;} earn('t-greta',25); next(); });
  },
  quizStep(6),
  talk(D.outro),
  function(b,next){ S.done[6]=1; earn('done6',20); save(); confetti(); b.appendChild(cardEl(true));
   var row=h('div',{cls:'row'}); var cp=h('button',{cls:'btn ghost'},'📋 העתקת התשובות שלי'); var m=h('button',{cls:'btn'},'🗺️ למפה'); row.appendChild(cp); row.appendChild(m); b.appendChild(row);
   cp.addEventListener('click',copyAnswers); m.addEventListener('click',closeStation); var pr=$('.station .prog i'); if(pr) pr.style.width='100%'; }
 ];
}

// ---------- identity card ----------
function cardEl(final){
 var I=S.inborn; var c=h('div',{cls:'idcard'+(final||S.done[6]?' final':'')});
 var sec=function(icon,title,body,lock){return '<div class="ic-s'+(lock?' lock':'')+'"><h4>'+icon+' '+title+'</h4>'+(lock?'<p class="small">🔒 '+lock+'</p>':body)+'</div>';};
 var head='<div class="ic-top"><div class="ic-av">'+avatarSVG({bgc:'#fff'})+'</div><div class="ic-id"><small>מדינת עיר הזהויות · תעודת זהות</small><h3>'+(hasChar()?esc(S.name):'???')+'</h3>'+(I?'<p>'+g('נולד','נולדה')+' ב'+I.city+'</p>':'')+'</div>'+(S.done[6]?'<div class="stamp">הונפקה ✓</div>':'')+'</div>';
 var inb=I?'<ul class="tags">'+bornRows().map(function(r){var f=G.s1.change[r.k].fixed;return '<li class="'+(f?'fx':'cg')+'">'+(f?'🔒':'🔄')+' '+r.label+': <b>'+r.val+'</b></li>';}).join('')+'</ul>':'';
 var pers=S.done[2]?'<ul class="tags"><li>✨ '+S.traits.join('</li><li>✨ ')+'</li><li>💇 מראה שבחרתי</li></ul>':'';
 var soc=S.done[2]?'<ul class="tags"><li>👥 '+S.group+'</li>'+(I?'<li>🌍 '+I.origin+'</li>':'')+'</ul>':'';
 var sub=S.done[3]?'<ul class="tags">'+G.s3.places.map(function(p){return '<li style="--c:'+p.color+'" class="bd">🏅 '+p.badge+': <b>'+clean(p.opts[S.places[p.id]])+'</b></li>';}).join('')+'</ul>':'';
 var mir=S.done[4]?'<p>💭 "'+esc(S.s4.selfImage||'')+'"</p><p>💪 '+esc(S.s4.act||'')+'</p><p class="small">הזהות התפתחה מתוך אינטראקציה עם אחרים.</p>':'';
 var th=S.done[5]?'<div class="shows">'+G.s5.scenes.map(function(sc){var r=S.s5[sc.id]||{};return '<div class="show"><div class="av-sm">'+avatarSVG({stage:true,outfit:r.outfit,prop:r.prop})+'</div><small>'+sc.name+' '+'⭐'.repeat(r.stars||0)+'</small></div>';}).join('')+'</div>':'';
 var worn=Object.keys(S.worn).map(function(k){var it=G.shop.filter(function(x){return x.id===S.worn[k]})[0];return it?'<li>'+it.icon+' '+it.name+' → <b>'+it.comp+'</b></li>':'';}).join('');
 c.innerHTML=head+sec('🍼','מרכיבים מולדים',inb,S.done[1]?'':'ייפתח בתחנה 1')+sec('🙋','זהות אישית',pers,S.done[2]?'':'ייפתח בתחנה 2')+sec('👥','זהות חברתית',soc,S.done[2]?'':'ייפתח בתחנה 2')+
  sec('🏅','זהויות משנה (מרכיבים נרכשים)',sub,S.done[3]?'':'ייפתח בתחנה 3')+sec('🪞','זהות שהתפתחה באינטראקציה',mir,S.done[4]?'':'ייפתח בתחנה 4')+sec('🎭','הצגת העצמי – המופעים שלי',th,S.done[5]?'':'ייפתח בתחנה 5')+
  sec('🛍️','הסמלים של הדמות (מהחנות)',worn?'<ul class="tags">'+worn+'</ul>':'<p class="small">עוד לא נבחרו פריטים בחנות.</p>');
 if(S.done[6]) c.innerHTML+=sec('✍️','הרפלקציה שלי',(S.texts.depp?'<p>'+esc(S.texts.depp)+'</p>':'<p class="small">—</p>'));
 return c;
}
function openCard(){var bd=sheet('🪪 הזהות של הדמות','tall'); bd.appendChild(cardEl()); var row=h('div',{cls:'row'}); var ed=h('button',{cls:'btn'},'✏️ החלפת הדמות'); row.appendChild(ed); ed.addEventListener('click',function(){closeSheet(); openBuilder({onDone:function(){openCard();}});}); var cp=h('button',{cls:'btn ghost'},'📋 העתקת התשובות שלי'); row.appendChild(cp); bd.appendChild(row); cp.addEventListener('click',copyAnswers); if(S.form){ var sbx=h('div'); bd.appendChild(sbx); var rs=h('button',{cls:'btn ghost'},'📤 שליחת כל התשובות למורה'); var rr=h('div',{cls:'row'}); rr.appendChild(rs); bd.appendChild(rr); rs.addEventListener('click',function(){ var ids=[1,2,3,4,5,6].filter(function(i){return S.done[i]}); if(!ids.length){toast('עוד אין תחנות שהסתיימו',false);return;} if(!S.student.name){ sendStation(ids[0],sbx); return; } var rows=[]; ids.forEach(function(i){rows=rows.concat(stationRows(i));}); rs.disabled=true; sendRows(S.form,rows).then(function(ok){rs.disabled=false; toast(ok?'✓ כל התשובות נשלחו למורה 📤':'⚠️ לא הצלחתי לשלוח',ok);}); }); }}
function copyAnswers(){
 var I=S.inborn||{}; var L=['עיר הזהויות – '+(S.name||'')];
 if(S.texts.s1think) L.push('תחנה 1 – מה אפשר לשנות?\n'+S.texts.s1think);
 if(S.texts.s3reflect) L.push('תחנה 3 – מרכיבים מתנגשים:\n'+S.texts.s3reflect);
 if(S.texts.depp) L.push('ג׳וני דפ – האם גם אני מציג/ה את עצמי אחרת?\n'+S.texts.depp);
 G.s6.greta.qs.forEach(function(q,k){ if(S.texts.greta[k]) L.push(q.q+'\n'+S.texts.greta[k]); });
 L.push('בדיקות ידע: '+[1,2,3,4,5,6].map(function(i){return 'תחנה '+i+': '+(S.quiz[i]!=null?S.quiz[i]+'/4':'—')}).join(' · '));
 copyText(L.join('\n\n'),'התשובות הועתקו – אפשר להדביק ולשלוח למורה 📋');
}
function copyText(t,msg){
 function fb(){var ta=h('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast(msg);}catch(e){toast('לא הצלחתי להעתיק',false);}ta.remove();}
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){toast(msg)},fb);}else fb();
}

// ---------- shop ----------
function openShop(){
 var bd=sheet('🛍️ החנות של עיר הזהויות','tall');
 function render(){
  bd.innerHTML='';
  var top=h('div',{cls:'shop-top'}); top.innerHTML='<div class="av-prev">'+avatarSVG()+'</div><div><p>כל פריט הוא <b>סמל</b> – ויש לו משמעות. הפריטים מופיעים כתגים ליד הדמות. לפני שקונים, קראו איזה מרכיב זהות הוא מבטא.</p>'+(points()?'<div class="coins"><span>🪙</span><b>'+S.coins+'</b></div>':'<div class="free">🎁 מצב בלי ניקוד: הכול בחינם</div>')+'</div>';
  bd.appendChild(top);
  if(hasChar()) bd.appendChild(h('div',{cls:'wbox'},wornTags('<p class="small center">🏷️ עוד אין לדמות סמלים. בחרו פריט – והוא יופיע כתג ליד הדמות.</p>')));
  if(!hasChar()) bd.appendChild(card('bad','🎨 קודם בוחרים דמות – אחר כך מוסיפים לה סמלים.'));
  Object.keys(G.slotNames).forEach(function(slot){
   bd.appendChild(h('div',{cls:'lbl'},G.slotNames[slot]));
   var grid=h('div',{cls:'shopgrid'}); bd.appendChild(grid);
   G.shop.filter(function(it){return it.slot===slot}).forEach(function(it){
    var own=S.owned.indexOf(it.id)>=0, wearing=S.worn[slot]===it.id;
    var c=h('button',{cls:'item'+(own?' own':'')+(wearing?' wear':'')});
    var ic='<span class="it-ic">'+it.icon+'</span>';
    c.innerHTML=ic+'<b>'+it.name+'</b><small class="comp">'+it.comp+'</small><small class="pr">'+(wearing?'✓ ליד הדמות':own?'שלי':(points()?'🪙 '+it.price:'חינם'))+'</small>';
    c.addEventListener('click',function(){itemDetail(it,render)}); grid.appendChild(c);
   });
  });
 }
 render();
}
function itemDetail(it,back){
 var own=S.owned.indexOf(it.id)>=0, wearing=S.worn[it.slot]===it.id;
 var bd=$('.sheet-b'); bd.innerHTML='';
 var prevWorn={}; prevWorn[it.slot]=it.id;
 bd.appendChild(h('div',{cls:'item-d'},'<div class="av-prev">'+(hasChar()?avatarSVG({worn:prevWorn}):avatarSVG())+'</div><h3>'+it.icon+' '+it.name+'</h3><div class="compb">מבטא: <b>'+it.comp+'</b></div><p>'+it.ex+'</p>'));
 var row=h('div',{cls:'row'}); bd.appendChild(row);
 var bk=h('button',{cls:'btn ghost'},'› חזרה'); bk.addEventListener('click',back); row.appendChild(bk);
 if(!hasChar()){return;}
 var act=h('button',{cls:'btn'}); row.appendChild(act);
 if(wearing){act.textContent='להסיר מהדמות'; act.addEventListener('click',function(){delete S.worn[it.slot];save();updateHud();back();});}
 else if(own){act.textContent='להוסיף לדמות'; act.addEventListener('click',function(){S.worn[it.slot]=it.id;save();updateHud();toast('👕 '+it.name+' – '+it.comp);back();});}
 else { var price=points()?it.price:0; act.textContent=price?('לקנות · 🪙 '+price):'לקחת (חינם)';
  if(price>S.coins){act.disabled=true; bd.appendChild(h('p',{cls:'center small'},'חסרים '+(price-S.coins)+' מטבעות. אפשר להרוויח בתחנות ובבדיקות הידע 💪'));}
  act.addEventListener('click',function(){ if(price>S.coins)return; S.coins-=price; S.owned.push(it.id); S.worn[it.slot]=it.id; save(); updateHud(); toast('🛍️ '+it.name+' – מבטא '+it.comp); back(); });
 }
}

// ---------- teacher ----------
function openTeacher(){
 var bd=sheet('🧑‍🏫 כניסת מורה','small');
 bd.innerHTML='<form id="tf" class="codef"><input id="ti" type="password" autocomplete="off" inputmode="numeric" placeholder="קוד מורה" aria-label="קוד מורה"><button class="btn" type="submit">כניסה</button></form><p class="err" id="terr"></p>';
 setTimeout(function(){$('#ti').focus()},200);
 $('#tf').addEventListener('submit',function(e){e.preventDefault(); var v=$('#ti').value; if(fnv(norm(v))!==G.teacherHash){$('#terr').textContent='קוד מורה שגוי';return;} teacherPanel(openBox(v));});
}
function teacherPanel(codes){
 var bd=sheet('🧑‍🏫 מסך מורה','tall');
 var base=location.origin+location.pathname;
 var lp=base+'?mode=points', lf=base+'?mode=free';
 var rows=G.stations.map(function(st){return '<tr><td>'+st.icon+' '+st.id+'. '+st.name+'<br><small>'+st.sub+'</small></td><td class="code">'+(st.id===1?'פתוחה תמיד':'<b>'+(codes&&codes[st.id]||'?')+'</b>')+'</td></tr>';}).join('');
 bd.innerHTML='<div class="panel"><h3>1. בחירת מצב המשחק</h3><p>שלחו לתלמידים <b>אחד</b> משני הקישורים. המצב נשמר במכשיר של כל תלמיד/ה כשהם פותחים את הקישור (אפשר להחליף בכל שלב – פשוט לשלוח את הקישור השני).</p>'+
  linkBox('🪙 עם ניקוד ומטבעות',lp,'מטבעות על כל פעילות ותשובה נכונה, ובחנות קונים במטבעות.')+linkBox('🎁 בלי ניקוד',lf,'אין מטבעות ואין ציון במסך. החנות פתוחה וכל הפריטים חינם.')+'</div>'+
  '<div class="panel"><h3>2. קודי התחנות</h3><p>תחנה 1 פתוחה לכולם. את שאר התחנות פותחים בכיתה: אומרים את הקוד בקול כשמגיעים לנושא. הקוד לא תלוי באותיות סופיות או ברווחים.</p><table class="codes">'+rows+'</table></div>'+
  (function(){var tfm=''; try{tfm=localStorage.getItem('idc-teacher-form')||'';}catch(e){} var lpf=lp+(tfm?'&f='+tfm:''), lff=lf+(tfm?'&f='+tfm:'');
  return '<div class="panel tform"><h3>📥 תשובות פתוחות – ישר לגיליון שלך</h3><p>כל מורה יוצר/ת לעצמו טופס גוגל משלו (חד-פעמי, כ-2 דקות). אחר כך כל תלמיד שמסיים תחנה שולח את התשובות הפתוחות שלו לטופס – והן נכנסות לגיליון שלך: שם, כיתה, תחנה, שאלה ותשובה.</p>'+
  '<ol class="steps"><li><b>יוצרים עותק:</b> <a class="btn sm" href="https://docs.google.com/forms/d/'+G.formTemplate+'/copy" target="_blank" rel="noopener">יצירת טופס משלי</a><br><small>נפתח גוגל טפסים ← "יצירת עותק".</small></li>'+
  '<li><b>מפרסמים ומחברים גיליון:</b> בעותק לוחצים <b>"פרסום"</b> (למעלה). אחר כך בלשונית <b>"תשובות"</b> ← <b>"קישור ל-Sheets"</b> ← יצירת גיליון חדש.<br><small>אם החשבון של בית הספר: ב"הגדרות" ← "תשובות" לבטל את "הגבלה למשתמשים בארגון", כדי שתלמידים יוכלו לשלוח בלי להתחבר.</small></li>'+
  '<li><b>מדביקים כאן</b> את כתובת הטופס משורת הכתובת (מתחילה ב-docs.google.com/forms/d/…):<div class="lrow"><input id="tFm" placeholder="https://docs.google.com/forms/d/…/edit" aria-label="כתובת הטופס" value="'+(tfm?'https://docs.google.com/forms/d/'+tfm+'/edit':'')+'"><button class="btn sm" id="tFmGo">שמירה</button></div><p class="err" id="tFmErr"></p></li></ol>'+
  (tfm?'<p class="okline">✓ הטופס שלך מחובר. שלחו לתלמידים את אחד הקישורים האלה (במקום הקישורים שלמעלה):</p>'+linkBox('🪙 עם ניקוד + שליחת תשובות',lpf,'כמו "עם ניקוד", והתשובות הפתוחות נשלחות לגיליון שלך.')+linkBox('🎁 בלי ניקוד + שליחת תשובות',lff,'כמו "בלי ניקוד", והתשובות הפתוחות נשלחות לגיליון שלך.')+'<div class="row wrap"><button class="btn ghost sm" id="tFmTest">שליחת שורת בדיקה לגיליון</button><button class="btn ghost sm danger" id="tFmDel">ניתוק הטופס</button></div>':'')+
  '<p class="small">בלי טופס, המשחק עובד כרגיל וכפתור "העתקת התשובות שלי" נשאר.</p></div>';})()+
  '<div class="panel"><h3>🧭 מעבר חופשי בין תחנות</h3><p>פותחים כל תחנה ישירות, בלי קודים ובלי לעבור תחנה-תחנה. זה מצב תצוגה למורה במכשיר הזה: ההתקדמות בו נפרדת, ולא פותח תחנות לתלמידים.</p>'+teacherJumpList()+(TEACHER?'<button class="btn ghost danger" id="tExitT">יציאה ממצב מורה</button>':'')+'</div>'+
  '<div class="panel"><h3>3. במכשיר הזה (לבדיקה)</h3><p>המצב כאן כרגע: <b>'+(points()?'עם ניקוד':'בלי ניקוד')+'</b></p><div class="row wrap"><button class="btn ghost" id="tAll">פתיחת כל התחנות כאן</button><button class="btn ghost" id="tMode">החלפת מצב כאן</button><button class="btn ghost danger" id="tReset">איפוס ההתקדמות כאן</button></div></div>'+
  '<p class="small center">התלמידים משחקים כל אחד במכשיר שלו, וההתקדמות נשמרת בדפדפן. עם טופס מחובר – התשובות הפתוחות מגיעות לגיליון שלך בסוף כל תחנה; ובכל מקרה כפתור "העתקת התשובות שלי" מאפשר להם להדביק ולשלוח לך.</p>';
 $$('.cpy',bd).forEach(function(b){b.addEventListener('click',function(){copyText(b.dataset.u,'הקישור הועתק 📋');});});
 $('#tFmGo').addEventListener('click',function(){ var v=$('#tFm').value; if(/forms\.gle/.test(v)){$('#tFmErr').textContent='זה קישור מקוצר. העתיקו את הכתובת משורת הכתובת כשהטופס פתוח לעריכה.';return;} var f=parseForm(v); if(!f){$('#tFmErr').textContent='לא זיהיתי כתובת של טופס גוגל. היא צריכה להתחיל ב-docs.google.com/forms/d/';return;} try{localStorage.setItem('idc-teacher-form',f);}catch(e){} toast('✓ הטופס חובר – הנה הקישורים לתלמידים'); teacherPanel(codes); setTimeout(function(){var x=$('.tform .okline'); if(x) x.scrollIntoView({behavior:'smooth',block:'start'});},100); });
 var tt=$('#tFmTest'); if(tt) tt.addEventListener('click',function(){ var f=''; try{f=localStorage.getItem('idc-teacher-form')||'';}catch(e){} sendRows(f,[{student:'בדיקה מהמורה',cls:'—',station:'בדיקה',q:'האם הטופס מחובר?',a:'כן! אם השורה הזאת בגיליון – הכול עובד ✓'}]).then(function(){toast('נשלחה שורת בדיקה – הציצו בגיליון בעוד כמה שניות 📥');}); });
 var td=$('#tFmDel'); if(td) td.addEventListener('click',function(){ try{localStorage.removeItem('idc-teacher-form');}catch(e){} teacherPanel(codes); });
 bindJump(bd); var tx=$('#tExitT',bd); if(tx) tx.addEventListener('click',exitTeacher);
 $('#tAll').addEventListener('click',function(){S.unlocked=[1,2,3,4,5,6];save();toast('כל התחנות נפתחו במכשיר הזה');closeSheet();renderMap();});
 $('#tMode').addEventListener('click',function(){S.mode=points()?'free':'points';save();toast('המצב כאן: '+(points()?'עם ניקוד':'בלי ניקוד'));teacherPanel(codes);updateHud();});
 $('#tReset').addEventListener('click',function(){ if(!confirm('לאפס את כל ההתקדמות במכשיר הזה?'))return; var m=S.mode; S=fresh(); S.mode=m; save(); closeSheet(); renderStart();});
}
function linkBox(title,url,desc){return '<div class="linkbox"><b>'+title+'</b><small>'+desc+'</small><div class="lrow"><input readonly value="'+url+'" aria-label="קישור"><button class="btn sm cpy" data-u="'+url+'">העתקה</button><a class="btn sm wa" href="https://wa.me/?text='+encodeURIComponent('עיר הזהויות 🏙️ '+url)+'" target="_blank" rel="noopener">וואטסאפ</a></div></div>';}

// ---------- character gallery ----------
function applyChar(c){
 var prevSex=S.sex; S.char=c.id; S.sex=c.sex; S.skin=c.skin; S.built=true;
 // inborn components already drawn must fit the chosen character
 if(S.inborn){ var pool=c.pool.map(function(i){return G.s1.profiles[i];}); var fits=pool.some(function(p){return p.origin===S.inborn.origin&&p.religion===S.inborn.religion;});
  if(!fits){ var pr=pick(pool); S.inborn.origin=pr.origin; S.inborn.religion=pr.religion; S.inborn.city=pr.city; S.inborn.cit=pr.cit; return true; } }
 if(prevSex!==S.sex&&S.traits.length){ // re-address chosen traits
  S.traits=S.traits.map(function(t){for(var i=0;i<G.s2.traits.length;i++){var p=G.s2.traits[i];if(p[0]===t||p[1]===t)return S.sex==='m'?p[0]:p[1];}return t;});
 }
 return false;
}
function openBuilder(opts){
 opts=opts||{};
 var old=$('.builder'); if(old) old.remove();
 var first=!!opts.first||!hasChar();
 var C=G.comp, cur=chr();
 // choices: restored from save, else derived from the current character
 var ch={}; if(S.comp&&typeof S.comp==='object'){for(var k0 in S.comp)ch[k0]=S.comp[k0];}
 else if(cur&&cur.b!=null){ch={sex:cur.sex,skin:cur.skin,b:cur.b,hc:cur.cv==='hijab'?null:cur.hc,len:cur.cv==='hijab'?null:cur.len,curl:cur.cv==='hijab'?null:cur.curl,eye:cur.eye,gl:cur.gl,cv:cur.cv};}
 var sel=cur?cur.id:null, manual=!!cur, step=0;
 var ov=h('div',{cls:'builder gal comp',role:'dialog','aria-label':'בונים את הדמות'});
 ov.innerHTML='<div class="b-head"><h2>🎨 '+(first?'בונים את הדמות':'עריכת הדמות')+'</h2>'+(first?'':'<button class="x" id="bX" aria-label="סגירה">✕</button>')+'</div>'+
  (opts.legacy?'<p class="b-new">חדש! ✨ עכשיו מרכיבים את הדמות שלב אחרי שלב. ההתקדמות שלכם נשמרה.</p>':'')+
  '<div class="b-top"><div class="b-prev" id="bPrev"></div><div class="b-side"><label class="lbl" for="bName">איך קוראים לדמות?</label><input id="bName" maxlength="14" placeholder="למשל: נוי, עומר, לין…" value="'+esc(S.name)+'"><p class="b-note" id="bSex"></p></div></div>'+
  '<div class="c-sim" id="cSim"></div>'+
  '<div class="c-steps" id="cSteps" role="tablist"></div>'+
  '<div class="b-body" id="bBody"><div class="c-step" id="cStep"></div></div>'+
  '<div class="b-foot c-foot"><button class="btn ghost" id="cBack">→ הקודם</button><button class="btn big" id="bDone"></button></div>';
 document.body.appendChild(ov); document.body.classList.add('noscroll');
 var STEPS=C.steps;
 function visible(st){ if(ch.cv==='hijab'&&(st.id==='hc'||st.id==='hair')) return false; return true; }
 function vis(){return STEPS.filter(visible);}
 function stepDone(st){return st.keys.every(function(k){return ch[k]!=null;});}
 function eyeD(a,b){var o=C.eyeOrder;return Math.abs(o.indexOf(a)-o.indexOf(b));}
 function dist(c){
  var d=0;
  if(ch.sex) d+= c.sex===ch.sex?0:1000;
  if(ch.skin!=null) d+= 4*Math.abs(C.skinOrder.indexOf(c.skin)-C.skinOrder.indexOf(ch.skin));
  if(ch.b!=null) d+= 3.2*Math.abs((c.b==null?1:c.b)-ch.b);
  if(ch.cv!=null){ if(ch.cv!==c.cv) d+= (ch.cv==='none'||c.cv==='none')?7:9; }
  if(ch.cv!=='hijab'){
   if(ch.hc!=null){ d+= c.hc==='none'?4:3*C.hcDist[ch.hc][c.hc]; }
   if(ch.len!=null&&c.hc!=='none') d+= 1.5*Math.abs(c.len-ch.len);
   if(ch.curl!=null&&c.hc!=='none') d+= 1.2*Math.abs(c.curl-ch.curl);
  }
  if(ch.eye!=null) d+= 2*eyeD(c.eye||'brown',ch.eye);
  if(ch.gl!=null) d+= (c.gl?1:0)===ch.gl?0:2.5;
  return d;
 }
 function ranked(){return G.chars.map(function(c,i){return {c:c,d:dist(c)+i*0.001};}).sort(function(x,y){return x.d-y.d;});}
 function byId(id){return G.chars.filter(function(x){return x.id===id})[0];}
 function prev(anim){
  var r=ranked(); if(!manual||!sel) sel=r[0].c.id;
  var c=byId(sel); var any=Object.keys(ch).some(function(k){return ch[k]!=null;});
  var p=$('#bPrev');
  p.innerHTML=(any||cur)?'<span class="pic"><span class="pic-in">'+chImg(c)+'</span></span>':'<span class="pic baby"><span>👆</span></span>';
  if(anim){p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop');}
  var sx=(any||cur)?c.sex:ch.sex;
  $('#bSex').innerHTML=sx?(sx==='m'?'👦 המשחק יפנה לדמות בלשון זכר':'👧 המשחק יפנה לדמות בלשון נקבה'):'בחרו שלב אחרי שלב – הדמות תתעדכן 👇';
  var sim=$('#cSim');
  if(!(any||cur)){sim.innerHTML='';return;}
  var others=r.filter(function(x){return x.c.id!==sel&&x.c.sex===c.sex;}).slice(0,3);
  if(manual&&r[0].c.id!==sel) others=[r[0]].concat(others.filter(function(x){return x.c.id!==r[0].c.id;})).slice(0,3);
  sim.innerHTML='<span class="c-sim-l">עוד דמויות דומות:</span>';
  others.forEach(function(x){var bt=h('button',{cls:'g-opt c-alt','aria-label':'דמות דומה','data-id':x.c.id},chImg(x.c,true)); sim.appendChild(bt);
   bt.addEventListener('click',function(){sel=x.c.id; manual=true; prev(true);});});
 }
 function tabs(){
  var t=$('#cSteps'); t.innerHTML=''; var vs=vis();
  vs.forEach(function(st,i){var b=h('button',{cls:'c-tab'+(i===step?' on':'')+(stepDone(st)?' done':''),role:'tab','aria-selected':i===step?'true':'false'},(stepDone(st)&&i!==step?'✓ ':'')+st.short);
   t.appendChild(b); b.addEventListener('click',function(){step=i; render();});});
  var on=$('.c-tab.on',t); if(on&&on.scrollIntoView) try{on.scrollIntoView({block:'nearest',inline:'center'});}catch(e){}
 }
 function chipRow(key,opts2,label){
  var w=h('div',{cls:'c-group'}); if(label) w.appendChild(h('div',{cls:'c-sub'},label));
  var row=h('div',{cls:'c-chips'}); w.appendChild(row);
  opts2.forEach(function(o){ if(o.sex&&ch.sex&&o.sex!==ch.sex) return;
   var on=ch[key]===o.v;
   var b=h('button',{cls:'c-chip'+(on?' sel':''),'aria-pressed':on?'true':'false'},(o.sw?'<i class="sw" style="background:'+o.sw+'"></i>':'')+(o.e?'<span class="e">'+o.e+'</span>':'')+'<span>'+(ch.sex==='m'&&o.m?o.m:o.t)+'</span>');
   row.appendChild(b);
   b.addEventListener('click',function(){ ch[key]=o.v; manual=false;
    if(key==='sex'){ if(ch.cv==='hijab'&&o.v==='m') ch.cv=null; if(ch.cv==='kippah'&&o.v==='f') ch.cv=null; }
    if(key==='cv'&&o.v==='hijab'){ ch.hc=null; ch.len=null; ch.curl=null; }
    S.comp=ch; save();
    prev(true); var st=vis()[step];
    if(stepDone(st)&&step<vis().length-1){ render(true); setTimeout(function(){ if(document.body.contains(ov)&&vis()[step]===st){ step++; render(); } },380); }
    else render(true);
   });
  });
  return w;
 }
 function render(keep){
  var vs=vis(); if(step>vs.length-1) step=vs.length-1; var st=vs[step];
  tabs();
  var box=$('#cStep'); box.innerHTML='';
  box.appendChild(h('h3',{cls:'c-q'},'<span class="c-n">'+(step+1)+'/'+vs.length+'</span> '+(ch.sex==='m'&&st.qm?st.qm:st.q)));
  st.rows.forEach(function(rw){ box.appendChild(chipRow(rw.key,rw.opts,rw.label)); });
  if(st.note) box.appendChild(h('p',{cls:'b-note c-note'},st.note));
  $('#cBack').style.visibility=step>0?'visible':'hidden';
  var last=step===vs.length-1;
  $('#bDone').textContent= last ? (first?'יוצאים לעיר! 🏙️':'שמירה ✓') : (first?'הבא ←':'שמירה ✓');
  $('#bDone').dataset.last=last?'1':'';
  if(!keep) $('#bBody').scrollTop=0;
 }
 $('#bName').addEventListener('input',function(){S.name=this.value.trim().slice(0,14);save();});
 $('#cBack').addEventListener('click',function(){ if(step>0){step--; render();} });
 function finish(close){
  if(close&&!first){ov.remove(); if(!$('.station')) document.body.classList.remove('noscroll'); return;}
  if(!ch.sex&&!cur){ step=0; render(); toast('מתחילים מהשלב הראשון 👆',false); return; }
  var c=byId(sel);
  if(!c){toast('בחרו דמות 👆',false);return;}
  var v=$('#bName').value.trim();
  if(!v){var n=$('#bName');n.classList.add('shake');n.focus();setTimeout(function(){n.classList.remove('shake')},500);toast('איך קוראים לדמות? ✍️',false);return;}
  var redrawn=applyChar(c); S.comp=ch;
  S.name=v.slice(0,14); var wasStarted=S.started; S.started=true; save();
  ov.remove(); if(!$('.station')) document.body.classList.remove('noscroll');
  if(first){ if(!wasStarted||!$('.map')) renderMap(); else updateHud(); confetti(); toast('✨ '+esc(S.name)+' '+g('מוכן','מוכנה')+'! '+(S.born?'ממשיכים במסע':'מתחילים בבית החולים 🏥'));}
  else { updateHud(); toast(redrawn?'✓ הדמות עודכנה – והמוצא הוגרל מחדש כך שיתאים לה':'✓ הדמות עודכנה'); }
  if(opts.onDone) opts.onDone();
 }
 $('#bDone').addEventListener('click',function(){
  if(this.dataset.last!=='1'&&first){ var st=vis()[step]; if(!stepDone(st)&&step===0&&!ch.sex&&!cur){toast('בחרו בת או בן 👆',false);return;} step++; render(); return; }
  finish(false);
 });
 var bx=$('#bX',ov); if(bx) bx.addEventListener('click',function(){finish(true)});
 prev(); render();
}

// ---------- boot ----------
if(TEACHER){ teacherPrep(); renderMap(); teacherFab(); }
else if(S.started){ renderMap(); if(!hasChar()) openBuilder({first:true,legacy:!!(S.built||S.born)}); } else renderStart();
window.__idc={state:function(){return S}};
})();
