'use strict';
/* ===== ЗАПУСК ===== */
load();
try { applyTheme(); } catch(e) {}
$('#ver').textContent = 'v'+APP.ver+' · '+APP.date;
try { show('home'); } catch(e) { S.tab='home'; window.onerror(e.message, '', 0, 0); }
