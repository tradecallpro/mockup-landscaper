(function () {
  // Header nav: hamburger below the desktop breakpoint
  var btn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  var header = document.querySelector('.site-header');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  btn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) { if (!header.contains(e.target)) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1180) setMenu(false); });

  // Blog nav item opens the sample-post modal instead of scrolling
  var blogLink = document.getElementById('blogLink');
  var blogModal = document.getElementById('blogModal');
  var blogClose = document.getElementById('blogClose');
  var opener = blogLink;
  function visible(el) { return el.offsetParent !== null; }
  blogLink.addEventListener('click', function (e) {
    e.preventDefault();
    // On mobile the dropdown closes, so focus goes back to the hamburger instead.
    setMenu(false);
    opener = blogLink;
    if (typeof blogModal.showModal === 'function') blogModal.showModal(); else blogModal.setAttribute('open', '');
    blogModal.scrollTop = 0;
    blogClose.focus();
  });
  function closeBlog() {
    if (typeof blogModal.close === 'function') blogModal.close(); else blogModal.removeAttribute('open');
  }
  blogClose.addEventListener('click', closeBlog);
  blogModal.addEventListener('click', function (e) {
    if (e.target !== blogModal) return;
    var r = blogModal.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeBlog();
  });
  // ESC closes the dialog natively; put focus back where the user came from.
  blogModal.addEventListener('close', function () { (visible(opener) ? opener : btn).focus(); });
})();
(function () {
  // "Quote this job" links preselect the service in the form
  var select = document.getElementById('service');
  document.querySelectorAll('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () { select.value = a.getAttribute('data-service'); });
  });

  // Hide the mobile call bar while the quote section is in view
  var bar = document.getElementById('mobileBar');
  var quote = document.getElementById('quote');
  if (bar && quote && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      bar.classList.toggle('hide', en[0].isIntersecting);
    }, { threshold: 0.15 }).observe(quote);
  }

  // Quote form
  var form = document.getElementById('quoteForm');
  var success = document.getElementById('success');
  var errBox = document.getElementById('formError');
  var PLACEHOLDER = 'TRADECALL-PRO-LEAD-CAPTURE-ENDPOINT';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errBox.hidden = true;
    var bad = null;
    form.querySelectorAll('input[required],select[required]').forEach(function (f) {
      f.classList.add('touched');
      if (!f.checkValidity() && !bad) bad = f;
    });
    if (bad) {
      errBox.textContent = 'Please fill in your name, phone, email, and the service you need.';
      errBox.hidden = false;
      bad.focus();
      return;
    }

    // TRADECALL PRO LEAD-CAPTURE HOOKUP:
    // POSTs JSON {name, phone, email, service, message, source, page} to the
    // endpoint in the form's data-endpoint attribute. In this mock-up the endpoint
    // is a placeholder, so nothing is sent and we go straight to the success state.
    var endpoint = form.getAttribute('data-endpoint') || '';
    var data = Object.fromEntries(new FormData(form).entries());
    data.source = 'becerras-landscaping-mockup-site';
    data.page = location.href;

    function done() {
      form.hidden = true;
      success.hidden = false;
      success.focus();
    }

    if (!endpoint || endpoint.indexOf(PLACEHOLDER) !== -1) { done(); return; }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error('bad status');
      done();
    }).catch(function () {
      errBox.textContent = 'Something went wrong. Please call (661) 477-7472 and we will help you right away.';
      errBox.hidden = false;
    });
  });
})();
