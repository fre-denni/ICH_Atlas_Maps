/**********************************************
 * Functional Script that handles the modal
 * -> manage graphic and content depending on visualisation
 ***********************************************/

document.addEventListener("DOMContentLoaded", function () {
  // Get the modal element (div, menu button, x,  and content)
  let modal = document.getElementById("legend-modal");
  let btn = document.getElementById("info");
  let span = document.getElementById("modal-close");

  //manage content of the modal
  let header = document.getElementById("modal-header");
  let body = document.getElementById("modal-body");

  // get csv table with content
  const content = "../data/content-modal.csv";

  // When the user clicks the button, open the modal and load content
  btn.onclick = function () {
    modal.style.display = "block";
    fetchCSV(); //filter and apply data
  };

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // detect page
  function getPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop(); //determine name

    switch (page) {
      case "digitalisation-flux.html":
        return "Digitalisation Flux";
      case "creative-approaches.html":
        return "Creative Approach";
      case "competences-map.html":
        return "Competences Map";
      case "comparisons-tool.html":
        return "Comparison Tool";
      default:
        return null;
    }
  }

  //take the correct content
  function fetchCSV() {
    const k = getPage();
    if (!k) {
      console.error("Not getting any viz, fam");
      return;
    }

    fetch(content) //get the content from url
      .then((response) => response.text())
      .then((csvText) => {
        const rows = csvText.trim().split("\n");

        header.innerHTML = "";
        body.innerHTML = "";

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];

          // This regex safely splits the row by commas, ignoring commas within quotes
          const columns = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

          const visualisation = columns[0].trim().replace(/"/g, "");
          const headerTxt = columns[1].trim().replace(/"/g, "");
          const bodyTxt = columns[2].trim().replace(/"/g, "");

          if (visualisation === k) {
            header.innerHTML = `<h2>${headerTxt}</h2>`;
            body.innerHTML = `<p>${bodyTxt}</p>`;
            break;
          }
        }
      })
      .catch((error) => console.error("CSV problem: ", error));
  }
});
