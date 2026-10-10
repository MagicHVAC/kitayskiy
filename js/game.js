'use strict';
/* ===== ИГРОВОЙ СЛОЙ: комбо, достижения, задания дня, сундуки, звания, звуки, конфетти (общий для обоих языков) ===== */
function GS(){
  const g = S.game || (S.game = {});
  g.cnt = g.cnt || {}; g.ach = g.ach || {}; g.best = g.best || {}; g.stickers = g.stickers || {}; g.cards = g.cards || {};
  if(g.sound === undefined) g.sound = true;
  if(!g.day || g.day.date !== today()) g.day = {date:today(), c:{}, chest:false};
  const wk = weekKey(); if(!g.week || g.week.key !== wk) g.week = {key:wk, c:{}, chest:false, days:{}};
  return g;
}
function weekKey(){ const d = new Date(); const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day); const y = new Date(Date.UTC(t.getUTCFullYear(),0,1)); return t.getUTCFullYear()+'-W'+Math.ceil(((t - y) / DAY + 1) / 7); }
function cnt(k, n){ const g = GS(); n = n || 1; g.cnt[k] = (g.cnt[k]||0) + n; g.day.c[k] = (g.day.c[k]||0) + n; g.week.c[k] = (g.week.c[k]||0) + n; g.week.days[today()] = 1; }

/* ---- звуки (WebAudio, без файлов) ---- */
let AC = null;
function sfx(kind){
  if(!GS().sound) return;
  try{
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const seq = {ok:[[660,.07],[990,.12]], bad:[[196,.2]], win:[[523,.1],[659,.1],[784,.1],[1047,.3]], pop:[[880,.04],[1320,.05]], coin:[[988,.07],[1319,.18]], tick:[[1500,.02]]}[kind] || [[440,.1]];
    let t = AC.currentTime;
    seq.forEach(([f,d]) => { const o = AC.createOscillator(), v = AC.createGain(); o.type = kind==='bad' ? 'square' : 'triangle'; o.frequency.value = f;
      v.gain.setValueAtTime(kind==='bad' ? .05 : .12, t); v.gain.exponentialRampToValueAtTime(.001, t+d); o.connect(v); v.connect(AC.destination); o.start(t); o.stop(t+d+.02); t += d; });
  }catch(e){}
}
const REDUCED = () => { try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };

/* ---- конфетти и всплывающие очки ---- */
function confetti(n){
  if(REDUCED()) return;
  const c = document.createElement('canvas'); c.className = 'fx'; document.body.appendChild(c);
  const W = c.width = innerWidth, H = c.height = innerHeight, x = c.getContext('2d');
  const cols = ['#e53935','#fdd835','#43a047','#1e88e5','#8e24aa','#ff7043','#00acc1'], P = [];
  for(let i=0;i<(n||110);i++) P.push({x:W/2+(Math.random()-.5)*60, y:H*.35, vx:(Math.random()-.5)*13, vy:-Math.random()*13-4, r:5+Math.random()*6, c:pick(cols), a:Math.random()*6, s:Math.random()*.3+.1});
  let f = 0;
  (function step(){ x.clearRect(0,0,W,H);
    P.forEach(p => { p.vy += .38; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.s; x.save(); x.translate(p.x,p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r/2,-p.r/4,p.r,p.r/2); x.restore(); });
    if(++f < 110) requestAnimationFrame(step); else c.remove(); })();
}
function flyXP(n){
  if(!n) return;
  const d = document.createElement('div'); d.className = 'flyxp'; d.textContent = '+' + n; document.body.appendChild(d);
  setTimeout(() => d.remove(), 1100);
}
function gameOnXP(n){ flyXP(n); }

/* ---- звания ---- */
const TITLES = ['Новичок','Ученик','Путник','Турист','Знаток улиц','Собеседник','Путешественник','Полиглот-стажёр','Мастер диалога','Посол языка','Легенда'];
function titleOf(lv){ return TITLES[Math.min(TITLES.length-1, Math.floor((lv-1)/2))]; }

/* ---- достижения ---- */
const ACH = [
 ['l1','🎬','Первая серия','Пройти первый урок',s=>s.lessons>=1],['l5','🧭','В пути','5 уроков',s=>s.lessons>=5],['l10','🎒','Бывалый турист','10 уроков',s=>s.lessons>=10],
 ['l30','🗺️','Треть пути','30 уроков',s=>s.lessons>=30],['l60','✈️','Без переводчика','60 уроков',s=>s.lessons>=60],['l90','👑','Финал сериала','Все 90 уроков',s=>s.lessons>=90],
 ['c1','🏙️','Первый город','Пройти первый город',s=>s.cities>=1],['c6','🌆','Шесть городов','Пройти 6 городов',s=>s.cities>=6],['c12','🌍','Двенадцать городов','Пройти 12 городов',s=>s.cities>=12],['c18','🏆','Кругосветка','Все 18 городов',s=>s.cities>=18],
 ['o100','✅','Сотня','100 верных ответов',s=>s.ok>=100],['o500','💯','Пятьсот','500 верных ответов',s=>s.ok>=500],['o1500','🧠','Мозг','1500 верных ответов',s=>s.ok>=1500],
 ['k10','⚡','Комбо ×10','10 верных подряд',s=>s.combo>=10],['k25','🔥','Комбо ×25','25 верных подряд',s=>s.combo>=25],['k50','🌟','Комбо ×50','50 верных подряд',s=>s.combo>=50],
 ['s3','🕯️','Три дня','3 дня подряд',s=>s.streak>=3],['s7','🔥','Неделя','7 дней подряд',s=>s.streak>=7],['s30','🌋','Месяц','30 дней подряд',s=>s.streak>=30],
 ['w25','📗','25 слов','25 слов в карточках',s=>s.words>=25],['w100','📚','100 слов','100 слов в карточках',s=>s.words>=100],['w300','🏛️','Словарь','300 слов в карточках',s=>s.words>=300],
 ['g5','🎮','Игрок','5 мини-игр',s=>s.games>=5],['g30','🕹️','Геймер','30 мини-игр',s=>s.games>=30],
 ['p1','💎','Без ошибок','Урок без единой ошибки',s=>s.perfect>=1],['p10','💠','Перфекционист','10 уроков без ошибок',s=>s.perfect>=10],
 ['x500','🥉','500 очков','Набрать 500 очков',s=>s.xp>=500],['x2000','🥈','2000 очков','Набрать 2000 очков',s=>s.xp>=2000],['x6000','🥇','6000 очков','Набрать 6000 очков',s=>s.xp>=6000],
 ['r10','🎭','Актёр','Сыграть 10 диалогов по ролям',s=>s.roles>=10],['t10','🔀','Тренер','10 смешанных тренировок',s=>s.trainings>=10],
 ['ch5','🧰','Кладоискатель','Открыть 5 сундуков',s=>s.chests>=5],['ch30','💰','Сокровищница','Открыть 30 сундуков',s=>s.chests>=30],
 ['st15','🖼️','Коллекционер','Собрать 15 наклеек',s=>s.stickers>=15],['owl','🦉','Сова','Урок после 22:00',s=>s.owl>=1],['bird','🐦','Жаворонок','Урок до 8:00',s=>s.bird>=1]
];
function achSnapshot(){
  const g = GS(), c = g.cnt;
  return {lessons:Object.keys((S.course||{}).done||{}).length, cities:citiesDone(), ok:c.ok||0, combo:g.bestCombo||0, streak:streak(),
    words:Object.keys(S.srs).length, games:c.games||0, perfect:c.perfect||0, xp:S.xp||0, roles:c.roles||0, trainings:c.trainings||0,
    chests:c.chests||0, stickers:Object.keys(g.stickers).length, owl:c.owl||0, bird:c.bird||0};
}
function citiesDone(){ if(typeof LESSONS==='undefined') return 0; let n = 0;
  COURSE.forEach((u,ui) => { const ids = LESSONS.map((x,i)=>i).filter(i => LESSONS[i].unit===ui); if(ids.length && ids.every(i => (S.course||{done:{}}).done[i])) n++; }); return n; }
function checkAch(){
  const g = GS(), s = achSnapshot(), fresh = [];
  ACH.forEach(a => { if(!g.ach[a[0]] && a[4](s)){ g.ach[a[0]] = today(); fresh.push(a); } });
  if(fresh.length){ save(); fresh.forEach((a,i) => setTimeout(() => { sfx('coin'); toast(a[1]+' Достижение: <b>'+a[2]+'</b>', 3200); confetti(60); }, 700 + i*1400)); }
}

/* ---- главное событие: что-то произошло в обучении ---- */
function award(ev, val){
  const g = GS();
  if(ev==='task'){
    cnt('tasks');
    if(val){ cnt('ok'); g.combo = (g.combo||0) + 1; g.day.c.comboMax = Math.max(g.day.c.comboMax||0, g.combo); g.bestCombo = Math.max(g.bestCombo||0, g.combo); sfx('ok');
      if(g.combo % 5 === 0){ mascotSay('Комбо ×' + g.combo + '! ' + pick(MASCOT_TXT.combo), 'happy'); if(g.combo % 10 === 0) confetti(50); }
      else mascotSay(pick(MASCOT_TXT.ok), 'happy');
    } else { g.combo = 0; sfx('bad'); mascotSay(pick(MASCOT_TXT.bad), 'sad'); if(typeof CL!=='undefined' && CL && !CL.train) CL.miss = (CL.miss||0) + 1; }
  }
  else if(ev==='lesson'){
    cnt('lessons'); if(val) cnt('perfect');
    const h = new Date().getHours(); if(h>=22) cnt('owl'); if(h<8) cnt('bird');
    sfx('win'); confetti(140);
  }
  else if(ev==='game'){ cnt('games'); }
  else if(ev==='training'){ cnt('trainings'); }
  else if(ev==='role'){ cnt('roles'); }
  else if(ev==='rev'){ cnt('rev'); }
  save(); checkAch(); questCheck();
}

/* ---- задания дня и недели, сундуки, наклейки ---- */
const QUEST_POOL = [
 ['lessons','Пройди 1 урок курса',1],['xp','Набери 30 очков',30],['ok','Дай 15 верных ответов',15],['games','Сыграй в 2 мини-игры',2],
 ['comboMax','Собери комбо ×8',8],['rev','Повтори 10 карточек',10],['trainings','Пройди смешанную тренировку',1],['roles','Сыграй диалог по ролям',1]
];
function dailyQuests(){
  const d = today(), seed = [...d].reduce((a,ch) => a*31 + ch.charCodeAt(0), 7) >>> 0, out = [], used = {};
  out.push(QUEST_POOL[0]);
  let s = seed; while(out.length < 3){ s = (s*1103515245 + 12345) >>> 0; const q = QUEST_POOL[1 + s % (QUEST_POOL.length-1)]; if(!used[q[0]]){ used[q[0]] = 1; out.push(q); } }
  return out;
}
function questVal(key){ const g = GS(); return key==='xp' ? (dayRec().xp||0) : (g.day.c[key]||0); }
function questCheck(){
  const g = GS();
  if(!g.day.chest && dailyQuests().every(q => questVal(q[0]) >= q[2]) && !g.day.ready){ g.day.ready = true; save(); setTimeout(() => { sfx('coin'); toast('🧰 Все задания дня выполнены! Открой сундук на главной.', 3500); }, 900); }
  const days = Object.keys(g.week.days).length, wl = g.week.c.lessons||0;
  if(!g.week.chest && days>=5 && wl>=5 && !g.week.ready){ g.week.ready = true; save(); setTimeout(() => toast('🎁 Испытание недели выполнено! Большой сундук ждёт.', 3500), 1500); }
}
function openChest(big){
  const g = GS();
  if(big){ if(!g.week.ready || g.week.chest) return; g.week.chest = true; } else { if(!g.day.ready || g.day.chest) return; g.day.chest = true; }
  cnt('chests');
  const bonus = big ? 60 + rnd(0,40) : 10 + rnd(0,20);
  const free = STICKERS.filter(s => !g.stickers[s[0]]), got = [];
  for(let i=0;i<(big?3:1) && free.length;i++){ const k = free.splice(rnd(0,free.length-1),1)[0]; g.stickers[k[0]] = today(); got.push(k); }
  save(); addXP(bonus); sfx('win'); confetti(big ? 200 : 120);
  showOverlay(`<div class="center chest-open"><div class="chest-ico">${big?'🎁':'🧰'}</div><h2>${big?'Большой сундук!':'Сундук дня!'}</h2>
    <div style="font-size:20px">+${bonus} очков</div>
    ${got.map(s => `<div class="sticker-new"><span>${s[0]}</span><b>${s[1]}</b><div class="mut">${s[2]}</div></div>`).join('') || '<div class="mut">Все наклейки уже собраны — ты легенда!</div>'}
    <button class="primary" onclick="closeOverlay()">Забрать</button></div>`);
  checkAch(); if(S.tab==='home') renderHome();
}
function showOverlay(html){ $('#sheet').innerHTML = html; $('#ovl').hidden = false; }
function closeOverlay(){ $('#ovl').hidden = true; if(S.tab==='home' && !CL) renderHome(); }

/* ---- блок на главной: звание, огонёк, задания, сундуки ---- */
function homeGameCards(){
  const g = GS(), L = levelOf(S.xp||0), st = streak(), active = (dayRec().xp||0) > 0, qs = dailyQuests();
  const qrow = q => { const v = Math.min(q[2], questVal(q[0])), ok = v >= q[2];
    return `<div class="quest ${ok?'done':''}"><span>${ok?'✅':'⬜'}</span><span style="flex:1">${q[1]}</span><span class="mut">${v}/${q[2]}</span></div>`; };
  const wdays = Object.keys(g.week.days).length, wl = Math.min(5, g.week.c.lessons||0);
  return `<div class="card game-top"><div class="row" style="flex-wrap:nowrap;gap:12px">
     ${mascotHTML(76)}
     <div style="flex:1"><div class="mut">Звание</div><b style="font-size:18px">${titleOf(L.lv)}</b> <span class="mut">· уровень ${L.lv}</span>
      <div class="bar" style="margin-top:6px"><i style="width:${L.cur/L.need*100}%"></i></div></div>
     <div class="flame ${active?'on':''}" title="Дней подряд">🔥<b>${st}</b></div></div></div>
   <div class="card"><div class="row" style="justify-content:space-between"><b>Задания дня</b><span class="mut">награда — сундук</span></div>
     ${qs.map(qrow).join('')}
     ${g.day.chest ? '<div class="mut center" style="margin-top:6px">Сундук дня открыт. Завтра будут новые задания!</div>'
       : g.day.ready ? '<button class="primary chest-btn" onclick="openChest(false)">🧰 Открыть сундук дня</button>' : ''}
     <div class="quest" style="margin-top:8px"><span>🎁</span><span style="flex:1">Испытание недели: 5 дней занятий и 5 уроков</span><span class="mut">${Math.min(5,wdays)}/5 · ${wl}/5</span></div>
     ${g.week.ready && !g.week.chest ? '<button class="primary chest-btn" onclick="openChest(true)">🎁 Открыть большой сундук</button>' : ''}</div>`;
}

/* ---- достижения, наклейки, открытки (для «Прогресса») ---- */
function achBlock(){
  const g = GS(), n = Object.keys(g.ach).length;
  return `<div class="card"><b>Достижения: ${n} из ${ACH.length}</b><div class="achgrid">${ACH.map(a => `<div class="ach ${g.ach[a[0]]?'got':''}" title="${a[3]}"><span>${a[1]}</span><b>${a[2]}</b><small>${a[3]}</small></div>`).join('')}</div></div>
   <div class="card"><b>Наклейки: ${Object.keys(g.stickers).length} из ${STICKERS.length}</b><div class="mut">Выпадают из сундуков за задания дня и недели.</div>
    <div class="stickers">${STICKERS.map(s => g.stickers[s[0]] ? `<span class="stk" title="${s[1]} — ${s[2]}">${s[0]}</span>` : '<span class="stk off">?</span>').join('')}</div></div>
   <div class="card"><b>Открытки городов: ${citiesDone()} из ${CITIES.length}</b><div class="mut">Открываются, когда пройден весь город.</div>
    <div class="stickers">${CITIES.map((c,i) => cityDone(i) ? `<span class="stk" onclick="showPostcard(${i})" title="${c.name}">${c.em}</span>` : '<span class="stk off">✉</span>').join('')}</div></div>`;
}
