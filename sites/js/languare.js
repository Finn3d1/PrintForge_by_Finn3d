document.addEventListener("DOMContentLoaded", () => {
    const langSelect = document.getElementById("lang");

    // Sprache aus localStorage übernehmen
    if (localStorage.getItem("language") !== null) {
        langSelect.selectedIndex = localStorage.getItem("language");
    }

    // Sprache direkt beim Laden anwenden
    setLanguage();

    // Sprache bei Änderung speichern und anwenden
    langSelect.addEventListener("change", () => {
        localStorage.setItem("language", langSelect.selectedIndex);
        setLanguage();
    });
});

function setLanguage() {
    const selectedIndex = document.getElementById("lang").selectedIndex;

    if (selectedIndex === 0) {
        // Deutsch
        setText("efm", "Beste Modelle");
        setText("home", "Home");
        setText("comunity", "Community");
        setText("modells", "Modele");
        setText("Hello", "Willkommen zu PrintCloud");
        setText("Hello2", "Die beste Seite für 3D-Druck-Modelle");
        setText("Explorebutton", "Entdecke Modelle");
        setText("newmodells", "Neueste Modelle");
    } else if (selectedIndex === 1) {
        // Englisch
        setText("efm", "Featured Models");
        setText("home", "Home");
        setText("comunity", "Community");
        setText("modells", "Models");
        setText("Hello", "Welcome to PrintCloud");
        setText("Hello2", "The best site for 3D printing models");
        setText("Explorebutton", "Explore Models");
        setText("newmodells", "New Models");
    }
}

// Hilfsfunktion um Text sicher zu setzen
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = text;
    }
}