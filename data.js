/* =========================================================
   SHARED DATA
   Loaded by BOTH index.html and owner.html (each page includes
   this file before its own script). Because each page is a
   separate load, they get separate copies in memory — editing
   a haircut on owner.html won't appear on index.html until you
   refresh, and won't survive a refresh either. That's expected
   for now: this goes away once your Express + Supabase backend
   is the single source of truth both pages fetch from.
   ========================================================= */

const SERVICES = [
  { id: "cut",        name: "Classic cut",      price: 150, durationMins: 30 },
  { id: "fade",       name: "Skin fade",        price: 180, durationMins: 40 },
  { id: "beard",      name: "Beard trim",       price: 90,  durationMins: 20 },
  { id: "cut-beard",  name: "Cut + beard",      price: 220, durationMins: 50 },
  { id: "kids",       name: "Kids cut (u12)",   price: 100, durationMins: 25 },
];

const BARBERS = [
  { id: "thabo",  name: "Thabo",  specialty: "Fades & tapers" },
  { id: "sipho",  name: "Sipho",  specialty: "Classic cuts" },
  { id: "ayanda", name: "Ayanda", specialty: "Beard specialist" },
];

// Flat surcharge added when a customer picks "with dye".
const DYE_SURCHARGE = 80;

// Turns "Taper Fade" into "taper-fade" for use as an id.
function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
