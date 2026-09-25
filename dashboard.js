/* =========================================================
   DASHBOARD — add/edit/remove haircuts and barbers
   SERVICES, BARBERS, and slugify() come from data.js, loaded
   before this file. Nothing here checks who's logged in — see
   the note in owner.js and at the top of dashboard.html.
   ========================================================= */

/* ---- MANAGE HAIRCUTS ---- */
function renderOwnerServiceList() {
  const list = document.getElementById("owner-service-list");

  if (SERVICES.length === 0) {
    list.innerHTML = `<li class="manage-empty">No haircuts on the menu — add one above.</li>`;
    return;
  }

  list.innerHTML = SERVICES.map(service => `
    <li class="manage-row" data-id="${service.id}">
      <span class="manage-row-name">${service.name}</span>
      <span class="manage-row-currency">R</span>
      <input type="number" class="manage-price-input" data-id="${service.id}" value="${service.price}" min="0" step="10">
      <button type="button" class="manage-remove btn btn-secondary" data-id="${service.id}">Remove</button>
    </li>
  `).join("");
}

function handleAddService(event) {
  event.preventDefault();

  const nameInput = document.getElementById("new-service-name");
  const priceInput = document.getElementById("new-service-price");
  const durationInput = document.getElementById("new-service-duration");
  const note = document.getElementById("owner-note");

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);
  const durationMins = Number(durationInput.value);

  if (!name || !price || !durationMins) {
    note.textContent = "Fill in a name, price, and duration.";
    return;
  }

  const id = slugify(name);

  if (SERVICES.some(s => s.id === id)) {
    note.textContent = `"${name}" already exists in the list.`;
    return;
  }

  SERVICES.push({ id, name, price, durationMins });
  renderOwnerServiceList();

  note.textContent = `Added "${name}" to the menu.`;
  event.target.reset();

  // ---------------------------------------------------------
  // BACKEND STUB — once your Express API + Supabase table for
  // services exist, replace the SERVICES.push() above with a
  // POST like this. index.html and dashboard.html would then
  // both load SERVICES from GET /api/services instead of data.js.
  // ---------------------------------------------------------
  // fetch("/api/services", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ name, price, durationMins }),
  // })
  //   .then(res => res.json())
  //   .then(saved => console.log("Service saved:", saved))
  //   .catch(err => console.error("Failed to save service:", err));
}

// Edit price: commit on change, not every keystroke.
document.addEventListener("change", (event) => {
  if (!event.target.classList.contains("manage-price-input")) return;
  const id = event.target.dataset.id;
  const newPrice = Number(event.target.value);
  const service = SERVICES.find(s => s.id === id);
  if (service && newPrice >= 0) {
    service.price = newPrice;
  }
});

// Remove a haircut.
document.addEventListener("click", (event) => {
  if (!event.target.classList.contains("manage-remove")) return;
  if (!event.target.closest("#owner-service-list")) return;

  const id = event.target.dataset.id;
  const index = SERVICES.findIndex(s => s.id === id);
  if (index !== -1) {
    SERVICES.splice(index, 1);
    renderOwnerServiceList();
  }
});

/* ---- MANAGE BARBERS ---- */
function renderOwnerBarberList() {
  const list = document.getElementById("owner-barber-list");

  if (BARBERS.length === 0) {
    list.innerHTML = `<li class="manage-empty">No barbers on the team — add one above.</li>`;
    return;
  }

  list.innerHTML = BARBERS.map(barber => `
    <li class="manage-row" data-id="${barber.id}">
      <span class="manage-row-name">${barber.name} — ${barber.specialty}</span>
      <button type="button" class="manage-remove btn btn-secondary" data-id="${barber.id}">Remove</button>
    </li>
  `).join("");
}

function handleAddBarber(event) {
  event.preventDefault();

  const nameInput = document.getElementById("new-barber-name");
  const specialtyInput = document.getElementById("new-barber-specialty");
  const note = document.getElementById("owner-barber-note");

  const name = nameInput.value.trim();
  const specialty = specialtyInput.value.trim() || "General cuts";

  if (!name) {
    note.textContent = "Enter a barber name.";
    return;
  }

  const id = slugify(name);
  if (BARBERS.some(b => b.id === id)) {
    note.textContent = `"${name}" is already on the team.`;
    return;
  }

  BARBERS.push({ id, name, specialty });
  renderOwnerBarberList();

  note.textContent = `Added ${name} to the team.`;
  event.target.reset();

  // BACKEND STUB — same pattern as services: once Supabase exists,
  // POST { name, specialty } to /api/barbers here instead of
  // pushing straight into the BARBERS array.
}

// Remove a barber.
document.addEventListener("click", (event) => {
  if (!event.target.classList.contains("manage-remove")) return;
  if (!event.target.closest("#owner-barber-list")) return;

  const id = event.target.dataset.id;
  const index = BARBERS.findIndex(b => b.id === id);
  if (index !== -1) {
    BARBERS.splice(index, 1);
    renderOwnerBarberList();
  }
});

/* ---- LOGOUT ---- */
function handleOwnerLogout() {
  // No real session to clear yet — this just sends you back to
  // the login page. Once Supabase Auth exists, this becomes
  // supabase.auth.signOut() before the redirect.
  window.location.href = "owner.html";
}

/* ---- INIT ---- */
document.addEventListener("DOMContentLoaded", () => {
  renderOwnerServiceList();
  renderOwnerBarberList();

  document.getElementById("owner-form").addEventListener("submit", handleAddService);
  document.getElementById("owner-barber-form").addEventListener("submit", handleAddBarber);
  document.getElementById("owner-logout").addEventListener("click", handleOwnerLogout);
});