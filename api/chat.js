export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  try {
    const { messages } = req.body;

    let lastMessage = "";

    if (Array.isArray(messages) && messages.length > 0) {
      lastMessage = messages[messages.length - 1].content.toLowerCase();
    }

    let reply = "Danke für deine Anfrage! Wir melden uns.";

    if (!lastMessage) {
      reply = "Bitte beschreibe dein Anliegen.";
    }

    if (lastMessage.includes("glas")) {
      reply = "Gerne! Wie groß sind die Glasflächen und wo befinden sie sich?";
    }

    if (lastMessage.includes("preis")) {
      reply = "Unsere Preise hängen von Fläche und Aufwand ab. Möchtest du ein Angebot?";
    }

    if (lastMessage.includes("termin")) {
      reply = "Wann soll die Reinigung stattfinden?";
    }

    res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Serverfehler." });
  }
}
