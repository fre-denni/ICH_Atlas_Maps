/**********************************************
 * MENU LOGIC + ACCESSIBILITY
 ***********************************************/

const nav = document.getElementById("floating-nav");
const menuBtn = document.getElementById("menu-btn");

const searchBtn = document.getElementById("search-btn");
const infoBtn = document.getElementById("info-btn");
const downloadBtnNav = document.getElementById("download-btn-nav");
const moreBtn = document.getElementById("more-btn");
const cameraBtn = document.getElementById("camera-btn");

const trigger = document.getElementById("trigger");

const menuItems = [
  searchBtn,
  infoBtn,
  downloadBtnNav,
  cameraBtn,
  moreBtn,
].filter(Boolean);

/* ===============================
   OPEN / CLOSE MENU
================================ */

function openMenu() {
  nav.classList.add("is-open");
  menuBtn.classList.add("is-active");
  menuBtn.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  nav.classList.remove("is-open");
  menuBtn.classList.remove("is-active");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.focus();
}

menuBtn.addEventListener("click", () => {
  nav.classList.contains("is-open") ? closeMenu() : openMenu();
});

/* ===============================
   ESC TO CLOSE
================================ */

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("is-open")) {
    e.preventDefault();
    closeMenu();
  }
});

/* ===============================
   KEYBOARD SHORTCUTS
================================ */

document.addEventListener("keydown", (event) => {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA")
    return;

  const key = event.key.toLowerCase();

  switch (key) {
    case "d":
      downloadBtnNav?.click();
      break;
    case "s":
      cameraBtn?.click();
      break;
    case "i":
      infoBtn?.click();
      break;
  }
});

/* ===============================
   TAB / SHIFT+TAB LOOP
================================ */

nav.addEventListener("keydown", (e) => {
  if (!nav.classList.contains("is-open")) return;
  if (e.key !== "Tab") return;

  const focusable = [menuBtn, ...menuItems];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

/* ===============================
   DOWNLOAD DATASET
================================ */

function downloadData(filePath, fileName) {
  trigger.href = filePath;
  trigger.setAttribute("download", fileName);

  downloadBtnNav.addEventListener("click", () => {
    trigger.click();
  });
}

/* ===============================
   IFRAME CHECK
================================ */

function checkIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

if (checkIframe()) {
  moreBtn && (moreBtn.style.display = "none");
  searchBtn && (searchBtn.style.display = "none");
}

//open menu at load
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    menuBtn.click();
  }, 500);
});
