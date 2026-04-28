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
    if (day === 'Sunday') return true;
    const hm = new Date().getHours() * 60 + new Date().getMinutes();
    const map = {
      Monday: [420,1020], Tuesday: [420,1020], Wednesday: [420,1020],
      Thursday: [420,1020], Friday: [420,960], Saturday: [480,720],
    };
    const [open, close] = map[day] || [420, 1020];
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

  function estimateResponse() {
    return `We offer **free on-site consultations and written estimates** — no obligation. Every project is different, so we always start with a site visit to give you an accurate number. Want to schedule one?`;
  }

  function additionResponse() {
    return `Home additions are one of our specialties. ${C.project_types.addition} The best way to get an accurate number is a free site visit. Want to schedule one?`;
  }

  function remodelResponse() {
    return `We handle full kitchen and bathroom remodels — demo through final finish. ${C.project_types.remodel} We'll give you a detailed written estimate after a free site walk. Want to get that scheduled?`;
  }

  function newHomeResponse() {
    return `We build fully custom homes from the ground up — design through certificate of occupancy. ${C.project_types.new_home} We'd love to discuss your vision. Want to schedule a free consultation?`;
  }

  function roofingResponse() {
    return `We handle full roofing replacement, repairs, and siding. Pricing depends on size, pitch, and material — we provide exact quotes after a site visit. Want to get that scheduled?`;
  }

  function deckResponse() {
    return `Decks and patios are a great investment. ${C.project_types.deck} We'll walk your yard and give you a free written estimate. Want to schedule a time?`;
  }

  function surveyResponse() {
    return `Yes — we offer land surveying for boundary determination, lot splits, and new construction. A survey is typically required before permits are pulled on additions or new builds. Want to discuss your project?`;
  }

  function licensedResponse() {
    return `${C.selling_points[0]} We carry full general liability and workers' compensation insurance and can provide certificates on request. Want to schedule a free estimate?`;
  }

  function timelineResponse() {
    return `${C.faq.timeline} We build a detailed schedule before work starts and provide weekly updates throughout. Want to talk through your project timeline?`;
  }

  function permitsResponse() {
    return `${C.faq.permits} You don't have to deal with a single form. Want to schedule a free consultation to get started?`;
  }

  function trustResponse() {
    return `${C.selling_points[0]} ${C.selling_points[2]} We're happy to provide references from recent projects in your area. Want to schedule a free site visit?`;
  }

  function hoursResponse() {
    return `Today we're available: **${todayHoursString()}**. Office hours Mon–Thu 7am–5pm, Fri 7am–4pm, Sat 8am–12pm, Sun closed. That said — you can always leave a message here and we'll call you back. Want to schedule a free estimate?`;
  }

  function locationResponse() {
    const areas = C.service_area.join(', ');
    return `Our office is at **${C.address}**. We serve: ${areas}. Most initial meetings happen at your project site — want to schedule a free site visit?`;
  }

  // ─── Estimate Request Flow ────────────────────────────────────────────────────

  async function startEstimateFlow(preface) {
    state.flow = 'estimate'; state.step = 'project_type'; state.data = {};
    await botReply(preface || `Let's get that set up. What kind of project are you thinking — remodel, addition, new home, roofing, deck, or something else?`, 850);
  }

  async function advanceEstimate(text) {
    const t = text.trim();
    if (state.step === 'project_type') {
      state.data.project_type = t; state.step = 'location';
      await botReply(`Got it — a ${t}. What's the address or general area of the project?`, 800); return;
    }
    if (state.step === 'location') {
      state.data.location = t; state.step = 'name';
      await botReply(`Perfect. Can I get your name?`, 700); return;
    }
    if (state.step === 'name') {
      if (t.length < 2) { await botReply(`Could you type your name again?`, 600); return; }
      state.data.name = t; state.step = 'phone';
      await botReply(`Thanks, ${t}! What's the best number to reach you?`, 750); return;
    }
    if (state.step === 'phone') {
      const digits = t.replace(/\D/g,'');
      if (digits.length < 10) { await botReply(`Could you double-check that number?`, 600); return; }
      state.data.phone = digits;
      finalizeLead('estimate');
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
      await botReply(`Thanks, ${t}! Best number to reach you?`, 700); return;
    }
    if (state.step === 'phone') {
      const digits = t.replace(/\D/g,'');
      if (digits.length < 10) { await botReply(`Could you double-check that number?`, 600); return; }
      state.data.phone = digits;
      finalizeLead('contact');
      await botReply(`Perfect, ${state.data.name}! We'll call you first thing tomorrow. Talk soon.`, 900);
      state.flow = 'done'; return;
    }
  }

  function finalizeLead(source) {
    const lead = { ...state.data, source, business: C.business_name, timestamp: new Date().toISOString() };
    window.capturedLead = lead; console.log('[Lead Captured]', lead);
  }

  function isAffirmative(t) {
    return /^(yes|yeah|sure|ok|okay|yep|yup|absolutely|sounds good|let's go|definitely|please|i would|i'd like)/i.test(t.trim());
  }

  async function processMessage(text) {
    input.disabled = true;

    if (state.flow === 'estimate') { await advanceEstimate(text); input.disabled = false; input.focus(); return; }
    if (state.flow === 'contact')  { await advanceContact(text);  input.disabled = false; input.focus(); return; }

    if (isAfterHours()) { await startContactCapture(C.after_hours_message); input.disabled = false; input.focus(); return; }

    const intent = detectIntent(text);

    switch (intent) {
      case 'estimate':
      case 'consultation':
        await startEstimateFlow(null); break;
      case 'addition':
        await botReply(additionResponse(), 900);
        showQuickReplies(['Schedule a free estimate', 'How long does it take?', 'Do you handle permits?']);
        state.pendingFlow = true; break;
      case 'remodel':
        await botReply(remodelResponse(), 900);
        showQuickReplies(['Schedule a free estimate', 'How long does it take?']);
        state.pendingFlow = true; break;
      case 'new_home':
        await botReply(newHomeResponse(), 900);
        showQuickReplies(['Schedule a free consultation', 'Do you handle permits?']);
        state.pendingFlow = true; break;
      case 'roofing':
        await botReply(roofingResponse(), 900);
        showQuickReplies(['Schedule a free estimate']);
        state.pendingFlow = true; break;
      case 'deck':
        await botReply(deckResponse(), 900);
        showQuickReplies(['Schedule a free estimate', 'How much does it cost?']);
        state.pendingFlow = true; break;
      case 'survey':
        await botReply(surveyResponse(), 900);
        showQuickReplies(['Schedule a consultation', 'Learn more about the process']);
        state.pendingFlow = true; break;
      case 'licensed':
        await botReply(licensedResponse(), 900);
        showQuickReplies(['Schedule a free estimate']);
        state.pendingFlow = true; break;
      case 'timeline':
        await botReply(timelineResponse(), 900);
        showQuickReplies(['Schedule a free estimate', 'What\'s the process?']);
        state.pendingFlow = true; break;
      case 'permits':
        await botReply(permitsResponse(), 900);
        showQuickReplies(['Schedule a free estimate']);
        state.pendingFlow = true; break;
      case 'trust':
        await botReply(trustResponse(), 900);
        showQuickReplies(['Schedule a free estimate', 'See past projects']);
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
      if (isAffirmative(text) || text.toLowerCase().includes('estimate') || text.toLowerCase().includes('schedule') || text.toLowerCase().includes('consult')) {
        await startEstimateFlow(null); input.disabled = false; input.focus(); return;
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
      showQuickReplies(['Get a free estimate', 'Kitchen or bath remodel', 'Home addition', 'Are you licensed?']);
    } else if (state.open) { input.focus(); }
  }

  window.toggleChat = toggleChat;
  window.openChat   = async () => { if (!state.open) await toggleChat(); };
  setTimeout(() => { notifDot.style.display = 'block'; }, 1500);

})();
