import {addToBag} from "../persist/persist.js";

// ****** Single Product Pictures ******

let productImg = document.getElementById("productImg");
let smallImg = document.getElementsByClassName("smallImg");
let addToCartBtn = document.getElementById("addToCartBtn");
let sizeSelection = document.getElementById("productSize");
let pleaseSelectSize = document.getElementById("pleaseSelectSize");

document.addEventListener('DOMContentLoaded', function () {
    smallImg[0].addEventListener("click", ()=> {
        productImg.src = smallImg[0].src;
    })

    smallImg[1].addEventListener("click", ()=> {
        productImg.src = smallImg[1].src;
    })

    smallImg[2].addEventListener("click", ()=> {
        productImg.src = smallImg[2].src;
    })

    smallImg[3].addEventListener("click", ()=> {
        productImg.src = smallImg[3].src;
    })
});

addToCartBtn.addEventListener('click', async() => {
    if (sizeSelection.value === "Select Size")
    {
        pleaseSelectSize.innerHTML = "Please select size"
    }
    else
    {
        await addToBagOnClick();
    }
})

// * Add To Bag Fetch To Post Request *

async function addToBagOnClick() {
    let fullPath = window.location.href
    let splitBySlash = fullPath.split("/")
    let lastPart = splitBySlash[4]
    let splitByPoint = lastPart.split(".")
    let productName = splitByPoint[0]
    let productAmount = document.getElementById("productAmount").value
    let productSize = document.getElementById("productSize").value
    const addToBagBtn = document.getElementById("addToCartBtn")

   await addToBag(productName, productSize, productAmount, addToBagBtn)
}