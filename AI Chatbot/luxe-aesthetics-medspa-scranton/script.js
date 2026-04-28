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
    if (day === 'Sunday' || day === 'Monday') return true;
    const hm = new Date().getHours() * 60 + new Date().getMinutes();
    const map = {
      Tuesday: [600,1140], Wednesday: [600,1140], Thursday: [600,1140],
      Friday: [600,1080], Saturday: [540,1020],
    };
    const [open, close] = map[day] || [600, 1080];
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

  function botoxResponse() {
    return `Botox is one of our most popular treatments! It smooths forehead lines, crow's feet, and frown lines for 3–4 months. Most clients are in and out in under 30 minutes with zero downtime. Pricing is per unit — we'll give you an exact quote at your free consultation. Want to book one?`;
  }

  function fillersResponse() {
    return `Dermal fillers restore volume and define your features — lips, cheeks, jawline, and more. Results last 6–18 months depending on the area. We use only premium products like Juvederm and Restylane. All treatments are performed by our licensed medical team. Want to book a free consultation?`;
  }

  function laserResponse() {
    return `We offer laser hair removal for face and body. Most clients need 6–8 sessions for permanent results. We'll assess your skin and hair type during a free consultation to make sure you're a good candidate. Want to schedule that?`;
  }

  function hydrafacialResponse() {
    return `HydraFacial is a 3-step treatment that cleanses, extracts, and hydrates — it's one of our most requested services! Clients love the instant glow with zero downtime. Great for all skin types. Want to book one?`;
  }

  function microneedlingResponse() {
    return `Microneedling stimulates your skin's natural collagen production — it's excellent for fine lines, acne scars, and overall texture. Most clients see results after 3 sessions. We can discuss your specific concerns at a free consultation. Want to book one?`;
  }

  function peelsResponse() {
    return `Chemical peels are great for uneven tone, dark spots, and texture. We offer peels at multiple depths depending on your skin goals. A consultation helps us choose the right one for your skin type. Want to get started?`;
  }

  function downtimeResponse() {
    return `Botox has virtually no downtime — most clients go straight back to their day. Fillers may cause mild swelling for 24–48 hours. Laser and peels vary by treatment depth. We'll walk you through exactly what to expect at your consultation. Want to book one?`;
  }

  function pricingResponse() {
    return `Pricing depends on the treatment and amount used. Botox is priced per unit — most areas run 20–40 units. We'll give you an exact quote at your **free consultation** so you know what to expect before committing to anything. Want to book one?`;
  }

  function skinResponse() {
    return `We have treatments for almost every skin concern — acne, scarring, pigmentation, dullness, and more. The best starting point is a **free consultation** where we assess your skin and build a personalized plan. Want to schedule that?`;
  }

  function trustResponse() {
    return `${C.selling_points[0]} ${C.selling_points[1]} We'd love to show you what's possible — would you like to book a free consultation?`;
  }

  function hoursResponse() {
    return `Today we're open: **${todayHoursString()}**. Full week: Tue–Thu 10am–7pm, Fri 10am–6pm, Sat 9am–5pm, Mon & Sun closed. Want to book a consultation?`;
  }

  function locationResponse() {
    return `We're at **${C.address}**. ${C.faq.parking} Want to schedule your free consultation before you come in?`;
  }

  // ─── Consultation Flow ────────────────────────────────────────────────────────

  async function startConsultationFlow(preface) {
    state.flow = 'consultation'; state.step = 'treatment'; state.data = {};
    await botReply(preface || `Wonderful! What treatment or concern would you like to discuss at your consultation?`, 800);
  }

  async function advanceConsultation(text) {
    const t = text.trim();
    if (state.step === 'treatment') {
      state.data.treatment = t; state.step = 'date';
      await botReply(`Great choice. What day works best for you?`, 750); return;
    }
    if (state.step === 'date') {
      state.data.date = t; state.step = 'name';
      await botReply(`${t} — perfect. Can I get your name?`, 700); return;
    }
    if (state.step === 'name') {
      if (t.length < 2) { await botReply(`Could you type your name again?`, 600); return; }
      state.data.name = t; state.step = 'phone';
      await botReply(`Lovely to meet you, ${t}! What's the best number to reach you?`, 750); return;
    }
    if (state.step === 'phone') {
      const digits = t.replace(/\D/g,'');
      if (digits.length < 10) { await botReply(`Could you double-check that number?`, 600); return; }
      state.data.phone = digits;
      finalizeLead('consultation');
      await botReply(C.lead_captured_message.replace('{name}', state.data.name), 1000);
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
      if (t.length < 2) { await botReply(`Could you type your name again?`, 600); return; }
      state.data.name = t; state.step = 'phone';
      await botReply(`Thank you, ${t}! What's the best number to reach you?`, 750); return;
    }
    if (state.step === 'phone') {
      const digits = t.replace(/\D/g,'');
      if (digits.length < 10) { await botReply(`Could you double-check that number?`, 600); return; }
      state.data.phone = digits;
      finalizeLead('contact');
      await botReply(`You're all set, ${state.data.name}! We'll be in touch to get you scheduled.`, 900);
      state.flow = 'done'; return;
    }
  }

  function finalizeLead(source) {
    const lead = { ...state.data, source, business: C.business_name, timestamp: new Date().toISOString() };
    window.capturedLead = lead; console.log('[Lead Captured]', lead);
  }

  function isAffirmative(t) {
    return /^(yes|yeah|sure|ok|okay|yep|yup|absolutely|sounds good|let's go|definitely|please|love to|i would|i'd like)/i.test(t.trim());
  }

  async function processMessage(text) {
    input.disabled = true;

    if (state.flow === 'consultation') { await advanceConsultation(text); input.disabled = false; input.focus(); return; }
    if (state.flow === 'contact')      { await advanceContact(text);      input.disabled = false; input.focus(); return; }

    if (isAfterHours()) { await startContactCapture(C.after_hours_message); input.disabled = false; input.focus(); return; }

    const intent = detectIntent(text);

    switch (intent) {
      case 'consultation':
        await startConsultationFlow(null); break;
      case 'botox':
        await botReply(botoxResponse(), 900);
        showQuickReplies(['Book a consultation', 'What\'s the downtime?', 'How much does it cost?']);
        state.pendingFlow = true; break;
      case 'fillers':
        await botReply(fillersResponse(), 900);
        showQuickReplies(['Book a consultation', 'What\'s the downtime?', 'How much does it cost?']);
        state.pendingFlow = true; break;
      case 'laser':
        await botReply(laserResponse(), 900);
        showQuickReplies(['Book a consultation', 'How much does it cost?']);
        state.pendingFlow = true; break;
      case 'hydrafacial':
        await botReply(hydrafacialResponse(), 900);
        showQuickReplies(['Book a consultation', 'How much does it cost?']);
        state.pendingFlow = true; break;
      case 'microneedling':
        await botReply(microneedlingResponse(), 900);
        showQuickReplies(['Book a consultation', 'What\'s the downtime?']);
        state.pendingFlow = true; break;
      case 'peels':
        await botReply(peelsResponse(), 900);
        showQuickReplies(['Book a consultation', 'What\'s the downtime?']);
        state.pendingFlow = true; break;
      case 'downtime':
        await botReply(downtimeResponse(), 900);
        showQuickReplies(['Book a consultation', 'What treatments do you offer?']);
        state.pendingFlow = true; break;
      case 'pricing':
        await botReply(pricingResponse(), 900);
        showQuickReplies(['Book a free consultation', 'What treatments do you offer?']);
        state.pendingFlow = true; break;
      case 'skin':
        await botReply(skinResponse(), 900);
        showQuickReplies(['Book a consultation', 'What treatments do you offer?']);
        state.pendingFlow = true; break;
      case 'trust':
        await botReply(trustResponse(), 900);
        showQuickReplies(['Book a free consultation']);
        state.pendingFlow = true; break;
      case 'hours':    await botReply(hoursResponse(), 800); break;
      case 'location': await botReply(locationResponse(), 800); break;
      default:         await botReply(C.fallback_message, 850); break;
    }

    input.disabled = false; input.focus();
  }

  async function handleSend() {
    const text = input.value.trim(); if (!text) return;
    input.value = ''; clearQuickReplies(); appendMessage(text, 'user');

    if (state.pendingFlow) {
      state.pendingFlow = false;
      if (isAffirmative(text) || text.toLowerCase().includes('consult') || text.toLowerCase().includes('book')) {
        await startConsultationFlow(null); input.disabled = false; input.focus(); return;
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
      showQuickReplies(['Book a consultation', 'Botox & fillers', 'What\'s good for wrinkles?', 'Pricing']);
    } else if (state.open) { input.focus(); }
  }

  window.toggleChat = toggleChat;
  window.openChat   = async () => { if (!state.open) await toggleChat(); };
  setTimeout(() => { notifDot.style.display = 'block'; }, 1500);

})();
