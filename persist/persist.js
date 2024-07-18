/* Admin Functions */

export async function addItemToDatabase(newItem)
{
    let newItemString = JSON.stringify(newItem)

    fetch(`/admin/addNewItem/${newItemString}`,
        {method: 'PUT'}).then(async function (response) {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
}

export async function doesItemNameExist(productName) {
    return await fetch(`/admin/productNameSearch`,
        {method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        body: JSON.stringify({productName: productName})}).then((response) => {
        return response.json();
    });
}

export function removeItem(removeItemText, removedApprove) {
    fetch(`/admin/removeItem/${removeItemText.value}`, {method: 'DELETE'})
        .then(function (response) {
            response.json().then((itemRemoved) => {
                if (itemRemoved === false) {
                    removedApprove.innerHTML = "Item was not found"
                } else {
                    removedApprove.innerText = "Item was removed successfully"
                }
            })
        })
}

export function sendUsersSearchDetails(searchUsers, resultsContainer) {
    fetch(`/admin/userSearch`,
        {method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({searchText: searchUsers.value})}).then(async function (response) {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.text();
    })
        .then(async(users) => {
            await showResults(users, resultsContainer)
        })
}

async function showResults(users, resultsContainer) {
    let resultHtml = "<div class =\"noResult\" id=\"noResult\">\n" +
        "                        <h3 class=\"noResultText\">No Results were found :(</h3>\n" +
        "                    </div>"

    resultsContainer.innerHTML = "";

    if (users === "[]")
    {
        resultsContainer.innerHTML = resultHtml;
    }
    else {
        for (let user of users) {
            resultHtml = "<div class=\"usersResult\" id=\"usersResult\">${field}</div><br>"
            resultsContainer.innerHTML += user
        }
    }
}

/* Contact Us Function */

export function addContactDetails(fname, contactEmail, contactMessage, contactUsBtn)
{
    fetch(`/contact`
        , {method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        body: JSON.stringify({
            fname: fname.value,
            contactEmail: contactEmail.value,
            contactMessage: contactMessage.value}
        )})
        .then((response) => {
            if (!response.ok)
            {
                console.log("There was an error in fetching contact message")
            }
        }).then((result) => {
        contactUsBtn.value = "Thank you Yogi! We will contact you as soon as possible"
        setTimeout(()=> {contactUsBtn.value = "Send us a message"}, 4000)
    })
}

/* Subscription Function */

export function addSubscription(emailSubscription, footerSubscriptionBtn)
{
    fetch(`/subscribe`, {method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email: emailSubscription})}).then((response) => {
        if (!response.ok)
        {
            console.log("There was an error in fetching subscription")
        }
        else
        {
            footerSubscriptionBtn.innerText = "Thanks for joining our yogis community!"
            setTimeout(()=> { footerSubscriptionBtn.innerText = "Subscribe"}, 3000)
        }
    })
}

/* Search Page Function */

export async function fetchSearchResult(searchInput)
{
    await fetch(`/searchPage`,
        {method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({searchInput: searchInput})}).then((response) => {
        if (!response.ok)
        {
            console.log("There was an error with the response")
        }
        else
        {
            location.href = '../searchPage/searchPage.html'
        }
    })
}

/*Checkout function */

export function placeOrder(newPurchase)
{
    fetch(`/checkoutPage/placeOrder`,
        {method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        body: JSON.stringify({newPurchase: newPurchase})}).then(async function (response) {
        await response.json().then((result) => {
            if (result === false)
            {
                location.href = '../usersLoginPages/loginPage.html'
            }
            else
            {
                location.href = '../shoppingBag/orderSubmittedPage.html'
            }
        })
    })
}

/* Shopping Bag Functions */

export function removeItemFromBagFetch(itemIndexInBag) {
    fetch(`/myBagPage/removeItemFromBag/${itemIndexInBag}`,
        {method: 'DELETE'}).then(
        async(response) => {
            if (!response.ok)
            {
                console.log("There was an error with the response")
            }
            else
            {
                await createBagFetch()
            }
        })
}

export function increaseProductAmountInBagFetch(itemIndexInBag) {
    fetch(`/myBagPage/increaseProductAmount/`, {method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({itemIndexInBag: itemIndexInBag})}).then(
        async (response) => {
            if (!response.ok)
            {
                console.log("There was an error with the response")
            }
            else
            {
                await createBagFetch()
            }
        })
}

export function decreaseProductAmountInBagFetch(itemIndexInBag) {
    fetch(`/myBagPage/decreaseProductAmount`, {method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({itemIndexInBag: itemIndexInBag})}).then(
        async (response) => {
            if (!response.ok)
            {
                console.log("There was an error with the response")
            }
            else
            {
                await createBagFetch()
            }
        })
}

export async function createBagFetch() {
    await fetch(`/myBagPage/createBag`,
        {method: 'GET'}).then(async function (response) {
        await response.json().then((result) => {
            if (result === false)
            {
                location.href = '../usersLoginPages/loginPage.html'
            }
            else
            {
                location.href = '../shoppingBag/myBagPage.html'
            }
        })
    })
}

export async function createCheckoutFetch() {
    await fetch(`/checkoutPage/createPage`,
        {method: 'GET'}).then(async function (response) {
        await response.json().then((result) => {
            if (result === false)
            {
                location.href = '../usersLoginPages/loginPage.html'
            }
            else
            {
                location.href = '../shoppingBag/checkoutPage.html'
            }
        })
    })
}

/* Single Product Function */

export async function addToBag(productName, productSize, productAmount, addToBagBtn)
{

    await fetch(`/sproduct/addToBag/${productName}/${productSize}/${productAmount}`,
        {method: 'PUT'
            }).then(async function (response) {
        response.json().then((addedToBag) => {
            if (addedToBag === true)
            {
                addToBagBtn.innerText = "Added Successfully"
                setTimeout(()=> { addToBagBtn.innerText = "Add to Bag"}, 2000)
            }
            else
            {
                window.location.href = "../usersLoginPages/loginPage.html";
            }
        })
    })
}

/* Login and Register Functions */

export function sendLoginDetails(email, password, rememberMeClicked, fieldsErrorMessage)
{
    let loginDetails = {
        email: email.value,
        password: password.value,
        rememberMe: rememberMeClicked
    }

    fetch(`/login`,
        {method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginDetails)}).then(function (response) {
        response.json().then((loggedIn) => {
            if (loggedIn === true)
            {
                window.location.href = "../homePage/homePage.html";
            }
            else
            {
                fieldsErrorMessage.innerText = "Email or password are incorrect."
            }
        })
    })
}

export async function sendRegisterDetails(username, email, password, fieldsErrorMessage) {
    const registerDetails = {
        username: username.value,
        email: email.value,
        password: password.value
    }
    await fetch(`/register`,
        {method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerDetails)}).then(async function (response) {
        await response.json().then((emailExists) => {
            if (emailExists === false)
            {
                window.location.href = "../homePage/homePage.html";
            }
            else
            {
                fieldsErrorMessage.innerText = "A user with this email already exists."
            }
        })
    })
}

export async function logoutUser() {
    await fetch(`/logout`, {method: 'GET'}).then((response) => {
        if (!response.ok)
        {
            console.log("There was an error fetching logout")
        }

        return response.json();
    }).then((wasLoggedIn) => {
        if (wasLoggedIn && (document.title === 'My Bag' || document.title === 'Checkout'))
        {
            location.href = '../homePage/homePage.html'
        }
        else
        {
            location.href = location.href
        }
    })
}
