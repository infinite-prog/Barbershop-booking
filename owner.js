/* =========================================================
   OWNER LOGIN — DEMO ONLY, NOT REAL SECURITY
   Checks the password against constants sitting right here in
   this file, which anyone can read via browser dev tools. On a
   match it just navigates to dashboard.html — it does not create
   a session, and dashboard.html does not check for one, so typing
   that page's address directly skips this login entirely.

   Real version (once your Express + Supabase backend exists):
     const { data, error } = await supabase.auth.signInWithPassword({
       email, password
     });
   Then dashboard.html would check supabase.auth.getSession() as
   the very first thing it does, redirecting back here if there's
   no valid session — that's what actually guards the page.
   ========================================================= */
const DEMO_OWNER_EMAIL = "owner@fadeandline.co.za";
const DEMO_OWNER_PASSWORD = "changeme123";

function handleOwnerLogin(event) {
  event.preventDefault();

  const email = document.getElementById("owner-email").value.trim();
  const password = document.getElementById("owner-password").value;
  const note = document.getElementById("owner-login-note");

  if (email === DEMO_OWNER_EMAIL && password === DEMO_OWNER_PASSWORD) {
    window.location.href = "dashboard.html";
  } else {
    note.textContent = "Incorrect email or password.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("owner-login-form").addEventListener("submit", handleOwnerLogin);
});