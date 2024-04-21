"use strict";

// Automatically set the current date
function formatDateToCustom() {
  var today = new Date();
  var day = today.getDate(); // Day without leading zero
  var month = today.getMonth() + 1; // Month is zero-based, add 1
  var year = today.getFullYear().toString().substr(-2); // Last two digits of the year

  var formattedDate = day + "-" + month + "-" + year;
  return formattedDate;
}

// Phone validation helpers
function validatePhone(phoneNumber) {
  const localPhoneRegexMobile = /^05\d{8}$/;
  const localPhoneRegexLandline = /^0[23489]\d{7}$/;
  const internationalPhoneRegex = /^\+?972\d{9}$/;

  let isValid =
    localPhoneRegexMobile.test(phoneNumber) ||
    localPhoneRegexLandline.test(phoneNumber) ||
    internationalPhoneRegex.test(phoneNumber);

  if (isValid) {
    if (phoneNumber.startsWith("+972")) {
      phoneNumber = "0" + phoneNumber.slice(4);
    } else if (phoneNumber.startsWith("972")) {
      phoneNumber = "0" + phoneNumber.slice(3);
    }
  }

  return { isValid: isValid, phoneNumber: phoneNumber };
}

// Name validation helper
function displayNameError(field, error) {
  field.classList.add("invalid");
  error.textContent = "That name field should be filled";
  error.style.display = "block";
}

// Phone helpers
function displayPhoneError(field, error) {
  field.classList.add("invalid");
  error.textContent = "That phone field should be filled";
  error.style.display = "block";
}

// Form submission
function submitFormData(form) {
  const data = new FormData(form);

  // Send both requests concurrently
  Promise.all([
    fetch(form.action, {
      method: "POST",
      body: data,
    }),
    fetch(ajax_object.ajax_url + "?action=submit_custom_form", {
      method: "POST",
      body: data,
    }),
  ])
    .then(([googleSheetsResponse, emailResponse]) => {
      // Handle responses
      console.log("Google Sheets Response:", googleSheetsResponse);
      console.log("Email Response:", emailResponse);
      form.innerHTML = `<div class="success" style="background:green;color:#fff;padding:10px">Thanks for reaching out! will contact you soon</div>`;
    })
    .catch((error) => {
      console.error("Error:", error);
      form.innerHTML = `<div class="error" style="background:red;color:#fff;padding:10px">Something went wrong! Please try again later.</div>`;
    });
}

// Form submit handler
function submitForm(event) {
  event.preventDefault();
  console.log("hi");
  const form = event.currentTarget;

  // Check if the form has the 'mogi' class
  if (!form.classList.contains("mogi")) {
    return; // Exit the function if the form doesn't have the 'mogi' class
  }

  const honeypotField = form.querySelector("#mobile-phone");
  if (honeypotField && honeypotField.value !== "") {
    // Potentially a bot, do not submit the form
    console.log("Honeypot field was filled out.");
    return; // Prevent form submission
  }

  // Get references
  const phoneField = form.querySelector("[name='phone-number']");
  const nameField = form.querySelector("[name='customer-name']");
  const phoneError = form.querySelector("#phone-error");
  const nameError = form.querySelector("#name-error");

  // Phone validation
  if (phoneField) {
    phoneField.classList.remove("invalid");
    phoneError.textContent = "";
    phoneError.style.display = "none";

    const validationResponse = validatePhone(phoneField.value);
    if (!validationResponse.isValid) {
      displayPhoneError(phoneField, phoneError);
      event.preventDefault();
      return;
    } else {
      phoneField.value = validationResponse.phoneNumber; // Update with formatted number
    }
  }

  // Name validation
  if (nameField) {
    nameField.classList.remove("invalid");
    nameError.textContent = "";
    nameError.style.display = "none";

    // Check if the name field is empty
    if (nameField.value.trim() === "") {
      displayNameError(nameField, nameError);
      return; // Prevent form submission
    }
  }

  // Submit if all validation passed
  if (!phoneError.textContent && !nameError.textContent) {
    submitFormData(form);
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  document.getElementById("date").value = formatDateToCustom();
});

// Event listener for form submission
const form = document.getElementById("yourFormId"); // Replace 'yourFormId' with your actual form ID
if (form) {
  form.addEventListener("submit", submitForm);
}
