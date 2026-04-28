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
      Monday: [480,1080], Tuesday: [480,1080], Wednesday: [480,780],
      Thursday: [480,1080], Friday: [480,1020], Saturday: [480,720],
    };
    const [open, close] = map[day] || [480, 1020];
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

  function newPatientResponse() {
    return `Welcome! Your first visit includes a full consultation, health history, and exam — and in most cases we begin treatment the same day. Plan on about an hour. We also verify your insurance before you arrive so there are no surprises. Want to get you on the schedule?`;
  }

  function backPainResponse() {
    return `Back pain is one of the most common things we treat, and most patients feel significant relief within a few visits. Whether it's a herniated disc, muscle strain, or sciatica — we'll find the root cause and build a treatment plan. Want to come in? We have same-day appointments available.`;
  }

  function neckPainResponse() {
    return `Neck pain and stiffness respond very well to chiropractic care. We'll examine your range of motion and spine alignment to find what's going on. Want to book an appointment? We often have same-day availability.`;
  }

  function headacheResponse() {
    return `Many headaches — especially tension headaches and migraines — are linked to spinal alignment and muscle tension in the neck. Chiropractic care can significantly reduce frequency and intensity. Want to come in and get evaluated?`;
  }

  function sciaticaResponse() {
    return `Sciatica is very treatable with chiropractic care. We work to relieve the pressure on the sciatic nerve through targeted adjustments and spinal decompression if needed. Most patients see improvement within a few visits. Want to book an appointment?`;
  }

  function accidentResponse() {
    return `If you were in an auto accident, don't wait — injuries like whiplash often don't show up immediately but can worsen quickly. Most auto insurance covers chiropractic care 100%. We can often get you in the same day. Can I grab your name and number so we can reach out right away?`;
  }

  function insuranceResponse() {
    const ins = C.insurance.join(', ');
    return `We accept most major plans: **${ins}**. Before your first visit, we'll call to verify your specific benefits so you know exactly what to expect. Want us to check your coverage?`;
  }

  function trustResponse() {
    return `${C.selling_points[0]} ${C.selling_points[2]} We'd love to show you what we can do — want to book a first appointment?`;
  }

  function hoursResponse() {
    return `Today we're open: **${todayHoursString()}**. Full week: Mon/Tue/Thu 8am–6pm, Wed 8am–1pm, Fri 8am–5pm, Sat 8am–12pm, Sun closed. Want to book an appointment?`;
  }

  function locationResponse() {
    return `We're at **${C.address}**. ${C.faq.parking} Want me to get you scheduled before you head over?`;
  }

  function xrayResponse() {
    return `${C.faq.xray} We'll let you know during the exam if X-rays are needed. Want to book an appointment?`;
  }

  function sportsResponse() {
    return `Sports injuries are a specialty of ours — from sprains and strains to repetitive stress issues. We'll get you evaluated and on a plan to recover and get back to training. Same-day appointments often available. Want to come in?`;
  }

  // ─── Appointment Flow ─────────────────────────────────────────────────────────

  async function startAppointmentFlow(preface) {
    state.flow = 'appointment'; state.step = 'type'; state.data = {};
    await botReply(preface || `Let's get you scheduled! Is this for a new patient visit, or are you an existing patient?`, 800);
  }

  async function advanceAppointment(text) {
    const t = text.trim();
    if (state.step === 'type') {
      state.data.type = t; state.step = 'date';
      await botReply(`Got it. What day works best for you?`, 750); return;
    }
    if (state.step === 'date') {
      state.data.date = t; state.step = 'name';
      await botReply(`${t} works. Can I get your name?`, 700); return;
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
      finalizeLead('appointment');
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
      await botReply(`Thanks, ${t}! What's the best number to reach you?`, 750); return;
    }
    if (state.step === 'phone') {
      const digits = t.replace(/\D/g,'');
      if (digits.length < 10) { await botReply(`Could you double-check that number?`, 600); return; }
      state.data.phone = digits;
      finalizeLead('contact');
      await botReply(`Perfect, ${state.data.name}! We'll be in touch shortly.`, 900);
      state.flow = 'done'; return;
    }
  }

  function finalizeLead(source) {
    const lead = { ...state.data, source, business: C.business_name, timestamp: new Date().toISOString() };
    window.capturedLead = lead; console.log('[Lead Captured]', lead);
  }

  function isAffirmative(t) {
    return /^(yes|yeah|sure|ok|okay|yep|yup|absolutely|sounds good|let's go|definitely|please|i do|i would|i'd like)/i.test(t.trim());
  }

  async function processMessage(text) {
    input.disabled = true;

    if (state.flow === 'appointment') { await advanceAppointment(text); input.disabled = false; input.focus(); return; }
    if (state.flow === 'contact')     { await advanceContact(text);     input.disabled = false; input.focus(); return; }

    if (isAfterHours()) { await startContactCapture(C.after_hours_message); input.disabled = false; input.focus(); return; }

    const intent = detectIntent(text);

    switch (intent) {
      case 'appointment': await startAppointmentFlow(null); break;
      case 'new_patient':
        await botReply(newPatientResponse(), 900);
        showQuickReplies(['Book an appointment', 'Check my insurance', 'What should I expect?']);
        state.pendingFlow = true; break;
      case 'back_pain':
        await botReply(backPainResponse(), 900);
        showQuickReplies(['Book an appointment', 'Do you take my insurance?']);
        state.pendingFlow = true; break;
      case 'neck_pain':
        await botReply(neckPainResponse(), 900);
        showQuickReplies(['Book an appointment', 'Do you take my insurance?']);
        state.pendingFlow = true; break;
      case 'headache':
        await botReply(headacheResponse(), 900);
        showQuickReplies(['Book an appointment', 'Tell me more']);
        state.pendingFlow = true; break;
      case 'sciatica':
        await botReply(sciaticaResponse(), 900);
        showQuickReplies(['Book an appointment', 'Do you take my insurance?']);
        state.pendingFlow = true; break;
      case 'accident':
        await botReply(accidentResponse(), 900);
        state.flow = 'contact'; state.step = 'name'; state.data = {}; break;
      case 'sports':
        await botReply(sportsResponse(), 900);
        showQuickReplies(['Book an appointment', 'Do you take my insurance?']);
        state.pendingFlow = true; break;
      case 'insurance':
        await botReply(insuranceResponse(), 900);
        showQuickReplies(['Book an appointment', 'What's a first visit like?']);
        state.pendingFlow = true; break;
      case 'xray':        await botReply(xrayResponse(), 850); break;
      case 'hours':       await botReply(hoursResponse(), 800); break;
      case 'location':    await botReply(locationResponse(), 800); break;
      case 'trust':
        await botReply(trustResponse(), 900);
        showQuickReplies(['Book an appointment', 'Check my insurance']);
        state.pendingFlow = true; break;
      default:            await botReply(C.fallback_message, 850); break;
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
      showQuickReplies(['Book an appointment', 'Do you take my insurance?', 'What\'s a first visit like?', 'I was in an accident']);
    } else if (state.open) { input.focus(); }
  }

  window.toggleChat = toggleChat;
  window.openChat   = async () => { if (!state.open) await toggleChat(); };
  setTimeout(() => { notifDot.style.display = 'block'; }, 1500);

})();
