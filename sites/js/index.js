window.switchToImageView = function(imageUrl) {
  document.getElementById('mainImage').src = imageUrl;
  document.getElementById('mainImage').style.display = 'block';
  document.getElementById('container3D').style.display = 'none';
  document.getElementById('modelSelect').style.display = 'none';

  const button = document.getElementById('toggleButton');
  if (button) button.innerText = '3D-Modell anzeigen';
};


function logout() {
  fetch('/logout', { method: 'POST' })
    .then(() => {
      localStorage.clear();
      window.location.href = "/";
    });
}
window.toggleMenu = function(menuId = 'menu') {
  const menu = document.getElementById(menuId);
  if (!menu) return;
  if (menu.style.display === "none" || menu.style.display === "") {
    menu.style.display = "block";
  } else {
    menu.style.display = "none";
  }
};

window.applyFilter = function() {
  const select = document.getElementById('filter');
  const sort = select.value;
  const params = new URLSearchParams(window.location.search);
  params.set('sort', sort);
  window.location.href = window.location.pathname + '?' + params.toString();
};

// Close profile and create menus when clicking outside
document.addEventListener('click', function(event) {
  const profileMenu = document.getElementById('menu');
  const profileButton = document.querySelector('.profile-button');
  if (profileMenu && profileMenu.style.display === 'block') {
    if (!profileMenu.contains(event.target) && !profileButton.contains(event.target)) {
      profileMenu.style.display = 'none';
    }
  }

  const createMenu = document.getElementById('createMenu');
  const createButton = document.querySelector('.create-button');
  if (createMenu && createMenu.style.display === 'block') {
    if (!createMenu.contains(event.target) && !createButton.contains(event.target)) {
      createMenu.style.display = 'none';
    }
  }
});