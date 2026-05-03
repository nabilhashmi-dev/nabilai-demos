(async function () {

  // ─── Load Config ─────────────────────────────────────────────────────────────
  let C;
  try {
    const res = await fetch('./chatbot-config.json');
    C = await res.json();
  } catch (e) {
    console.error('Could not load chatbot-config.json', e);
    return;
  }

  // ─── State ───────────────────────────────────────────────────────────────────
  const state = {
    open: false,
    greeted: false,
    flow: null,              // 'reservation' | 'event_lead' | 'contact_capture'
    step: null,
    data: {},
    pendingReservation: false, // true after menu/dietary CTA — only starts flow on affirmative
  };

  window.capturedLead = null;

  // ─── DOM ─────────────────────────────────────────────────────────────────────
  const bubble     = document.getElementById('chat-bubble');
  const chatWindow = document.getElementById('chat-window');
  const msgList    = document.getElementById('chat-messages');
  const input      = document.getElementById('chat-input');
  const notifDot   = document.getElementById('notif-dot');

  // ─── Utilities ───────────────────────────────────────────────────────────────
  function scrollBottom() {
    msgList.scrollTop = msgList.scrollHeight;
  }

  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function appendMessage(text, sender) {
    const wrap = document.createElement('div');
    wrap.className = `msg ${sender}`;
    const bub = document.createElement('div');
    bub.className = 'msg-bubble';
    bub.innerHTML = renderMarkdown(text);
    wrap.appendChild(bub);
    msgList.appendChild(wrap);
    scrollBottom();
  }

  // ─── Quick Replies ────────────────────────────────────────────────────────────
  function showQuickReplies(options) {
    clearQuickReplies();
    const row = document.createElement('div');
    row.className = 'quick-replies';
    row.id = 'quick-replies';
    options.forEach(label => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.textContent = label;
      btn.onclick = () => {
        clearQuickReplies();
        input.value = label;
        handleSend();
      };
      row.appendChild(btn);
    });
    msgList.appendChild(row);
    scrollBottom();
  }

  function clearQuickReplies() {
    document.getElementById('quick-replies')?.remove();
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'typing-indicator';
    el.id = 'typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgList.appendChild(el);
    scrollBottom();
    return el;
  }

  function botReply(text, delay = 850) {
    showTyping();
    return new Promise(resolve => {
      setTimeout(() => {
        document.getElementById('typing')?.remove();
        appendMessage(text, 'bot');
        resolve();
      }, delay);
    });
  }

  // ─── Time Helpers ─────────────────────────────────────────────────────────────
  function isAfterHours() {
    const days  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const now   = new Date();
    const day   = days[now.getDay()];
    const hm    = now.getHours() * 60 + now.getMinutes();
    const map   = {
      Monday:    [660, 1260], Tuesday:   [660, 1260],
      Wednesday: [660, 1260], Thursday:  [660, 1260],
      Friday:    [660, 1320], Saturday:  [660, 1320],
      Sunday:    [720, 1200],
    };
    const [open, close] = map[day] || [660, 1260];
    return hm < open || hm >= close;
  }

  function todayHoursString() {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const day  = days[new Date().getDay()];
    return C.hours[day] || 'hours unavailable';
  }

  // ─── Intent Detection ─────────────────────────────────────────────────────────
  function detectIntent(text) {
    const t = text.toLowerCase();
    const intents = C.intents;
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(k => t.includes(k))) return intent;
    }
    return null;
  }

  // ─── Response Builders ────────────────────────────────────────────────────────

  function menuTopThree() {
    const top = C.menu.popular.slice(0, 3);
    const list = top.map((d, i) => `${i + 1}. **${d.name}** (${d.price}) — ${d.description.split('.')[0]}.`).join('\n');
    return `Our top three right now:\n${list}\n\nThe Chicken Parm is legendary — it's been on the menu since we opened. Want me to grab you a table?`;
  }

  function veganResponse() {
    const items = C.menu.vegan.slice(0, 2);
    const list  = items.map(d => `• **${d.name}** — ${d.description.split('.')[0]}`).join('\n');
    return `We've got some great vegan options! 🌱\n${list}\n\nWant me to grab you a reservation so you can come try them?`;
  }

  function gfResponse() {
    const items = C.menu.gluten_free.slice(0, 2);
    const list  = items.map(d => `• **${d.name}** (${d.price}) — ${d.description.split('.')[0]}`).join('\n');
    return `We have gluten-free options available:\n${list}\n\nNote: our kitchen isn't 100% gluten-free, so please let your server know about any severe allergy. Want to come in? I can grab a table for you.`;
  }

  function specialsResponse() {
    return `Here's what's on right now:\n• ${C.menu.specials.weekly}\n• ${C.menu.specials.lunch}\n• ${C.menu.specials.happy_hour}\n\nWant to come in this week? I can get you a reservation.`;
  }

  function takeoutResponse() {
    const pop = C.takeout.popular_items.join(', ');
    return `You can order by calling us at ${C.phone} or online through our site — pickup takes about 20–25 minutes. Most popular takeout orders are: ${pop}. ${C.takeout.upsell}`;
  }

  function hoursResponse() {
    const today = todayHoursString();
    return `Today we're open ${today}. Our full hours: Mon–Thu 11am–9pm, Fri–Sat 11am–10pm, Sun 12pm–8pm. Anything else I can help with?`;
  }

  function locationResponse() {
    return `We're at ${C.address}. ${C.faq.parking} Want me to help you grab a reservation before you head over?`;
  }

  function waitTimeResponse() {
    return `${C.busy_times.peak} ${C.busy_times.off_peak} Want me to grab you a table at a quieter time?`;
  }

  function trustResponse() {
    const pts = C.selling_points;
    return `${pts[0]} ${pts[2]} Want to come see for yourself? I can grab a reservation.`;
  }

  function giftCardResponse() {
    return `${C.gift_cards.description} Want me to get you the info on how to grab one?`;
  }

  function kidsResponse() {
    return `${C.faq.kids} Parents love that we have a separate kids' menu so the little ones are happy. Want to bring the family in? I can grab a table.`;
  }

  function outdoorResponse() {
    return `${C.faq.outdoor_seating} The patio fills up fast on nice evenings. Want me to grab a reservation so you have a spot?`;
  }

  function petsResponse() {
    return `${C.faq.pets} The patio is a great spot for a dog-friendly dinner. Want to come in? I can get a table set up for you.`;
  }

  function dresscodeResponse() {
    return `${C.faq.dress_code} Most guests come in jeans or business casual — no need to dress up. Is there anything else I can help with?`;
  }

  function allergyResponse() {
    return `We take allergies seriously and can accommodate most dietary needs with advance notice. Please let your server know when you arrive, or mention it when booking. Can I grab your name to get a reservation started?`;
  }

  // ─── Flow: Reservation (party size → date → time → name → phone) ─────────────
  async function startReservationFlow(preface) {
    state.flow = 'reservation';
    state.step = 'party_size';
    state.data = {};
    const msg = preface
      ? `${preface} How many people will be joining you?`
      : `I'd love to help! How many people will be in your party?`;
    await botReply(msg, 800);
  }

  async function advanceReservation(text) {
    const t = text.trim();

    if (state.step === 'party_size') {
      const num = parseInt(t.replace(/\D/g, ''));
      if (!num || num < 1) {
        await botReply("Just need a number — how many guests will you have?", 700);
        return;
      }
      state.data.party_size = num;
      state.step = 'date';

      if (num >= 6) {
        await botReply(`A party of ${num} — perfect! We can definitely accommodate that. What date works for you?`, 800);
      } else {
        await botReply(`${num} guests, got it! What date are you thinking?`, 700);
      }
      return;
    }

    if (state.step === 'date') {
      if (t.length < 2) {
        await botReply("What date are you looking at — tonight, this weekend, a specific date?", 700);
        return;
      }
      state.data.date = t;
      const hasTime = /\b\d{1,2}(:\d{2})?\s*(am|pm)\b|\b(morning|afternoon|lunch|dinner|evening|night|noon)\b/i.test(t);
      if (hasTime) {
        state.step = 'name';
        await botReply(`${t} — perfect! Can I get your name for the reservation?`, 750);
      } else {
        state.step = 'time';
        await botReply(`${t} works! What time were you thinking — lunch, dinner, or a specific time like 7pm?`, 800);
      }
      return;
    }

    if (state.step === 'time') {
      const looksLikeTime = /\d|morning|afternoon|lunch|dinner|evening|night|noon|am|pm/i.test(t);
      if (!looksLikeTime) {
        await botReply(`What time works — like 7pm, dinner time, or a specific hour?`, 600);
        return;
      }
      state.data.time = t;
      state.step = 'name';
      await botReply(`Perfect. Last thing — can I get your name for the reservation?`, 750);
      return;
    }

    if (state.step === 'name') {
      if (t.length < 2 || /^\d+$/.test(t)) {
        await botReply("Could you type your name for the reservation?", 700);
        return;
      }
      state.data.name = t;
      state.step = 'phone';
      await botReply(`Thanks, ${t}! And what's the best phone number to reach you?`, 750);
      return;
    }

    if (state.step === 'phone') {
      const digits = t.replace(/\D/g, '');
      if (digits.length < 10) {
        await botReply("Could you double-check that number? We want to make sure we can confirm your reservation.", 700);
        return;
      }
      state.data.phone = digits;
      finalizeLead('reservation');
      const msg = C.lead_captured_message.replace('{name}', state.data.name);
      await botReply(`${msg} We'll confirm your table for ${state.data.party_size} on ${state.data.date} at ${state.data.time}. Is there anything else — dietary needs, a special occasion we should know about?`, 1000);
      state.flow = 'done';
      return;
    }
  }

  // ─── Flow: Event / Catering Lead (event type → date → size → name → phone) ───
  async function startEventFlow() {
    state.flow = 'event_lead';
    state.step = 'event_type';
    state.data = {};
    await botReply(`We'd love to host you! Is this a birthday, anniversary, corporate event, or something else?`, 800);
  }

  async function advanceEvent(text) {
    const t = text.trim();

    if (state.step === 'event_type') {
      state.data.event_type = t;
      state.step = 'date';
      await botReply(`A ${t} — wonderful! What date are you looking at?`, 750);
      return;
    }

    if (state.step === 'date') {
      state.data.date = t;
      state.step = 'size';
      await botReply(`Got it. How many guests are you expecting?`, 700);
      return;
    }

    if (state.step === 'size') {
      state.data.size = t;
      state.step = 'name';
      const roomNote = parseInt(t) <= 40
        ? `Our private room fits up to 40 — that sounds like a great fit.`
        : `For larger groups we can work with you on setup options.`;
      await botReply(`${roomNote} Can I get your name so we can follow up?`, 800);
      return;
    }

    if (state.step === 'name') {
      if (t.length < 2) {
        await botReply("Could you type your name again?", 700);
        return;
      }
      state.data.name = t;
      state.step = 'phone';
      await botReply(`Thanks, ${t}! What's the best number to reach you to discuss details?`, 750);
      return;
    }

    if (state.step === 'phone') {
      const digits = t.replace(/\D/g, '');
      if (digits.length < 10) {
        await botReply("Could you double-check that number?", 700);
        return;
      }
      state.data.phone = digits;
      finalizeLead('event_lead');
      await botReply(`You're all set, ${state.data.name}! Our events coordinator will call you within 24 hours to walk through the details and pricing. We can't wait to make it special. Anything else I can help with?`, 1100);
      state.flow = 'done';
      return;
    }
  }

  // ─── Flow: Generic Contact Capture (after hours / fallback) ──────────────────
  async function startContactCapture(preface) {
    state.flow = 'contact_capture';
    state.step = 'name';
    state.data = {};
    await botReply(preface || "Can I grab your name and number so our team can follow up?", 800);
  }

  async function advanceContact(text) {
    const t = text.trim();

    if (state.step === 'name') {
      if (t.length < 2 || /^\d+$/.test(t)) {
        await botReply("Just want to make sure I get your name right — could you type it again?", 700);
        return;
      }
      state.data.name = t;
      state.step = 'phone';
      await botReply(`Thanks, ${t}! What's the best number to reach you?`, 750);
      return;
    }

    if (state.step === 'phone') {
      const digits = t.replace(/\D/g, '');
      if (digits.length < 10) {
        await botReply("Could you double-check that number?", 700);
        return;
      }
      state.data.phone = digits;
      finalizeLead('contact_capture');
      await botReply(`Perfect, ${state.data.name}! Someone from Carmine's will reach out to you shortly. Is there anything else I can help with in the meantime?`, 900);
      state.flow = 'done';
      return;
    }
  }

  // ─── Lead Storage ─────────────────────────────────────────────────────────────
  function finalizeLead(source) {
    const lead = {
      ...state.data,
      source,
      business:  C.business_name,
      timestamp: new Date().toISOString(),
    };
    window.capturedLead = lead;
    console.log('[Lead Captured]', lead);
  }

  // ─── Main Router ──────────────────────────────────────────────────────────────
  async function processMessage(text) {
    input.disabled = true;

    // Active flows take priority
    if (state.flow === 'reservation') {
      await advanceReservation(text);
      input.disabled = false;
      input.focus();
      return;
    }

    if (state.flow === 'event_lead') {
      await advanceEvent(text);
      input.disabled = false;
      input.focus();
      return;
    }

    if (state.flow === 'contact_capture') {
      await advanceContact(text);
      input.disabled = false;
      input.focus();
      return;
    }

    // Intent routing
    const intent = detectIntent(text);

    // After hours — answer info questions normally; only block booking intent
    if (isAfterHours()) {
      const infoIntents = new Set(['menu','specials','dietary_vegan','dietary_gf','dietary_allergy','takeout','hours','location','wait_time','trust','kids','outdoor','pets','dress_code','gift_card']);
      if (!infoIntents.has(intent)) {
        await startContactCapture(C.after_hours_message);
        input.disabled = false;
        input.focus();
        return;
      }
    }

    switch (intent) {
      case 'reservation':
        await startReservationFlow(null);
        break;

      case 'dietary_vegan':
        await botReply(veganResponse(), 900);
        showQuickReplies(['Make a reservation', 'What\'s the special?', 'See full menu']);
        state.pendingReservation = true;
        break;

      case 'dietary_gf':
        await botReply(gfResponse(), 900);
        showQuickReplies(['Make a reservation', 'What\'s the special?']);
        state.pendingReservation = true;
        break;

      case 'dietary_allergy':
        await botReply(allergyResponse(), 850);
        showQuickReplies(['Make a reservation', 'What\'s good here?']);
        state.pendingReservation = true;
        break;

      case 'menu':
        await botReply(menuTopThree(), 950);
        showQuickReplies(['Make a reservation', 'What\'s the special?', 'Vegan options?']);
        state.pendingReservation = true;
        break;

      case 'specials':
        await botReply(specialsResponse(), 900);
        showQuickReplies(['Make a reservation', 'What\'s good here?']);
        break;

      case 'takeout':
        await botReply(takeoutResponse(), 900);
        break;

      case 'events':
        await startEventFlow();
        break;

      case 'wait_time':
        await botReply(waitTimeResponse(), 850);
        break;

      case 'trust':
        await botReply(trustResponse(), 900);
        break;

      case 'gift_card':
        await botReply(giftCardResponse(), 800);
        break;

      case 'hours':
        await botReply(hoursResponse(), 800);
        break;

      case 'location':
        await botReply(locationResponse(), 800);
        break;

      case 'kids':
        await botReply(kidsResponse(), 850);
        break;

      case 'outdoor':
        await botReply(outdoorResponse(), 850);
        break;

      case 'pets':
        await botReply(petsResponse(), 850);
        break;

      case 'dress_code':
        await botReply(dresscodeResponse(), 800);
        break;

      default:
        // Fallback — gently route toward reservation or menu
        await botReply(C.fallback_message, 850);
        break;
    }

    input.disabled = false;
    input.focus();
  }

  // ─── Handle yes/no after menu/dietary recommendations ────────────────────────
  // When a reservation flow is primed (step = party_size) but not yet started,
  // a "yes" response should kick it off cleanly.
  function isAffirmative(text) {
    return /^(yes|yeah|sure|ok|okay|yep|yup|absolutely|sounds good|let's go|let's do it|definitely|please)/i.test(text.trim());
  }

  // ─── Send ─────────────────────────────────────────────────────────────────────
  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    clearQuickReplies();
    appendMessage(text, 'user');

    // If we offered a reservation and user said yes, start the flow
    if (state.pendingReservation) {
      state.pendingReservation = false;
      if (isAffirmative(text)) {
        await startReservationFlow(null);
        input.disabled = false;
        input.focus();
        return;
      }
      // Not affirmative — fall through to normal intent routing below
    }

    await processMessage(text);
  }

  window.handleSend = handleSend;

  window.handleKey = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Toggle ──────────────────────────────────────────────────────────────────
  async function toggleChat() {
    state.open = !state.open;
    bubble.classList.toggle('open', state.open);
    chatWindow.classList.toggle('open', state.open);
    notifDot.style.display = 'none';

    if (state.open && !state.greeted) {
      state.greeted = true;
      setTimeout(() => input.focus(), 300);
      await botReply(C.greeting, 650);
      showQuickReplies(['What\'s good here?', 'Make a reservation', 'Vegan options?', 'Private events']);
    } else if (state.open) {
      input.focus();
    }
  }

  window.toggleChat = toggleChat;
  window.openChat   = async function () { if (!state.open) await toggleChat(); };

  // Show notification dot on load
  setTimeout(() => { notifDot.style.display = 'block'; }, 1500);

})();
