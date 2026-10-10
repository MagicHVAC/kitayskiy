'use strict';
const APP = {ver:'1.1.0', date:'10.10.2026'};
const NEWS = [
 'Словарь вырос до 300 слов: добавлен уровень HSK 2.',
 'Новая вкладка «Правила»: 15 уроков грамматики с упражнением «собери предложение» и тренажёр чисел, цен, времени и дат.',
 'Вкладка «Речь»: 8 диалогов по ролям (можно говорить за одного из героев) и аудирование.',
 '«Звуки»: тренажёр тонов в словах — слышишь слово, выбираешь верный пиньинь.',
 '«Чтение»: прописи — пишите пальцем слова, которые уже выучили.',
 'Очки опыта и дневная цель. Работает без интернета, можно поставить значок на экран «Домой».'
];

/* ===== СОСТОЯНИЕ ===== */
const LS = 'zh_learn_v1';
const DAY = 864e5;
const DEF_SETTINGS = {rate:0.8, newPerDay:10, mode:'read', autoplay:true, voice:'', goal:30};
let S = {srs:{}, daily:{}, tone:{ok:0,all:0}, pair:{ok:0,all:0}, xp:0, seenVer:'', sub:{},
  settings:Object.assign({}, DEF_SETTINGS), tab:'home'};
function load(){ try{ const t=localStorage.getItem(LS); if(t){ const o=JSON.parse(t); S=Object.assign(S,o); S.settings=Object.assign({}, DEF_SETTINGS, o.settings||{}); S.sub=S.sub||{}; } }catch(e){} }
function save(){ try{ localStorage.setItem(LS, JSON.stringify(S)); }catch(e){} }
function today(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function dayRec(){ const k=today(); return S.daily[k] || (S.daily[k]={nw:0,rev:0,q:0,qok:0,xp:0}); }
function addXP(n){ S.xp=(S.xp||0)+n; const r=dayRec(); const before=r.xp||0; r.xp=before+n; save();
  const g=S.settings.goal; if(before<g && r.xp>=g) toast('🎯 Дневная цель выполнена! 太好了！', 3000); }

/* ===== УТИЛИТЫ ===== */
const $ = s => document.querySelector(s);
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];} return a; };
const pick = a => a[Math.random()*a.length|0];
const esc = s => String(s).replace(/'/g,"\\'");
let toastT;
function toast(m, ms){ const t=$('#toast'); t.innerHTML=m; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('on'), ms||2200); }
function toneOf(syl){
  if(/[āēīōūǖĀĒĪŌŪ]/.test(syl)) return 1; if(/[áéíóúǘÁÉÍÓÚ]/.test(syl)) return 2;
  if(/[ǎěǐǒǔǚǍĚǏǑǓ]/.test(syl)) return 3; if(/[àèìòùǜÀÈÌÒÙ]/.test(syl)) return 4; return 5;
}
const VOW_ON = /^[aoeāáǎàōóǒòēéěè]/i;
function pyJoin(py){ return py.split(' ').map((x,i)=> i>0 && VOW_ON.test(x) ? "'"+x : x).join(''); }
function colorHz(hz, py){
  const ch=[...hz], sy=py.split(' ');
  if(ch.length!==sy.length) return hz;
  return ch.map((c,i)=>'<span class="t'+toneOf(sy[i])+'">'+c+'</span>').join('');
}
function colorPy(py){ return py.split(' ').map((s,i)=>'<span class="t'+toneOf(s)+'">'+(i>0&&VOW_ON.test(s)?"'":'')+s+'</span>').join(''); }
// Слог без знака тона: «hǎo» → «hao», ü сохраняется
function bareSyl(s){ return s.normalize('NFD').replace(/ü/g,'ü').replace(/[̀-ͯ]/g,'').normalize('NFC'); }
// Поставить тон t (1–4, 5 = лёгкий) по правилам пиньиня: a/e, затем o в ou, иначе последняя гласная
function setTone(s, t){
  const b = bareSyl(s); if(t===5) return b;
  const M = {a:'āáǎà',e:'ēéěè',i:'īíǐì',o:'ōóǒò',u:'ūúǔù','ü':'ǖǘǚǜ',A:'ĀÁǍÀ',E:'ĒÉĚÈ',O:'ŌÓǑÒ'};
  let k = b.search(/[aAeE]/);
  if(k<0) k = b.search(/o(?=u)|O(?=u)/);
  if(k<0){ for(let i=b.length-1;i>=0;i--) if('aeiouüAEO'.includes(b[i])){ k=i; break; } }
  if(k<0) return b;
  return b.slice(0,k) + M[b[k]][t-1] + b.slice(k+1);
}

/* ===== ОЗВУЧКА ===== */
let zhVoice = null, zhVoiceB = null, voicesReady = false;
function zhVoices(){ return ('speechSynthesis' in window) ? speechSynthesis.getVoices().filter(v=>/^(zh|cmn)/i.test(v.lang) && !/HK|TW|yue/i.test(v.lang)) : []; }
function pickVoice(){
  if(!('speechSynthesis' in window)) return;
  const all = speechSynthesis.getVoices(); if(all.length) voicesReady = true;
  const vs = zhVoices();
  zhVoice = vs.find(v=>v.name===S.settings.voice) || vs.find(v=>/zh[-_]CN/i.test(v.lang)) || vs[0] || null;
  zhVoiceB = vs.find(v=>v!==zhVoice) || null;
}
if('speechSynthesis' in window){ pickVoice(); speechSynthesis.onvoiceschanged = () => { pickVoice(); if(S.tab==='home') renderHome(); }; }
function utter(text, rate, who){
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  const v = who==='B' ? (zhVoiceB || zhVoice) : zhVoice; if(v) u.voice = v;
  if(who==='B' && !zhVoiceB) u.pitch = 1.35;
  u.rate = rate || S.settings.rate;
  return u;
}
function say(text, rate, who){
  if(!('speechSynthesis' in window)){ toast('Этот браузер не умеет озвучивать текст'); return; }
  speechSynthesis.cancel(); speechSynthesis.speak(utter(text, rate, who));
}
function slow(text){ say(text, 0.5); }
// Очередь реплик: items = [{t, who}], onStep(i) перед каждой, onDone в конце
let sayQ = 0;
function sayQueue(items, onStep, onDone){
  if(!('speechSynthesis' in window)){ toast('Этот браузер не умеет озвучивать текст'); return; }
  speechSynthesis.cancel(); const id = ++sayQ; let i = 0;
  const next = () => { if(id!==sayQ) return; if(i>=items.length){ onDone && onDone(); return; }
    onStep && onStep(i); const u = utter(items[i].t, 0, items[i].who); i++;
    u.onend = () => setTimeout(next, 450); u.onerror = () => setTimeout(next, 450); speechSynthesis.speak(u); };
  next();
}
function stopSay(){ sayQ++; if('speechSynthesis' in window) speechSynthesis.cancel(); }

/* ===== ЧИСЛА ПО-КИТАЙСКИ ===== */
const DIG = '零一二三四五六七八九';
function numZh(n, liang){
  if(n<10) return (n===2 && liang) ? '两' : DIG[n];
  if(n<20) return '十' + (n%10 ? DIG[n%10] : '');
  let s='', zero=false, started=false;
  for(const [v,u] of [[1000,'千'],[100,'百'],[10,'十'],[1,'']]){
    const d = Math.floor(n/v)%10;
    if(!d){ if(started) zero=true; continue; }
    if(zero){ s+='零'; zero=false; }
    s += (d===2 && !started && (u==='千'||u==='百') ? '两' : DIG[d]) + u; started=true;
  }
  return s;
}
const NUM_PY = {'零':'líng','一':'yī','二':'èr','两':'liǎng','三':'sān','四':'sì','五':'wǔ','六':'liù','七':'qī','八':'bā','九':'jiǔ',
  '十':'shí','百':'bǎi','千':'qiān','块':'kuài','点':'diǎn','分':'fēn','半':'bàn','月':'yuè','号':'hào','星':'xīng','期':'qī','天':'tiān'};
function numPy(hz){ return [...hz].map(c=>NUM_PY[c]||c).join(' '); }

/* ===== РАСПОЗНАВАНИЕ РЕЧИ ===== */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const EMBED = (() => { try { return window.self !== window.top; } catch(e){ return true; } })();
function onlyHz(s){ return (s.match(/[㐀-鿿]/g)||[]).join(''); }
function lcs(a,b){ const A=[...a],B=[...b]; const d=Array(B.length+1).fill(0);
  for(let i=1;i<=A.length;i++){ let prev=0; for(let j=1;j<=B.length;j++){ const t=d[j]; d[j]=A[i-1]===B[j-1]?prev+1:Math.max(d[j],d[j-1]); prev=t; } } return d[B.length]; }
function listen(target, outId){
  const out = document.getElementById(outId);
  if(EMBED){ out.innerHTML = '🎤 В этой версии микрофон закрыт. Тренируйтесь так: 🔊 послушайте → повторите вслух 3 раза → снова 🔊 и сравните.'; return; }
  if(!SR){ out.innerHTML = '🎤 Этот браузер не распознаёт речь. Тренируйтесь так: 🔊 послушайте → повторите вслух → сравните.'; return; }
  const r = new SR(); r.lang='zh-CN'; r.interimResults=false; r.maxAlternatives=5;
  out.textContent = '🎤 Говорите…';
  r.onresult = e => {
    const tgt = onlyHz(target); let best=-1, heard='';
    for(const alt of e.results[0]){ const sc = lcs(tgt, onlyHz(alt.transcript)) / Math.max(1,tgt.length); if(sc>best){best=sc;heard=alt.transcript;} }
    const pct = Math.round(best*100); if(pct>=90) addXP(2);
    out.innerHTML = 'Услышано: <span class="hz">'+heard+'</span> — '+(pct>=90?'<b style="color:var(--ok)">отлично! '+pct+'%</b>':pct>=50?'<b style="color:#ef6c00">почти: '+pct+'%</b>':'<b style="color:var(--bad)">ещё раз: '+pct+'%</b>');
  };
  r.onerror = e => { out.textContent = 'Микрофон: ' + (e.error==='not-allowed'?'нет доступа (разрешите микрофон)':e.error==='no-speech'?'ничего не услышал':e.error); };
  try{ r.start(); }catch(e){ out.textContent='Не удалось включить микрофон'; }
}

/* ===== ПОРЯДОК ЧЕРТ (нужен интернет) ===== */
function loadHW(){
  if(window.HanziWriter) return Promise.resolve();
  return new Promise((res,rej)=>{ const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js'; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
}
function strokes(hz, elId, quiz){
  const el = document.getElementById(elId); el.textContent='Загрузка…';
  loadHW().then(()=>{
    el.innerHTML='';
    const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#333';
    [...hz].filter(ch=>/[㐀-鿿]/.test(ch)).forEach(ch=>{
      const d=document.createElement('div'); d.className='hw'; el.appendChild(d);
      const w = HanziWriter.create(d, ch, {width:120,height:120,padding:6,strokeColor:fg,radicalColor:'#b3261e',
        outlineColor:'rgba(128,128,128,.35)',delayBetweenStrokes:180,showOutline:true,showCharacter:!quiz,
        onLoadCharDataError:()=>{ el.textContent = 'Не удалось загрузить черты — нужен интернет.'; }});
      if(quiz) w.quiz({onComplete:()=>{ toast('✅ Иероглиф '+ch+' написан!'); addXP(2); }}); else w.loopCharacterAnimation();
    });
    if(quiz) el.insertAdjacentHTML('beforeend','<div class="mut">Рисуйте пальцем черту за чертой. Ошибётесь 3 раза — будет подсказка.</div>');
  }).catch(()=>{ el.textContent='Для порядка черт нужен интернет (библиотека загружается из сети).'; });
}

/* ===== НАВИГАЦИЯ ===== */
const TABS = {home:()=>renderHome(), sounds:()=>renderSounds(), words:()=>wordsEnter(), talk:()=>renderTalk(),
  read:()=>renderRead(), rules:()=>renderRules(), stats:()=>renderStats()};
function show(tab){
  stopSay();
  S.tab = tab; save();
  document.querySelectorAll('main section').forEach(s => s.hidden = s.id !== 't-'+tab);
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.t===tab));
  TABS[tab]();
  window.scrollTo(0,0);
}
// Переключатель подразделов внутри вкладки
function subnav(tab, items, cur){
  return '<div class="seg">'+items.map(([k,l])=>'<button class="'+(k===cur?'on':'')+'" onclick="S.sub.'+tab+'=\''+k+'\';save();stopSay();TABS.'+tab+'()">'+l+'</button>').join('')+'</div>';
}
