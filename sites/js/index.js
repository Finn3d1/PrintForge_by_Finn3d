document.addEventListener("DOMContentLoaded", () => {
  const emailElement = document.getElementById("email");
  const pasElement = document.getElementById("pas");
  const userElement = document.getElementById("username");

  if (userElement) {
    const username = userElement.innerText;
    const email = emailElement.innerText;
    const pas = pasElement.innerText;

    // in localStorage speichern
    localStorage.setItem("username", username);
    localStorage.setItem("email", email);
    localStorage.setItem("password", pas);

    console.log("Gespeichert:");
    console.log(localStorage.getItem("username"));
    console.log(localStorage.getItem("email"));
    console.log(localStorage.getItem("password"));
  }

  const currentPath = window.location.pathname;

  // Autologin nur auf /
  if (currentPath === "/") {
    if (localStorage.getItem("email") && localStorage.getItem("password")) {
      const email = localStorage.getItem("email");
      const password = localStorage.getItem("password");

      // Unsichtbares Formular erstellen
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/index";

      const emailInput = document.createElement("input");
      emailInput.type = "hidden";
      emailInput.name = "email";
      emailInput.value = email;
      form.appendChild(emailInput);

      const passwordInput = document.createElement("input");
      passwordInput.type = "hidden";
      passwordInput.name = "password";
      passwordInput.value = password;
      form.appendChild(passwordInput);

      document.body.appendChild(form);

      // Formular absenden
      form.submit();
    }
  }
});
function logout() {
  // Session löschen
  fetch('/logout', { method: 'POST' })
    .then(() => {
      localStorage.clear();
      window.location.href = "/";
    });
}

function applyFilter() {
  const value = document.getElementById("filter").value;
  window.location.href = `/modells?sort=${value}`;
}