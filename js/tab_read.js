'use strict';
/* ===== ЧТЕНИЕ ===== */
const CHARMAP = (() => { const m={};
  for(const w of WORDS){ const ch=[...w[0]], sy=w[1].split(' ');
    if(ch.length===1) m[ch[0]] = {py:w[1], ru:w[2]};
    else if(ch.length===sy.length) ch.forEach((c,i)=>{ if(!m[c]) m[c]={py:sy[i], ru:'из слова '+w[0]+' ('+pyJoin(w[1])+') — '+w[2]}; });
  } return m; })();
let showPy = true, showRu = false;
function charTap(c){ say(c); const i=CHARMAP[c]; toast('<span class="hz" style="font-size:22px">'+c+'</span> '+(i?i.py+' — '+i.ru:''), 3500); }
function renderRead(){
  const sub = S.sub.read || 'chr';
  $('#t-read').innerHTML = subnav('read', [['chr','Иероглифы'],['snt','Предложения'],['wrt','Прописи']], sub) + '<div id="readBody"></div>';
  ({chr:readChars, snt:readSent, wrt:readWrite})[sub]();
}
function readChars(){
  $('#readBody').innerHTML = `<h2>Иероглифы</h2>
   <div class="card"><b>Как устроены иероглифы</b><div class="mut" style="margin-top:4px">
    Иероглиф — это слог со смыслом. Многие произошли из рисунков (日 — солнце, 山 — гора). Сложные иероглифы собраны из частей: <b>ключ</b> подсказывает смысл, а другая часть — звучание.
    Например, 妈 mā «мама» = 女 «женщина» (смысл) + 马 mǎ «лошадь» (звук). Знать ключи — значит быстрее запоминать.</div></div>
   <h3>Иероглифы-картинки</h3><div class="mut">Нажмите — прозвучит; ✍ покажет порядок черт.</div>
   <div class="grid" style="margin-top:8px">${PICTO.map(p=>`<div class="tile" onclick="say('${p[0]}')"><div class="hz">${colorHz(p[0],p[1])}</div><div class="py">${colorPy(p[1])}</div><div>${p[2]}</div><div class="mut">${p[3]}</div></div>`).join('')}</div>
   <div class="card"><div class="row"><input type="text" id="sw" placeholder="Иероглиф для порядка черт, например 我" style="flex:1" maxlength="4">
    <button class="btn" onclick="strokes($('#sw').value||'我','swo')">✍ черты</button><button class="btn" onclick="strokes($('#sw').value||'我','swo',true)">✏ написать</button></div><div id="swo" class="center"></div></div>
   <h3>Главные ключи</h3>
   <div class="card tw"><table><tr><th>Ключ</th><th>Смысл</th><th>В знакомых словах</th></tr>${RADICALS.map(r=>`<tr><td class="hz" style="font-size:26px">${r[0]}</td><td>${r[1]}</td><td class="hz" style="font-size:20px">${[...r[2].replace(/ /g,'')].map(c=>`<span class="ch" onclick="charTap('${c}')">${c}</span>`).join(' ')}</td></tr>`).join('')}</table></div>`;
}
function readSent(){
  $('#readBody').innerHTML = `<h2>Читаем предложения</h2>
   <div class="row"><label><input type="checkbox" ${showPy?'checked':''} onchange="showPy=this.checked;readSent()"> пиньинь</label>
    <label style="margin-left:12px"><input type="checkbox" ${showRu?'checked':''} onchange="showRu=this.checked;readSent()"> перевод</label></div>
   <div class="mut">Сначала прочитайте сами, потом проверьте. Нажмите на иероглиф — подсказка.</div>
   ${SENTENCES.map((s,i)=>`<div class="card"><div class="hz mid">${[...s[0]].map(c=>/[㐀-鿿]/.test(c)?`<span class="ch" onclick="charTap('${c}')">${c}</span>`:c).join('')}</div>
    ${showPy?`<div class="py">${s[1]}</div>`:''}<div ${showRu?'':'hidden'} id="sr${i}">${s[2]}</div>
    <div class="row" style="margin-top:6px"><button class="btn" onclick="say('${s[0]}')">🔊</button><button class="btn" onclick="slow('${s[0]}')">🐢</button>
    ${showRu?'':`<button class="btn" onclick="$('#sr${i}').hidden=false">Показать перевод</button>`}
    <button class="btn" onclick="listen('${s[0]}','sm${i}')">🎤</button></div><div class="res" id="sm${i}"></div></div>`).join('')}
   <div class="card">Тренируйте чтение и в карточках: режим <b>«字 → смысл»</b> во вкладке «Слова». <button class="btn" onclick="S.settings.mode='read';show('words')">Перейти →</button></div>`;
}
let WR = null;
function readWrite(){
  const known = WORDS.filter(w => S.srs[w[0]]);
  const pool = known.length ? known : WORDS.filter(w => w[3]===1).slice(0,30);
  WR = pick(pool);
  $('#readBody').innerHTML = `<h2>Прописи</h2>
   <div class="mut">${known.length?'Слова, которые вы уже изучаете.':'Пока нет изученных слов — берём первые слова HSK 1.'} Сначала посмотрите порядок черт, потом напишите сами пальцем. Нужен интернет.</div>
   <div class="card center"><div class="ru" style="font-size:22px">${WR[2]}</div><div class="py">${colorPy(WR[1])}</div>
    <div class="row" style="justify-content:center;margin-top:8px"><button class="btn" onclick="say(WR[0])">🔊</button>
     <button class="btn" onclick="strokes(WR[0],'wro')">✍ Показать черты</button><button class="btn" onclick="strokes(WR[0],'wro',true)">✏ Написать</button></div>
    <div id="wro" style="margin-top:6px"></div>
    <button class="primary" onclick="readWrite()">Другое слово →</button></div>`;
  strokes(WR[0], 'wro', true);
}
