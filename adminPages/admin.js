import {removeItem, sendUsersSearchDetails, doesItemNameExist, addItemToDatabase} from '../persist/persist.js'

const searchUsers =  document.getElementById("searchUsers");
const filterUsersBtn =  document.getElementById("filterUsersBtn");
const newItemBtn = document.getElementById("newItemBtn");
const removeItemText = document.getElementById("removeItemText");
const removedApprove = document.getElementById("removedApprove");
const productType = document.getElementById("productType");
const productName = document.getElementById("productName");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");
const productMainImage = document.getElementById("productMainImage");
const productSubImage1 = document.getElementById("productSubImage1");
const productSubImage2 = document.getElementById("productSubImage2");
const productSubImage3 = document.getElementById("productSubImage3");
const addNewItemBtn = document.getElementById("addNewItemBtn");
const addingApproved = document.getElementById("addingApproved");
const productNameExists = document.getElementById("productNameExists");
const resultsContainer = document.getElementById("resultsContainer");

if (newItemBtn) {
    newItemBtn.addEventListener("click", (e) => {
        e.preventDefault()
        window.location.href = './addNewItem.html'
    })
}
if(removeItemText) {
    removeItemText.addEventListener("keypress", (keyPressed) => {
        if (keyPressed.key === "Enter")
        {
            removeItem(removeItemText, removedApprove)
            keyPressed.preventDefault()
        }
    })
}

if (searchUsers) {
    searchUsers.addEventListener("keypress", async(keyPressed) => {
        if (keyPressed.key === 'Enter') {
            console.log("arrived")
            sendUsersSearchDetails(searchUsers, resultsContainer)
            keyPressed.preventDefault()
        }
    })
}

if(addNewItemBtn) {
    addNewItemBtn.addEventListener("click", async(e) => {
        e.preventDefault()
        await addNewItem()
    })
}

if (filterUsersBtn) {
    filterUsersBtn.addEventListener("click", (e)=> {
        e.preventDefault()
        if (e.key !== 'Enter')
        {
            window.location.href = './filterUsersPage.html'
        }
    })
}

async function addNewItem() {
    let newItem = {
        "productType": productType.value,
        "productName": productName.value,
        "productDescription": productDescription.value,
        "productPrice": productPrice.value,
        "productMainImage": productMainImage.value.substring(productMainImage.value.lastIndexOf("\\") + 1),
        "productSubImage1": productSubImage1.value.substring(productSubImage1.value.lastIndexOf("\\") + 1),
        "productSubImage2": productSubImage2.value.substring(productSubImage2.value.lastIndexOf("\\") + 1),
        "productSubImage3": productSubImage3.value.substring(productSubImage3.value.lastIndexOf("\\") + 1)
    }

    doesItemNameExist(newItem.productName).then(async (itemExists) => {
        //add here all that is written below
        if (!itemExists) {
            //add a check that main image was added
            //then add a check that if sub image was added - then all three were added
            //add fetch request to add newItem obj but should add to object - link for html product
            await addItemToDatabase(newItem);
            productNameExists.innerHTML = ""
            addingApproved.innerHTML = "Added new item successfully!"
        } else {
            productNameExists.innerHTML = "Product name already exists.<br><br>"
            addingApproved.innerHTML = "Please fix details before submitting"
        }
    })
}