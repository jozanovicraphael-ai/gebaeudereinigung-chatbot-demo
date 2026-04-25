export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { message } = req.body;

  let reply = "Danke für deine Anfrage! Wir melden uns.";

  if (!message) {
    reply = "Bitte beschreibe dein Anliegen.";
  }

  if (message.toLowerCase().includes("glas")) {
    reply = "Gerne! Wie groß sind die Glasflächen und wo befinden sie sich?";
  }

  if (message.toLowerCase().includes("preis")) {
    reply = "Unsere Preise hängen von Fläche und Aufwand ab. Möchtest du ein Angebot?";
  }

  if (message.toLowerCase().includes("termin")) {
    reply = "Wann soll die Reinigung stattfinden?";
  }

  res.status(200).json({ reply });
}
