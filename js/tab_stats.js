'use strict';
/* ===== ПРОГРЕСС ===== */
function renderStats(){
  const c=counts(); const days=Object.keys(S.daily).sort().slice(-14);
  const act=r=>r.xp||((r.rev||0)+(r.nw||0)+(r.q||0)); const max=Math.max(1,...days.map(d=>act(S.daily[d])));
  const lv=n=>{ const ws=WORDS.filter(w=>w[3]===n); const k=ws.filter(w=>{const s=S.srs[w[0]];return s&&s.r>=1&&s.i>=3;}).length; return [k,ws.length]; };
  const L1=lv(1), L2=lv(2), L3=lv(3), cd=Object.keys((S.course||{}).done||{}).length;
  const weak = WORDS.filter(w=>S.srs[w[0]] && S.srs[w[0]].l>0).sort((a,b)=>S.srs[b[0]].l-S.srs[a[0]].l).slice(0,10);
  $('#t-stats').innerHTML = `<h2>📊 Прогресс</h2>
   <div class="kpi"><div><b>${cd} / ${LESSONS.length}</b><span class="mut">уроков курса</span></div><div><b>${c.known}</b><span class="mut">выучено</span></div><div><b>${c.learn}</b><span class="mut">изучается</span></div>
    <div><b>${c.fresh}</b><span class="mut">ещё впереди</span></div><div><b>${streak()}</b><span class="mut">дней подряд</span></div>
    <div><b>${S.tone.all?Math.round(S.tone.ok/S.tone.all*100):0}%</b><span class="mut">тоны на слух</span></div>
    <div><b>${S.pair.all?Math.round(S.pair.ok/S.pair.all*100):0}%</b><span class="mut">звуки на слух</span></div>
    <div><b>${S.xp||0}</b><span class="mut">очков всего</span></div><div><b>${levelOf(S.xp||0).lv}</b><span class="mut">уровень</span></div></div>
   ${[['HSK 1',L1],['HSK 2',L2],['курса',L3]].map(([n,v])=>`<div class="card"><b>Словарь ${n}</b><div class="bar" style="margin:8px 0"><i style="width:${(v[0]/v[1]*100).toFixed(1)}%"></i></div>
    <div class="mut">выучено ${v[0]} из ${v[1]} слов</div></div>`).join('')}
   <div class="card"><b>Очки за последние 14 дней</b>${days.length?days.map(d=>{const v=act(S.daily[d]);
     return `<div class="row" style="flex-wrap:nowrap"><span class="mut" style="width:52px">${d.slice(8)}.${d.slice(5,7)}</span><div class="bar" style="flex:1"><i style="width:${v/max*100}%"></i></div><span style="width:40px;text-align:right">${v}</span></div>`;}).join(''):'<div class="mut">Пока пусто</div>'}</div>
   <div class="card"><b>Трудные слова</b>${weak.length?weak.map(w=>`<div class="dict-row" onclick="say('${w[0]}')"><span class="hz">${colorHz(w[0],w[1])}</span><span class="py">${colorPy(w[1])}</span><span>${w[2]}</span><span class="mut">✗${S.srs[w[0]].l}</span></div>`).join(''):'<div class="mut">Пока нет — отлично!</div>'}</div>
   <div class="card"><b>Резервная копия прогресса</b><div class="mut">Прогресс хранится в этом браузере. Чтобы перенести на другое устройство: скопируйте текст и вставьте там.</div>
    <textarea id="bk" rows="3" style="margin:8px 0" placeholder="Сюда вставить копию для загрузки"></textarea>
    <div class="row"><button class="btn" onclick="$('#bk').value=JSON.stringify(S);$('#bk').select();toast('Выделено — скопируйте (Ctrl+C / «Копировать»)')">Получить копию</button>
    <button class="btn" onclick="importBk()">Загрузить копию</button><button class="btn" id="rst" onclick="resetAll(this)">Сбросить всё</button></div></div>`;
}
function importBk(){ try{ const o=JSON.parse($('#bk').value); if(!o.srs) throw 0; S=Object.assign(S,o); save(); Q=[]; toast('✅ Прогресс загружен'); renderStats(); }catch(e){ toast('❌ Это не копия прогресса'); } }
function resetAll(b){ if(!b.dataset.sure){ b.dataset.sure=1; b.textContent='Точно? Нажмите ещё раз'; b.style.color='var(--bad)'; return; }
  const st=S.settings; S={srs:{},daily:{},tone:{ok:0,all:0},pair:{ok:0,all:0},xp:0,seenVer:APP.ver,sub:{},course:{done:{}},settings:st,tab:'stats'}; Q=[]; save(); toast('Прогресс сброшен'); renderStats(); }
/* ===== НАСТРОЙКИ ===== */
function openSettings(){
  const vs = zhVoices();
  $('#sheet').innerHTML = `<h2>⚙ Настройки</h2>
   <label>Скорость речи: <b id="rv">${S.settings.rate}</b></label>
   <input type="range" min="0.4" max="1.2" step="0.1" value="${S.settings.rate}" style="width:100%" oninput="S.settings.rate=+this.value;$('#rv').textContent=this.value;save()">
   <button class="btn" onclick="say('你好，我是你的汉语老师。')">🔊 Проверить голос</button>
   <label style="display:block;margin-top:12px">Новых слов в день</label>
   <select onchange="S.settings.newPerDay=+this.value;save();Q=[]">${[5,10,15,20,30].map(n=>`<option ${n===S.settings.newPerDay?'selected':''}>${n}</option>`).join('')}</select>
   <label style="display:block;margin-top:12px">Дневная цель (очков)</label>
   <select onchange="S.settings.goal=+this.value;save()">${[10,20,30,50,80].map(n=>`<option ${n===S.settings.goal?'selected':''}>${n}</option>`).join('')}</select>
   <label style="display:block;margin-top:12px">Голос</label>
   <select onchange="S.settings.voice=this.value;save();pickVoice()"><option value="">авто</option>${vs.map(v=>`<option ${v.name===S.settings.voice?'selected':''} value="${v.name}">${v.name} (${v.lang})</option>`).join('')}</select>
   ${vs.length?'':'<div class="warn" style="margin-top:6px">Китайских голосов не найдено — см. подсказку на вкладке «Старт».</div>'}
   <label class="row" style="margin-top:12px"><input type="checkbox" ${S.settings.autoplay?'checked':''} onchange="S.settings.autoplay=this.checked;save()"> Автоматически озвучивать карточки</label>
   <div class="mut" style="margin-top:12px">Очки: урок курса +20, новое слово +2, повторение +1, верный ответ в тесте +2, тон +1, собранное предложение +3, сыгранный диалог +5.<br>Версия ${APP.ver} от ${APP.date}. Распознавание речи: ${SR?'есть':'нет в этом браузере'}.</div>
   <button class="primary" onclick="closeOvl()">Готово</button>`;
  $('#ovl').hidden = false;
}
function closeOvl(){ $('#ovl').hidden = true; if(S.tab==='words') wordsEnter(); }
