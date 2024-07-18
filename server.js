const express = require('express')
const webServer = express();
const fs = require('fs') // File System
const path = require('path')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const req = require("express/lib/request");
const res = require("express/lib/response");
const router = express.Router()
const sessions = {};
const port = process.env.PORT || 3000
const sha1 = require('js-sha1');

webServer.listen(port);
console.log(`App listening on port ${port}`)
webServer.use(cookieParser())

webServer.use(bodyParser.urlencoded({
    extended: false
}));
webServer.use(bodyParser.json())

webServer.use(`/adminPages/`, router, async(req, res, next) => {
    await goToAdminPage(req, res, next)
})

webServer.use(`/shoppingBag/`, router, (req, res, next) => {
    goToBagPages(req, res, next)
})

router.get(`menuPage.html`, () => {})
router.get(`addNewItem.html`, () => {})
router.get(`filterUserPage.html`, () => {})

router.get(`myBagPage.html`, () => {})
router.get(`checkoutPage.html`, () => {})

webServer.use('/', express.static(__dirname + '/'));

webServer.get(`/persist/persist/`, (req, res, next) => {
    next()
})

webServer.post(`/removeMember/:email`, async(req, res) => {
    let email = req.params.email
    let membersData = await fs.promises.readFile(`./members.json`)
    let membersObj = await JSON.parse(membersData)

    for (let member of membersObj.members)
    {
        if (member.email === email)
        {
            member = null
            break
        }
    }

    membersObj.members = membersObj.members.filter(function (element) {return element !== null})
    await fs.promises.writeFile('./members.json', JSON.stringify(membersObj, null, 2))

    res.send(true)
})

webServer.post(`/removeSubscription/:email`, async(req, res) => {
    let email = req.params.email
    let subscriptionData = await fs.promises.readFile(`./subscribers.json`)
    let subscriptionObj = await JSON.parse(subscriptionData)

    for (let subscriber of subscriptionObj.subscribers)
    {
        if (subscriber.email === email)
        {
            subscriber = null
            break
        }
    }

    subscriptionObj.subscribers = subscriptionObj.subscribers.filter(function (element) {return element !== null})
    await fs.promises.writeFile('./subscribers.json', JSON.stringify(subscriptionObj, null, 2))

    res.send(true)
})


webServer.post('/myBagPage/increaseProductAmount',async (req,res,next) => {
    const cookies = req.cookies
    let result = false
    let itemIndexInBag = req.body.itemIndexInBag
    let membersData = fs.readFileSync('./members.json')
    let membersObj = JSON.parse(membersData)

    if (cookies?.shortPass && sessions[cookies?.shortPass]){
        for (let member of membersObj.members) {
            if (cookies.shortPass === member.cookiePassword) {
                member.shoppingBag[itemIndexInBag].productAmount++
                break
            }
        }
        result = true
    }

    membersData = JSON.stringify(membersObj, null, 2)
    await fs.promises.writeFile('./members.json', membersData, async(err) => {
        if (err)
        {
            console.log(err)
        }
    })

    res.send(JSON.stringify(result))
})

webServer.post('/myBagPage/decreaseProductAmount',async (req,res,next) => {
    const cookies = req.cookies
    let result = false
    let itemIndexInBag = req.body.itemIndexInBag
    let membersData = fs.readFileSync('./members.json')
    let membersObj = JSON.parse(membersData)

    if (cookies?.shortPass && sessions[cookies?.shortPass]){
        for (let member of membersObj.members) {
            if (cookies.shortPass === member.cookiePassword) {
                if (member.shoppingBag[itemIndexInBag].productAmount > 1) {
                    member.shoppingBag[itemIndexInBag].productAmount--
                }
                break
            }
        }
        result = true
    }

    membersData = JSON.stringify(membersObj, null, 2)
    await fs.promises.writeFile('./members.json', membersData, async(err) => {
        if (err)
        {
            console.log(err)
        }
    })

    res.send(JSON.stringify(result))
})


webServer.delete('/myBagPage/removeItemFromBag/:itemIndexInBag',async (req,res,next) => {
    const cookies = req.cookies
    let result = false
    let itemIndexInBag = req.params.itemIndexInBag
    let membersData = await fs.promises.readFile('./members.json')
    let membersObj = await JSON.parse(membersData)

    if (cookies?.shortPass && sessions[cookies?.shortPass]){
        for (let member of membersObj.members) {
            if (cookies.shortPass === member.cookiePassword) {
                member.shoppingBag.splice(itemIndexInBag, 1)
                break
            }
        }
        result = true
    }

    membersData = JSON.stringify(membersObj, null, 2)
    await fs.promises.writeFile('./members.json', membersData, async(err) => {
        if (err)
        {
            console.log(err)
        }
    })

    res.send(JSON.stringify(result))
})

webServer.post('/checkoutPage/placeOrder',async (req,res,next) => {
    const cookies = req.cookies
    let result = false
    let purchase = await JSON.parse(req.body.newPurchase)
    let membersData = await  fs.promises.readFile('./members.json')
    let membersObj = JSON.parse(membersData)

    if (cookies?.shortPass && sessions[cookies?.shortPass]){
        for (let member of membersObj.members) {
            if (cookies.shortPass === member.cookiePassword) {
                purchase.products = JSON.parse(JSON.stringify(member.shoppingBag))
                member.purchases.push(purchase)
                member.shoppingBag = []
                result = true
                break
            }
        }
    }

    membersData = JSON.stringify(membersObj, null, 2)
    await fs.promises.writeFile('./members.json', membersData, async(err) => {
        if (err)
        {
            console.log(err)
        }
    })

    res.send(JSON.stringify(result))
})

webServer.get('/checkoutPage/createPage',async (req,res,next) => {
    const cookies = req.cookies
    let result = false
    if (cookies?.shortPass && sessions[cookies?.shortPass]){
        await createMemberCheckoutPage(cookies.shortPass)
        result = true
    }

    res.send(JSON.stringify(result))
})

webServer.get('/myBagPage/createBag',async (req,res,next) => {
    const cookies = req.cookies
    let result = false
    if (cookies?.shortPass && sessions[cookies?.shortPass]){
        await createMemberBagPage(cookies.shortPass)
        result = true
    }

    res.send(JSON.stringify(result))
})

webServer.put(`/sproduct/addToBag/:productName/:productSize/:productAmount`, async(req, res) => {
    const cookies = req.cookies
    let isCookiesAvailable = true
    let productSize = req.params.productSize
    let productAmount = req.params.productAmount
    let productName = req.params.productName
    let productsData = await fs.promises.readFile('./products.json')
    let productsObj = await JSON.parse(productsData)
    let membersData = await  fs.promises.readFile('./members.json')
    let membersObj = JSON.parse(membersData)
    let productToInsert;

    if (cookies?.shortPass && sessions[cookies?.shortPass]){
        for (let product of productsObj.products) {
            if (product.productName === productName) {
                product.productSize = productSize
                product.productAmount = productAmount
                productToInsert = product
                break
            }
        }

        for (let member of membersObj.members) {
            if (cookies.shortPass === member.cookiePassword) {
                member.shoppingBag.push(productToInsert)
                break
            }
        }

        membersData = JSON.stringify(membersObj, null, 2)
        await fs.promises.writeFile('./members.json', membersData, async(err) => {
            if (err)
            {
                console.log(err)
            }
        })

        res.send(isCookiesAvailable)
    }
    else {
        console.log("else")
        res.send(!isCookiesAvailable)
    }
})

webServer.post(`/admin/userSearch`, async(req, res) => {
    let searchText = req.body.searchText
    let searchResult = await findUsers(searchText)
    res.send(JSON.stringify(searchResult))
})

webServer.delete(`/admin/removeItem/:productName`, async(req, res) => {
    let productName = req.params.productName
    let productType = await findProductType(productName)
    let itemRemoved =  await removeItemIfExists(productName)
    await createProductsPage(productType)


    res.send(JSON.stringify(itemRemoved))
})

webServer.put(`/admin/addNewItem/:newItem`, async(req, res) => {
    let newItem = await JSON.parse(req.params.newItem)
    let productsData = await fs.promises.readFile('./products.json')
    let productsObj =  await JSON.parse(productsData)

    if (newItem.productSubImage1 === "" && newItem.productSubImage2 === ""
        && newItem.productSubImage3 === "")
    {
        newItem.productSubImage1 = ""
        newItem.productSubImage2 = ""
        newItem.productSubImage3 = ""
    }

    let newPagePath = "./singleProducts/" + newItem.productName + ".html"

    newItem.pageLink = newPagePath
    productsObj.products.push(newItem)
    productsData = JSON.stringify(productsObj, null, 2)
    fs.writeFile('./products.json', productsData, async(err) => {
        if (err)
        {
            console.log(err)
        }
        else
        {
            await createNewItemPage(newItem, newPagePath)
            await createProductsPage(newItem.productType)
        }
    })

    res.send(true);
})

webServer.post(`/admin/productNameSearch`, async (req, res) => {
    let productName = req.body.productName
    let productsData = await fs.promises.readFile('./products.json')
    let productsObj = JSON.parse(productsData)
    let productExists = false

    for (let product of productsObj.products)
    {
        if (product.productName === productName)
        {
            productExists = true
            break
        }
    }

    res.send(JSON.stringify(productExists))
})

webServer.post(`/register`, async (req
    , res) => {
    let username = req.body.username
    let email = req.body.email
    let password = req.body.password
    let emailExists = await isEmailExist(email)

    if (!emailExists) {
        let randomPassword = randomPasswordGenerator();
        res.cookie('shortPass', randomPassword)
        await setNewCookie(randomPassword, email)
        await insertUserToDB(username, email, password, randomPassword)
    }

    res.send(JSON.stringify(emailExists))
})

webServer.post(`/login`, async (req,
                                                             res)=>{
    let email = req.body.email;
    let password = req.body.password;
    let rememberMe = req.body.rememberMe;

    let correctCredentials = await areCredentialsCorrect(email, password);

    if (correctCredentials)
    {
        let randomPassword = randomPasswordGenerator();

        res.cookie('shortPass', randomPassword)
        if (rememberMe === "true")
        {
            await setNewCookie(randomPassword, email, true)
        }
        else
        {
            await setNewCookie(randomPassword, email)
        }
    }

    res.send(JSON.stringify(correctCredentials))
})

webServer.post(`/searchPage`, async(req, res) => {
    let searchInput = req.body.searchInput.toLowerCase()
    let productsData = await fs.promises.readFile('./products.json')
    let productsObj = await JSON.parse(productsData)
    let resultArray = []

    for (let product of productsObj.products)
    {
        if (product.productName.toLowerCase().includes(searchInput) || product.productDescription.toLowerCase().includes(searchInput))
        {
            resultArray.push(product)
        }
    }

    await showSearchResultsOnPage(resultArray)
    res.send(true)
})

webServer.post(`/subscribe`, async(req, res) => {
    let email = req.body.email

    let subscribersData = await fs.promises.readFile('./subscribers.json')
    let subscribersObj = JSON.parse(subscribersData)

        subscribersObj.subscribers.push(email)
        subscribersData = JSON.stringify(subscribersObj, null, 2)
        await fs.promises.writeFile('./subscribers.json', subscribersData, (err) => {
            console.log(err)
        })

        res.send(true)
})

webServer.post(`/contact`, async(req, res) => {
    let contactObj = {
        "fullName": req.body.fname,
        "email": req.body.contactEmail,
        "contactMessage": req.body.contactMessage
    }

    let contactData = await fs.promises.readFile('./contactUs.json')
    let contactDataObj = JSON.parse(contactData)

    contactDataObj.contactUs.push(contactObj)
    contactData = JSON.stringify(contactDataObj, null, 2)
    await fs.promises.writeFile('./contactUs.json', contactData, (err) => {
        console.log(err)
    })

    res.send(true)
})

webServer.get(`/logout`, async(req, res) => {
    const cookies = req.cookies
    let isCookiesAvailable = false

    if (cookies?.shortPass && sessions[cookies?.shortPass]){
        isCookiesAvailable = true
        let membersData = await fs.promises.readFile('./members.json')
        let membersObj = JSON.parse(membersData)

        for (let member of membersObj.members)
        {
            if (cookies.shortPass === member.cookiePassword)
            {
                member.loginActivity = "Logged out"
                delete sessions[member.cookiePassword]
                member.cookiePassword = ""
                break
            }
        }

        membersData = JSON.stringify(membersObj, null, 2)
        await fs.promises.writeFile('./members.json', membersData, (error) => {
            console.log(error)
        })
    }

    res.send(JSON.stringify(isCookiesAvailable))
})

webServer.post('/removeContactUs/:email', async(req, res) => {
    let email = req.params.email
    let contactData = await fs.promises.readFile('./contactUs.json')
    let contactObj = await JSON.parse(contactData)

    for (let contact of contactObj.contactUs)
    {
        if (contact.email === email)
        {
            contact = null
        }
    }

    contactObj.contactUs = contactObj.contactUs.filter(function (element) {return element !== null})
    await fs.promises.writeFile('./contactUs.json', JSON.stringify(contactObj, null, 2))

    res.send(true)
})

async function goToAdminPage(req, res, next)
{
    const cookies = req.cookies
    if(cookies?.shortPass && sessions[cookies?.shortPass]){
        let adminCookies = await doesCookieBelongToAdmin(cookies.shortPass)

        if (adminCookies)
        {
            next()
        }
        else
        {
            res.redirect('../homePage/homePage.html')
        }
    }
    else
    {
        res.redirect('../usersLoginPages/loginPage.html')
    }
}

function goToBagPages(req, res, next)
{
    const cookies = req.cookies
    if(cookies?.shortPass && sessions[cookies?.shortPass]){
        next()
    }
    else {
        res.redirect('../usersLoginPages/loginPage.html')
    }
}

async function isEmailExist(email) {
    let emailExists = false;
    const membersData = await fs.promises.readFile('./members.json' ,"utf8")
    const membersObj = await JSON.parse(membersData)

    for (let possibleEmail of membersObj.members) {
        if (possibleEmail.email === email) {
            emailExists = true
            break
        }
    }

    return emailExists
}

async function areCredentialsCorrect(email, password) {
    let credentialsCorrect = false;

    try {
        let membersData = await fs.promises.readFile('./members.json', "utf8")
        let membersObj = await JSON.parse(membersData)

        for (let user of membersObj.members)
        {
            if (user.email === email)
            {
                if (user.password === sha1(password))
                {
                    credentialsCorrect = true;
                    user.loginActivity = "Logged in"
                }

                break
            }
        }

        membersData = JSON.stringify(membersObj, null, 2)
        await fs.promises.writeFile('./members.json', membersData, (error) => {
            console.log(error)
        })
    }
    catch(err) {
        console.log(err)
    }

    return credentialsCorrect;
}

function randomPasswordGenerator() {
    let length = 20,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";

    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }

    return retVal;
}

async function setNewCookie(cookie, email, rememberMe=false) {
    sessions[cookie] = email
    let membersData = await fs.promises.readFile('./members.json')
    let membersObj = await JSON.parse(membersData)

    for (let member of membersObj.members) {
        if (member.email === email) {
            member.cookiePassword = cookie
        }
    }

    membersData = JSON.stringify(membersObj, null, 2)
    fs.writeFile('./members.json', membersData, async(err) => {
        if (err)
        {
            console.log(err)
        }
    })

    if (!rememberMe)
    {
        setTimeout(()=>{
            delete sessions[cookie]
        },1000*60*30)
    }
    else
    {
        setTimeout(()=>{
            delete sessions[cookie]
        },1000*60*30*480)
    }
}

async function insertUserToDB(username, email, password, cookiePassword) {
    let membersData = await fs.promises.readFile('./members.json', "utf-8")
    let membersObj = await JSON.parse(membersData)
    let newUser = {
        "username": username,
        "email": email,
        "password": sha1(password),
        "shoppingBag": [],
        "purchases": [],
        "loginActivity": "Logged In",
        "cookiePassword": cookiePassword
    }

    membersObj.members.push(newUser)
    membersData = JSON.stringify(membersObj, null, 2)
    await fs.promises.writeFile('./members.json', membersData, (err) => {
        console.log(err)
    })
}

async function findUsers(username)
{
    let membersData = await fs.promises.readFile('./members.json')
    let membersObj = await JSON.parse(membersData)
    let foundUsers = {
        userResults: []
    }

    for (let user of membersObj.members) {
        if (user.username.startsWith(username)) {
            foundUsers.userResults.push(user)
        }
    }

    return foundUsers.userResults;
}

async function doesCookieBelongToAdmin(userCookie)
{
    let membersData = await fs.promises.readFile('./members.json')
    let membersObj = JSON.parse(membersData)
    let cookieBelongToAdmin = false

    for (let member of membersObj.members)
    {
        if (member.cookiePassword === userCookie && member.email === "admin@admin.com")
        {
            cookieBelongToAdmin = true
            break
        }
        else if (member.cookiePassword === userCookie)
        {
            break
        }
    }

    return cookieBelongToAdmin
}

async function findProductType(productName)
{
    let productsData = await fs.promises.readFile('./products.json')
    let productsObj = JSON.parse(productsData)
    let productType = ""

    for (let product of productsObj.products)
    {
        if (product.productName === productName)
        {
            productType = product.productType
            break
        }
    }

    return productType
}
async function removeItemIfExists(itemName) {
    let productsData = await fs.promises.readFile('./products.json')
    let productsObj = await JSON.parse(productsData)
    let productRemoved = false

    for (let i in productsObj.products) {
        if (productsObj.products[i]?.productName === itemName) {
            delete productsObj.products[i]
            productRemoved = true
            break
        }
    }

    productsObj.products = productsObj.products.filter(function (element) {return element !== null})
    await fs.promises.writeFile('./products.json', JSON.stringify(productsObj, null, 2))

    return productRemoved
}

async function createNewItemPage(newProduct, newProductPath)
{
    let imagesPathPrefix = "../images/"
    let maimImgSrc = imagesPathPrefix + newProduct.productMainImage
    let sub1Src = imagesPathPrefix + newProduct.productSubImage1
    let sub2Src = imagesPathPrefix + newProduct.productSubImage2
    let sub3Src = imagesPathPrefix + newProduct.productSubImage3
    let head = `<!DOCTYPE html>
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="../home.css">
                    <title> ${newProduct.productName} </title> 
                    <link rel="icon" href="../images/siteIcon.png" type="image/icon type">
                </head>`
    let pageContent;

    if (newProduct.productSubImage1 !== ""){
        pageContent = ` 
        <div class="smallContainer singleProduct" id="singleProductContainer">
            <div class="row">
                <div class="col-2">
                    <img src=${maimImgSrc} id="productImg">
                        <div class="smallImgRow">
                            <div class="smallImgCol">
                                <img src=${maimImgSrc} class="smallImg" id="smallImg1" onclick="getElementById(productImg).src = ${maimImgSrc}">
                            </div>
                            <div class="smallImgCol">
                                <img src=${sub1Src} class="smallImg" id="smallImg2" onclick="getElementById(productImg).src = ${sub1Src}">
                            </div>
                            <div class="smallImgCol">
                                <img src=${sub2Src} class="smallImg" id="smallImg3" onclick="getElementById(productImg).src = ${sub2Src}">
                            </div>
                            <div class="smallImgCol">
                                <img src=${sub3Src} class="smallImg" id="smallImg4" onclick="getElementById(productImg).src = ${sub3Src}">
                            </div>
                        </div>
                </div>
                <div class="col-2">
                    <p>Home / ${newProduct.productType}</p>
                    <h1>${newProduct.productName}</h1>
                    <h4>${newProduct.productPrice}</h4>
                    <select id="productSize">
                        <option>Select Size</option>
                        <option>S</option>
                        <option>M</option>
                        <option>L</option>
                    </select>
                    <div id="pleaseSelectSize"></div>
                    <input type="number" value="1" min="1" id="productAmount">
                        <button id="addToCartBtn" class="addToCartBtn">Add to Bag</button>
                        <h3>Product Details<i class="fa fa-indent"></i></h3>
                        <br>
                        <p>${newProduct.productDescription}</p>
                </div>
            </div>
        </div> `
    }
    else {
        pageContent = ` 
        <div class="smallContainer singleProduct" id="singleProductContainer">
            <div class="row">
                <div class="col-2">
                    <img src=${maimImgSrc} id="productImg">      
                </div>
                <div class="col-2">
                    <p>Home / ${newProduct.productType}</p>
                    <h1>${newProduct.productName}</h1>
                    <h4>${newProduct.productPrice}</h4>
                    <select id="productSize">
                        <option>One Size</option>
                    </select>
                    <div id="pleaseSelectSize"></div>
                    <input type="number" value="1" min="1" id="productAmount">
                        <button id="addToCartBtn" class="addToCartBtn">Add to Bag</button>
                        <h3>Product Details<i class="fa fa-indent"></i></h3>
                        <br>
                        <p>${newProduct.productDescription}</p>
                </div>
            </div>
        </div> `
    }

    let closure = `<script type="module" defer src="./sproduct.js"></script> 
                    <script type="module" defer src="../searchPage/searchPage.js"></script>
                    <script type="module" defer src="../homePage/homePage.js"></script>
                    </html> `

    let productHTML = [head, header, pageContent, footer, closure].join(``)
    await fs.writeFile(newProductPath, productHTML, (error) => {
        console.log(error);
    });
}


async function createProductsPage(productType)
{
    let productsData = await fs.readFileSync('./products.json')
    let productsObj = await JSON.parse(productsData)
    let productBox;
    let storePage = ""
    let imgSrc;

    for (let product of productsObj.products) {
        if (product.productType === productType)
        {
            imgSrc = "../images/" + product.productMainImage
            productBox = `<div class="productBox">
                            <img src=${imgSrc} id="${product.productName}" onclick="location.href ='.${product.pageLink}'">
                            <h3 class="productTitle">${product.productName}</h3>
                            <h4 class="productPrice">${product.productPrice}</h4>
                          </div>`

            storePage += productBox;
        }
    }

    let head = `<!DOCTYPE html>
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="../home.css">
                    <title> ${productType} </title> 
                    <link rel="icon" href="../images/siteIcon.png" type="image/icon type">
                </head>`

    let pageContent = `<div class="shopContainer" id="shopContainer">
                       <div class="shopTitle" id="shopTitle">
                           <h2>${productType}</h2>
                       </div>
                        <div class="productsContainer" id="productsContainer">`

    let pageContentClosing = `</div>
                            </div>`

    let closure = `<script type="module" defer src="../searchPage/searchPage.js"></script>
                    <script type="module" defer src="../homePage/homePage.js"></script>
                    </html>`

    let productHTML = [head, header, pageContent, storePage, pageContentClosing, footer, closure].join(``)

    await fs.writeFile(`./productsPages/productsPage_${productType}.html`,productHTML, (error) => {
        console.log(error)
    })
}

async function showSearchResultsOnPage(resultArray) {
    let head = `<!DOCTYPE html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="../home.css">
        <title> Search Result </title> 
        <link rel="icon" href="../images/siteIcon.png" type="image/icon type">
    </head>`

    let pageContent;

    if (resultArray.length === 0)
    {
        pageContent = `<div class="shopContainer" id="shopContainer">
       <div class="shopTitle" id="shopTitle">
           <h2>Search Results</h2>
       </div>
        <div class="noResultsWereFound" id="noResultsWereFound">
            No results were found :(</div>
        </div>`
    }
    else
    {
        let imgSrc;
        pageContent = `<div class="shopContainer" id="shopContainer">
                           <div class="shopTitle" id="shopTitle">
                               <h2>Search Results</h2>
                           </div>
                            <div class="productsContainer" id="productsContainer">`
        for (let result of resultArray)
        {
            imgSrc = `../images/` + result.productMainImage
            pageContent += `<div class="productBox">
                            <img src=${imgSrc} id="${result.productName}" onclick="location.href ='.${result.pageLink}'">
                            <h3 class="productTitle">${result.productName}</h3>
                            <h4 class="productPrice">${result.productPrice}</h4>
                          </div>`
        }
    }

    let pageContentClosing = `</div>
                            </div>`

    let closure = `<script type="module" defer src="../searchPage/searchPage.js"></script>
                    <script type="module" defer src="../persist/persist.js"></script>
                    <script type="module" src="../homePage/homePage.js"></script>
                </html>`

    let htmlPage = [head, header, pageContent, pageContentClosing, footer, closure].join('')

    await fs.writeFile(`./searchPage/searchPage.html`,htmlPage, (error) => {
        if (error)
        {
            console.log(error)
        }
    })
}

async function createMemberBagPage(cookieShortPass)
{
    let membersData = fs.readFileSync('./members.json')
    let membersObj = JSON.parse(membersData)
    let productBox;
    let bagContainer = ""
    let bagTotal = 0;

    for (let member of membersObj.members) {
        if (member.cookiePassword === cookieShortPass) {
            if (member.shoppingBag.length === 0) {
                bagContainer += `<div class="noResultsWereFound">
                                    Bag is empty :(</div>`
            }
            else {
                for (let product of member.shoppingBag) {
                    productBox = `<div class="bagContainer" id="bagContainer">
                                <div class="myBagBox" id="myBagBox">
                                    <div class="bagItem">
                                        <div class="imageBox">
                                            <a href=".${product.pageLink}"><img src="../images/${product.productMainImage}"></a>
                                        </div>
                                        <div class="bagItemDetails">
                                            <h1 class="bagItemTitle">${product.productName}</h1>
                                            <h3 class="bagItemDescription">${product.productDescription}</h3>
                                        </div>
                                        <div class="counter">
                                            <div class="counterBtn plusCounterBtn" id="plusCounterBtn">+</div>
                                            <div class="bagProductCount">${product.productAmount}</div>
                                            <div class="counterBtn minusCounterBtn" id="minusCounterBtn">-</div>
                                        </div>
                                        <div class="prices">
                                            <div class="bagProductPrice">${product.productPrice}</div>
                                            <div class="removeFromBag"><u>Remove</u></div>
                                        </div>
                                    </div>
                                </div>
                            </div>`

                    bagContainer += productBox;
                    bagTotal += parseInt((product.productPrice).slice(1)) * parseInt(product.productAmount)
                }
                bagContainer += `<div class="bagTotal">Total: $${bagTotal}</div>
                                <div class="checkoutBtn">
                                    <button class="addToCartBtn" id="checkoutBtn">Checkout</button>
                                 </div>`
            }
            break
        }
    }

    let head = `<!DOCTYPE html>
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="../home.css">
                    <title>My Bag</title> 
                    <link rel="icon" href="../images/siteIcon.png" type="image/icon type">
                </head>`

    let pageContent = ` <h2 id="bagTitle">My Bag</h2>`

    let closure = ` <script type="module" defer src="./shoppingBag.js"></script>
                    <script type="module" defer src="../persist/persist.js"></script>
                    <script type="module" defer src="../homePage/homePage.js"></script>
                    <script type="module" defer src="../searchPage/searchPage.js"></script>
                    </html>`

    let myBagHTML = [head, header, pageContent, bagContainer, footer, closure].join(``)

    await fs.writeFile(`./shoppingBag/myBagPage.html`,myBagHTML, (error) => {
        console.log(error)
    })
}


async function createMemberCheckoutPage(cookieShortPass)
{
    let membersData = await fs.promises.readFile('./members.json')
    let membersObj = await JSON.parse(membersData)
    let productBox;
    let bagContainer = ""
    let bagTotal = 0;

    for (let member of membersObj.members) {
        if (member.cookiePassword === cookieShortPass) {
            for (let product of member.shoppingBag) {
                productBox = `<div class="bagContainer" id="bagContainer">
                            <div class="myBagBox" id="myBagBox">
                                <div class="bagItem">
                                    <div class="imageBox">
                                        <img src="../images/${product.productMainImage}">
                                    </div>
                                    <div class="bagItemDetails">
                                        <h1 class="bagItemTitle">${product.productName}</h1>
                                        <h3 class="bagItemDescription">${product.productDescription}</h3>
                                    </div>
                                    <div class="counter">
                                        <div class="bagProductCount">${product.productAmount}</div>
                                    </div>
                                    <div class="prices">
                                        <div class="bagProductPrice">${product.productPrice}</div>
                                    </div>
                                </div>
                            </div>
                        </div>`

                bagContainer += productBox;
                bagTotal += parseInt((product.productPrice).slice(1)) * parseInt(product.productAmount)
            }
            bagContainer += `<div class="bagTotal">Total: $${bagTotal}</div>
                             <div class="checkoutDetails">
                                <form id="coShippingForm" onsubmit="return false">
                                  <h2>Shipping Address</h2><br>
                                  <label for="coName"><b></b></label>
                                  <input type="text" id="coName" placeholder="Full Name" value="" required><br>
                                  <label for="coAddress"><b></b></label>
                                  <input type="text" id="coAddress" placeholder="Address" value="" required><br>
                                  <label for="coCountry"><b></b></label>
                                  <input type="text" id="coCountry" placeholder="Country" value="" required><br><br>
                            
                                  <br><br>
                                  <h2>Shipping Method</h2><br>
                                  <input type="radio" class="coShipMethods" id="ship1" value="express" name="shippingMethod" required>
                                  <label for="ship1" class="coShipMethods">Express delivery - up to 24 hours!</label><br>
                                  <input type="radio" class="coShipMethods" id="ship2" value="regular" name="shippingMethod">
                                  <label for="ship2" class="coShipMethods">Regular delivery - 1 to 5 business days</label><br><br>
                            
                                  <input type="submit" value="Pay and Place Order" id="checkoutSubmit">
                                </form>
                              </div>`
        }
    }

    let head = `<!DOCTYPE html>
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="../home.css">
                    <title>Checkout</title> 
                    <link rel="icon" href="../images/siteIcon.png" type="image/icon type">
                </head>`

    let pageContent = ` <h2 id="bagTitle">Checkout</h2>`

    let closure = ` <script type="module" defer src="./checkoutPage.js"></script>
                    <script type="module" defer src="../persist/persist.js"></script>
                    <script type="module" defer src="../homePage/homePage.js"></script>
                    <script type="module" defer src="../searchPage/searchPage.js"></script>
                    </html>`

    let myBagHTML = [head, header, pageContent, bagContainer, footer, closure].join(``)

    await fs.writeFile(`./shoppingBag/checkoutPage.html`,myBagHTML, (error) => {
        console.log(error)
    })
}



// ****** Global Variables of Html Code ******

let header = `
    
    <body>
    <div class="header">
        <div class="menu">
            <div class="dropdown">
                <div class="menuItem" id="newInBtn">New In
                    <div class="dropdown-content">
                        <a id="headerAllCat">All Categories</a>
                    </div>
                </div>
            </div>
            <div class="dropdown">
                <div class="menuItem" id="clothingBtn">Clothing
                    <div class="dropdown-content">
                        <a id="headerTops" href="../productsPages/productsPage_Tops.html">Tops</a>
                        <a id="headerBras" href="../productsPages/productsPage_Bras.html">Bras</a>
                        <a id="headerBottoms" href="../productsPages/productsPage_Bottoms.html">Bottoms</a>
                    </div>
                </div>
            </div>
            <div class="dropdown">
                <div class="menuItem" id="essentialsBtn">Essentials
                    <div class="dropdown-content">
                        <a id="headerMats" href="../productsPages/productsPage_Mats.html">Yoga Mats</a>
                        <a id="headerBlocks" href="../productsPages/productsPage_Blocks.html">Yoga Blocks</a>
                        <a id="headerBags" href="../productsPages/productsPage_Bags.html">Bags</a>
                    </div>
                </div>
            </div>
        </div>
    
        <img src="../images/Logo1.png" id="MainLogo" onclick="location.href='../homePage/homePage.html';">
    
        <div class="headerIcons">
            <div class="headerBtn" id="searchBtn" >
                <img src="../images/searchIcon.png">
                <p>Search</p>
            </div>
            <div class="headerBtn" id="logInBtn" >
                <img src="../images/logInIcon.png">
                <p>Log In</p>
                <div class="dropdown-content">
                    <a id="headerLogOut">Log Out</a>
                </div>
            </div>
            <div class="headerBtn" id="myBagBtn" href="../myBagPage.html">
                <img src="../images/myBagIcon.png">
                <p>My Bag</p>
            </div>
        </div>
    </div>
    <div class="searchBar" id="searchBar">
        <form>
            <input class="searchInput" placeholder="Search an item here" type="search" value="" id="search">
        </form>
    </div>`

let footer = `
    <div class="footer">
        <div class="footerInfo">
            <p>Receive exclusive promotions, private sales and news</p>
            <input type="email" placeholder="Email" name="email" id="emailSubscription" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\\\.[a-z]{2,}$" required>
        </div>
        <div class="subscribeBtn">
            <button type="button" class="footerSubscription" id=footerSubscriptionBtn>Subscribe</button>
        </div>
    
        <div class="footerBtns">
            <a class="footerItem" id="footerAboutUsBtn" href="../footerPages/aboutUsPage.html">About Us</a>
            <a class="footerItem" id="footerHelpBtn" href="../footerPages/helpPage.html">Help</a>
            <a class="footerItem" id="footerContactBtn" href="../footerPages/contactPage.html">Contact</a>
        </div>
    </div>
    </body>`


module.exports = webServer;