/**********************************************
 * Functional Script that handles the menu
 * -> search and query of results (highlighting elements) -- trigger with d3?
 * -> open and close modal window
 * -> open to the website of the project
 ***********************************************/

const menu = document.getElementById("menu");
const items = document.getElementsByClassName("menu-item");
const nav = document.getElementById("floating-nav");
const trigger = document.getElementById("trigger");
const download = document.getElementById("download");

//animations
menu.addEventListener("click", () => {
  nav.classList.toggle("is-open");
});

// download dataset when activated (triggered on main code)
function downloadData(filePath, fileName) {
  trigger.href = filePath;
  trigger.setAttribute("download", fileName);

  download.addEventListener("change", function () {
    if (this.checked) {
      trigger.click();
      console.log("download started...");
      this.checked = false;
    }
  });
}

// Search modal and code (to trigger in main code with the dataset)

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
  document.getElementById("label-more").style.display = "none";
  document.getElementById("label-search").style.display = "none";
  document.getElementById("download-btn").style.display = "none";
}
