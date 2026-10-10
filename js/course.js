'use strict';
/* ===== КУРС «РАЗГОВОР НА УЛИЦЕ»: уроки по ситуациям (общий для английского и китайского) =====
   Нужны: LANG (lang.js), COURSE и SLOTS (course_data.js), функции ядра: R, sayI, slowI, listenI, say, sayQueue, stopSay, addXP. */
const IS_EN = LANG.code==='en';
// Английские данные пишутся без поля произношения — приводим к общему виду [текст, произношение, перевод…]
const nk = a => IS_EN ? [a[0],'',a[1]] : a;
const nd = a => IS_EN ? [a[0],a[1],'',a[2]] : a;
const np = a => IS_EN ? [a[0],'',a[1],a[2],a[3]] : a;
const nsl = a => IS_EN ? [a[0],''].concat(a.slice(1)) : a;
const SLOT = {}; Object.keys(SLOTS).forEach(k => { SLOT[k] = SLOTS[k].map(nsl); });
const LESSONS = [];
COURSE.forEach((u,ui) => u.l.forEach(l => LESSONS.push({unit:ui, t:l.t, g:l.g, tip:l.tip||'', w:l.w||[],
  k:(l.k||[]).map(nk), pt:(l.pt||[]).map(np), d:(l.d||[]).map(nd), sit:(l.sit||[]).map(s => [s[0], s[1].map(a => IS_EN ? [a,''] : a)])})));
// Слова уроков — в общий словарь (уровень 3), если их там ещё нет
(() => { const have = {}; WORDS.forEach(w => { have[w[0]] = 1; });
  LESSONS.forEach(L => L.w.forEach(w => { if(!have[w[0]]){ have[w[0]] = 1; WORDS.push([w[0], w[1], w[2], 3]); } })); })();

function C(){ return S.course || (S.course = {done:{}}); }
function nextLesson(){ for(let i=0;i<LESSONS.length;i++) if(!C().done[i]) return i; return LESSONS.length-1; }
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

/* ---- подстановка в конструкции ---- */
function fillPat(pt, f){
  let t = pt[0].replace('{x}', f[0]), p = pt[1].replace('{x}', f[1]), r = pt[2].replace('{x}', f[pt[4]||2] || f[2]);
  if(IS_EN) t = t.replace(/\b([Aa]) (?=[aeiouAEIOU])/g, '$1n ');
  return {t:cap(t), p:cap(p), r:cap(r), pt};
}
function lessonItems(L){
  const a = L.k.map(k => ({t:k[0], p:k[1], r:k[2]}));
  L.pt.forEach(pt => SLOT[pt[3]].forEach(f => a.push(fillPat(pt, f))));
  return a;
}
function itemsOf(ls){
  const a = [];
  ls.forEach(L => { a.push(...lessonItems(L)); L.d.forEach(d => a.push({t:d[1], p:d[2], r:d[3]})); });
  const seen = {}; return a.filter(x => !seen[x.t] && (seen[x.t] = 1));
}
// Задания: say — скажи по-…, hear — пойми на слух, build — собери фразу, sit — ситуация
function makeTasks(ls, n, types){
  const items = itemsOf(ls), sits = [], out = [];
  ls.forEach(L => L.sit.forEach(s => sits.push(s)));
  const okTypes = types.filter(t => t!=='sit' || sits.length);
  let last = null;
  for(let i=0;i<n;i++){
    const ty = pick(okTypes);
    if(ty==='sit'){ out.push({ty, s:pick(sits)}); continue; }
    let it = pick(items), g = 0;
    const bad = x => x===last || (ty==='build' && (LANG.tok(x.t).length<3 || LANG.tok(x.t).length>9));
    while(bad(it) && g++<40) it = pick(items);
    last = it;
    const task = {ty, it};
    if(ty==='hear'){
      const same = it.pt ? shuffle(items.filter(x => x.pt===it.pt && x.r!==it.r)).slice(0,2) : [];
      shuffle(items).forEach(x => { if(same.length<3 && x.r!==it.r && !same.some(y => y.r===x.r)) same.push(x); });
      task.opts = shuffle([it].concat(same));
    }
    if(ty==='build'){
      const tk = LANG.tok(it.t); let o = shuffle(tk.map((x,j)=>j)), gg = 0;
      while(o.every((x,j)=>x===j) && tk.length>1 && gg++<10) o = shuffle(o);
      Object.assign(task, {tk, order:o, picked:[]});
    }
    out.push(task);
  }
  return out;
}

/* ---- карта курса на главной ---- */
function courseBlock(){
  const nx = nextLesson(), done = Object.keys(C().done).length, L = LESSONS[nx];
  return `<div class="card course-next"><div class="mut">Курс «Разговор на улице» · пройдено ${done} из ${LESSONS.length}</div>
    <div class="bar" style="margin:6px 0 10px"><i style="width:${done/LESSONS.length*100}%"></i></div>
    <div class="mut">${C().done[nx] ? 'Все уроки пройдены — повторяйте любые' : 'Следующий урок'}</div>
    <h2 style="margin:4px 0">${nx+1}. ${L.t}</h2><div>${L.g}</div>
    <button class="primary" onclick="openLesson(${nx})">${C().done[nx] ? 'Повторить' : 'Начать урок'} →</button>
    <button class="btn" style="width:100%;margin-top:6px" onclick="openTraining()">🔀 Смешанная тренировка по пройденному</button></div>
   ${COURSE.map((u,ui) => { const ids = LESSONS.map((x,i)=>i).filter(i => LESSONS[i].unit===ui), dn = ids.filter(i => C().done[i]).length;
     return `<details class="card" ${ids.includes(nx)?'open':''}><summary><b>Блок ${ui+1}. ${u.u}</b> <span class="mut">${dn} / ${ids.length}</span></summary>
      ${ids.map(i => `<div class="lrow ${i===nx?'nx':''}" onclick="openLesson(${i})"><span class="ln">${C().done[i]?'✓':i+1}</span><span><b>${LESSONS[i].t}</b><br><span class="mut">${LESSONS[i].g}</span></span></div>`).join('')}</details>`; }).join('')}`;
}

/* ---- урок по шагам ---- */
const STEPS = [['intro','Цель'],['words','Слова'],['phr','Фразы'],['pat','Конструкции'],['say','Скажи'],['hear','Пойми'],['build','Собери'],['dlg','Диалог'],['sit','Ситуации'],['done','Итог']];
let CL = null;   // {i, s, role, di, shown} или {train:true}
let TK = null;   // текущая серия заданий
function openLesson(i){ stopSay(); CL = {i, s:0}; TK = null; renderStep(); window.scrollTo(0,0); }
function closeLesson(){ stopSay(); CL = null; TK = null; renderHome(); window.scrollTo(0,0); }
function stepGo(d){ stopSay(); CL.s = Math.max(0, Math.min(STEPS.length-1, CL.s+d)); TK = null; CL.role = null; renderStep(); window.scrollTo(0,0); }
function lineView(it){ return LANG.big(it) + `<div>${it.r}</div>`; }
function renderStep(){
  if(CL.train) return renderTraining();
  const L = LESSONS[CL.i], st = STEPS[CL.s][0];
  const head = `<div class="row" style="justify-content:space-between;margin-top:8px"><button class="btn" onclick="closeLesson()">← Курс</button><span class="mut">Урок ${CL.i+1} из ${LESSONS.length}</span></div>
   <h2>${L.t}</h2><div class="steps">${STEPS.map((x,j)=>`<span class="${j<CL.s?'d':j===CL.s?'c':''}" title="${x[1]}"></span>`).join('')}</div>
   <div class="mut" style="margin-bottom:6px">Шаг ${CL.s+1} из ${STEPS.length}: <b>${STEPS[CL.s][1]}</b></div>`;
  const next = (lbl) => `<button class="primary" onclick="stepGo(1)">${lbl||'Дальше'} →</button>`;
  const back = CL.s>0 ? `<button class="btn" style="width:100%;margin-top:6px" onclick="stepGo(-1)">← Назад</button>` : '';
  let body = '';
  if(st==='intro'){
    body = `<div class="card"><b>Цель урока</b><div style="font-size:18px;margin-top:4px">${L.g}</div>
      ${L.tip?`<div class="tip" style="margin-top:10px">💡 ${L.tip}</div>`:''}
      <div class="mut" style="margin-top:10px">Вы научитесь говорить:</div><ul>${L.k.slice(0,5).map(k=>`<li>${k[2]}</li>`).join('')}</ul></div>` + next('Начать');
  }
  else if(st==='words'){
    body = `<div class="mut">Послушайте каждое слово 2–3 раза и повторите вслух. Слова попадут в ваши карточки.</div>
      ${L.w.map(w => { const i = R(w[0]); return `<div class="card row" style="justify-content:space-between;flex-wrap:nowrap;cursor:pointer" onclick="sayI(${i})"><span>${LANG.word(w)}<br>${w[2]}</span><span>🔊</span></div>`; }).join('')}
      <button class="primary" onclick="addLessonWords(${CL.i});stepGo(1)">В карточки и дальше →</button>`;
  }
  else if(st==='phr'){
    body = `<div class="mut">Главные фразы урока. Метод «тень»: послушайте и сразу повторите, копируя интонацию.</div>
      ${L.k.map((k,j) => `<div class="card">${lineView({t:k[0],p:k[1],r:k[2]})}<div class="row" style="margin-top:4px">${audioBtns(k[0],'km'+j)}</div><div class="res" id="km${j}"></div></div>`).join('')}` + next();
  }
  else if(st==='pat'){
    body = `<div class="mut">Конструкция — это фраза-шаблон: меняете одно слово и получаете десятки новых фраз. Нажимайте на слова-подстановки.</div>
      ${L.pt.map((pt,j) => `<div class="card"><div class="mut">Конструкция ${j+1}</div>
        <div class="mid ${IS_EN?'en':'hz'}" style="font-size:24px">${pt[0].replace('{x}','<u class="slot">…</u>')}</div>${pt[1]?`<div class="py">${pt[1].replace('{x}','…')}</div>`:''}
        <div>${pt[2].replace('{x}','…')}</div>
        <div class="row" style="margin-top:8px">${SLOT[pt[3]].map((f,q) => `<button class="chip" onclick="patTry(${j},${q})">${f[0]}</button>`).join('')}</div>
        <div id="pv${j}" class="pv"></div></div>`).join('')}` + next();
  }
  else if(st==='say' || st==='hear' || st==='build'){
    if(!TK){ const n = {say:8, hear:6, build:4}[st]; TK = {list:makeTasks([L], n, [st]), i:0, ok:0, onDone:'stepGo(1)'}; }
    body = `<div id="ctask"></div>`;
  }
  else if(st==='dlg'){ body = dlgView(L) + next(); }
  else if(st==='sit'){
    body = `<div class="mut">Представьте, что вы на улице. Скажите вслух своими словами, потом сравните с вариантами — правильных ответов несколько.</div>
      ${L.sit.map((s,j) => `<div class="card"><div style="font-size:18px">🎭 ${s[0]}</div>
        <div class="row" style="margin-top:6px"><button class="btn" onclick="$('#sv${j}').hidden=false">Показать варианты</button></div>
        <div id="sv${j}" hidden>${s[1].map(a => { const i = R(a[0]); return `<div class="ans-var" onclick="sayI(${i})">${IS_EN?`<span class="en">${a[0]}</span>`:`<span class="hz" style="font-size:22px">${a[0]}</span><br><span class="py">${a[1]}</span>`} 🔊</div>`; }).join('')}</div></div>`).join('')}` + next();
  }
  else if(st==='done'){
    const first = !C().done[CL.i];
    if(first){ C().done[CL.i] = 1; addXP(20); }
    body = `<div class="card center"><div style="font-size:48px">🎉</div><b>Урок «${L.t}» пройден!</b>
      <div class="mut">${first?'+20 очков. ':''}Завтра повторите слова в карточках и сделайте смешанную тренировку — так фразы закрепятся.</div>
      ${CL.i+1<LESSONS.length?`<button class="primary" onclick="openLesson(${CL.i+1})">Следующий урок: ${LESSONS[CL.i+1].t} →</button>`:''}
      <button class="btn" style="width:100%;margin-top:6px" onclick="openTraining()">🔀 Смешанная тренировка</button>
      <button class="btn" style="width:100%;margin-top:6px" onclick="closeLesson()">К списку уроков</button></div>`;
  }
  $('#t-home').innerHTML = head + body + (st!=='done' ? back : '');
  if(TK) renderTask();
}
function addLessonWords(i){
  const now = Date.now();
  LESSONS[i].w.forEach(w => { if(!S.srs[w[0]]) S.srs[w[0]] = {i:0, e:2.5, d:now, r:0, l:0}; });
  save();
}
function patTry(j, q){
  const L = LESSONS[CL.i], it = fillPat(L.pt[j], SLOT[L.pt[j][3]][q]);
  say(it.t);
  $('#pv'+j).innerHTML = `<div class="pvi">${lineView(it)}</div>`;
}

/* ---- диалог урока ---- */
function dlgView(L){
  const lines = L.d;
  if(CL.role){
    if(CL.di >= lines.length) return `<div class="card center"><b>👏 Диалог сыгран!</b><div class="row" style="justify-content:center;margin-top:6px"><button class="btn" onclick="CL.role=null;renderStep()">Ещё раз</button></div></div>`;
    const l = lines[CL.di], mine = l[0]===CL.role, i = R(l[1]);
    const past = lines.slice(Math.max(0,CL.di-2), CL.di).map(x => `<div class="mut"><b>${x[0]}:</b> ${x[1]}</div>`).join('');
    if(!mine){ setTimeout(() => say(l[1], 0, l[0]), 150);
      return `<div class="card">${past}<div style="margin-top:6px"><b>${l[0]}:</b></div>${lineView({t:l[1],p:l[2],r:l[3]})}
        <div class="row"><button class="btn" onclick="sayI(${i},0,'${l[0]}')">🔊</button><button class="btn" style="font-weight:600" onclick="CL.di++;CL.shown=false;renderStep()">Дальше →</button></div></div>`; }
    return `<div class="card">${past}<span class="badge">Ваша очередь</span><div style="font-size:20px;margin-top:6px">«${l[3]}»</div>
      <div class="mut">Скажите это ${LANG.name} вслух.</div>${CL.shown?lineView({t:l[1],p:l[2],r:''}):''}
      <div class="row" style="margin-top:6px">${CL.shown?'':`<button class="btn" onclick="CL.shown=true;renderStep();sayI(${i})">Показать ответ</button>`}
       <button class="btn" onclick="listenI(${i},'dlm')">🎤</button><button class="btn" style="font-weight:600" onclick="CL.di++;CL.shown=false;renderStep()">Дальше →</button></div><div class="res" id="dlm"></div></div>`;
  }
  return `<div class="row" style="margin:6px 0"><button class="btn" onclick="playLessonDlg()">▶ Слушать весь</button><button class="btn" onclick="stopSay()">■</button>
     <button class="btn" onclick="CL.role='A';CL.di=0;CL.shown=false;renderStep()">Я — A</button><button class="btn" onclick="CL.role='B';CL.di=0;CL.shown=false;renderStep()">Я — B</button></div>
    ${lines.map((l,j) => `<div class="card line ${l[0]==='B'?'lineB':''}" id="cdl${j}"><span class="who">${l[0]}</span>${lineView({t:l[1],p:l[2],r:l[3]})}
      <div class="row" style="margin-top:4px">${audioBtns(l[1],'',l[0])}</div></div>`).join('')}`;
}
function playLessonDlg(){
  const lines = LESSONS[CL.i].d;
  sayQueue(lines.map(l => ({t:l[1], who:l[0]})), j => {
    document.querySelectorAll('.line').forEach(e => e.classList.remove('now'));
    const el = document.getElementById('cdl'+j); if(el){ el.classList.add('now'); el.scrollIntoView({block:'center', behavior:'smooth'}); }
  }, () => document.querySelectorAll('.line').forEach(e => e.classList.remove('now')));
}

/* ---- задания (общие для урока и тренировки) ---- */
function renderTask(){
  const box = $('#ctask'); if(!box) return;
  if(TK.i >= TK.list.length){
    box.innerHTML = `<div class="card center"><b>Готово: ${TK.ok} из ${TK.list.length}</b><div class="mut">${TK.ok>=TK.list.length*.8?'Отлично!':'Хорошая тренировка — повторение сделает своё дело.'}</div>
      <button class="primary" onclick="${TK.onDone}">Дальше →</button></div>`;
    return;
  }
  const k = TK.list[TK.i], head = `<div class="mut">Задание ${TK.i+1} из ${TK.list.length} · верно ${TK.ok}</div>`;
  if(k.ty==='say'){
    const i = R(k.it.t);
    box.innerHTML = `<div class="card">${head}<div class="mut" style="margin-top:6px">Скажите ${LANG.name}:</div><div style="font-size:22px;margin:4px 0 8px">«${k.it.r}»</div>
      <div id="tkr"></div><div class="row"><button class="btn" id="tkShow" onclick="tkReveal(${i})">Показать ответ</button><button class="btn" onclick="listenI(${i},'tkm')">🎤 Проверить</button></div>
      <div class="res" id="tkm"></div><div id="tkg"></div></div>`;
  }
  else if(k.ty==='hear'){
    const i = R(k.it.t);
    box.innerHTML = `<div class="card">${head}<div class="center"><button class="huge" onclick="sayI(${i})" aria-label="Послушать">🔊</button>
      <div class="row" style="justify-content:center;margin-top:6px"><button class="btn" onclick="slowI(${i})">🐢 медленно</button></div><div class="mut">Что прозвучало?</div></div>
      <div id="tko" style="display:grid;gap:8px;margin-top:8px">${k.opts.map((o,q) => `<button class="opt" onclick="tkHear(${q})">${o.r}</button>`).join('')}</div><div id="tkr" class="res"></div></div>`;
    setTimeout(() => say(k.it.t), 250);
  }
  else if(k.ty==='build'){
    box.innerHTML = `<div class="card">${head}<div class="mut" style="margin-top:6px">Соберите ${LANG.name}:</div><div style="font-size:20px;margin:4px 0 8px">«${k.it.r}»</div>
      <div class="ans">${k.picked.map((q,j) => `<button class="tile2 ${IS_EN?'':'hz'}" onclick="tkUndo(${j})">${k.tk[q]}</button>`).join('') || '<span class="mut">нажимайте на слова по порядку</span>'}</div>
      <div class="row" style="margin-top:8px">${k.order.filter(q => !k.picked.includes(q)).map(q => `<button class="tile2 ${IS_EN?'':'hz'}" onclick="tkPick(${q})">${k.tk[q]}</button>`).join('')}</div>
      ${k.picked.length===k.tk.length && !k.done ? '<button class="primary" onclick="tkBuild()">Проверить</button>' : ''}<div id="tkr" class="res"></div></div>`;
  }
  else if(k.ty==='sit'){
    box.innerHTML = `<div class="card">${head}<div style="font-size:19px;margin-top:6px">🎭 ${k.s[0]}</div><div class="mut">Скажите вслух своими словами, потом сравните.</div>
      <div id="tkr"></div><button class="btn" id="tkShow" onclick="tkSit()">Показать варианты</button></div>`;
  }
}
function tkNextBtn(){ return `<button class="primary" onclick="TK.i++;renderTask()">Дальше →</button>`; }
function tkReveal(i){
  const k = TK.list[TK.i]; sayI(i);
  $('#tkShow').hidden = true;
  $('#tkr').innerHTML = `<div class="card pvi">${LANG.big(k.it)}</div>`;
  $('#tkg').innerHTML = `<div class="mut">Получилось сказать?</div><div class="row"><button class="btn okb" onclick="TK.ok++;addXP(1);TK.i++;renderTask()">✓ Да</button><button class="btn badb" onclick="TK.i++;renderTask()">✗ Нет</button></div>`;
}
function tkHear(q){
  const k = TK.list[TK.i]; if(k.done) return; k.done = true;
  const right = k.opts.indexOf(k.it), ok = q===right; if(ok){ TK.ok++; addXP(1); }
  const bs = document.querySelectorAll('#tko button'); bs[right].classList.add('ok'); if(!ok) bs[q].classList.add('bad');
  $('#tkr').innerHTML = `<div class="pvi">${LANG.big(k.it)}</div>` + tkNextBtn();
}
function tkPick(q){ const k = TK.list[TK.i]; if(k.done) return; k.picked.push(q); renderTask(); }
function tkUndo(j){ const k = TK.list[TK.i]; if(k.done) return; k.picked.splice(j,1); renderTask(); }
function tkBuild(){
  const k = TK.list[TK.i]; k.done = true;
  const ok = LANG.same(LANG.join(k.picked.map(q => k.tk[q])), k.it.t); if(ok){ TK.ok++; addXP(2); }
  say(k.it.t); renderTask();
  $('#tkr').innerHTML = (ok?'<b style="color:var(--ok)">✅ Верно!</b>':'<b style="color:var(--bad)">❌ Правильно так:</b>') + `<div class="pvi">${LANG.big(k.it)}</div>` + tkNextBtn();
}
function tkSit(){
  const k = TK.list[TK.i]; $('#tkShow').hidden = true; TK.ok++; addXP(1);
  $('#tkr').innerHTML = k.s[1].map(a => { const i = R(a[0]); return `<div class="ans-var" onclick="sayI(${i})">${IS_EN?`<span class="en">${a[0]}</span>`:`<span class="hz" style="font-size:22px">${a[0]}</span><br><span class="py">${a[1]}</span>`} 🔊</div>`; }).join('') + tkNextBtn();
}

/* ---- смешанная тренировка ---- */
function openTraining(){
  stopSay();
  const done = LESSONS.filter((L,i) => C().done[i]);
  const ls = done.length ? done : [LESSONS[0]];
  CL = {train:true, n:ls.length};
  TK = {list:makeTasks(ls, 12, ['say','say','hear','hear','build','sit']), i:0, ok:0, onDone:'openTraining()'};
  renderStep(); window.scrollTo(0,0);
}
function renderTraining(){
  $('#t-home').innerHTML = `<div class="row" style="justify-content:space-between;margin-top:8px"><button class="btn" onclick="closeLesson()">← Курс</button><span class="mut">${CL.n>1?'по '+CL.n+' урокам':'по первому уроку'}</span></div>
    <h2>Смешанная тренировка</h2><div class="mut">Каждый раз новые сочетания из всех пройденных уроков. 12 заданий.</div><div id="ctask"></div>
    <button class="btn" style="width:100%;margin-top:6px" onclick="closeLesson()">Закончить</button>`;
  renderTask();
}
