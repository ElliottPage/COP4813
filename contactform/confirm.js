const savedData = sessionStorage.getItem("contactFormData");

const confirmationContent = document.getElementById("confirmationContent");
const missingDataMessage = document.getElementById("missingDataMessage");

if (!savedData) {
    confirmationContent.hidden = true;
    missingDataMessage.hidden = false;
} else {
    const data = JSON.parse(savedData);

    const formattedBirthDate = new Date(
        `${data.birthDate}T00:00:00`
    ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    document.getElementById("reviewName").textContent =
        `${data.firstName} ${data.lastName}`;

    document.getElementById("reviewAddress").textContent =
        `${data.streetAddress}, ${data.city}, ${data.state} ${data.zip}`;

    document.getElementById("reviewPhone").textContent = data.phone;
    document.getElementById("reviewEmail").textContent = data.email;
    document.getElementById("reviewBirthDate").textContent = formattedBirthDate;
    document.getElementById("reviewMessage").textContent = data.message;

    document.getElementById("editButton").addEventListener("click", () => {
        window.location.href = "index.html";
    });

    document.getElementById("confirmButton").addEventListener("click", () => {
        const recipient = "elliottp260@gmail.com";

        const subject = "Website Contact Form Submission";

        const body =
`Name: ${data.firstName} ${data.lastName}

Address:
${data.streetAddress}
${data.city}, ${data.state} ${data.zip}

Phone: ${data.phone}
Email: ${data.email}
Birth Date: ${formattedBirthDate}

Message:
${data.message}`;

        const mailtoLink =
            `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;

        sessionStorage.removeItem("contactFormData");
        sessionStorage.removeItem("securityQuestion");
    });
}