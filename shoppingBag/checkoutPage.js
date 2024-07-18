import {placeOrder} from '../persist/persist.js'

let shipForm = document.getElementById("coShippingForm")
let placeOrderBtn = document.getElementById("checkoutSubmit")
let shipFullName = document.getElementById("coName")
let shipAddress = document.getElementById("coAddress")
let shipCountry = document.getElementById("coCountry")
let shipMethod1 = document.getElementById("ship1")
let shipMethod2 = document.getElementById("ship2")

if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", verifySubmission)
}

function isCredentialsFilled()
{
    let shipFullNameValue = shipFullName.value
    let shipAddressValue = shipAddress.value
    let shipCountryValue = shipCountry.value
    let credentialsFilled = false;

    if (shipFullNameValue.length !== 0 && shipAddressValue.length !== 0 && shipCountryValue.length !== 0
        && (shipMethod1.checked || shipMethod2.checked)) {
        credentialsFilled = true;
    }

    return credentialsFilled;
}

function verifySubmission() {
    if (isCredentialsFilled()) {
        submitOrderFetch()
    }
}


function submitOrderFetch() {
    let shipFullNameValue = shipFullName.value
    let shipAddressValue = shipAddress.value
    let shipCountryValue = shipCountry.value
    let chosenShipMethod = shipMethod1.value
    if (shipMethod2.checked) {
        chosenShipMethod = shipMethod2.value
    }

    let newPurchase = {
        "products": [],
        "fullName": shipFullNameValue,
        "address": shipAddressValue,
        "country": shipCountryValue,
        "shipMethod": chosenShipMethod
    }

    newPurchase = JSON.stringify(newPurchase, null, 2)
    placeOrder(newPurchase)
}