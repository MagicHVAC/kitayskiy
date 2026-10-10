'use strict';
/* ===== СЛОВА: КАРТОЧКИ С ИНТЕРВАЛЬНЫМ ПОВТОРЕНИЕМ ===== */
let Q = [], cur = null, QZ = null, DL = 0;
function buildQueue(){
  const now=Date.now();
  const due = shuffle(WORDS.filter(w => S.srs[w[0]] && S.srs[w[0]].d <= now));
  const newLeft = Math.max(0, S.settings.newPerDay - dayRec().nw);
  const fresh = WORDS.filter(w => !S.srs[w[0]]).slice(0, newLeft);
  Q = due.concat(fresh);
}
function moreNew(){ const extra = WORDS.filter(w => !S.srs[w[0]] && !Q.includes(w)).slice(0,5); if(!extra.length){toast('Все слова уже в изучении 🎉');return;} Q = Q.concat(extra); renderCard(); }
function wordsEnter(){
  const m = S.settings.mode;
  $('#t-words').innerHTML = `
   <div class="seg">
    <button class="${m==='read'?'on':''}" onclick="setMode('read')">字 → смысл</button>
    <button class="${m==='listen'?'on':''}" onclick="setMode('listen')">🔊 → смысл</button>
    <button class="${m==='recall'?'on':''}" onclick="setMode('recall')">смысл → 字</button></div>
   <div class="mut" id="winfo"></div>
   <div class="card" id="card"></div>
   <div class="row"><button class="btn" onclick="startQuiz()" style="flex:1">🧩 Тест из 10 вопросов</button></div>
   <details class="card"><summary><b>📖 Весь словарь (${WORDS.length})</b></summary>
    <div class="seg" style="margin-top:8px">${[[0,'Все'],[1,'HSK 1'],[2,'HSK 2'],[3,'Курс']].map(([k,l])=>`<button class="${DL===k?'on':''}" onclick="DL=${k};wordsEnter();document.querySelector('#t-words details').open=true">${l}</button>`).join('')}</div>
    <input type="search" id="dsearch" placeholder="Поиск: иероглиф, пиньинь или перевод" oninput="renderDict(this.value)" style="margin:8px 0">
    <div class="mut">● серый — новое, ● оранжевый — изучается, ● зелёный — выучено</div><div id="dict"></div></details>`;
  if(QZ) renderQuiz(); else { if(!Q.length) buildQueue(); renderCard(); }
  renderDict('');
}
function setMode(m){ S.settings.mode=m; save(); wordsEnter(); }
function winfo(){ const c=counts(); const el=$('#winfo'); if(el) el.textContent = 'В очереди: '+Q.length+' · к повторению: '+c.due+' · новых сегодня: '+dayRec().nw+'/'+S.settings.newPerDay+' · выучено: '+c.known; }
function wordBack(w, id){
  return `<div class="hz big" onclick="say('${w[0]}')" style="cursor:pointer">${colorHz(w[0],w[1])}</div>
   <div class="center py">${colorPy(w[1])}</div><div class="center" style="font-size:20px;margin-top:4px">${w[2]}</div>
   <div class="row" style="justify-content:center;margin-top:8px">
    <button class="btn" onclick="say('${w[0]}')">🔊</button><button class="btn" onclick="slow('${w[0]}')">🐢 медленно</button>
    <button class="btn" onclick="strokes('${w[0]}','${id}w')">✍ черты</button><button class="btn" onclick="strokes('${w[0]}','${id}w',true)">✏ написать</button>
    <button class="btn" onclick="listen('${w[0]}','${id}m')">🎤 скажи</button></div>
   <div id="${id}w" class="center"></div><div id="${id}m" class="res center"></div>`;
}
function renderCard(){
  winfo();
  const box = $('#card'); if(!box) return;
  if(!Q.length){
    box.innerHTML = `<div class="center"><div style="font-size:48px">🎉</div><b>На сегодня всё!</b>
     <div class="mut">Возвращайтесь завтра — программа сама напомнит, что пора повторить.</div>
     <button class="primary" onclick="moreNew()">Ещё 5 новых слов</button></div>`; return;
  }
  cur = Q[0];
  const isNew = !S.srs[cur[0]], m = S.settings.mode;
  if(isNew){
    box.innerHTML = `<span class="badge">новое слово · ${cur[3]===3?'курс':'HSK '+cur[3]}</span>${wordBack(cur,'c')}
     <div class="mut center" style="margin-top:6px">Послушайте 2–3 раза и повторите вслух. Через пару карточек оно вернётся для проверки.</div>
     <button class="primary" onclick="introduce()">Запомнил, дальше</button>`;
    if(S.settings.autoplay) setTimeout(()=>say(cur[0]),250);
    return;
  }
  let front = m==='read' ? `<div class="hz big">${cur[0]}</div><div class="mut center">Что это значит? Как читается?</div>`
    : m==='listen' ? `<div class="center"><button class="huge" onclick="say(cur[0])">🔊</button><div class="mut">Что это значит?</div></div>`
    : `<div class="ru big center">${cur[2]}</div><div class="mut center">Вспомните иероглиф и произношение</div>`;
  box.innerHTML = `<div id="front">${front}</div><button class="primary" id="showBtn" onclick="reveal()">Показать ответ</button>`;
  if(m==='listen') setTimeout(()=>say(cur[0]),250);
}
function introduce(){
  S.srs[cur[0]] = {i:0, e:2.5, d:Date.now(), r:0, l:0};
  dayRec().nw++; addXP(2);
  Q.shift(); Q.splice(Math.min(3,Q.length), 0, cur);
  renderCard();
}
function reveal(){
  $('#card').innerHTML = wordBack(cur,'c') + `<div class="mut center" style="margin-top:8px">Насколько хорошо вспомнили?</div>
   <div class="rate"><button class="r0" onclick="rate(0)">Не помню</button><button class="r1" onclick="rate(1)">Трудно</button>
   <button class="r2" onclick="rate(2)">Помню</button><button class="r3" onclick="rate(3)">Легко</button></div>`;
  if(S.settings.autoplay && S.settings.mode!=='listen') say(cur[0]);
}
function grade(hz, g){
  const now = Date.now(); const s = S.srs[hz] || {i:0,e:2.5,d:now,r:0,l:0};
  if(g===0){ s.r=0; s.l++; s.i=0; s.e=Math.max(1.3,s.e-0.2); s.d=now; }
  else{
    if(g===1){ s.i = s.r===0 ? 0.5 : Math.max(1, s.i*1.2); s.e=Math.max(1.3,s.e-0.15); }
    else if(g===2){ s.i = s.r===0 ? 1 : s.r===1 ? 3 : Math.round(s.i*s.e); }
    else { s.i = s.r===0 ? 3 : Math.round(s.i*s.e*1.3)+1; s.e+=0.15; }
    s.r++; s.d = now + s.i*DAY;
  }
  S.srs[hz] = s;
}
function rate(g){
  grade(cur[0], g); dayRec().rev++; addXP(1);
  Q.shift(); if(g===0) Q.splice(Math.min(3,Q.length), 0, cur);
  renderCard();
}
function renderDict(f){
  const el = $('#dict'); if(!el) return; f = (f||'').trim().toLowerCase();
  const plain = s => s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ /g,'');
  el.innerHTML = WORDS.filter(w => !DL || w[3]===DL).filter(w => !f || w[0].includes(f) || plain(w[1]).toLowerCase().includes(plain(f)) || w[2].toLowerCase().includes(f))
    .map(w => { const s=S.srs[w[0]]; const cls = !s ? '' : (s.r>=1&&s.i>=3?'k':'l');
      return `<div class="dict-row" onclick="say('${w[0]}')"><span class="dot ${cls}"></span><span class="hz">${colorHz(w[0],w[1])}</span><span class="py" style="min-width:90px">${colorPy(w[1])}</span><span>${w[2]}</span></div>`; }).join('');
}

/* ---- тест ---- */
function startQuiz(){
  const pool = WORDS.filter(w => S.srs[w[0]]);
  if(pool.length < 4){ toast('Сначала познакомьтесь хотя бы с 4 словами в карточках'); return; }
  const qs = shuffle(pool).slice(0,10).map(w => {
    const others = shuffle(WORDS.filter(x => x!==w && x[2]!==w[2] && x[1]!==w[1])).slice(0,3);
    return {w, type: pick(['read','listen','recall','py']), opts: shuffle([w].concat(others))};
  });
  QZ = {qs, i:0, ok:0, done:false}; renderQuiz();
}
function renderQuiz(){
  const box=$('#card'); if(!box) return;
  if(QZ.i >= QZ.qs.length){
    const n=QZ.qs.length; box.innerHTML = `<div class="center"><div style="font-size:48px">${QZ.ok>=n*.8?'🏆':QZ.ok>=n*.5?'👍':'💪'}</div>
     <b>Результат: ${QZ.ok} из ${n}</b><div class="mut">Ошибки отправлены на повторение.</div>
     <button class="primary" onclick="QZ=null;wordsEnter()">К карточкам</button><button class="btn" onclick="startQuiz()" style="width:100%">Ещё тест</button></div>`;
    return;
  }
  const q = QZ.qs[QZ.i]; QZ.done=false;
  const head = q.type==='read' ? `<div class="hz big">${q.w[0]}</div><div class="mut center">Что значит?</div>`
    : q.type==='py' ? `<div class="hz big">${q.w[0]}</div><div class="mut center">Как читается?</div>`
    : q.type==='listen' ? `<div class="center"><button class="huge" onclick="say(QZ.qs[QZ.i].w[0])">🔊</button><div class="mut">Что услышали?</div></div>`
    : `<div class="ru big center">${q.w[2]}</div><div class="mut center">Выберите иероглиф</div>`;
  const lab = o => q.type==='recall' ? `<span class="hz" style="font-size:28px">${o[0]}</span>` : q.type==='py' ? pyJoin(o[1]) : o[2];
  box.innerHTML = `<div class="mut">Вопрос ${QZ.i+1} из ${QZ.qs.length} · верно: ${QZ.ok}</div>${head}
   <div class="opts" id="qzo">${q.opts.map((o,k)=>`<button onclick="qzAns(${k})">${lab(o)}</button>`).join('')}</div><div id="qzr" class="res"></div>`;
  if(q.type==='listen') setTimeout(()=>say(q.w[0]),250);
}
function qzAns(k){
  if(QZ.done) return; QZ.done=true;
  const q=QZ.qs[QZ.i], right=q.opts.indexOf(q.w), ok=k===right, r=dayRec();
  r.q++; if(ok){ r.qok++; QZ.ok++; addXP(2); } else { const s=S.srs[q.w[0]]; if(s){ s.l++; s.d=Date.now(); } }
  save();
  const bs=document.querySelectorAll('#qzo button'); bs[right].classList.add('ok'); if(!ok) bs[k].classList.add('bad');
  say(q.w[0]);
  $('#qzr').innerHTML = `<div class="center"><span class="hz mid">${colorHz(q.w[0],q.w[1])}</span> ${colorPy(q.w[1])} — ${q.w[2]}</div>
   <button class="primary" onclick="QZ.i++;renderQuiz()">Дальше →</button>`;
}
