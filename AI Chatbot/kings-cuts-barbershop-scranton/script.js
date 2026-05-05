(async function () {

  let C;
  try { const res = await fetch('./chatbot-config.json'); C = await res.json(); }
  catch (e) { console.error('Could not load config', e); return; }

  const state = { open: false, greeted: false, flow: null, step: null, data: {}, pendingFlow: false };
  window.capturedLead = null;

  const bubble     = document.getElementById('chat-bubble');
  const chatWindow = document.getElementById('chat-window');
  const msgList    = document.getElementById('chat-messages');
  const input      = document.getElementById('chat-input');
  const notifDot   = document.getElementById('notif-dot');

  function scrollBottom() { msgList.scrollTop = msgList.scrollHeight; }

  function renderMarkdown(t) {
    return t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  }

  function appendMessage(text, sender) {
    const wrap = document.createElement('div'); wrap.className = `msg ${sender}`;
    const bub  = document.createElement('div'); bub.className = 'msg-bubble';
    bub.innerHTML = renderMarkdown(text);
    wrap.appendChild(bub); msgList.appendChild(wrap); scrollBottom();
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'typing-indicator'; el.id = 'typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgList.appendChild(el); scrollBottom();
  }

  function botReply(text, delay = 850) {
    showTyping();
    return new Promise(resolve => setTimeout(() => {
      document.getElementById('typing')?.remove();
      appendMessage(text, 'bot'); resolve();
    }, delay));
  }

  function showQuickReplies(options) {
    clearQuickReplies();
    const row = document.createElement('div'); row.className = 'quick-replies'; row.id = 'quick-replies';
    options.forEach(label => {
      const btn = document.createElement('button'); btn.className = 'quick-reply-btn'; btn.textContent = label;
      btn.onclick = () => { clearQuickReplies(); input.value = label; handleSend(); };
      row.appendChild(btn);
    });
    msgList.appendChild(row); scrollBottom();
  }

  function clearQuickReplies() { document.getElementById('quick-replies')?.remove(); }

  function isAfterHours() {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const day = days[new Date().getDay()];
    if (day === 'Monday') return true;
    const hm = new Date().getHours() * 60 + new Date().getMinutes();
    const map = {
      Tuesday: [540,1140], Wednesday: [540,1140], Thursday: [540,1140],
      Friday: [540,1140], Saturday: [480,1080], Sunday: [600,960],
    };
    const [open, close] = map[day] || [540, 1140];
    return hm < open || hm >= close;
  }

  function todayHoursString() {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return C.hours[days[new Date().getDay()]] || 'Closed';
  }

  function detectIntent(text) {
    const t = text.toLowerCase();
    for (const [intent, keywords] of Object.entries(C.intents)) {
      if (keywords.some(k => t.includes(k))) return intent;
    }
    return null;
  }

  // ─── Response Builders ────────────────────────────────────────────────────────

  function servicesResponse() {
    const s = C.services;
    return `Here's what we offer:\n• **${s.haircut.name}** — ${s.haircut.price}\n• **${s.fade.name}** — ${s.fade.price}\n• **${s.beard.name}** — ${s.beard.price}\n• **${s.combo.name}** — ${s.combo.price}\n• **${s.shave.name}** — ${s.shave.price}\n• **${s.kids.name}** — ${s.kids.price}\n\nWant to book an appointment?`;
  }

  function pricingResponse() {
    return `Here's our pricing:\n• Haircut — **$25**\n• Fade & Taper — **$28**\n• Beard Trim — **$15**\n• Haircut + Beard combo — **$38**\n• Hot Towel Shave — **$35**\n• Kids (12 & under) — **$18**\n• Lineup — **$12**\n\nWant to book a time?`;
  }

  function walkInResponse() {
    return `Walk-ins are always welcome! ${C.faq.wait_time} Want to book ahead to skip the wait?`;
  }

  function waitTimeResponse() {
    return `${C.busy_times.peak} ${C.busy_times.off_peak} Want to book an appointment so you're guaranteed a spot?`;
  }

  function kidsResponse() {
    return `${C.faq.kids} Kids cuts are **$18** and take about 20 minutes. Want to book a time for your little one?`;
  }

  function fadeResponse() {
    return `Fades and tapers are our specialty — skin fades, low, mid, high, you name it. A fade is **$28** and takes about 30 minutes. Want to book?`;
  }

  function beardResponse() {
    return `We do beard trims, shaping, and lineups. A beard trim on its own is **$15**. Combo with a haircut is **$38** — most guys go for the combo. Want to book?`;
  }

  function shaveResponse() {
    return `Our hot towel straight razor shave is **$35** — takes about 45 minutes and it's an experience. Skin prep, hot towel, clean razor shave, cold towel finish. Want to book one?`;
  }

  function trustResponse() {
    return `${C.selling_points[1]} ${C.selling_points[2]} Come see why our regulars don't go anywhere else. Want to book a cut?`;
  }

  function hoursResponse() {
    return `Today we're open: **${todayHoursString()}**. Full week: Tue–Fri 9am–7pm, Sat 8am–6pm, Sun 10am–4pm, Mon closed. Want to book?`;
  }

  function locationResponse() {
    return `We're at **${C.address}**. ${C.faq.parking} Want to book ahead so you're all set when you arrive?`;
  }

  // ─── Appointment Flow ─────────────────────────────────────────────────────────

  async function startAppointmentFlow(preface) {
    state.flow = 'appointment'; state.step = 'service'; state.data = {};
    await botReply(preface || `Let's get you booked! What service are you coming in for — haircut, fade, beard, combo, or something else?`, 800);
  }

  async function advanceAppointment(text) {
    const t = text.trim();
    if (state.step === 'service') {
      if (t.length < 2) { await botReply(`What are you coming in for — haircut, fade, beard, combo, shave, or kids cut?`, 600); return; }
      state.data.service = t; state.step = 'date';
      await botReply(`${t} — nice. What day and time works for you?`, 700); return;
    }
    if (state.step === 'date') {
      if (t.length < 2) { await botReply(`What day and time works for you?`, 500); return; }
      state.data.date = t; state.step = 'name';
      await botReply(`Got it. What's your name?`, 650); return;
    }
    if (state.step === 'name') {
      if (t.length < 2 || /^\d+$/.test(t)) { await botReply(`What's your name?`, 500); return; }
      state.data.name = t; state.step = 'phone';
      await botReply(`${t}! And your phone number so we can send a reminder?`, 700); return;
    }
    if (state.step === 'phone') {
      const digits = t.replace(/\D/g,'');
      if (digits.length < 10) { await botReply(`Double-check that number for me?`, 500); return; }
      state.data.phone = digits;
      finalizeLead('appointment');
      await botReply(C.lead_captured_message.replace('{name}', state.data.name), 900);
      state.flow = 'done'; return;
    }
  }

  async function startContactCapture(preface) {
    state.flow = 'contact'; state.step = 'name'; state.data = {};
    await botReply(preface, 800);
  }

  async function advanceContact(text) {
    const t = text.trim();
    if (state.step === 'name') {
      if (t.length < 2 || /^\d+$/.test(t)) { await botReply(`What's your name?`, 500); return; }
      state.data.name = t; state.step = 'phone';
      await botReply(`${t}! What's your number?`, 700); return;
    }
    if (state.step === 'phone') {
      const digits = t.replace(/\D/g,'');
      if (digits.length < 10) { await botReply(`Double-check that number for me?`, 500); return; }
      state.data.phone = digits;
      finalizeLead('contact');
      await botReply(`You're on the list, ${state.data.name}! We'll hit you back soon.`, 800);
      state.flow = 'done'; return;
    }
  }

  function finalizeLead(source) {
    const lead = { ...state.data, source, business: C.business_name, timestamp: new Date().toISOString() };
    window.capturedLead = lead; console.log('[Lead Captured]', lead);
    if (C.lead_webhook_url) {
      fetch(C.lead_webhook_url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(lead) }).catch(() => {});
    }
  }

  function isAffirmative(t) {
    return /^(yes|yeah|sure|ok|okay|yep|yup|absolutely|sounds good|let's go|definitely|please|book|i do)/i.test(t.trim());
  }

  async function processMessage(text) {
    input.disabled = true;

    if (state.flow === 'appointment') { await advanceAppointment(text); input.disabled = false; input.focus(); return; }
    if (state.flow === 'contact')     { await advanceContact(text);     input.disabled = false; input.focus(); return; }

    const intent = detectIntent(text);

    if (isAfterHours()) {
      const infoIntents = new Set(['hours', 'location', 'pricing', 'services', 'fade', 'beard', 'shave', 'kids', 'walk_in', 'wait_time', 'trust']);
      if (!infoIntents.has(intent)) {
        await startContactCapture(C.after_hours_message); input.disabled = false; input.focus(); return;
      }
    }

    switch (intent) {
      case 'appointment':
        await startAppointmentFlow(null); break;
      case 'walk_in':
        await botReply(walkInResponse(), 850);
        showQuickReplies(['Book an appointment', 'What\'s the wait today?']);
        state.pendingFlow = true; break;
      case 'wait_time':
        await botReply(waitTimeResponse(), 850);
        showQuickReplies(['Book an appointment', 'Walk-in info']);
        state.pendingFlow = true; break;
      case 'services':
        await botReply(servicesResponse(), 900);
        showQuickReplies(['Book an appointment', 'Pricing']);
        state.pendingFlow = true; break;
      case 'pricing':
        await botReply(pricingResponse(), 900);
        showQuickReplies(['Book an appointment']);
        state.pendingFlow = true; break;
      case 'fade':
        await botReply(fadeResponse(), 850);
        showQuickReplies(['Book an appointment', 'See all pricing']);
        state.pendingFlow = true; break;
      case 'beard':
        await botReply(beardResponse(), 850);
        showQuickReplies(['Book an appointment', 'See all pricing']);
        state.pendingFlow = true; break;
      case 'shave':
        await botReply(shaveResponse(), 850);
        showQuickReplies(['Book an appointment']);
        state.pendingFlow = true; break;
      case 'kids':
        await botReply(kidsResponse(), 850);
        showQuickReplies(['Book an appointment for my kid']);
        state.pendingFlow = true; break;
      case 'trust':
        await botReply(trustResponse(), 850);
        showQuickReplies(['Book an appointment']);
        state.pendingFlow = true; break;
      case 'hours':    await botReply(hoursResponse(), 800); break;
      case 'location': await botReply(locationResponse(), 800); break;
      default:
        await botReply(C.fallback_message, 800);
        showQuickReplies(['Book an appointment', 'Services & pricing', 'Hours & location']);
        state.pendingFlow = true;
        break;
    }

    input.disabled = false; input.focus();
  }

  async function handleSend() {
    const text = input.value.trim(); if (!text) return;
    input.value = ''; clearQuickReplies(); appendMessage(text, 'user');

    if (state.pendingFlow) {
      state.pendingFlow = false;
      if (isAffirmative(text) || text.toLowerCase().includes('book') || text.toLowerCase().includes('appointment')) {
        await startAppointmentFlow(null); input.disabled = false; input.focus(); return;
      }
    }
    await processMessage(text);
  }

  window.handleSend = handleSend;
  window.handleKey  = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  async function toggleChat() {
    state.open = !state.open;
    bubble.classList.toggle('open', state.open);
    chatWindow.classList.toggle('open', state.open);
    notifDot.style.display = 'none';
    if (state.open && !state.greeted) {
      state.greeted = true; setTimeout(() => input.focus(), 300);
      await botReply(C.greeting, 650);
      showQuickReplies(['Book a haircut', 'Walk-in wait time', 'Services & pricing', 'Kids cuts']);
    } else if (state.open) { input.focus(); }
  }

  window.toggleChat = toggleChat;
  window.openChat   = async () => { if (!state.open) await toggleChat(); };
  setTimeout(() => { notifDot.style.display = 'block'; }, 1500);

})();
