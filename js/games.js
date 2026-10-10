'use strict';
/* ===== МИНИ-ИГРЫ: шарики, пары, падающие слова, блиц 60 секунд (общий для обоих языков) ===== */
let GM = null, GMT = 0;   // текущая игра; GMT — номер запуска, чтобы старые таймеры сами останавливались
const GAMES = [
  ['balloon','🎈','Лопни шарик','Звучит слово — лопни шарик с верным переводом. 10 раундов.'],
  ['pairs','🃏','Пары','Найди пары «слово — перевод». Чем меньше ходов, тем больше очков.'],
  ['fall','🌧️','Падающие слова','Успей выбрать перевод, пока слово не упало. 3 жизни, скорость растёт.'],
  ['blitz','⏱️','Блиц 60 секунд','Перевод верный или нет? Успей ответить как можно больше.']
];
if(typeof setTone === 'function') GAMES.splice(1, 0, ['tones','🎵','Шарики-тоны','Звучит слово — лопни шарик с правильными тонами пиньиня.']);
function gamePool(){
  const known = WORDS.filter(w => S.srs[w[0]]);
  return known.length >= 8 ? known : WORDS.filter(w => w[3]===1).slice(0, 40);
}
function gWord(w, big){ return IS_EN ? `<span class="en" style="font-size:${big?30:20}px">${w[0]}</span>` : `<span class="hz" style="font-size:${big?40:24}px">${w[0]}</span>${big?`<div class="py">${pyJoin(w[1])}</div>`:''}`; }
function distract(w, pool, n){ return shuffle(pool.filter(x => x[0]!==w[0] && x[2]!==w[2])).slice(0, n); }
function renderGames(){
  GMT++; GM = null;
  const g = GS();
  $('#t-games').innerHTML = `<h2>Мини-игры</h2><div class="mut">Разминка на 2–3 минуты. Слова берутся из твоих карточек${gamePool().length<40?' (пока мало — из первого урока)':''}. Каждая игра приносит очки.</div>
   <div class="gamegrid">${GAMES.map(x => `<button class="gcard" onclick="startGame('${x[0]}')"><span class="gi">${x[1]}</span><b>${x[2]}</b><small>${x[3]}</small><span class="best">Рекорд: ${g.best[x[0]]||0}</span></button>`).join('')}</div>
   <div class="center" style="margin-top:12px">${mascotHTML(70, 'Выбирай игру!')}</div>`;
}
function startGame(id){
  sfx('pop'); const token = ++GMT;
  GM = {id, token, score:0, round:0};
  ({balloon:balloonStart, tones:balloonStart, pairs:pairsStart, fall:fallStart, blitz:blitzStart})[id]();
}
function alive(t){ return GM && GM.token === t && S.tab === 'games'; }
function gameHead(title){ return `<div class="row" style="justify-content:space-between;margin-top:8px"><button class="btn" onclick="renderGames()">← Игры</button><b>${title}</b><span class="score">⭐ <b id="gsc">${GM.score}</b></span></div><div class="mfloat">${mascotHTML(56)}</div>`; }
function gameOver(){
  const g = GS(), id = GM.id, sc = GM.score, rec = sc > (g.best[id]||0);
  if(rec) g.best[id] = sc;
  const xp = Math.min(30, Math.ceil(sc/2));
  GMT++;
  award('game', sc); if(xp) addXP(xp);
  if(rec && sc > 0){ confetti(120); sfx('win'); }
  $('#t-games').innerHTML = `<div class="card center"><div style="font-size:52px">${rec&&sc>0?'🏆':sc>5?'🎉':'💪'}</div><h2>Счёт: ${sc}</h2>
    <div class="mut">${rec&&sc>0?'Новый рекорд!':'Рекорд: '+(g.best[id]||0)} · +${xp} очков</div>
    ${mascotHTML(70, rec&&sc>0?'Рекорд! Ты лучшая!':pick(MASCOT_TXT.ok))}
    <button class="primary" onclick="startGame('${id}')">Ещё раз</button><button class="btn" style="width:100%;margin-top:6px" onclick="renderGames()">Другие игры</button></div>`;
}

/* ---- шарики (смысл или тоны) ---- */
function balloonStart(){ GM.rounds = 10; balloonRound(); }
function balloonRound(){
  if(GM.round >= GM.rounds) return gameOver();
  GM.round++;
  const pool = gamePool(), w = pick(pool), tone = GM.id === 'tones';
  let opts;
  if(tone){
    const sy = w[1].split(' '), set = [w[1]]; let guard = 0;
    while(set.length < 4 && guard++ < 60){ const v = sy.map(s => toneOf(s)===5 ? s : setTone(s, 1+rnd(0,3))).join(' '); if(!set.includes(v)) set.push(v); }
    opts = shuffle(set).map(v => ({lab:pyJoin(v), ok:v===w[1]}));
  } else opts = shuffle([w].concat(distract(w, pool, 3))).map(x => ({lab:x[2], ok:x===w}));
  GM.w = w; GM.done = false;
  const cols = ['#e53935','#1e88e5','#43a047','#fb8c00','#8e24aa'];
  $('#t-games').innerHTML = gameHead(tone ? 'Шарики-тоны' : 'Лопни шарик') + `<div class="mut center">Раунд ${GM.round} из ${GM.rounds}</div>
    <div class="center"><button class="btn" onclick="say(GM.w[0])">🔊 Ещё раз</button>${tone?'':` <span class="hint">${gWord(w)}</span>`}</div>
    <div class="sky" id="sky">${opts.map((o,k) => `<button class="balloon" style="--bc:${cols[k]};left:${6+k*23}%;animation-delay:${(k*0.35).toFixed(2)}s" onclick="balloonHit(this,${o.ok})"><span>${o.lab}</span></button>`).join('')}</div>`;
  setTimeout(() => say(w[0]), 250);
  const t = GM.token, r = GM.round;
  setTimeout(() => { if(alive(t) && GM.round === r && !GM.done){ GM.done = true; sfx('bad'); toast('Улетели! Это было: ' + w[2]); setTimeout(() => alive(t) && balloonRound(), 900); } }, 9000);
}
function balloonHit(el, ok){
  if(GM.done) return;
  if(ok){ GM.done = true; GM.score++; $('#gsc').textContent = GM.score; el.classList.add('pop'); sfx('pop'); award('task', true);
    const t = GM.token; setTimeout(() => alive(t) && balloonRound(), 700); }
  else { el.classList.add('wrong'); award('task', false); }
}

/* ---- пары ---- */
function pairsStart(){
  const ws = shuffle(gamePool()).slice(0, 6);
  GM.cards = shuffle(ws.flatMap((w,i) => [{i, side:'t', w}, {i, side:'r', w}]));
  GM.open = []; GM.matched = 0; GM.moves = 0; GM.t0 = Date.now();
  pairsRender();
}
function pairsRender(){
  $('#t-games').innerHTML = gameHead('Пары') + `<div class="mut center">Ходов: ${GM.moves} · найдено ${GM.matched} из 6</div>
    <div class="pairs">${GM.cards.map((c,k) => `<button class="pcard ${c.m?'m':''} ${GM.open.includes(k)||c.m?'open':''}" onclick="pairsFlip(${k})"><span class="face">${c.side==='t' ? gWord(c.w) : c.w[2]}</span><span class="back">?</span></button>`).join('')}</div>`;
}
function pairsFlip(k){
  const c = GM.cards[k]; if(c.m || GM.open.includes(k) || GM.open.length === 2) return;
  GM.open.push(k); sfx('tick'); if(c.side==='t') say(c.w[0]);
  pairsRender();
  if(GM.open.length === 2){
    GM.moves++;
    const [a,b] = GM.open.map(x => GM.cards[x]), t = GM.token;
    if(a.i === b.i && a.side !== b.side){ a.m = b.m = true; GM.matched++; GM.open = []; award('task', true);
      setTimeout(() => { if(!alive(t)) return; pairsRender(); if(GM.matched === 6){ GM.score = Math.max(5, 40 - (GM.moves-6)*3); gameOver(); } }, 350); }
    else { award('task', false); setTimeout(() => { if(!alive(t)) return; GM.open = []; pairsRender(); }, 900); }
  }
}

/* ---- падающие слова ---- */
function fallStart(){ GM.lives = 3; GM.speed = 0.55; fallRound(); }
function fallRound(){
  if(GM.lives <= 0) return gameOver();
  const pool = gamePool(), w = pick(pool), opts = shuffle([w].concat(distract(w, pool, 2)));
  GM.w = w; GM.y = 0; GM.done = false;
  $('#t-games').innerHTML = gameHead('Падающие слова') + `<div class="mut center">Жизни: ${'❤️'.repeat(GM.lives)}${'🤍'.repeat(3-GM.lives)}</div>
    <div class="rain" id="rain"><div class="drop" id="drop">${gWord(w)}</div><div class="ground"></div></div>
    <div class="opts3">${opts.map(o => `<button class="opt" onclick="fallAns(${o===w})">${o[2]}</button>`).join('')}</div>`;
  if(IS_EN || Math.random() < .5) say(w[0]);
  const t = GM.token, drop = $('#drop'), H = $('#rain').clientHeight - 50;
  (function step(){
    if(!alive(t) || GM.done || GM.w !== w) return;
    GM.y += GM.speed; drop.style.transform = 'translateY(' + GM.y + 'px)';
    if(GM.y >= H){ GM.done = true; GM.lives--; sfx('bad'); award('task', false); toast('Упало! «' + w[0] + '» — ' + w[2]); setTimeout(() => alive(t) && fallRound(), 900); return; }
    requestAnimationFrame(step);
  })();
}
function fallAns(ok){
  if(GM.done) return; GM.done = true;
  const t = GM.token;
  if(ok){ GM.score++; GM.speed = Math.min(2.6, GM.speed + 0.12); sfx('ok'); award('task', true); $('#drop').classList.add('caught'); }
  else { GM.lives--; award('task', false); toast('«' + GM.w[0] + '» — ' + GM.w[2]); }
  setTimeout(() => alive(t) && fallRound(), ok ? 400 : 900);
}

/* ---- блиц 60 секунд ---- */
function blitzStart(){ GM.left = 60; GM.t0 = Date.now(); blitzRound(); blitzTick(); }
function blitzTick(){
  const t = GM.token;
  const left = Math.max(0, 60 - Math.floor((Date.now() - GM.t0)/1000));
  const el = $('#btime'); if(el){ el.style.width = (left/60*100) + '%'; $('#bsec').textContent = left; }
  if(left <= 0){ if(alive(t)) gameOver(); return; }
  setTimeout(() => alive(t) && blitzTick(), 250);
}
function blitzRound(){
  const pool = gamePool(), w = pick(pool), right = Math.random() < .5, shown = right ? w : pick(distract(w, pool, 3));
  GM.ok = right;
  $('#t-games').innerHTML = gameHead('Блиц 60 секунд') + `<div class="bar" style="margin:8px 0"><i id="btime" style="width:100%"></i></div><div class="mut center"><b id="bsec">60</b> сек</div>
    <div class="card center blitz">${gWord(w, true)}<div style="font-size:22px;margin-top:8px">= ${shown[2]} ?</div></div>
    <div class="opts"><button class="okb big2" onclick="blitzAns(true)">✓ Верно</button><button class="badb big2" onclick="blitzAns(false)">✗ Неверно</button></div>`;
  const left = Math.max(0, 60 - Math.floor((Date.now() - GM.t0)/1000)); $('#btime').style.width = (left/60*100) + '%'; $('#bsec').textContent = left;
}
function blitzAns(v){
  const ok = v === GM.ok;
  if(ok){ GM.score++; sfx('ok'); } else { sfx('bad'); GS().combo = 0; }
  cnt('tasks'); if(ok) cnt('ok');
  blitzRound();
}
