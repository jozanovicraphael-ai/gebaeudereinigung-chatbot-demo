export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Nur POST erlaubt" });
  }

  try {
    const body = req.body;

    let userText = "";

    // 👉 egal ob message oder messages kommt
    if (body.message) {
      userText = body.message.toLowerCase();
    }

    if (Array.isArray(body.messages) && body.messages.length > 0) {
      userText = body.messages[body.messages.length - 1].content.toLowerCase();
    }

    let reply = "Danke für deine Anfrage!";

    if (!userText) {
      reply = "Bitte beschreibe dein Anliegen.";
    }

    if (userText.includes("glas")) {
      reply = "Gerne! Wie groß sind die Glasflächen und wo befinden sie sich?";
    }

    if (userText.includes("preis")) {
      reply = "Unsere Preise hängen von Fläche und Aufwand ab. Möchtest du ein Angebot?";
    }

    if (userText.includes("termin")) {
      reply = "Wann soll die Reinigung stattfinden?";
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(200).json({
      reply: "Technischer Fehler, bitte später erneut versuchen."
    });
  }
}
