import { validateInput, emailRegex } from './validationUtil.js';

const email = document.querySelector("#Email");
const Fname = document.querySelector("#Fname");
const Lname = document.querySelector("#Lname");
const password = document.querySelector("#pass");
const confirmPassword = document.querySelector("#confPass");
const pwHint = document.querySelector("#pw-hint");
const pwMatch = document.querySelector("#pw-match");
const submitBtn = document.querySelector(".submit-btn");

email.addEventListener("input", () => {
  validateInput(email, email.value.match(emailRegex));
});

Fname.addEventListener("input", ()=> {
  validateInput(Fname, Fname.value.trim() !== "");
})

Lname.addEventListener("input", ()=> {
  validateInput(Lname, Lname.value.trim() !== "");
})

password.addEventListener("input", () => {
  const isValidPassword = password.value.length >= 8;
  pwHint.style.color = isValidPassword ? "#4CAF50" : "#E74C3C";
  validateInput(password, isValidPassword);

  if (password.value.trim() !== "") { 
    checkPasswordMatch();
  }
});

confirmPassword.addEventListener("input", checkPasswordMatch);

function checkPasswordMatch() {
  if (confirmPassword.value === "") {
    pwMatch.textContent = "";
    return;
  }

  const passwordsMatch = confirmPassword.value === password.value;
  pwMatch.textContent = passwordsMatch ? "Passwords match!" : "Passwords do not match!";
  pwMatch.style.color = passwordsMatch ? "#4CAF50" : "#E74C3C";
  validateInput(confirmPassword, passwordsMatch);
}

const form = document.querySelector("form");

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  let isValid = true;

  const inputs = form.querySelectorAll("input");
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add("invalid");
      isValid = false;
    }
  });

  validateInput(email, email.value.match(emailRegex));
  validateInput(password, password.value.length >= 8);
  validateInput(
    confirmPassword,
    confirmPassword.value.trim() !== "" &&
    password.value === confirmPassword.value
  );
  validateInput(Fname, Fname.value.trim() !== "");
  validateInput(Lname, Lname.value.trim() !== "");


  if (isValid) {
    form.reset();
    inputs.forEach(input => input.classList.remove("valid"));
  }
})
