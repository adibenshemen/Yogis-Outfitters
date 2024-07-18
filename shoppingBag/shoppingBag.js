import {createCheckoutFetch, createBagFetch, increaseProductAmountInBagFetch, decreaseProductAmountInBagFetch,
    removeItemFromBagFetch} from '../persist/persist.js'

let checkoutBtn = document.getElementById("checkoutBtn")
let removeFromBagBtns = document.getElementsByClassName("removeFromBag")
let increaseAmountBtns = document.getElementsByClassName("plusCounterBtn")
let decreaseAmountBtns = document.getElementsByClassName("minusCounterBtn")

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async(e) => {
        await createCheckoutFetch()
    })
}

myBagBtn.addEventListener("click", async(e) => {
    await createBagFetch()
})

for (let i = 0; i < increaseAmountBtns.length; i++) {
    increaseAmountBtns[i].addEventListener("click", () => {
        increaseProductAmountInBagFetch(i)
    });
}

for (let i = 0; i < decreaseAmountBtns.length; i++) {
    decreaseAmountBtns[i].addEventListener("click", () => {
        decreaseProductAmountInBagFetch(i)
    });
}

for (let i = 0; i < removeFromBagBtns.length; i++) {
    removeFromBagBtns[i].addEventListener("click", () => {
        removeItemFromBagFetch(i)
    });
}