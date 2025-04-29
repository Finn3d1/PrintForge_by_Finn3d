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
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
