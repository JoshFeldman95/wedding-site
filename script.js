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
        formResult.textContent = "Thank you! Your RSVP has been saved.";
        formResult.classList.remove("hidden");
        formResult.style.color = "green";
      } else {
        throw new Error(result.error);
      }
    })
    .catch((error) => {
      console.error("Error!", error.message);
      formResult.textContent = "Oops! Something went wrong. Please try again.";
      formResult.classList.remove("hidden");
      formResult.style.color = "red";
    })
    .finally(() => {
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit RSVP";
    });
});
