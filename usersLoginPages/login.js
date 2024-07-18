import {sendLoginDetails} from '../persist/persist.js'

let email = document.getElementById("email");
let password = document.getElementById("password");
let login = document.getElementById("logInBtn");
let fieldsErrorMessage = document.getElementById("fieldsErrorMessage");
let rememberMe = document.getElementById("rememberMe");
let rememberMeClicked = false;

email.addEventListener("input", function(e){
    email.setCustomValidity('');//remove message when new text is input
});

email.addEventListener("invalid", function(e){
    email.setCustomValidity('Please enter a valid email');//custom validation message for invalid text
});

rememberMe.addEventListener("click", () => { //change the sign of the checkbox
    rememberMeClicked = !rememberMeClicked;
})

login.addEventListener("click", verifyLogin);

function isCredentialsFilled() {  //maybe to put it together with the register function??
    let emailValue = email.value;
    let passwordValue = password.value;
    let credentialsFilled = true;

    if (emailValue.length === 0 || passwordValue.length === 0)
    {
        credentialsFilled = false;
    }

    return credentialsFilled;
}

function verifyLogin() {
    if (!isCredentialsFilled())
    {
        fieldsErrorMessage.innerHTML = "Please fill out all fields."
    }
    else
    {
        fieldsErrorMessage.innerText = ""
        sendLoginDetails(email, password, rememberMeClicked, fieldsErrorMessage);
    }
}
