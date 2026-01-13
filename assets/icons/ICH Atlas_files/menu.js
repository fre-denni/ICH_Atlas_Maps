/**********************************************
 * Functional Script that handles the menu
 * -> search and query of results (highlighting elements) -- trigger with d3?
 * -> open and close modal window
 * -> open to the website of the project
 ***********************************************/

const nav = document.getElementById("floating-nav");
const menuBtn = document.getElementById("menu-btn");

const searchBtn = document.getElementById("search-btn");
const infoBtn = document.getElementById("info-btn");
const downloadBtnNav = document.getElementById("download-btn-nav");
const moreBtn = document.getElementById("more-btn");

const trigger = document.getElementById("trigger");

/* MENU OPEN / CLOSE */
menuBtn.addEventListener("click", () => {
  nav.classList.toggle("is-open");
  menuBtn.classList.toggle("is-active");
  menuBtn.setAttribute("aria-expanded", nav.classList.contains("is-open"));
});

/* ACTIVE STATE HELPER */
function toggleActive(btn) {
  btn.classList.toggle("is-active");
}

/* DOWNLOAD */
function downloadData(filePath, fileName) {
  trigger.href = filePath;
  trigger.setAttribute("download", fileName);

  downloadBtnNav.addEventListener("click", () => {
    toggleActive(downloadBtnNav);
    trigger.click();
    setTimeout(() => downloadBtnNav.classList.remove("is-active"), 300);
  });
}

/* IFRAME CHECK */
function checkIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

if (checkIframe()) {
  moreBtn.style.display = "none";
  searchBtn.style.display = "none";
  document.getElementById("camera").style.display = "none";
}
