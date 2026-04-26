export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ reply: "API funktioniert!" });
  }

  try {
    const body = req.body || {};

    let text = "";

    if (body.message) {
      text = body.message.toLowerCase();
    }

    if (Array.isArray(body.messages) && body.messages.length > 0) {
      text = body.messages[body.messages.length - 1].content.toLowerCase();
    }

    let reply = "Danke für deine Anfrage!";

    if (!text) {
      reply = "Bitte beschreibe dein Anliegen.";
    }

    if (text.includes("glas")) {
      reply = "Gerne! Wie groß sind die Glasflächen?";
    }

    if (text.includes("preis")) {
      reply = "Die Preise hängen von Fläche und Aufwand ab.";
    }

    if (text.includes("termin")) {
      reply = "Wann soll die Reinigung stattfinden?";
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error(err);
    return res.status(200).json({
      reply: "Server läuft, aber Fehler intern."
    });
  }
}
