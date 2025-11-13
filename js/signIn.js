import { validateInput, emailRegex } from './validationUtil.js';

const email = document.querySelector("#Email");
const password = document.querySelector("#pass");
const submitBtn = document.querySelector(".submit-btn button");
const form = document.querySelector("form");

email.addEventListener("input", () => {
 validateInput(email, email.value.match(emailRegex));
});

password.addEventListener("input", () => {
  const isValidPassword = password.value.length >= 8;
  pwHint.style.color = isValidPassword ? "#4CAF50" : "#E74C3C";
  validateInput(password, isValidPassword);
});

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  let isValid = true;

  validateInput(email, email.value.match(emailRegex));
  validateInput(password, password.value.length >= 8);

  if (!email.value.match(emailRegex) || password.value.length < 8) {
    isValid = false;
  }

  if (isValid) {
    form.reset();
    email.classList.remove("valid");
    password.classList.remove("valid");
    window.location.href = "home.html";
  }
});
