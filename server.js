import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();

// Basis-Middleware
app.use(cors());
app.use(express.json());

// ➜ Statische Dateien aus dem Ordner laden (index.html, frontend etc.)
app.use(express.static("."));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Gebäudereinigungs-Systemprompt inkl. interner Zusammenfassung
const SYSTEM_PROMPT = `Du bist ein professioneller KI-Assistent für ein Gebäudereinigungsunternehmen. Deine Aufgabe ist es, automatisch Reinigungsanfragen aufzunehmen, Objektgrößen zu ermitteln, Reinigungsarten abzufragen, Terminwünsche oder Angebotsanforderungen zu registrieren und alle relevanten Daten professionell aufzubereiten.

Ziele:
1. Reinigungsart identifizieren
2. Fläche, Objektinfos & Besonderheiten abfragen
3. Terminwünsche aufnehmen
4. Name, Adresse, Telefonnummer & E-Mail erfassen
5. Angebotszusammenfassung erstellen

Dienstleistungen:
• Unterhaltsreinigung
• Glas- & Fensterreinigung
• Büroreinigung
• Treppenhausreinigung
• Grundreinigung
• Baureinigung
• Teppichreinigung
• Fassadenreinigung
• Außenanlagenreinigung (ohne Winterdienst)

Abzufragende Details:
• Fläche (m²)
• Objektart
• Besonderheiten
• Termin- oder Angebotswunsch

Terminverfügbarkeit:
Montag–Freitag 08:00–18:00
Samstag 09:00–14:00
Sonntag geschlossen

Am Ende der Konversation, wenn alle relevanten Daten vorliegen (Reinigungsart, Objekt/Fläche, Besonderheiten, Terminwunsch, Kontaktdaten), gehe bitte wie folgt vor:

1. Gib dem Kunden eine kurze Bestätigung wie z. B.:
"Ihre Reinigungsanfrage wurde aufgenommen. Wir melden uns so schnell wie möglich mit einem Angebot bei Ihnen."

2. Gib zusätzlich am Ende eine separate interne Zeile für das Unternehmen aus, die NICHT für den Kunden bestimmt ist, mit folgendem Format (wichtig, genau so):

INTERNE_ZUSAMMENFASSUNG:
Neue Gebäudereinigungs-Anfrage:
- Reinigungsart: ...
- Objekt/Fläche: ...
- Besonderheiten: ...
- Terminwunsch: ...
- Name: ...
- Telefon: ...
- E-Mail: ...

Schreibe diese Zeile immer auf Deutsch.`;

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const COMPANY_EMAIL = process.env.COMPANY_EMAIL || "nabutulu@denipl.net";
const FROM_EMAIL = process.env.FROM_EMAIL || "anfrage-bot@ihre-domain.de";

async function sendSummaryEmail(summaryText) {
  if (!COMPANY_EMAIL) return;
  await transporter.sendMail({
    from: FROM_EMAIL,
    to: COMPANY_EMAIL,
    subject: "Neue Gebäudereinigungs-Anfrage",
    text: summaryText
  });
}

// Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(messages) ? messages : [])
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: fullMessages,
      temperature: 0.3
    });

    const reply = completion.choices?.[0]?.message?.content || "";

    // Interne Zusammenfassung für E-Mail extrahieren
    const marker = "INTERNE_ZUSAMMENFASSUNG:";
    if (reply.includes(marker)) {
      const summary = reply.substring(reply.indexOf(marker) + marker.length).trim();
      sendSummaryEmail(summary).catch(err => {
        console.error("Fehler beim Senden der Zusammenfassungs-Mail:", err);
      });
    }

    res.json({ reply });
  } catch (err) {
    console.error("Chat-Error:", err);
    res.status(500).json({ error: "Fehler bei der KI-Antwort" });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Gebäudereinigung Chatbot Backend läuft auf Port " + PORT);
});
