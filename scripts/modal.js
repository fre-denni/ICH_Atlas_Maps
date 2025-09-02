/**********************************************
 * Functional Script that handles the modal
 * -> manage graphic and content depending on visualisation
 ***********************************************/

// Get the modal element (div, menu button, x,  and content)
let modal = document.getElementById("legend-modal");
let btn = document.getElementById("menu-legend");
let span = document.getElementById("modal-close");
let content = document.getElementById("modal-content");

// When the user clicks the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    console.log("cliccato fuori");
    modal.style.display = "none";
  }
};

//manage content of the modal
