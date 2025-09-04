/**********************************************
 * Functional Script that handles the menu
 * -> search and query of results (highlighting elements) -- trigger with d3?
 * -> open and close modal window
 * -> open to the website of the project
 ***********************************************/

// search dataset function (triggered on main code)

// Show labels and content modal on menu elements

// download dataset when activated (triggered on main code)

// check if it is in iframe and hide "more" checkbox
function checkIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

if (checkIframe()) {
  //element to not display when in <iframe>
  document.getElementById("prova").style.display = "none";

  //Opzione 2: aggiungi a tutti gli elementi un "in-an-iframe"
  //class e rendi il default "display none" con CSS se JS fallisce
}
