/* =========================================================
   BOOKING PAGE LOGIC
   SERVICES, BARBERS, DYE_SURCHARGE, and slugify() come from
   data.js, loaded before this file in index.html. The owner's
   login and management panel now live on their own page —
   see owner.html and owner.js.
   ========================================================= */

const OPENING_HOUR = 9;   // 09:00
const CLOSING_HOUR = 18;  // 18:00 (last slot starts before this)
const SLOT_STEP_MINS = 30;

// In-memory list of today's confirmed bookings.
// This resets on page reload — real persistence comes later
// once the booking is written to Postgres via your API route.
const bookings = [];

/* =========================================================
   RENDER: services list
   ========================================================= */
function renderServices() {
  const list = document.getElementById("service-list");
  const select = document.getElementById("service");

  list.innerHTML = SERVICES.map(service => `
    <li class="service-item">
      <h3>${service.name}</h3>
      <div class="service-price">R${service.price}</div>
    </li>
  `).join("");

  select.innerHTML = SERVICES.map(service =>
    `<option value="${service.id}">${service.name} — R${service.price}</option>`
  ).join("") + `<option value="other">Other (upload your own)</option>`;
}

/* =========================================================
   RENDER: barber dropdown (booking form)
   ========================================================= */
function renderBarbers() {
  const select = document.getElementById("barber");
  if (!select) return;

  if (BARBERS.length === 0) {
    select.innerHTML = `<option value="">No barbers available</option>`;
    return;
  }

  select.innerHTML = BARBERS.map(barber =>
    `<option value="${barber.name}">${barber.name} — ${barber.specialty}</option>`
  ).join("");
}

/* =========================================================
   RENDER: time slot options
   Builds a dropdown of 30-min slots between opening/closing.
   ========================================================= */
function renderTimeSlots() {
  const select = document.getElementById("time");
  const options = [];

  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
    for (let min = 0; min < 60; min += SLOT_STEP_MINS) {
      const hh = String(hour).padStart(2, "0");
      const mm = String(min).padStart(2, "0");
      options.push(`${hh}:${mm}`);
    }
  }

  select.innerHTML = options
    .map(time => `<option value="${time}">${time}</option>`)
    .join("");
}

/* =========================================================
   RENDER: ticket rail
   ========================================================= */
function renderTickets() {
  const list = document.getElementById("ticket-list");
  const empty = document.getElementById("ticket-empty");

  if (bookings.length === 0) {
    list.innerHTML = "";
    list.appendChild(empty);
    return;
  }

  list.innerHTML = bookings.map(b => {
    const details = b.price === null
      ? `Custom cut · photo: ${b.photoName}`
      : `${b.dye ? "With dye" : "No dye"} · R${b.price}`;

    return `
      <li class="ticket">
        <strong>${b.serviceName} · ${b.barber}</strong>
        <span>${b.name} — ${b.date} at ${b.time}</span>
        <span>${details}</span>
      </li>
    `;
  }).join("");
}

/* =========================================================
   SERVICE SELECTION: dye toggle, "Other" upload, live price
   ========================================================= */
let selectedPhotoFile = null; // holds the File object when "Other" is chosen

function updateBookingPreview() {
  const serviceId = document.getElementById("service").value;
  const dyeField = document.getElementById("dye-field");
  const otherField = document.getElementById("other-field");
  const priceValue = document.getElementById("price-value");

  if (serviceId === "other") {
    dyeField.hidden = true;
    otherField.hidden = false;
    priceValue.textContent = "Custom quote";
    return;
  }

  otherField.hidden = true;
  dyeField.hidden = false;

  const service = SERVICES.find(s => s.id === serviceId);
  const dyeChosen = document.querySelector('input[name="dye"]:checked').value === "yes";
  const price = service.price + (dyeChosen ? DYE_SURCHARGE : 0);

  priceValue.textContent = `R${price}`;
}

function handlePhotoChange(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("photo-preview");

  selectedPhotoFile = file || null;
  preview.innerHTML = "";

  if (file) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = "Reference haircut photo";
    preview.appendChild(img);
  }
}

/* =========================================================
   FORM HANDLING
   ========================================================= */
function setMinDateToday() {
  const dateInput = document.getElementById("date");
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;
  dateInput.value = today;
}

function isSlotTaken(barber, date, time) {
  return bookings.some(b => b.barber === barber && b.date === date && b.time === time);
}

function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const note = document.getElementById("form-note");

  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const serviceId = form.service.value;
  const barber = form.barber.value;
  const date = form.date.value;
  const time = form.time.value;

  if (!name || !phone || !date || !time) {
    note.textContent = "Please fill in every field before confirming.";
    return;
  }

  if (isSlotTaken(barber, date, time)) {
    note.textContent = `${barber} is already booked at ${time} on ${date}. Pick another slot.`;
    return;
  }

  let booking;

  if (serviceId === "other") {
    // Custom cut path: no fixed service, no price — needs a reference photo instead.
    if (!selectedPhotoFile) {
      note.textContent = "Please upload a reference photo for a custom cut.";
      return;
    }

    booking = {
      name,
      phone,
      serviceName: "Custom (see photo)",
      dye: false,
      price: null,
      photoName: selectedPhotoFile.name,
      barber,
      date,
      time,
    };
  } else {
    // Standard menu path: price depends on the dye radio choice.
    const service = SERVICES.find(s => s.id === serviceId);
    const dyeChosen = document.querySelector('input[name="dye"]:checked').value === "yes";
    const price = service.price + (dyeChosen ? DYE_SURCHARGE : 0);

    booking = {
      name,
      phone,
      serviceName: service.name,
      dye: dyeChosen,
      price,
      photoName: null,
      barber,
      date,
      time,
    };
  }

  bookings.push(booking);
  renderTickets();

  const priceText = booking.price === null ? "custom quote pending" : `R${booking.price}`;
  note.textContent = `Booked! ${booking.serviceName} (${priceText}) with ${barber} on ${date} at ${time}.`;

  form.reset();
  setMinDateToday();
  selectedPhotoFile = null;
  document.getElementById("photo-preview").innerHTML = "";
  updateBookingPreview();

  // ---------------------------------------------------------
  // BACKEND STUB — uncomment once your Express API exists.
  // This is the fetch call that will replace the in-memory
  // `bookings` array above with a real POST to your server,
  // which then inserts the row into Supabase.
  //
  // Note: `photoName` above is just the filename. To actually
  // store the uploaded image, you'll want Supabase Storage —
  // upload the file there first, then save the returned URL
  // as part of the booking row, rather than the raw file.
  // ---------------------------------------------------------
  // fetch("/api/bookings", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(booking),
  // })
  //   .then(res => res.json())
  //   .then(data => console.log("Saved booking:", data))
  //   .catch(err => console.error("Booking failed:", err));
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  renderServices();
  renderBarbers();
  renderTimeSlots();
  renderTickets();
  setMinDateToday();

  document.getElementById("dye-surcharge-label").textContent = `(+R${DYE_SURCHARGE})`;

  document.getElementById("service").addEventListener("change", updateBookingPreview);
  document.querySelectorAll('input[name="dye"]').forEach(radio =>
    radio.addEventListener("change", updateBookingPreview)
  );
  document.getElementById("reference-photo").addEventListener("change", handlePhotoChange);
  updateBookingPreview(); // set the initial price once services are loaded

  document.getElementById("booking-form").addEventListener("submit", handleSubmit);
});