/*
 * Becerra's Landscaping mock-up: Tradecall Pro voice AI demo (modal + web call).
 *
 * Mirrors the tradecallpro.co homepage flow (public/js/voice-demo.js there):
 *   Turnstile check -> POST /api/demo-call -> RetellWebClient.startCall with
 *   ALL FOUR of { access_token, call_id, transport, ice_servers }.
 *   transport comes back as "gateway", not LiveKit: pass it through untouched.
 * The Worker maps { trade: "landscaper" } to the landscaper demo agent; no agent
 * ID is ever sent from the browser. The Retell API key never touches the browser;
 * all guardrails are server-side. Web call only: no phone number is ever shown here.
 */
(function () {
  'use strict';

  var API = 'https://tradecallpro.co/api/demo-call';
  var TRADE = 'landscaper';
  var SITEKEY_PROD = '0x4AAAAAAFD8JHMxo9hf2tQB';          // same site key as tradecallpro.co
  var SITEKEY_LOCAL = '1x00000000000000000000AA';          // Cloudflare always-pass test key
  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var SITEKEY = LOCAL ? SITEKEY_LOCAL : SITEKEY_PROD;
  var CAP_MS = 4 * 60 * 1000;

  var modal = document.getElementById('demoModal');
  var openBtn = document.getElementById('demoOpen');
  var closeBtn = document.getElementById('demoClose');
  var btn = document.getElementById('demoCall');
  if (!modal || !openBtn || !btn) return;
  var lbl = btn.querySelector('.lbl');
  var statusEl = document.getElementById('demoStatus');
  var timerEl = document.getElementById('demoTimer');
  var failEl = document.getElementById('demoFail');
  var afterEl = document.getElementById('demoAfter');
  var tsBox = document.getElementById('demoTs');

  var supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.fetch && window.Promise);
  var client = null, state = 'idle', sdkPromise = null, tsPromise = null, tsWidget = null;
  var tick = null, cap = null, startedAt = 0;

  /* ---------- modal open/close ---------- */
  function openModal() {
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    btn.focus();
    if (supported) { loadSdk().catch(function () {}); loadTurnstile().catch(function () {}); }
  }
  function closeModal() {
    teardown();
    if (state !== 'idle') set('idle');
    say('');
    if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open');
    openBtn.focus();
  }
  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  // Backdrop click: a click that lands on the dialog element itself, outside its content box.
  modal.addEventListener('click', function (e) {
    if (e.target !== modal) return;
    var r = modal.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeModal();
  });
  // ESC: the browser closes the dialog and returns focus; also hang up any live call.
  modal.addEventListener('close', function () { teardown(); if (state !== 'idle') set('idle'); say(''); openBtn.focus(); });

  /* ---------- script loaders ---------- */
  function loadSdk() {
    if (window.RetellWebClient) return Promise.resolve();
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'retell-web.js';
      s.onload = function () { window.RetellWebClient ? resolve() : reject(new Error('sdk')); };
      s.onerror = function () { sdkPromise = null; reject(new Error('sdk')); };
      document.head.appendChild(s);
    });
    return sdkPromise;
  }
  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve();
    if (tsPromise) return tsPromise;
    tsPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = function () { window.turnstile ? resolve() : reject(new Error('ts')); };
      s.onerror = function () { tsPromise = null; reject(new Error('ts')); };
      document.head.appendChild(s);
    });
    return tsPromise;
  }
  function challenge() {
    return loadTurnstile().then(function () {
      return new Promise(function (resolve, reject) {
        var done = false;
        var timeout = setTimeout(function () { if (!done) { done = true; reject(new Error('challenge timeout')); } }, 30000);
        function ok(t) { if (!done) { done = true; clearTimeout(timeout); resolve(t); } }
        function no(e) { if (!done) { done = true; clearTimeout(timeout); reject(e || new Error('challenge')); } }
        var opts = {
          sitekey: SITEKEY, action: 'demo_call', execution: 'execute', appearance: 'interaction-only',
          callback: ok,
          'before-interactive-callback': function () { say('One quick check below, then we will connect you.'); },
          'error-callback': function (code) { var e = new Error('challenge'); e.code = code; no(e); return true; },
          'unsupported-callback': function () { var e = new Error('challenge'); e.code = 'unsupported'; no(e); },
          'timeout-callback': function () { no(new Error('challenge')); },
          'expired-callback': function () { no(new Error('challenge')); }
        };
        try {
          if (tsWidget === null) tsWidget = window.turnstile.render(tsBox, opts);
          else window.turnstile.reset(tsWidget);
          window.turnstile.execute(tsWidget);
        } catch (e) { no(e); }
      });
    });
  }

  /* ---------- UI state ---------- */
  var REFUSALS = {
    region: 'The live demo is only available to visitors in the US.',
    challenge_failed: 'We could not verify your browser. Reload the page and try again.',
    visitor_gap: 'Give it a few seconds before calling again.',
    visitor_hour: 'You have reached the demo limit for now. Come back a little later.',
    visitor_day: 'You have reached the demo limit for today. Come back tomorrow.',
    busy: 'The demo is busy right now. Try again in a minute.',
    daily_cap: 'The live demo has reached its limit for today. Try again tomorrow.',
    rate_limited: 'A lot of people are trying the demo right now. Give it a minute.'
  };
  var LABELS = { idle: 'Call now', connecting: 'Connecting...', live: 'End call', ended: 'Call again', error: 'Try again' };

  function set(next) {
    state = next;
    lbl.textContent = LABELS[next];
    btn.disabled = next === 'connecting';
    btn.classList.toggle('end', next === 'live');
    timerEl.hidden = next !== 'live';
    afterEl.hidden = next !== 'ended';
    failEl.hidden = next !== 'error';
  }
  function say(t) { statusEl.textContent = t; }
  function clock(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }
  function teardown() {
    clearInterval(tick); clearTimeout(cap); tick = cap = null;
    if (client) {
      try { client.removeAllListeners && client.removeAllListeners(); client.stopCall(); } catch (e) { /* already closed */ }
      client = null;
    }
  }
  function fail(message) { teardown(); set('error'); say(message); }

  function onLive() {
    startedAt = Date.now();
    set('live');
    say('Agent is speaking...');
    timerEl.textContent = '0:00';
    tick = setInterval(function () { timerEl.textContent = clock(Date.now() - startedAt); }, 500);
    cap = setTimeout(function () { if (client) client.stopCall(); }, CAP_MS);
  }
  function onEnded() {
    teardown();
    set('ended');
    say('Call ended. Thanks for trying it!');
    startedAt = 0;
  }

  /* ---------- the call ---------- */
  async function start() {
    set('connecting');
    say('Checking your browser...');
    var token, data;
    try {
      token = await challenge();
    } catch (e) {
      return fail(REFUSALS.challenge_failed);
    }
    say('Connecting you to the voice agent...');
    try {
      var res = await fetch(API, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnstile: token, trade: TRADE })
      });
      data = await res.json().catch(function () { return {}; });
      if (!res.ok || !data.access_token) {
        var code = (data && data.error) || String(res.status);
        return fail(REFUSALS[code] || 'The live demo is not available right now.');
      }
      await loadSdk();
    } catch (e) {
      return fail('We could not reach the live demo. Check your connection and try again.');
    }

    try {
      client = new window.RetellWebClient();
      client.on('call_started', onLive);
      client.on('agent_start_talking', function () { if (state === 'live') say('Agent is speaking...'); });
      client.on('agent_stop_talking', function () { if (state === 'live') say('Your turn. Go ahead!'); });
      client.on('call_ended', onEnded);
      client.on('error', function () { fail('The call dropped. Try again.'); });
      // Pass all four values through; transport is "gateway", not LiveKit.
      await client.startCall({
        accessToken: data.access_token,
        transport: data.transport,
        callId: data.call_id,
        iceServers: data.ice_servers
      });
    } catch (err) {
      var denied = err && (err.name === 'NotAllowedError' || /permission|denied|not allowed/i.test(String(err.message || err)));
      fail(denied
        ? 'Your browser blocked the microphone. Allow it and try again.'
        : 'We could not start the call from your browser.');
    }
  }

  btn.addEventListener('click', function () {
    if (state === 'connecting') return;
    if (state === 'live') { if (client) client.stopCall(); return; }
    if (!supported) { fail('Your browser does not support voice calls. Try a current version of Chrome, Safari, or Firefox.'); return; }
    start();
  });
  window.addEventListener('pagehide', function () { teardown(); });
})();
