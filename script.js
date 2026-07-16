const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzGYjuN-OAhGlmhJU5NNGMiVkySFaKd1Ja-D95yM2UAAbYxwBtYQxeDJ6XODXIhptCLAA/exec"; // <-- Paste your Web App URL here

const form = document.getElementById("user-form");
const submitBtn = document.getElementById("submit-btn");
const formResult = document.getElementById("form-result");

form.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent page reload

  // Visual feedback for the user
  submitBtn.disabled = true;
  submitBtn.innerText = "Sending...";

  // Gather form data
  const formData = new FormData(form);
  const data = {
    name: formData.get("name"),
    choice: formData.get("choice"),
    token: "becca-josh-2027-xK9pL2", // must match SECRET_TOKEN in Code.gs
    website: formData.get("website"), // honeypot field, should always be empty
  };

  // Send data to Google Apps Script
  fetch(WEB_APP_URL, {
    method: "POST",
    mode: "cors", // Handles cross-origin security
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.result === "success") {
        // Reset and update UI upon success
        form.reset();
        formResult.textContent =
          "Thank you! We can't wait to celebrate with you!";
        formResult.classList.remove("hidden");
      } else {
        throw new Error(result.error);
      }
    })
    .catch((error) => {
      console.error("Error!", error.message);
      formResult.textContent =
        "Oops! Something went wrong :( Please text us your RSVP.";
      formResult.classList.remove("hidden");
    })
    .finally(() => {
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit RSVP";
    });
});

const modalRoot = document.getElementById("modal");
let modalStack = [];
let zIndexBase = 1000;

function removeModal(modal) {
  modal.remove();
  modalStack = modalStack.filter((m) => m !== modal);
  if (modalStack.length === 0) modalRoot.classList.remove("active");
}

function closeAllModals() {
  modalStack.forEach((modal) => modal.remove());
  modalStack = [];
  modalRoot.classList.remove("active");
}
function getSafeOffset() {
  const cardWidth = Math.min(320, window.innerWidth * 0.78);
  const cardHeight = cardWidth + 60; // padding-bottom + caption space, roughly

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Modal is centered via translate(-50%, -50%) from viewport center,
  // so usable horizontal range keeps the card fully on screen with a margin.
  const margin = 12;
  const maxX = vw / 2 - cardWidth / 2 - margin;
  const maxY = vh / 2 - cardHeight / 2 - margin;

  // Try to avoid the map: bias y away from vertical center,
  // where the map section visually sits.
  const mapEl = document.getElementById("map-container");
  const mapRect = mapEl.getBoundingClientRect();
  const mapCenterY = mapRect.top + mapRect.height / 2 - vh / 2; // offset from viewport center

  let x = Math.random() * (maxX * 2) - maxX;
  let y = Math.random() * (maxY * 2) - maxY;

  // If the random spot lands within the map's vertical band, push it
  // above or below instead.
  const mapHalfHeight = mapRect.height / 2 + 40;
  if (Math.abs(y - mapCenterY) < mapHalfHeight) {
    const pushAbove = Math.random() < 0.5;
    y = pushAbove
      ? Math.max(-maxY, mapCenterY - mapHalfHeight - Math.random() * 60)
      : Math.min(maxY, mapCenterY + mapHalfHeight + Math.random() * 60);
  }

  return { x, y };
}
function openMapPoint(el) {
  closeAllModals();

  modalRoot.classList.add("active");

  const title = el.dataset.title;
  const text = el.dataset.text;
  const image = el.dataset.image;

  const z = zIndexBase + modalStack.length;

  const card = document.createElement("div");
  card.className = "modal-content";
  card.style.zIndex = z;

  const { x, y } = getSafeOffset();
  const rot = Math.random() * 10 - 5;

  card.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rot}deg)`;

  card.innerHTML = `
    <button class="close-btn">&times;</button>
    <h3>${title}</h3>
    <img src="${image}" style="width:100%; border-radius:8px;" />
    <p>${text}</p>
  `;

  card.querySelector(".close-btn").onclick = () => removeModal(card);

  modalRoot.appendChild(card);
  modalStack.push(card);
}

document.addEventListener("click", (e) => {
  if (modalStack.length === 0) return; // nothing open, ignore
  if (e.target.closest(".map-point")) return; // let map icons keep working
  if (e.target.closest(".modal-content")) return; // clicked inside a card
  closeAllModals();
});

const INTRO_DURATION_MS = 4000; // set this to match your GIF's full playback length

setTimeout(function () {
  console.log("Fading out now!");
  document.getElementById("preloader").classList.add("fade-out");
}, INTRO_DURATION_MS);
