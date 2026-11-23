export const TOWNS = [
  "Alle Dorpe",
  "Kuboes",
  "Lekkersing",
  "Eksteenfontein",
  "Sanddrift",
  "Port Nolloth",
  "Alexanderbaai",
  "Sendelingsdrif",
];

export const CATEGORIES = [
  { id: "all", label: "Alle Kategorieë", icon: "Grid" },
  { id: "kos_bakkery", label: "Kos & Bakkery", icon: "UtensilsCrossed" },
  { id: "ambag_bou", label: "Ambagsmanne & Bouwerk", icon: "Hammer" },
  { id: "vervoer", label: "Bakkie Vervoer & Vragte", icon: "Truck" },
  { id: "toerisme_gidse", label: "Toerisme & 4x4 Gidse", icon: "Compass" },
  { id: "handwerk_kuns", label: "Tradisionele Nama Handwerk", icon: "Palette" },
  { id: "landbou_vars", label: "Vars Seekos & Plaasprodukte", icon: "Fish" },
  { id: "meganies_sonkrag", label: "Sonkrag & Meganies", icon: "Sun" },
  { id: "skoonheid_klerasie", label: "Skoonheid & Klerasie", icon: "Scissors" },
  { id: "ander", label: "Ander Plaaslike Dienste", icon: "Briefcase" },
];

export const MARKETPLACE_CATEGORIES = [
  { id: "all", label: "Alle Items" },
  { id: "vee_diere", label: "Vee & Plaasdiere" },
  { id: "voertuie", label: "Bakkies & Onderdele" },
  { id: "gereedskap", label: "Gereedskap & Toerusting" },
  { id: "kos_vars", label: "Vars Kos & Vrugte" },
  { id: "meubels_huis", label: "Huis & Meubels" },
  { id: "dienste", label: "Plaaslike Dienste" },
  { id: "ander", label: "Ander" },
];

export function getWhatsAppLink(phone: string, businessName: string, ownerName?: string, lang: "af" | "en" = "af") {
  let clean = phone.replace(/[^0-9]/g, "");
  if (clean.startsWith("0")) {
    clean = "27" + clean.substring(1);
  } else if (!clean.startsWith("27")) {
    clean = "27" + clean;
  }

  const greeting = lang === "af"
    ? `Goeiedag ${ownerName ? ownerName : ""}, ek het jou besigheid '${businessName}' op die Richtersveld Gemeenskapsapp gesien. Kan jy my asseblief help met meer inligting / beskikbaarheid? Baie dankie!`
    : `Hello ${ownerName ? ownerName : ""}, I saw your business '${businessName}' on the Richtersveld Community App. Could you please assist me with more information / availability? Thank you!`;

  return `https://wa.me/${clean}?text=${encodeURIComponent(greeting.trim())}`;
}

export function getMarketplaceWhatsAppLink(phone: string, itemTitle: string, sellerName: string, lang: "af" | "en" = "af") {
  let clean = phone.replace(/[^0-9]/g, "");
  if (clean.startsWith("0")) {
    clean = "27" + clean.substring(1);
  } else if (!clean.startsWith("27")) {
    clean = "27" + clean;
  }

  const message = lang === "af"
    ? `Hallo ${sellerName}, ek stel belang in jou advertensie vir '${itemTitle}' op die Richtersveld Markplein. Is dit nog beskikbaar?`
    : `Hello ${sellerName}, I am interested in your listing '${itemTitle}' on the Richtersveld Marketplace. Is it still available?`;

  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function getRideWhatsAppLink(phone: string, ride: { origin: string; destination: string; driverName: string }, lang: "af" | "en" = "af") {
  let clean = phone.replace(/[^0-9]/g, "");
  if (clean.startsWith("0")) {
    clean = "27" + clean.substring(1);
  } else if (!clean.startsWith("27")) {
    clean = "27" + clean;
  }

  const message = lang === "af"
    ? `Hallo ${ride.driverName}, ek stel belang in jou saamry-rit van ${ride.origin} na ${ride.destination} op die Richtersveld App. Is daar nog 'n sitplek beskikbaar?`
    : `Hello ${ride.driverName}, I am interested in your ride from ${ride.origin} to ${ride.destination} on the Richtersveld App. Is a seat still available?`;

  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
