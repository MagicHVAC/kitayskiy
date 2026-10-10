'use strict';
/* ===== КАРТА ПУТЕШЕСТВИЯ, ОТКРЫТКИ ГОРОДОВ, СЕРИИ СЮЖЕТА (общий для обоих языков) =====
   Нужны: CITIES[18] (один город = один блок курса), EPISODES[90] (одна серия = один урок), HERO — имя героини. */
function unitLessons(ui){ return LESSONS.map((x,i) => i).filter(i => LESSONS[i].unit === ui); }
function cityDone(ui){ const ids = unitLessons(ui); return ids.length > 0 && ids.every(i => C().done[i]); }
let mapLastHere = null;
function renderMap(){
  const nx = nextLesson(), curUnit = LESSONS[nx].unit;
  const moved = mapLastHere !== null && mapLastHere !== nx; mapLastHere = nx;
  return `<div class="map">${COURSE.map((u,ui) => {
    const c = CITIES[ui] || {name:u.u, local:'', em:'📍', col:'#888'}, ids = unitLessons(ui), done = cityDone(ui), cur = ui === curUnit;
    return `<div class="stop ${ui%2?'r':'l'} ${done?'done':''} ${cur?'cur':''} ${!done&&!cur&&ui>curUnit?'lock':''}" style="--cc:${c.col}">
      <div class="city" onclick="${done?`showPostcard(${ui})`:`openLesson(${ids[0]})`}"><span class="cem">${c.em}</span>
        <span><b>${c.name}</b><br><span class="mut">${c.local} · ${u.u.replace(/^[AB]\d · /,'')}</span></span>${done?'<span class="stamp">✓</span>':''}</div>
      <div class="dots">${ids.map(i => `<button class="dot2 ${C().done[i]?'ok':''} ${i===nx?'here':''}" onclick="openLesson(${i})" aria-label="Урок ${i+1}">${i===nx?`<span class="av ${moved?'arrive':''}">${mascotSVG()}</span>`:(C().done[i]?'★':i+1)}</button>`).join('')}</div></div>`;
  }).join('')}</div>`;
}
function showPostcard(ui){
  const c = CITIES[ui];
  sfx('pop');
  showOverlay(`<div class="postcard" style="--cc:${c.col}"><div class="pc-top"><span class="pc-em">${c.em}</span><div><div class="pc-local">${c.local}</div><h2 style="margin:0">${c.name}</h2></div><span class="pc-stamp">ПРОЙДЕНО</span></div>
    <p>${c.fact}</p><div class="mut">Открытка из путешествия ${HERO}. Блок ${ui+1}: ${COURSE[ui].u}</div>
    <button class="primary" onclick="closeOverlay()">Закрыть</button></div>`);
}
/* ---- серия сюжета ---- */
function episodeHTML(i){
  const e = EPISODES[i]; if(!e) return '';
  const c = CITIES[LESSONS[i].unit] || {name:'', em:''};
  return `<div class="card episode" style="--cc:${c.col||'#888'}"><div class="ep-head"><span>${c.em} ${c.name}</span><span class="mut">Серия ${i+1}</span></div>
    <div class="story">${e.n}</div>
    ${e.d.map(l => { const t = R(l[1]); return `<div class="ep-line ${l[0]===HERO?'me':''}"><b>${l[0]}:</b> <span class="${IS_EN?'en':'hz'}">${l[1]}</span>${l[2]?` <span class="py">${l[2]}</span>`:''}
      <div class="mut">${l[3]}</div><button class="btn sm" onclick="sayI(${t},0,'${l[0]===HERO?'A':'B'}')" aria-label="Послушать">🔊</button></div>`; }).join('')}
    <button class="btn" onclick="playEpisode(${i})">▶ Слушать серию</button></div>`;
}
function playEpisode(i){ sayQueue(EPISODES[i].d.map(l => ({t:l[1], who:l[0]===HERO?'A':'B'}))); }
function teaserHTML(i){
  const e = EPISODES[i+1]; if(!e) return '';
  const k = e.n.search(/[.!?…]\s/), s = k >= 0 ? e.n.slice(0, k+1) : e.n;   // без lookbehind: старые iPhone его не знают
  return `<div class="card teaser"><div class="mut">В следующей серии…</div><div class="story">${s.length>110 ? s.slice(0,110)+'…' : s} <b>Что будет дальше?</b></div></div>`;
}
