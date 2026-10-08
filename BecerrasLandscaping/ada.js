(function () {
  var btn = document.getElementById('adaBtn');
  var modal = document.getElementById('adaModal');
  var x = document.getElementById('adaClose');
  if (!btn || !modal) return;
  function close() {
    if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open');
    btn.focus();
  }
  btn.addEventListener('click', function () {
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    modal.scrollTop = 0;
    x.focus();
  });
  x.addEventListener('click', close);
  modal.addEventListener('click', function (e) {
    if (e.target !== modal) return;
    var r = modal.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
  });
  // ESC closes natively; return focus to the trigger.
  modal.addEventListener('close', function () { btn.focus(); });
  // Fallback focus trap for browsers without <dialog>.showModal.
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
