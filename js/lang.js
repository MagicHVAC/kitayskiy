'use strict';
/* ===== Язык для курса: как показывать фразы и делить их на слова ===== */
// Деление китайской фразы на слова: самое длинное совпадение со словарём (до 4 знаков)
let ZH_DICT = null;
function zhDict(){
  if(ZH_DICT) return ZH_DICT;
  ZH_DICT = new Set(['我','你','他','她','它','的','了','吗','呢','吧','啊','是','在','有','不','没','很','也','都','要','想','去','来','这','那','个','请','一','和','就','还','给','到','往','把','跟','得','会','能','可以','什么','哪儿','多少','怎么','我们','你们','他们']);
  WORDS.forEach(w => ZH_DICT.add(w[0]));
  Object.keys(SLOTS).forEach(k => SLOTS[k].forEach(f => ZH_DICT.add(f[0])));
  return ZH_DICT;
}
function zhTok(t){
  const D = zhDict(), out = [];
  (t.match(/[A-Za-z0-9]+|[㐀-鿿]+/g) || []).forEach(run => {
    if(/^[A-Za-z0-9]+$/.test(run)){ out.push(run); return; }
    let i = 0;
    while(i < run.length){
      let n = Math.min(4, run.length - i);
      while(n > 1 && !D.has(run.substr(i, n))) n--;
      out.push(run.substr(i, n)); i += n;
    }
  });
  return out;
}
const zhClean = s => String(s).replace(/[^㐀-鿿A-Za-z0-9]/g, '');
const LANG = {
  code:'zh', name:'по-китайски',
  big: it => `<div class="hz mid" style="font-size:28px">${it.t}</div>${it.p ? `<div class="py">${it.p}</div>` : ''}`,
  word: w => `<span class="hz" style="font-size:28px">${colorHz(w[0], w[1])}</span> <span class="py">${colorPy(w[1])}</span>`,
  tok: zhTok,
  join: a => a.join(''),
  same: (a, b) => zhClean(a) === zhClean(b)
};
