'use strict';
/* ===== ПОМОЩНИК: лиса (английский) или панда (китайский) — SVG с анимацией и репликами ===== */
const MASCOT_TXT = {
  ok:['Отлично!','Супер!','Так держать!','Умница!','В точку!','Браво!'],
  bad:['Ничего, бывает!','Почти! Ещё раз','Ошибки помогают учиться','Не сдаёмся!','Запомним и дальше'],
  combo:['Ты в ударе!','Не остановить!','Огонь!','Вот это серия!'],
  start:['Поехали!','Новая серия начинается!','Я с тобой!','Готова к приключению?'],
  idle:['Каждый день по уроку — и ты заговоришь!','Повтори карточки — слова не забудутся','Сыграй в мини-игру для разминки','Скажи фразу вслух — так запоминается лучше']
};
function mascotSVG(){
  if(LANG.code === 'zh') return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="22" cy="24" r="13" fill="#222"/><circle cx="78" cy="24" r="13" fill="#222"/>
    <ellipse cx="50" cy="56" rx="38" ry="34" fill="#fff" stroke="#222" stroke-width="2"/>
    <ellipse cx="34" cy="52" rx="10" ry="13" fill="#222" transform="rotate(-20 34 52)"/><ellipse cx="66" cy="52" rx="10" ry="13" fill="#222" transform="rotate(20 66 52)"/>
    <g class="eyes"><ellipse cx="35" cy="53" rx="6.5" ry="7.5" fill="#fff"/><ellipse cx="65" cy="53" rx="6.5" ry="7.5" fill="#fff"/><ellipse cx="35.5" cy="54" rx="4.6" ry="5.8" fill="#3b2a6b"/><ellipse cx="65.5" cy="54" rx="4.6" ry="5.8" fill="#3b2a6b"/><circle cx="37" cy="51.5" r="2" fill="#fff"/><circle cx="67" cy="51.5" r="2" fill="#fff"/><circle cx="34" cy="57" r="1" fill="#fff"/><circle cx="64" cy="57" r="1" fill="#fff"/></g>
    <ellipse cx="50" cy="66" rx="5" ry="3.5" fill="#222"/>
    <path class="mouth" d="M42 73 Q50 80 58 73" fill="none" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="27" cy="68" r="5" fill="#ffb3c1" opacity=".7"/><circle cx="73" cy="68" r="5" fill="#ffb3c1" opacity=".7"/><g class="spark"><path d="M90 14 l2.2 5.5 5.5 2.2 -5.5 2.2 -2.2 5.5 -2.2 -5.5 -5.5 -2.2 5.5 -2.2z" fill="#ffd54f"/><path d="M10 82 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z" fill="#ff8fc0"/></g></svg>`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M14 12 L36 34 L20 46 Z" fill="#e8742a"/><path d="M86 12 L64 34 L80 46 Z" fill="#e8742a"/>
    <path d="M18 18 L30 32 L22 38 Z" fill="#2b1a10"/><path d="M82 18 L70 32 L78 38 Z" fill="#2b1a10"/>
    <path d="M50 22 C78 22 90 44 88 58 C86 74 70 88 50 90 C30 88 14 74 12 58 C10 44 22 22 50 22 Z" fill="#f08a3c"/>
    <path d="M50 54 C64 54 78 62 80 70 C74 84 62 90 50 90 C38 90 26 84 20 70 C22 62 36 54 50 54 Z" fill="#fff6ec"/>
    <g class="eyes"><ellipse cx="36" cy="52" rx="6" ry="7.5" fill="#2b1a40"/><ellipse cx="64" cy="52" rx="6" ry="7.5" fill="#2b1a40"/><ellipse cx="36" cy="54.5" rx="4" ry="3.5" fill="#7b4fd6" opacity=".8"/><ellipse cx="64" cy="54.5" rx="4" ry="3.5" fill="#7b4fd6" opacity=".8"/><circle cx="38" cy="49" r="2.2" fill="#fff"/><circle cx="66" cy="49" r="2.2" fill="#fff"/><circle cx="34.5" cy="56" r="1" fill="#fff"/><circle cx="62.5" cy="56" r="1" fill="#fff"/></g>
    <ellipse cx="50" cy="68" rx="5" ry="3.5" fill="#2b1a10"/>
    <path class="mouth" d="M43 75 Q50 81 57 75" fill="none" stroke="#2b1a10" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="28" cy="66" r="4.5" fill="#ff9e80" opacity=".6"/><circle cx="72" cy="66" r="4.5" fill="#ff9e80" opacity=".6"/><g class="spark"><path d="M90 14 l2.2 5.5 5.5 2.2 -5.5 2.2 -2.2 5.5 -2.2 -5.5 -5.5 -2.2 5.5 -2.2z" fill="#ffd54f"/><path d="M10 82 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z" fill="#ff8fc0"/></g></svg>`;
}
let MID = 0;
function mascotHTML(size, text){
  return `<div class="mascot idle" style="--ms:${size||64}px" id="m${++MID}" onclick="mascotSay(pick(MASCOT_TXT.idle),'happy')">${mascotSVG()}
    <div class="bubble"${text?'':' hidden'}>${text||''}</div></div>`;
}
let mascotT = null;
function mascotSay(text, mood){
  const ms = [...document.querySelectorAll('.mascot')].filter(m => m.offsetParent !== null);
  ms.forEach(m => {
    m.classList.remove('happy','sad','idle'); void m.offsetWidth; m.classList.add(mood || 'happy');
    const b = m.querySelector('.bubble'); if(b){ b.textContent = text; b.hidden = false; }
  });
  clearTimeout(mascotT);
  mascotT = setTimeout(() => ms.forEach(m => { m.classList.remove('happy','sad'); m.classList.add('idle'); const b = m.querySelector('.bubble'); if(b) b.hidden = true; }), 2600);
}
