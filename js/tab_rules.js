'use strict';
/* ===== ПРАВИЛА: грамматика и числа ===== */
function renderRules(){
  const sub = S.sub.rules || 'gram';
  $('#t-rules').innerHTML = subnav('rules', [['gram','Грамматика'],['num','Числа, время, деньги']], sub) + '<div id="rulesBody"></div>';
  if(sub==='num') numEnter(); else if(GL!==null) renderLesson(); else renderGrammarList();
}

/* ---- список уроков ---- */
let GL = null;   // индекс открытого урока
function lessonDone(i){ return (S.gram||{})[i]; }
function renderGrammarList(){
  const done = GRAMMAR.filter((g,i)=>lessonDone(i)).length;
  $('#rulesBody').innerHTML = `<h2>Грамматика</h2>
   <div class="mut">Китайская грамматика проще русской: слова не меняются, всё решает порядок. Пройдено уроков: ${done} из ${GRAMMAR.length}.</div>
   ${GRAMMAR.map((g,i)=>`<div class="card row" style="justify-content:space-between;flex-wrap:nowrap;cursor:pointer" onclick="GL=${i};renderLesson()">
     <span><span class="mut">Урок ${i+1}</span><br><b>${g.t}</b></span><span>${lessonDone(i)?'✅':'→'}</span></div>`).join('')}`;
}

/* ---- урок + «собери предложение» ---- */
let GB = null;   // {bi: номер упражнения, picked: [индексы], order: [перемешанные индексы], done}
function renderLesson(){
  const g = GRAMMAR[GL];
  $('#rulesBody').innerHTML = `<div class="row" style="justify-content:space-between;margin-top:8px"><button class="btn" onclick="GL=null;GB=null;renderGrammarList()">← Все уроки</button><span class="mut">Урок ${GL+1} из ${GRAMMAR.length}</span></div>
   <h2>${g.t}</h2><div class="card">${g.x}</div>
   ${g.ex.map(e=>`<div class="card"><div class="hz mid" style="font-size:26px">${e[0]}</div><div class="py">${e[1]}</div><div>${e[2]}</div>
     <div class="row" style="margin-top:4px"><button class="btn" onclick="say('${esc(e[0])}')">🔊</button><button class="btn" onclick="slow('${esc(e[0])}')">🐢</button></div></div>`).join('')}
   <h3>Собери предложение</h3><div class="card" id="gb"></div>`;
  gbStart(0);
}
function gbStart(bi){
  const b = GRAMMAR[GL].b[bi];
  let order = shuffle(b[0].map((x,i)=>i)); let guard=0;
  while(order.every((x,i)=>x===i) && b[0].length>1 && guard++<10) order = shuffle(order);
  GB = {bi, picked:[], order, done:false};
  gbRender();
}
function gbRender(){
  const g = GRAMMAR[GL], b = g.b[GB.bi], w = b[0];
  $('#gb').innerHTML = `<div class="mut">Задание ${GB.bi+1} из ${g.b.length}. Составьте по-китайски:</div>
   <div style="font-size:20px;margin:6px 0">«${b[1]}»</div>
   <div class="ans">${GB.picked.map((k,j)=>`<button class="tile2 hz" onclick="gbUndo(${j})">${w[k]}</button>`).join('') || '<span class="mut">нажимайте на слова ниже по порядку</span>'}</div>
   <div class="row" style="margin-top:8px">${GB.order.filter(k=>!GB.picked.includes(k)).map(k=>`<button class="tile2 hz" onclick="gbPick(${k})">${w[k]}</button>`).join('')}</div>
   <div class="res" id="gbr"></div>
   ${GB.picked.length===w.length && !GB.done ? '<button class="primary" onclick="gbCheck()">Проверить</button>' : ''}`;
}
function gbPick(k){ if(GB.done) return; GB.picked.push(k); gbRender(); }
function gbUndo(j){ if(GB.done) return; GB.picked.splice(j,1); gbRender(); }
function gbCheck(){
  const g = GRAMMAR[GL], b = g.b[GB.bi], w = b[0];
  const got = GB.picked.map(k=>w[k]).join(''), right = w.join('');
  const ok = got===right || (b[2]||[]).includes(got);
  GB.done = true; gbRender();
  const last = GB.bi+1 >= g.b.length;
  if(ok){ addXP(3); say(got); if(last){ S.gram = S.gram||{}; S.gram[GL]=1; save(); } }
  $('#gbr').innerHTML = (ok ? '<b style="color:var(--ok)">✅ Верно!</b> ' : '<b style="color:var(--bad)">❌ Правильно так:</b> ')
    + `<span class="hz" style="font-size:22px">${right}</span> <button class="btn" onclick="say('${esc(right)}')">🔊</button>`
    + `<div class="row" style="margin-top:6px">${ok?'':'<button class="btn" onclick="gbStart(GB.bi)">Ещё раз</button>'}`
    + (last ? (GL+1<GRAMMAR.length ? `<button class="btn" style="font-weight:600" onclick="GL++;renderLesson();window.scrollTo(0,0)">Следующий урок →</button>` : '<span>🎉 Все уроки пройдены!</span>')
            : `<button class="btn" style="font-weight:600" onclick="gbStart(${GB.bi+1})">Следующее задание →</button>`) + '</div>';
}

/* ---- числа, время, деньги, даты ---- */
const MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const WEEK = [['星期一','понедельник'],['星期二','вторник'],['星期三','среда'],['星期四','четверг'],['星期五','пятница'],['星期六','суббота'],['星期天','воскресенье']];
const NUM_KINDS = [['n1','0–99'],['n2','100–9999'],['price','Цены'],['time','Время'],['date','Даты'],['week','Дни недели']];
const rnd = (a,b) => a + (Math.random()*(b-a+1)|0);
function numItem(kind){
  if(kind==='n1'){ const n=rnd(0,99); return {zh:numZh(n), show:String(n)}; }
  if(kind==='n2'){ const n=rnd(100,9999); return {zh:numZh(n), show:String(n)}; }
  if(kind==='price'){ const y=rnd(1,99), j=pick([0,0,5,rnd(1,9)]); return {zh:numZh(y,true)+'块'+(j?DIG[j]:''), show:'¥ '+y+(j?','+j:'')}; }
  if(kind==='time'){ const h=rnd(1,12), m=pick([0,0,30,15,45,rnd(1,59)]);
    const mz = m===0 ? '' : m===30 ? '半' : (m<10 ? '零'+DIG[m] : numZh(m))+'分';
    return {zh:numZh(h,true)+'点'+mz, show:h+':'+String(m).padStart(2,'0')}; }
  if(kind==='date'){ const mo=rnd(1,12), d=rnd(1,28); return {zh:numZh(mo)+'月'+numZh(d)+'号', show:d+' '+MONTHS[mo-1]}; }
  const w = pick(WEEK); return {zh:w[0], show:w[1]};
}
function numPyOf(zh){ return numPy(zh); }
let NQ = null;
function numEnter(){
  const k = S.sub.numk || 'n1', m = S.sub.numm || 'hear';
  $('#rulesBody').innerHTML = `<h2>Числа, время, деньги</h2>
   <div class="card mut">Числа строятся как конструктор: 十 = 10, 二十 = 2×10, 二十三 = 2×10+3, 一百零五 = 105 (零 — «ноль» на месте пропуска).
    «Два» перед 百, 千, счётным словом, часами и 块 — <b>两</b>. 30 минут — 半 «половина». Месяц = число + 月, день = число + 号.</div>
   <div class="seg">${NUM_KINDS.map(([kk,l])=>`<button class="${kk===k?'on':''}" onclick="S.sub.numk='${kk}';save();numEnter()">${l}</button>`).join('')}</div>
   <div class="seg"><button class="${m==='hear'?'on':''}" onclick="S.sub.numm='hear';save();numEnter()">👂 Услышь</button><button class="${m==='say'?'on':''}" onclick="S.sub.numm='say';save();numEnter()">🗣 Скажи</button></div>
   <div class="card" id="nq"></div>`;
  numNext();
}
function numNext(){
  const k = S.sub.numk || 'n1', m = S.sub.numm || 'hear', it = numItem(k);
  const opts = [it];
  if(k==='n1' && +it.show>10 && +it.show%10){ const s=it.show.split('').reverse().join(''); if(s!==it.show) opts.push({zh:numZh(+s), show:String(+s)}); }
  let guard=0; while(opts.length<4 && guard++<50){ const o=numItem(k); if(!opts.some(x=>x.show===o.show)) opts.push(o); }
  NQ = {it, opts:shuffle(opts), done:false, n:(NQ?NQ.n:0), ok:(NQ?NQ.ok:0)};
  if(m==='hear'){
    $('#nq').innerHTML = `<div class="center"><button class="huge" onclick="say(NQ.it.zh)">🔊</button><div class="mut" style="margin-top:6px">Что прозвучало? Счёт: ${NQ.ok} из ${NQ.n}</div></div>
     <div class="opts" id="nqo">${NQ.opts.map((o,i)=>`<button onclick="numAns(${i})">${o.show}</button>`).join('')}</div><div class="res" id="nqr"></div>`;
    setTimeout(()=>say(it.zh),250);
  } else {
    $('#nq').innerHTML = `<div class="center"><div class="mut">Скажите по-китайски:</div><div style="font-size:40px;font-weight:700;margin:8px 0">${it.show}</div>
     <div class="row" style="justify-content:center"><button class="btn" onclick="numReveal()">Проверить себя</button><button class="btn" onclick="listen(NQ.it.zh,'nqm')">🎤</button></div>
     <div id="nqr" class="res"></div><div id="nqm" class="res"></div></div>`;
  }
}
function numReveal(){
  if(!NQ.done){ NQ.done=true; NQ.n++; NQ.ok++; addXP(1); }
  say(NQ.it.zh);
  $('#nqr').innerHTML = `<div class="hz mid" style="font-size:30px">${NQ.it.zh}</div><div class="py">${numPyOf(NQ.it.zh)}</div>
   <button class="primary" onclick="numNext()">Дальше →</button>`;
}
function numAns(i){
  if(NQ.done) return; NQ.done=true; NQ.n++;
  const right = NQ.opts.indexOf(NQ.it), ok = i===right; if(ok){ NQ.ok++; addXP(1); }
  const bs = document.querySelectorAll('#nqo button'); bs[right].classList.add('ok'); if(!ok) bs[i].classList.add('bad');
  $('#nqr').innerHTML = `<div class="center"><span class="hz" style="font-size:28px">${NQ.it.zh}</span> <span class="py">${numPyOf(NQ.it.zh)}</span></div>
   <div class="row" style="justify-content:center"><button class="btn" onclick="slow(NQ.it.zh)">🐢 медленно</button></div>
   <button class="primary" onclick="numNext()">Дальше →</button>`;
}
