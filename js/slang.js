'use strict';
/* ===== МОЛОДЁЖНЫЙ СЛЕНГ: карточки и мини-тест (общий для обоих языков, данные — SLANG в slang_data.js)
   SLANG: [слово, произношение, значение, пример, перевод примера, где уместно] ===== */
let SQ = null;
function renderSlang(){
  SQ = null;
  $('#talkBody').innerHTML = `<h2>Модный сленг</h2>
   <div class="mut">Так говорят подростки и блогеры в соцсетях. Сленг быстро меняется, поэтому смотри на пометку: где такое уместно, а где лучше сказать обычными словами.</div>
   <button class="primary" onclick="slangQuiz()">🧩 Тест: что это значит? (10 вопросов)</button>
   ${SLANG.map((s,i) => { const a = R(s[0]), b = R(s[3]);
     return `<div class="card slang"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><span><b class="${IS_EN?'en':'hz'}" style="font-size:24px">${s[0]}</b> ${s[1]?`<span class="py">${s[1]}</span>`:''}</span><button class="btn" onclick="sayI(${a})" aria-label="Послушать">🔊</button></div>
      <div style="font-size:17px;margin:4px 0">${s[2]}</div>
      <div class="pvi"><span class="${IS_EN?'en':'hz'}">${s[3]}</span> <button class="btn sm" onclick="sayI(${b})" aria-label="Послушать пример">🔊</button><div class="mut">${s[4]}</div></div>
      <div class="mut" style="margin-top:6px">💬 ${s[5]}</div></div>`; }).join('')}`;
}
function slangQuiz(){
  const qs = shuffle(SLANG).slice(0, 10).map(s => ({s, opts:shuffle([s].concat(shuffle(SLANG.filter(x => x!==s)).slice(0,3)))}));
  SQ = {qs, i:0, ok:0}; slangQ();
}
function slangQ(){
  if(SQ.i >= SQ.qs.length){
    award('game', SQ.ok); addXP(SQ.ok);
    if(SQ.ok >= 8) confetti(100);
    $('#talkBody').innerHTML = `<div class="card center"><div style="font-size:48px">${SQ.ok>=8?'😎':'💪'}</div><h2>${SQ.ok} из ${SQ.qs.length}</h2>${mascotHTML(64, SQ.ok>=8 ? (IS_EN?'You ate! 🔥':'YYDS！') : 'Ещё разок?')}
      <button class="primary" onclick="slangQuiz()">Ещё тест</button><button class="btn" style="width:100%;margin-top:6px" onclick="renderSlang()">К словам</button></div>`;
    return;
  }
  const q = SQ.qs[SQ.i]; SQ.done = false; const a = R(q.s[0]);
  $('#talkBody').innerHTML = `<div class="card"><div class="mut">Вопрос ${SQ.i+1} из ${SQ.qs.length} · верно ${SQ.ok}</div>
    <div class="center" style="margin:8px 0"><b class="${IS_EN?'en':'hz'}" style="font-size:34px">${q.s[0]}</b> <button class="btn" onclick="sayI(${a})">🔊</button></div>
    <div id="sqo" style="display:grid;gap:8px">${q.opts.map((o,k) => `<button class="opt" onclick="slangAns(${k})">${o[2]}</button>`).join('')}</div><div id="sqr" class="res"></div></div>`;
}
function slangAns(k){
  if(SQ.done) return; SQ.done = true;
  const q = SQ.qs[SQ.i], right = q.opts.indexOf(q.s), ok = k === right; if(ok) SQ.ok++;
  award('task', ok);
  const bs = document.querySelectorAll('#sqo button'); bs[right].classList.add('ok'); if(!ok) bs[k].classList.add('bad');
  $('#sqr').innerHTML = `<div class="pvi"><span class="${IS_EN?'en':'hz'}">${q.s[3]}</span><div class="mut">${q.s[4]}</div></div><button class="primary" onclick="SQ.i++;slangQ()">Дальше →</button>`;
}
