const canvas = document.getElementById("websiteCanvas");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatLog = document.getElementById("chatLog");
const resetButton = document.getElementById("resetButton");
const exportButton = document.getElementById("exportButton");
const previewModeButton = document.getElementById("previewModeButton");

const STORAGE_KEY = "minimal-chat-builder-state-v1";

let state = loadState();
let history = [];

function defaultState() {
  return {
    theme: {
      accent: "#111827",
      canvasBg: "#ffffff",
      canvasText: "#111827",
      canvasMuted: "#6b7280",
      canvasCard: "#f9fafb",
      radius: "28px"
    },
    sections: []
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState();
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function pushHistory() {
  history.push(JSON.stringify(state));
  if (history.length > 20) history.shift();
}

function undo() {
  const last = history.pop();
  if (!last) return "Es gibt noch nichts zum Rückgängig machen.";
  state = JSON.parse(last);
  saveState();
  render();
  return "Die letzte Änderung wurde rückgängig gemacht.";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripQuotes(value) {
  return value
    .trim()
    .replace(/^["'„“]/, "")
    .replace(/["'”]$/, "")
    .trim();
}

function titleCaseTopic(topic) {
  const clean = stripQuotes(topic)
    .replace(/[.!?]$/, "")
    .trim();

  if (!clean) return "Deine neue Website";

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function render() {
  document.documentElement.style.setProperty("--accent", state.theme.accent);
  document.documentElement.style.setProperty("--canvas-bg", state.theme.canvasBg);
  document.documentElement.style.setProperty("--canvas-text", state.theme.canvasText);
  document.documentElement.style.setProperty("--canvas-muted", state.theme.canvasMuted);
  document.documentElement.style.setProperty("--canvas-card", state.theme.canvasCard);
  document.documentElement.style.setProperty("--radius", state.theme.radius);

  if (!state.sections.length) {
    canvas.classList.add("empty");
    canvas.innerHTML = `
      <div class="empty-state">
        <p class="small-label">Leerer Canvas</p>
        <h1>Gestalte diese Website per Chat.</h1>
        <p>
          Schreib rechts zum Beispiel:
          <br />
          <strong>„Mach eine Landingpage für ein KI-Automationsstudio“</strong>
        </p>
      </div>
    `;
    return;
  }

  canvas.classList.remove("empty");
  canvas.innerHTML = state.sections.map(renderSection).join("");
}

function renderSection(section) {
  if (section.type === "hero") {
    return `
      <section class="site-section site-hero">
        <p class="small-label">${escapeHtml(section.label || "Neu")}</p>
        <h1>${escapeHtml(section.title)}</h1>
        <p>${escapeHtml(section.text)}</p>
        <a class="site-button" href="#">${escapeHtml(section.button || "Loslegen")}</a>
      </section>
    `;
  }

  if (section.type === "text") {
    return `
      <section class="site-section">
        <h2>${escapeHtml(section.title)}</h2>
        <p>${escapeHtml(section.text)}</p>
      </section>
    `;
  }

  if (section.type === "cards") {
    return `
      <section class="site-section">
        <h2>${escapeHtml(section.title)}</h2>
        <div class="card-grid">
          ${section.cards.map(card => `
            <article class="builder-card">
              <h3>${escapeHtml(card.title)}</h3>
              <p>${escapeHtml(card.text)}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (section.type === "contact") {
    return `
      <section class="site-section">
        <div class="contact-box">
          <p class="small-label" style="color: rgba(255,255,255,.7)">Kontakt</p>
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.text)}</p>
          <a class="site-button" style="background:white;color:var(--accent)" href="mailto:hallo@example.com">
            ${escapeHtml(section.button)}
          </a>
        </div>
      </section>
    `;
  }

  return "";
}

function addMessage(role, text) {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  message.innerHTML = `<p>${escapeHtml(text)}</p>`;
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function applyPrompt(prompt) {
  const lower = prompt.toLowerCase().trim();

  if (lower.includes("rückgängig") || lower.includes("undo")) {
    return undo();
  }

  if (
    lower.includes("leere") ||
    lower.includes("neu starten") ||
    lower.includes("zurücksetzen") ||
    lower === "reset"
  ) {
    pushHistory();
    state = defaultState();
    saveState();
    render();
    return "Alles klar. Die Website ist wieder leer.";
  }

  pushHistory();

  const messages = [];

  if (lower.includes("dunkel") || lower.includes("dark")) {
    state.theme.canvasBg = "#0f172a";
    state.theme.canvasText = "#f8fafc";
    state.theme.canvasMuted = "#cbd5e1";
    state.theme.canvasCard = "#111827";
    state.theme.accent = "#8b5cf6";
    messages.push("Dark-Design aktiviert");
  }

  if (lower.includes("hell") || lower.includes("weiß") || lower.includes("weiss")) {
    state.theme.canvasBg = "#ffffff";
    state.theme.canvasText = "#111827";
    state.theme.canvasMuted = "#6b7280";
    state.theme.canvasCard = "#f9fafb";
    messages.push("Helles Design aktiviert");
  }

  const colorMap = [
    ["lila", "#7c3aed"],
    ["violett", "#7c3aed"],
    ["blau", "#2563eb"],
    ["grün", "#16a34a"],
    ["gruen", "#16a34a"],
    ["rot", "#dc2626"],
    ["orange", "#f97316"],
    ["pink", "#db2777"],
    ["schwarz", "#111827"],
    ["gelb", "#ca8a04"]
  ];

  for (const [name, hex] of colorMap) {
    if (lower.includes(name)) {
      state.theme.accent = hex;
      messages.push(`Akzentfarbe auf ${name} gesetzt`);
      break;
    }
  }

  const hexMatch = prompt.match(/#([0-9a-f]{6})/i);
  if (hexMatch) {
    state.theme.accent = `#${hexMatch[1]}`;
    messages.push("Akzentfarbe per Hex-Code gesetzt");
  }

  if (lower.includes("runde ecken") || lower.includes("abgerundet")) {
    state.theme.radius = "34px";
    messages.push("Runde Ecken verstärkt");
  }

  if (lower.includes("kantig") || lower.includes("eckig")) {
    state.theme.radius = "8px";
    messages.push("Ecken kantiger gemacht");
  }

  const titleMatch = prompt.match(/(?:ändere|aendere|setze|mach).*?(?:titel|überschrift|headline).*?(?:zu|auf|:)\s*(.+)$/i);
  if (titleMatch) {
    const target = findLastSection(["hero", "text"]);
    if (target) {
      target.title = stripQuotes(titleMatch[1]);
      messages.push("Titel geändert");
    }
  }

  const buttonMatch = prompt.match(/(?:button|cta).*?(?:zu|auf|:)\s*(.+)$/i);
  if (buttonMatch) {
    const hero = findLastSection(["hero", "contact"]);
    if (hero) {
      hero.button = stripQuotes(buttonMatch[1]);
      messages.push("Button geändert");
    }
  }

  const landingMatch = prompt.match(/(?:landingpage|website|seite).*?(?:für|fuer|über|ueber)\s+(.+)$/i);
  if (
    landingMatch ||
    lower.includes("landingpage") ||
    lower.includes("komplette website")
  ) {
    const topic = landingMatch ? titleCaseTopic(landingMatch[1]) : "dein Projekt";

    state.sections = [
      {
        type: "hero",
        label: "Minimal Website",
        title: `${topic}, klar und modern präsentiert`,
        text: "Eine reduzierte, elegante Website mit Fokus auf das Wesentliche.",
        button: "Anfrage starten"
      },
      {
        type: "cards",
        title: "Was du bekommst",
        cards: [
          {
            title: "Klares Angebot",
            text: "Erkläre in wenigen Sekunden, was du anbietest."
          },
          {
            title: "Modernes Design",
            text: "Minimalistisch, schnell und responsiv."
          },
          {
            title: "Direkte Anfrage",
            text: "Besucher werden ohne Umwege zur Handlung geführt."
          }
        ]
      },
      {
        type: "contact",
        title: "Bereit für den nächsten Schritt?",
        text: "Schreib uns kurz, was du brauchst. Wir melden uns zeitnah.",
        button: "Kontakt aufnehmen"
      }
    ];

    messages.push("Eine komplette minimalistische Landingpage wurde erstellt");
  }

  const heroMatch = prompt.match(/hero.*?(?:titel|überschrift|headline).*?(?:zu|:)?\s*["“„']?(.+?)["”']?$/i);
  if (lower.includes("hero") && !messages.some(m => m.includes("Landingpage"))) {
    const title = heroMatch ? stripQuotes(heroMatch[1]) : "Dein starker erster Eindruck";
    state.sections.unshift({
      type: "hero",
      label: "Hero",
      title,
      text: "Beschreibe dein Angebot klar, knapp und überzeugend.",
      button: "Loslegen"
    });
    messages.push("Hero-Section hinzugefügt");
  }

  const cardsMatch = prompt.match(/(?:füge|fuege|erstelle|mach).*?(\d+).*?(?:karten|cards|leistungen)/i);
  if (cardsMatch || lower.includes("karten") || lower.includes("leistungen")) {
    const count = cardsMatch ? Math.min(Number(cardsMatch[1]), 6) : 3;
    const cards = Array.from({ length: count }, (_, index) => ({
      title: `Leistung ${index + 1}`,
      text: "Beschreibe hier kurz den Nutzen dieser Leistung."
    }));

    state.sections.push({
      type: "cards",
      title: "Leistungen",
      cards
    });

    messages.push(`${count} Karten hinzugefügt`);
  }

  const sectionMatch = prompt.match(/(?:füge|fuege|erstelle|mach).*?(?:abschnitt|sektion|section).*?(?:über|ueber|zu)\s+(.+)$/i);
  if (sectionMatch) {
    const topic = titleCaseTopic(sectionMatch[1]);
    state.sections.push({
      type: "text",
      title: topic,
      text: `Dieser Abschnitt erklärt ${topic.toLowerCase()} in klarer, minimalistischer Form.`
    });
    messages.push(`Abschnitt "${topic}" hinzugefügt`);
  }

  if (lower.includes("kontakt")) {
    state.sections.push({
      type: "contact",
      title: "Lass uns sprechen",
      text: "Schreib uns eine kurze Nachricht. Wir melden uns so schnell wie möglich.",
      button: "Kontakt aufnehmen"
    });
    messages.push("Kontaktbereich hinzugefügt");
  }

  if (!messages.length) {
    history.pop();
    return "Ich habe das noch nicht verstanden. Probiere z. B.: „Mach eine Landingpage für ein Café“, „Füge 3 Karten hinzu“ oder „Mach die Website dunkel“. ";
  }

  saveState();
  render();

  return messages.join(". ") + ".";
}

function findLastSection(types) {
  for (let i = state.sections.length - 1; i >= 0; i--) {
    if (types.includes(state.sections[i].type)) return state.sections[i];
  }
  return null;
}

function exportHtml() {
  const fullHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exportierte Website</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: ${state.theme.canvasBg};
      color: ${state.theme.canvasText};
    }
    :root {
      --accent: ${state.theme.accent};
      --canvas-muted: ${state.theme.canvasMuted};
      --canvas-card: ${state.theme.canvasCard};
      --radius: ${state.theme.radius};
    }
    .site-section { width: min(1120px, 90%); margin: 0 auto; padding: 76px 0; }
    .site-hero { min-height: 74vh; display: grid; align-content: center; }
    .site-hero h1, .site-section h2 { letter-spacing: -0.07em; line-height: 0.95; margin: 0; }
    .site-hero h1 { font-size: clamp(3rem, 8vw, 7rem); max-width: 900px; }
    .site-section h2 { font-size: clamp(2.2rem, 5vw, 4.4rem); max-width: 760px; }
    .site-section p, .site-hero p { color: var(--canvas-muted); font-size: 1.15rem; line-height: 1.7; max-width: 680px; }
    .small-label { color: var(--accent); font-size: .78rem; text-transform: uppercase; letter-spacing: .12em; font-weight: 900; }
    .site-button { display: inline-flex; margin-top: 22px; padding: 15px 24px; border-radius: 999px; background: var(--accent); color: white; text-decoration: none; font-weight: 900; }
    .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 28px; }
    .builder-card { background: var(--canvas-card); border-radius: var(--radius); padding: 26px; }
    .contact-box { background: var(--accent); color: white; border-radius: var(--radius); padding: 42px; }
    .contact-box p { color: rgba(255,255,255,.8); }
    @media (max-width: 850px) { .card-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
${state.sections.map(renderSection).join("\n")}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "meine-chat-website.html";
  link.click();
  URL.revokeObjectURL(url);
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = chatInput.value.trim();

  if (!prompt) return;

  addMessage("user", prompt);
  chatInput.value = "";

  const response = applyPrompt(prompt);
  addMessage("assistant", response);
});

document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    chatInput.value = button.dataset.prompt;
    chatInput.focus();
  });
});

resetButton.addEventListener("click", () => {
  addMessage("user", "Leere die Website");
  const response = applyPrompt("Leere die Website");
  addMessage("assistant", response);
});

exportButton.addEventListener("click", exportHtml);

previewModeButton.addEventListener("click", () => {
  document.body.classList.toggle("preview-only");
  canvas.classList.toggle("preview");
});

render();
