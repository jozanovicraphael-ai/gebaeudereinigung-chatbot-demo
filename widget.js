(function () {
  const currentScript = document.currentScript;
  const logoUrl = currentScript.getAttribute("data-logo") || "";
  const companyName = currentScript.getAttribute("data-company") || "Gebäudereinigung";

  // ✅ FIXED ENDPOINT
  const endpoint = "/api/chat";

  const btn = document.createElement("button");
  btn.id = "gr-widget-button";
  btn.innerText = "Anfrage starten";
  document.body.appendChild(btn);

  const widget = document.createElement("div");
  widget.id = "gr-widget-window";
  widget.style.display = "none";

  widget.innerHTML = `
    <div id="gr-widget-header">
      <div id="gr-widget-header-logo">
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo">` : `<span>🧹</span>`}
      </div>
      <div id="gr-widget-header-title">
        <span>${companyName}</span>
        <span>Gebäudereinigung • Anfrage-Chat</span>
      </div>
      <div id="gr-widget-close">&times;</div>
    </div>
    <div id="gr-widget-messages"></div>
    <div id="gr-widget-input">
      <input id="gr-input-field" type="text" placeholder="Ihre Nachricht..." />
      <button id="gr-send-btn">Senden</button>
    </div>
  `;

  document.body.appendChild(widget);

  const messagesEl = document.getElementById("gr-widget-messages");
  const inputEl = document.getElementById("gr-input-field");
  const sendBtn = document.getElementById("gr-send-btn");
  const closeBtn = document.getElementById("gr-widget-close");

  const conversation = [];

  function addMessage(text, sender = "bot") {
    const el = document.createElement("div");
    el.classList.add("gr-msg", sender === "bot" ? "gr-bot" : "gr-user");
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    conversation.push({
      role: sender === "bot" ? "assistant" : "user",
      content: text
    });
  }

  function startConversation() {
    messagesEl.innerHTML = "";
    conversation.length = 0;
    addMessage("Willkommen! Ich helfe Ihnen bei Ihrer Reinigungsanfrage. Um welche Art Reinigung geht es?", "bot");
  }

  btn.addEventListener("click", () => {
    const isOpen = widget.style.display === "flex";
    if (!isOpen) {
      widget.style.display = "flex";
      widget.style.flexDirection = "column";
      if (!messagesEl.innerHTML.trim()) {
        startConversation();
      }
    } else {
      widget.style.display = "none";
    }
  });

  closeBtn.addEventListener("click", () => {
    widget.style.display = "none";
  });

  sendBtn.addEventListener("click", handleSend);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });

  async function handleSend() {
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = "";
    addMessage(text, "user");

    const loadingMsg = document.createElement("div");
    loadingMsg.classList.add("gr-msg", "gr-bot");
    loadingMsg.textContent = "Einen Moment...";
    messagesEl.appendChild(loadingMsg);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text
        })
      });

      const data = await response.json();
      messagesEl.removeChild(loadingMsg);

      if (data.reply) {
        addMessage(data.reply, "bot");
      } else {
        addMessage("Fehler bei der Antwort.", "bot");
      }

    } catch (err) {
      console.error(err);
      messagesEl.removeChild(loadingMsg);
      addMessage("Server nicht erreichbar.", "bot");
    }
  }
})();
