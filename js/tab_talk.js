'use strict';
/* ===== РЕЧЬ: фразы, диалоги, аудирование ===== */
let hideRu = false;
function renderTalk(){
  const sub = S.sub.talk || 'phr';
  $('#t-talk').innerHTML = subnav('talk', [['phr','Фразы'],['dlg','Диалоги'],['aud','Аудирование']], sub) + '<div id="talkBody"></div>';
  ({phr:renderPhrases, dlg:renderDialogs, aud:audNext})[sub]();
}

/* ---- фразы ---- */
function renderPhrases(){
  let n=0;
  $('#talkBody').innerHTML = `<h2>Фразы для разговора</h2>
   <div class="mut">Метод «тень»: включите фразу → сразу повторите вслух, копируя мелодию. 5 раз каждую. Потом 🎤 — проверка произношения.</div>
   <label class="row" style="margin:10px 0"><input type="checkbox" id="hideRu" ${hideRu?'checked':''} onchange="hideRu=this.checked;renderPhrases()"> Режим проверки: скрыть перевод (нажмите на фразу, чтобы открыть)</label>
   <div class="${hideRu?'hideru':''}">${PHRASES.map(g=>`<h3>${g[0]}</h3>`+g[1].map(p=>{ const id='p'+(n++);
     return `<div class="card phr" onclick="this.classList.add('open')"><div class="hz mid">${p[0]}</div><div class="py">${p[1]}</div><div class="ru">${p[2]}</div>
      <div class="row" style="margin-top:6px" onclick="event.stopPropagation()"><button class="btn" onclick="say('${p[0]}')">🔊</button>
      <button class="btn" onclick="slow('${p[0]}')">🐢 медленно</button><button class="btn" onclick="listen('${p[0]}','${id}')">🎤 скажи сам</button></div>
      <div class="res" id="${id}"></div></div>`; }).join('')).join('')}</div>`;
}

/* ---- диалоги ---- */
let DG = null;   // {d: индекс диалога, role: null | 'A' | 'B', i: шаг ролевой игры, shown}
function renderDialogs(){
  if(DG) return renderDialog();
  $('#talkBody').innerHTML = `<h2>Диалоги</h2>
   <div class="mut">Сначала прослушайте диалог целиком, потом разыграйте: программа говорит за одного героя, вы — за другого.</div>
   ${DIALOGS.map((d,k)=>`<div class="card row" style="justify-content:space-between"><span><b>${k+1}. ${d[0]}</b><br><span class="mut">${d[1].length} реплик</span></span>
     <button class="btn" onclick="DG={d:${k},role:null};renderDialog()">Открыть →</button></div>`).join('')}`;
}
function renderDialog(){
  const d = DIALOGS[DG.d], lines = d[1];
  if(DG.role) return renderRole();
  $('#talkBody').innerHTML = `<div class="row" style="justify-content:space-between;margin-top:8px"><button class="btn" onclick="stopSay();DG=null;renderDialogs()">← Все диалоги</button><b>${d[0]}</b></div>
   <div class="row" style="margin:8px 0"><button class="btn" onclick="playDialog()">▶ Слушать весь</button><button class="btn" onclick="stopSay()">■ Стоп</button>
    <label><input type="checkbox" id="dlgRu" ${hideRu?'':'checked'} onchange="hideRu=!this.checked;renderDialog()"> перевод</label></div>
   ${lines.map((l,i)=>`<div class="card line ${l[0]==='B'?'lineB':''}" id="dl${i}"><span class="who">${l[0]}</span>
     <div class="hz mid" style="font-size:26px">${l[1]}</div><div class="py">${l[2]}</div>${hideRu?'':`<div>${l[3]}</div>`}
     <div class="row" style="margin-top:4px"><button class="btn" onclick="say('${esc(l[1])}',0,'${l[0]}')">🔊</button><button class="btn" onclick="slow('${esc(l[1])}')">🐢</button></div></div>`).join('')}
   <div class="card"><b>Разыграть по ролям</b><div class="mut">Вы говорите за выбранного героя. Программа подсказывает перевод, вы произносите фразу по-китайски.</div>
    <div class="row" style="margin-top:6px"><button class="btn" onclick="DG.role='A';DG.i=0;DG.shown=false;renderRole()">Я — A</button><button class="btn" onclick="DG.role='B';DG.i=0;DG.shown=false;renderRole()">Я — B</button></div></div>`;
}
function playDialog(){
  const lines = DIALOGS[DG.d][1];
  sayQueue(lines.map(l=>({t:l[1], who:l[0]})), i => {
    document.querySelectorAll('.line').forEach(e=>e.classList.remove('now'));
    const el = document.getElementById('dl'+i); if(el){ el.classList.add('now'); el.scrollIntoView({block:'center', behavior:'smooth'}); }
  }, () => document.querySelectorAll('.line').forEach(e=>e.classList.remove('now')));
}
function renderRole(){
  const d = DIALOGS[DG.d], lines = d[1];
  if(DG.i >= lines.length){
    addXP(5);
    $('#talkBody').innerHTML = `<div class="card center"><div style="font-size:44px">👏</div><b>Диалог «${d[0]}» сыгран!</b>
     <div class="mut">+5 очков. Попробуйте другую роль или следующий диалог.</div>
     <button class="primary" onclick="DG.role=null;renderDialog()">К диалогу</button><button class="btn" style="width:100%" onclick="DG=null;renderDialogs()">Все диалоги</button></div>`;
    return;
  }
  const l = lines[DG.i], mine = l[0]===DG.role;
  const past = lines.slice(Math.max(0,DG.i-2), DG.i).map(x=>`<div class="mut"><b>${x[0]}:</b> <span class="hz">${x[1]}</span></div>`).join('');
  if(!mine){
    $('#talkBody').innerHTML = `<div class="row" style="justify-content:space-between;margin-top:8px"><button class="btn" onclick="stopSay();DG.role=null;renderDialog()">← Выйти</button><span class="mut">Реплика ${DG.i+1} из ${lines.length}</span></div>
     <div class="card">${past}<div style="margin-top:8px"><b>${l[0]}:</b> <span class="hz mid" style="font-size:26px">${l[1]}</span><div class="py">${l[2]}</div><div class="mut">${l[3]}</div></div>
     <div class="row"><button class="btn" onclick="say('${esc(l[1])}',0,'${l[0]}')">🔊 Ещё раз</button></div>
     <button class="primary" onclick="DG.i++;DG.shown=false;renderRole()">Дальше →</button></div>`;
    say(l[1], 0, l[0]);
    return;
  }
  $('#talkBody').innerHTML = `<div class="row" style="justify-content:space-between;margin-top:8px"><button class="btn" onclick="stopSay();DG.role=null;renderDialog()">← Выйти</button><span class="mut">Реплика ${DG.i+1} из ${lines.length}</span></div>
   <div class="card">${past}<div style="margin-top:8px"><span class="badge">Ваша очередь</span><div style="font-size:20px;margin-top:6px">«${l[3]}»</div>
    <div class="mut">Скажите это по-китайски вслух, потом проверьте себя.</div></div>
    ${DG.shown?`<div class="hz mid" style="font-size:26px;margin-top:8px">${l[1]}</div><div class="py">${l[2]}</div>`:''}
    <div class="row" style="margin-top:6px">${DG.shown?'':`<button class="btn" onclick="DG.shown=true;renderRole();say('${esc(l[1])}')">Показать ответ</button>`}
     <button class="btn" onclick="say('${esc(l[1])}')">🔊 Как правильно</button><button class="btn" onclick="listen('${esc(l[1])}','rolem')">🎤 Проверить</button></div>
    <div class="res" id="rolem"></div>
    <button class="primary" onclick="DG.i++;DG.shown=false;renderRole()">Дальше →</button></div>`;
}

/* ---- аудирование ---- */
let AQ = null;
function audPool(){
  const a = [];
  PHRASES.forEach(g => g[1].forEach(p => a.push([p[0],p[1],p[2]])));
  SENTENCES.forEach(s => a.push(s));
  DIALOGS.forEach(d => d[1].forEach(l => a.push([l[1],l[2],l[3]])));
  const seen = {}; return a.filter(x => !seen[x[0]] && (seen[x[0]] = 1));
}
function audNext(){
  const pool = audPool(), s = pick(pool);
  const opts = shuffle([s].concat(shuffle(pool.filter(x => x[2]!==s[2])).slice(0,3)));
  AQ = {s, opts, done:false, n:(AQ?AQ.n:0), ok:(AQ?AQ.ok:0)};
  $('#talkBody').innerHTML = `<h2>Аудирование</h2><div class="mut">Послушайте фразу (можно несколько раз) и выберите перевод. Счёт: ${AQ.ok} из ${AQ.n}</div>
   <div class="card"><div class="center"><button class="huge" onclick="say(AQ.s[0])">🔊</button>
    <div class="row" style="justify-content:center;margin-top:6px"><button class="btn" onclick="slow(AQ.s[0])">🐢 медленно</button></div></div>
   <div id="audo" style="display:grid;gap:8px;margin-top:10px">${opts.map((o,i)=>`<button class="opt" onclick="audAns(${i})">${o[2]}</button>`).join('')}</div>
   <div class="res" id="audr"></div></div>`;
  setTimeout(()=>say(s[0]),250);
}
function audAns(i){
  if(AQ.done) return; AQ.done=true; AQ.n++;
  const right = AQ.opts.indexOf(AQ.s), ok = i===right; if(ok){ AQ.ok++; addXP(2); }
  const bs = document.querySelectorAll('#audo button'); bs[right].classList.add('ok'); if(!ok) bs[i].classList.add('bad');
  $('#audr').innerHTML = `<div class="hz mid" style="font-size:26px">${AQ.s[0]}</div><div class="py">${AQ.s[1]}</div>
   <button class="primary" onclick="audNext()">Дальше →</button>`;
}
