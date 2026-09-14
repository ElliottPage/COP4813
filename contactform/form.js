const form = document.getElementById("contactForm");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const streetAddress = document.getElementById("streetAddress");
const city = document.getElementById("city");
const state = document.getElementById("state");
const zip = document.getElementById("zip");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const birthDate = document.getElementById("birthDate");
const message = document.getElementById("message");
const securityAnswer = document.getElementById("securityAnswer");
const securityQuestion = document.getElementById("securityQuestion");

const firstNumber = Math.floor(Math.random() * 10) + 1;
const secondNumber = Math.floor(Math.random() * 10) + 1;
const correctAnswer = firstNumber + secondNumber;

securityQuestion.textContent = `${firstNumber} + ${secondNumber}`;

function formatPhoneNumber(value) {
    const digits = value.replace(/\D/g, "").slice(0, 10);

    if (digits.length <= 3) {
        return digits.length > 0 ? `(${digits}` : "";
    }

    if (digits.length <= 6) {
        return `(${digits.slice(0, 3)})${digits.slice(3)}`;
    }

    return `(${digits.slice(0, 3)})${digits.slice(3, 6)}-${digits.slice(6)}`;
}

phone.addEventListener("input", () => {
    phone.value = formatPhoneNumber(phone.value);
});

zip.addEventListener("input", () => {
    const numbersOnly = zip.value.replace(/[^\d-]/g, "");
    zip.value = numbersOnly;
});

function validateBirthDate() {
    birthDate.setCustomValidity("");

    if (!birthDate.value) {
        return;
    }

    const selectedDate = new Date(`${birthDate.value}T00:00:00`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const oldestAllowedDate = new Date();
    oldestAllowedDate.setFullYear(today.getFullYear() - 120);
    oldestAllowedDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
        birthDate.setCustomValidity("Your birth date cannot be in the future.");
    } else if (selectedDate < oldestAllowedDate) {
        birthDate.setCustomValidity("Please enter a birth date within the last 120 years.");
    }
}

function validateSecurityAnswer() {
    securityAnswer.setCustomValidity("");

    if (securityAnswer.value === "") {
        return;
    }

    if (Number(securityAnswer.value) !== correctAnswer) {
        securityAnswer.setCustomValidity("The answer to the security question is incorrect.");
    }
}

function validateNames() {
    firstName.setCustomValidity("");
    lastName.setCustomValidity("");

    if (firstName.value.trim().length < 2) {
        firstName.setCustomValidity("Please enter your first name.");
    }

    if (lastName.value.trim().length < 2) {
        lastName.setCustomValidity("Please enter your last name.");
    }
}

birthDate.addEventListener("change", validateBirthDate);
securityAnswer.addEventListener("input", validateSecurityAnswer);
firstName.addEventListener("input", validateNames);
lastName.addEventListener("input", validateNames);

form.addEventListener("submit", (event) => {
    event.preventDefault();

    validateNames();
    validateBirthDate();
    validateSecurityAnswer();

    if (!form.reportValidity()) {
        return;
    }

    const formData = {
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        streetAddress: streetAddress.value.trim(),
        city: city.value.trim(),
        state: state.value,
        zip: zip.value.trim(),
        phone: phone.value.trim(),
        email: email.value.trim(),
        birthDate: birthDate.value,
        message: message.value.trim()
    };

    sessionStorage.setItem("contactFormData", JSON.stringify(formData));

    window.location.href = "confirm.html";
});

form.addEventListener("reset", () => {
    setTimeout(() => {
        firstName.setCustomValidity("");
        lastName.setCustomValidity("");
        birthDate.setCustomValidity("");
        securityAnswer.setCustomValidity("");
    }, 0);
});