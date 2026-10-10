'use strict';
/* ===== ОФОРМЛЕНИЕ: «Аниме» (по умолчанию) или «Классика»; лепестки сакуры на главной (общий для обоих языков) ===== */
function applyTheme(){
  const anime = (S.settings.style || 'anime') === 'anime';
  document.documentElement.classList.toggle('anime', anime);
  petals(anime);
}
let PET = null;
function petals(on){
  if(PET){ PET.stop = true; PET.c.remove(); PET = null; }
  if(!on || REDUCED()) return;
  const c = document.createElement('canvas'); c.className = 'petals'; document.body.prepend(c);
  const x = c.getContext('2d'), st = {c, stop:false}; PET = st;
  let W, H; const fit = () => { W = c.width = innerWidth; H = c.height = innerHeight; }; fit(); addEventListener('resize', fit);
  const cols = LANG.code === 'zh' ? ['#ffb7c5','#ffd1dc','#ff9eb5','#ffe08a'] : ['#ffb7c5','#c5b3ff','#9fd8ff','#ffd1dc'];
  const P = Array.from({length:16}, () => ({x:Math.random()*innerWidth, y:Math.random()*innerHeight, r:5+Math.random()*6, v:.4+Math.random()*.7, a:Math.random()*6, w:.01+Math.random()*.02, c:pick(cols)}));
  (function step(){
    if(st.stop) return;
    if(!document.hidden && S.tab === 'home'){
      x.clearRect(0,0,W,H);
      P.forEach(p => { p.y += p.v; p.a += p.w; p.x += Math.sin(p.a) * .6; if(p.y > H + 10){ p.y = -10; p.x = Math.random()*W; }
        x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.beginPath(); x.ellipse(0, 0, p.r, p.r*.55, 0, 0, Math.PI*2); x.fill(); x.restore(); });
    } else x.clearRect(0,0,W,H);
    requestAnimationFrame(step);
  })();
}
