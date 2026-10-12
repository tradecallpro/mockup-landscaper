/*
 * Accessibility Statement: a round icon fixed at the bottom left of every page opens the statement in a pop-up.
 * The footer "Accessibility" link opens the same pop-up. Included on every page:
 *   <script src="/js/a11y-statement.js" defer></script>
 * Per-site copy: business name, phone and email are the constants below. Edit the words in BODY. Guardrails (docs/accessibility.md): never claim the site "is ADA compliant",
 * "is WCAG compliant" or "is certified", and keep the phone and email live.
 */
(function () {
  'use strict';

  var BUSINESS = "Becerra's Landscaping";
  var PHONE = '(661) 477-7472', PHONE_HREF = 'tel:+16614777472';
  var EMAIL = 'becerralandscape05@gmail.com';
  var RESPONSE = 'two business days';
  var PREPARED = 'October 12, 2026';

  var css = '' +
    '.a11y-fab{position:fixed;left:16px;bottom:16px;z-index:45;width:52px;height:52px;border-radius:50%;border:2px solid #fff;background:#0B1530;color:#fff;display:grid;place-items:center;padding:0;cursor:pointer;box-shadow:0 6px 18px rgba(11,21,48,.35);transition:transform .15s ease}' +
    '.a11y-fab:hover{transform:translateY(-2px)}' +
    '.a11y-fab:focus-visible{outline:3px solid #7C93D6;outline-offset:3px}' +
    '.a11y-fab svg{width:30px;height:30px;fill:currentColor}' +
    '.a11y-dlg{z-index:200;margin:auto;inset:0;border:0;padding:0;border-radius:20px;width:min(640px,calc(100% - 32px));max-height:calc(100vh - 48px);color:#505256;background:#fff;box-shadow:0 30px 80px rgba(11,21,48,.45);font:500 1rem/1.6 Montserrat,"Avenir Next","Segoe UI",system-ui,-apple-system,Helvetica,Arial,sans-serif}' +
    '.a11y-dlg::backdrop{background:rgba(7,14,33,.62)}' +
    '.a11y-in{padding:34px 34px 30px;overflow-y:auto;max-height:calc(100vh - 48px)}' +
    '.a11y-dlg h2{margin:0 44px 14px 0;color:#0B1530;font-size:1.6rem;line-height:1.15;letter-spacing:-.02em;font-weight:800}' +
    '.a11y-dlg h3{margin:24px 0 8px;color:#0B1530;font-size:1.05rem;font-weight:800}' +
    '.a11y-dlg p{margin:0 0 12px}' +
    '.a11y-dlg ul{margin:0 0 12px;padding-left:1.2rem}' +
    '.a11y-dlg li{margin-bottom:6px}' +
    '.a11y-dlg a{color:#0B1530;font-weight:700}' +
    '.a11y-dlg .a11y-date{font-size:.9rem;margin-top:18px}' +
    '.a11y-x{position:absolute;top:14px;right:14px;width:44px;height:44px;border-radius:10px;border:1px solid #E1E4EB;background:#fff;color:#0B1530;display:grid;place-items:center;padding:0;cursor:pointer}' +
    '.a11y-x:hover{background:#EEF0F5}' +
    '.a11y-x:focus-visible,.a11y-done:focus-visible{outline:3px solid #7C93D6;outline-offset:3px}' +
    '.a11y-x svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}' +
    '.a11y-done{margin-top:10px;min-height:44px;padding:0 24px;border-radius:12px;border:2px solid #0B1530;background:#0B1530;color:#fff;font:800 1rem/1 inherit;font-family:inherit;cursor:pointer}' +
    '.a11y-done:hover{background:#16224A}' +
    'html.a11y-lock{overflow:hidden}' +
    'footer{padding-bottom:104px}.a11y-fab{background:var(--amber,#ffc20e);color:var(--on-amber,#111);border-color:var(--on-amber,#111)}.a11y-fab:hover{filter:brightness(.93)}@media (max-width:767px){.a11y-fab{bottom:calc(86px + env(safe-area-inset-bottom))}}' +
    '@media (prefers-reduced-motion:reduce){.a11y-fab{transition:none}}';

  var BODY = '' +
    '<p>' + BUSINESS + ' is committed to making this website usable for all visitors, including people with disabilities. We work toward conformance with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. WCAG 2.1 AA is the technical standard commonly referenced for website accessibility under the Americans with Disabilities Act.</p>' +
    '<h3>Measures we take</h3>' +
    '<ul>' +
    '<li>Pages are built with a clear heading structure and semantic markup so assistive technology can read content in a logical order.</li>' +
    '<li>Informative images carry text descriptions (alt text). Decorative images are marked so screen readers skip them.</li>' +
    '<li>Text and background color combinations meet WCAG 2.1 AA contrast ratios.</li>' +
    '<li>All interactive elements, including menus, buttons, and forms, can be reached and operated with a keyboard alone.</li>' +
    '<li>Form fields have visible labels and instructions. When a form entry has an error, the message identifies the field and what to fix.</li>' +
    '<li>Links and buttons have descriptive names that state what they do.</li>' +
    '<li>We scan the site periodically with automated accessibility tools and correct the issues the scans find.</li>' +
    '<li>New pages and features are checked against these same measures before they are published.</li>' +
    '</ul>' +
    '<h3>Known limitations</h3>' +
    '<p>Some content may not yet fully meet WCAG 2.1 AA. This site includes content supplied by third parties, such as map embeds and review feeds. We do not control the accessibility of third-party content, and we report issues to those providers when we find them. We correct limitations on our own content as we identify them.</p>' +
    '<h3>Feedback and assistance</h3>' +
    '<p>If you encounter a barrier on this site, or if you need information from this site in a different format, contact us and we will work with you directly:</p>' +
    '<p>Phone: <a href="' + PHONE_HREF + '">' + PHONE + '</a><br>Email: <a href="mailto:' + EMAIL + '">' + EMAIL + '</a></p>' +
    '<p>We aim to respond to accessibility requests within ' + RESPONSE + '.</p>' +
    '<p class="a11y-date">This statement was prepared on ' + PREPARED + '. We review it when the site changes in a significant way and at least once a year.</p>';

  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a2.2 2.2 0 1 1 0 4.4A2.2 2.2 0 0 1 12 2zM4.2 8.1c0-.6.5-1 1-1h13.6c.6 0 1 .5 1 1s-.4 1-1 1H14v3.3l2 7.3c.2.6-.2 1.2-.8 1.3-.5.1-1-.2-1.2-.7L12 14.8l-2 5.5c-.2.5-.7.8-1.2.7-.6-.1-1-.7-.8-1.3l2-7.3V9.1H5.2c-.5 0-1-.5-1-1z"/></svg>';
  var XICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  var dlg, last;

  function build() {
    if (dlg) return;
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    dlg = document.createElement('dialog');
    dlg.className = 'a11y-dlg';
    dlg.setAttribute('aria-labelledby', 'a11y-title');
    dlg.innerHTML = '<div class="a11y-in"><button type="button" class="a11y-x" aria-label="Close accessibility statement">' + XICON + '</button>' +
      '<h2 id="a11y-title">Accessibility Statement</h2>' + BODY +
      '<button type="button" class="a11y-done">Close</button></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('.a11y-x,.a11y-done')) dlg.close();   // backdrop, X or Close
    });
    dlg.addEventListener('close', function () {
      document.documentElement.classList.remove('a11y-lock');
      if (last && document.contains(last)) last.focus();
    });
  }

  function open(from) {
    build();
    if (dlg.open) return;
    last = from || document.activeElement;
    document.documentElement.classList.add('a11y-lock');
    dlg.showModal();
    dlg.querySelector('.a11y-in').scrollTop = 0;
  }

  function init() {
    if (typeof HTMLDialogElement === 'undefined') return;   // very old browsers: nothing to open
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'a11y-fab';
    fab.setAttribute('aria-label', 'Accessibility statement');
    fab.setAttribute('aria-haspopup', 'dialog');
    fab.innerHTML = ICON;
    if (!document.getElementById('a11y-fab-css')) {
      var s = document.createElement('style');
      s.id = 'a11y-fab-css';
      s.textContent = css;
      document.head.appendChild(s);
    }
    document.body.appendChild(fab);
    fab.addEventListener('click', function () { open(fab); });
    document.addEventListener('click', function (e) {
      var l = e.target.closest && e.target.closest('[data-a11y-statement]');
      if (l) { e.preventDefault(); open(l); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
