/**********************************************
 * Functional Script that handles the graphic modal
 * -> manages responsive image loading based on page
 ***********************************************/

document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const modal = document.getElementById("legend-modal");
  const btn = document.getElementById("info-btn");
  const span = document.getElementById("modal-close");
  const modalImg = document.getElementById("modal-img");

  // Base path for images
  const basePath = "../assets/img/";

  // --- 1. CONFIGURAZIONE IMMAGINI ---
  // Mappa il nome della pagina al file immagine corrispondente
  function getImageNameByPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop(); // estrae nomefile.html

    switch (page) {
      case "digitalisation-flux.html":
        return "Dig_Flux_legend.png";
      case "creative-approaches.html":
        return "Creative_Tact_legend.png";
      case "competences-map.html":
        return "Tech_and_skill_legend.png";
      case "comparisons-tool.html":
        return "Comp_tool_legend.png";
      default:
        return "Ecosystems_legend.png"; // Fallback
    }
  }

  // Funzione per aprire la modale e caricare l'immagine
  function openModal() {
    const imgName = getImageNameByPage();
    modalImg.src = basePath + imgName;

    modal.style.display = "block";

    // Aggiorna stato bottone (opzionale se usato come toggle)
    if (btn) btn.checked = true;
  }

  // --- EVENT LISTENERS ---

  // Click sul bottone Info
  if (btn) {
    btn.onclick = function () {
      openModal();
    };
  }

  // Click sulla X per chiudere
  if (span) {
    span.onclick = function () {
      modal.style.display = "none";
      if (btn) btn.checked = false;
    };
  }

  // Click fuori dalla modale per chiudere
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      if (btn) btn.checked = false;
    }
  };

  // --- AUTO-OPEN LOGIC ---
  // Apre la modale automaticamente al caricamento della pagina
  // Usiamo un timeout per coordinarci (o confliggere meno) con il menu
  setTimeout(() => {
    openModal();
  }, 500); // Ritardo di 1 secondo
});
