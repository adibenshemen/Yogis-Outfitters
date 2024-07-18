import {sendRegisterDetails} from '../persist/persist.js'

let username = document.getElementById("username");
let email = document.getElementById("email");
let password = document.getElementById("password");
let passwordRepeat = document.getElementById("passwordRepeat");
let submitButton = document.getElementById("registerBtn");
let fieldsErrorMessage = document.getElementById("fieldsErrorMessage");
let registerForm = document.getElementById("registerForm");
let termsOfUse = document.getElementById("termsOfUse");
let popup = document.getElementById("termsPopUp");

username.addEventListener("input", function(e){
    username.setCustomValidity('');//remove message when new text is input
});
username.addEventListener("invalid", function(e){
    username.setCustomValidity('Please enter your full name');//custom validation message for invalid text
});

email.addEventListener("input", function(e){
    email.setCustomValidity('');//remove message when new text is input
});
email.addEventListener("invalid", function(e){
    email.setCustomValidity('Please enter a valid email');//custom validation message for invalid text
});

password.addEventListener("input", function(e){
    password.setCustomValidity('');//remove message when new text is input
});
password.addEventListener("invalid", function(e){
    password.setCustomValidity('Password should contain 8-12 characters with at least 1 uppercase letter, ' +
        'at least 1 lowercase letter and at least 1 number, with no special characters (@#$* etc.).');//custom validation message for invalid text
});

submitButton.addEventListener("click", verifySubmission);

termsOfUse.addEventListener('click',() => {
    popup.innerHTML = "By approving our terms of use, you agree to give us 100 on our project ;)";
    popup.classList.toggle("show");
})

function isCredentialsFilled()
{
    let nameValue = username.value;
    let emailValue = email.value;
    let passwordValue = password.value;
    let passwordRepeatValue = passwordRepeat.value;
    let credentialsFilled = true;

    if (nameValue.length === 0 || emailValue.length === 0 ||
        passwordValue.length === 0 || passwordRepeatValue.length === 0)
    {
        credentialsFilled = false;
    }

    return credentialsFilled;
}

async function verifySubmission() {
    if (!isCredentialsFilled()) {
        fieldsErrorMessage.innerHTML = "Please fill out all fields."
    }
    else {
        if (password.value !== passwordRepeat.value) {
            fieldsErrorMessage.innerText = "Passwords are not compatible."
        }
        else {
            fieldsErrorMessage.innerText = ""
            await sendRegisterDetails(username, email, password, fieldsErrorMessage)
        }
    }
}