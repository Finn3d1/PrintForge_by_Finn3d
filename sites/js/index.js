
  function applyFilter() {
    const value = document.getElementById("filter").value;
    window.location.href = `/modells?sort=${value}`;
  }
