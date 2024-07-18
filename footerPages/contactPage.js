import {addContactDetails} from '../persist/persist.js'

const fname = document.getElementById('fname');
const contactEmail = document.getElementById('contactEmail');
const contactMessage = document.getElementById('contactMessage');
const submit = document.getElementById('submit');
const contactUsBtn = document.getElementById('contactUsBtn')

submit.addEventListener('click', (e)=> {
    if (fname.value !== "" && contactEmail.value !== "" && contactMessage.value !== "")
    {
        addContactDetails(fname, contactEmail, contactMessage, contactUsBtn)
    }

    e.preventDefault()
})