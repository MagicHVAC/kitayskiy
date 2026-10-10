'use strict';
/* ===== ЗВУКИ И ТОНЫ ===== */
function curveSVG(pts){
  if(!pts) return '<svg class="curve" viewBox="0 0 120 64"><circle cx="60" cy="44" r="5" fill="var(--t5)"/></svg>';
  const P = pts.map(p => (10+p[0]*100).toFixed(1)+','+(58-(p[1]-1)*13).toFixed(1));
  return '<svg class="curve" viewBox="0 0 120 64"><g stroke="var(--line)">'+[1,2,3,4,5].map(l=>'<line x1="6" x2="114" y1="'+(58-(l-1)*13)+'" y2="'+(58-(l-1)*13)+'"/>').join('')+
    '</g><polyline points="'+P.join(' ')+'" fill="none" stroke="var(--acc)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
let TQ = null, PQ = null;
function renderSounds(){
  $('#t-sounds').innerHTML = `
  <h2>Тоны — главное в китайском</h2>
  <div class="mut">Один слог с разным тоном — разные слова: mā «мама», mǎ «лошадь», mà «ругать». Нажимайте и повторяйте вслух.</div>
  ${TONES.map(t=>`<div class="card row" style="flex-wrap:nowrap;gap:12px">${curveSVG(t.pts)}
    <div style="flex:1"><b class="t${t.n}">${t.name}</b><div class="mut">${t.hint}</div>
    <button class="btn" onclick="say('${t.ex[0]}')"><span class="hz">${t.ex[0]}</span> ${t.ex[1]} — ${t.ex[2]} 🔊</button></div></div>`).join('')}
  <div class="card"><b>Послушать четвёрки</b><div class="row" style="margin-top:6px">
   ${TONE_SETS.map((s,i)=>`<button class="btn" onclick="say('${s.map(x=>x[0]).join('，')}')">${s[0][1].replace(/[āēīōū]/,m=>({'ā':'a','ē':'e','ī':'i','ō':'o','ū':'u'})[m])}: <span class="hz">${s.map(x=>x[0]).join('')}</span></button>`).join('')}
  </div></div>
  <h3>🎯 Тренажёр: какой тон?</h3><div class="card" id="tq"></div>
  <h3>🎯 Тоны в словах</h3><div class="mut">Послушайте слово и выберите пиньинь с верными тонами.</div><div class="card" id="wq"></div>
  <h3>Правила изменения тонов</h3>
  <div class="card"><b>3 + 3 → 2 + 3.</b> Два третьих тона подряд: первый звучит как второй. 你好 nǐ hǎo → <i>ní hǎo</i>.
   <button class="btn" onclick="say('你好')">🔊 你好</button></div>
  <div class="card"><b>不 bù → bú перед 4-м тоном.</b> 不是 <i>bú shì</i>, 不客气 <i>bú kèqi</i>.
   <button class="btn" onclick="say('不是')">🔊 不是</button></div>
  <div class="card"><b>一 yī:</b> перед 4-м тоном → <i>yí</i> (一个 yí ge), перед 1-м, 2-м, 3-м → <i>yì</i> (一点 yìdiǎn). В счёте и в конце слова — <i>yī</i>.
   <button class="btn" onclick="say('一个')">🔊 一个</button><button class="btn" onclick="say('一点')">🔊 一点</button></div>
  <h2 style="margin-top:22px">Звуки пиньиня</h2>
  <div class="mut">Пиньинь — латинская запись китайского. Многие буквы читаются не так, как в английском. Вот трудные:</div>
  <div class="card tw"><table>${SOUNDS.map(s=>`<tr><td><b>${s[0]}</b></td><td>${s[1]}<div class="row" style="margin-top:4px">${s[2].map(e=>`<button class="btn" onclick="say('${e[0]}')"><span class="hz">${e[0]}</span> ${e[1]} 🔊</button>`).join('')}</div></td></tr>`).join('')}</table></div>
  <h3>👂 Различи на слух</h3><div class="card" id="pq"></div>`;
  tqNext(); wqNext(); pqNext();
}
function tqNext(){
  const set = pick(TONE_SETS), k = Math.random()*4|0;
  TQ = {set, k, done:false};
  $('#tq').innerHTML = `<div class="center"><button class="huge" onclick="say(TQ.set[TQ.k][0])">🔊</button>
   <div class="mut" style="margin-top:6px">Послушайте и выберите тон. Точность: ${S.tone.all?Math.round(S.tone.ok/S.tone.all*100):0}% (${S.tone.ok}/${S.tone.all})</div></div>
   <div class="opts" id="tqo">${[1,2,3,4].map(n=>`<button onclick="tqAns(${n})"><span class="t${n}">${n}-й</span> ${curveMini(n)}</button>`).join('')}</div><div class="res" id="tqr"></div>`;
  setTimeout(()=>say(set[k][0]),200);
}
function curveMini(n){ return ['','‾','／','∨','＼'][n]; }
function tqAns(n){
  if(TQ.done) return; TQ.done=true;
  const right = TQ.k+1, ok = n===right; S.tone.all++; if(ok){ S.tone.ok++; addXP(1); } save();
  const bs = document.querySelectorAll('#tqo button'); bs[right-1].classList.add('ok'); if(!ok) bs[n-1].classList.add('bad');
  const w = TQ.set[TQ.k];
  $('#tqr').innerHTML = (ok?'✅ Верно! ':'❌ Это был '+right+'-й тон. ') + `<span class="hz">${w[0]}</span> <b class="t${right}">${w[1]}</b>
   <div class="row" style="margin-top:6px"><button class="btn" onclick="say('${TQ.set.map(x=>x[0]).join('，')}')">🔊 Сравнить все 4</button>
   <button class="btn" onclick="tqNext()" style="font-weight:600">Дальше →</button></div>`;
}
function pqNext(){
  const p = pick(PAIRS), k = Math.random()*2|0;
  PQ = {p, k, done:false};
  $('#pq').innerHTML = `<div class="center"><button class="huge" onclick="say(PQ.p[PQ.k][0])">🔊</button>
   <div class="mut" style="margin-top:6px">Что прозвучало? Точность: ${S.pair.all?Math.round(S.pair.ok/S.pair.all*100):0}%</div></div>
   <div class="opts" id="pqo">${p.map((x,i)=>`<button onclick="pqAns(${i})"><span class="hz">${x[0]}</span> ${colorPy(x[1])}</button>`).join('')}</div><div class="res" id="pqr"></div>`;
  setTimeout(()=>say(p[k][0]),200);
}
function pqAns(i){
  if(PQ.done) return; PQ.done=true; const ok=i===PQ.k; S.pair.all++; if(ok){ S.pair.ok++; addXP(1); } save();
  const bs=document.querySelectorAll('#pqo button'); bs[PQ.k].classList.add('ok'); if(!ok) bs[i].classList.add('bad');
  $('#pqr').innerHTML = (ok?'✅ Верно!':'❌ Прозвучало '+PQ.p[PQ.k][1]) + ` <button class="btn" onclick="say('${PQ.p[0][0]}，${PQ.p[1][0]}')">🔊 Оба</button><button class="btn" onclick="pqNext()" style="font-weight:600">Дальше →</button>`;
}
// Тоны в словах: слово звучит, варианты — тот же пиньинь с другими тонами
let WQ = null;
function wqNext(){
  const known = WORDS.filter(w => S.srs[w[0]]);
  const pool = (known.length>=10 ? known : WORDS.filter(w=>w[3]===1)).filter(w => w[1].split(' ').some(s=>toneOf(s)<5));
  const w = pick(pool), sy = w[1].split(' ');
  const opts = [w[1]]; let guard = 0;
  while(opts.length<4 && guard++<60){
    const v = sy.map(s => toneOf(s)===5 ? s : setTone(s, 1+(Math.random()*4|0))).join(' ');
    if(!opts.includes(v)) opts.push(v);
  }
  WQ = {w, opts:shuffle(opts), done:false};
  $('#wq').innerHTML = `<div class="center"><button class="huge" onclick="say(WQ.w[0])">🔊</button>
   <div class="mut" style="margin-top:6px">${S.tone.all?'Точность по тонам: '+Math.round(S.tone.ok/S.tone.all*100)+'%':''}</div></div>
   <div class="opts" id="wqo">${WQ.opts.map((o,i)=>`<button onclick="wqAns(${i})">${pyJoin(o)}</button>`).join('')}</div><div class="res" id="wqr"></div>`;
  setTimeout(()=>say(w[0]),200);
}
function wqAns(i){
  if(WQ.done) return; WQ.done=true;
  const right = WQ.opts.indexOf(WQ.w[1]), ok = i===right; S.tone.all++; if(ok){ S.tone.ok++; addXP(1); } save();
  const bs = document.querySelectorAll('#wqo button'); bs[right].classList.add('ok'); if(!ok) bs[i].classList.add('bad');
  $('#wqr').innerHTML = (ok?'✅ Верно! ':'❌ ') + `<span class="hz mid">${colorHz(WQ.w[0],WQ.w[1])}</span> ${colorPy(WQ.w[1])} — ${WQ.w[2]}
   <div class="row" style="margin-top:6px"><button class="btn" onclick="slow(WQ.w[0])">🐢 медленно</button><button class="btn" onclick="wqNext()" style="font-weight:600">Дальше →</button></div>`;
}
