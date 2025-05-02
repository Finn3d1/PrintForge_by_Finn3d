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