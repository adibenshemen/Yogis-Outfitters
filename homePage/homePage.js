import {addSubscription, logoutUser} from '../persist/persist.js'

// ****** Header And Footer ******

const allCategoriesBtn = document.getElementById('headerAllCat');
const topsBtn = document.getElementById('headerTops');
const brasBtn = document.getElementById('headerBras');
const bottomsBtn = document.getElementById('headerBottoms');
const matsBtn = document.getElementById('headerMats');
const blocksBtn = document.getElementById('headerBlocks');
const bagsBtn = document.getElementById('headerBags');
const aboutUsBtn = document.getElementById('footerAboutUsBtn');
const helpBtn = document.getElementById('footerHelpBtn');
const contactBtn = document.getElementById('footerContactBtn');
const loginBtn = document.getElementById('logInBtn');
const myBagBtn = document.getElementById('myBagBtn');
const footerSubscriptionBtn = document.getElementById('footerSubscriptionBtn');
const logoutBtn = document.getElementById('headerLogOut');

allCategoriesBtn.addEventListener("click", (e) => {
    window.location.href = "../productsPages/productsPage_New In.html"
})
topsBtn.addEventListener("click", (e) => {
    window.location.href = "../productsPages/productsPage_Tops.html"
})
brasBtn.addEventListener("click", (e) => {
    window.location.href = "../productsPages/productsPage_Bras.html"
})
bottomsBtn.addEventListener("click", (e) => {
    window.location.href = "../productsPages/productsPage_Bottoms.html"
})
matsBtn.addEventListener("click", (e) => {
    window.location.href = "../productsPages/productsPage_Mats.html"
})
blocksBtn.addEventListener("click", (e) => {
    window.location.href = "../productsPages/productsPage_Blocks.html"
})
bagsBtn.addEventListener("click", (e) => {
    window.location.href = "../productsPages/productsPage_Bags.html"
})

aboutUsBtn.addEventListener("click", (e) => {
    window.location.href = "../footerPages/aboutUsPage.html"
})
helpBtn.addEventListener("click", (e) => {
    window.location.href = "../footerPages/helpPage.html"
})
contactBtn.addEventListener("click", (e) => {
    window.location.href = "../footerPages/contactPage.html"
})
loginBtn.addEventListener("click", (e) => {
    window.location.href = "../usersLoginPages/loginPage.html"
})
myBagBtn.addEventListener("click", (e) => {
    window.location.href = "../shoppingBag/myBagPage.html"
})

footerSubscriptionBtn.addEventListener("click", () => {
    let emailSubscription = document.getElementById("emailSubscription").value;

    addSubscription(emailSubscription, footerSubscriptionBtn)
})

if (logoutBtn) {
    logoutBtn.addEventListener("click", async() => {
        await logoutUser()
    })
}


// ****** Home Page Loader ******

if (document.title === "Yogis Outfitters")
{
    document.onreadystatechange = function () {     // page fully load
        if (document.readyState === "complete") {    // hide loader after 1.5 seconds
            setTimeout(function(){
                document.getElementById('loader').style.display = 'none';
            }, 3000);
        }
    }
}


// ****** Home Page Buttons ******

const discoverMoreBtn = document.getElementById('maimHomePageImgBtn');
const upperLeftPicBtn = document.getElementById('leftTopImgHomeBtn');
const upperRightPicBtn = document.getElementById('rightTopImgHomeBtn');
const lowerLeftPicBtn = document.getElementById('leftBottomImgHomeBtn');
const lowerRightPicBtn = document.getElementById('rightBottomImgHomeBtn');
let newInImages = document.getElementsByClassName('homeNewIn')
let newInLinks = ['../singleProducts/Hailey Top.html', '../singleProducts/Vic Shorts.html',
                    '../singleProducts/Ive Bra.html', '../singleProducts/Jade Bra.html']

if (newInImages) {
    for (let i = 0; i < newInImages.length; i++) {
        newInImages[i].addEventListener("click", (e) => {
            window.location.href = newInLinks[i]
        })
    }
}

if (discoverMoreBtn)
{
    discoverMoreBtn.addEventListener("click", (e) => {
        window.location.href = "../productsPages/productsPage_New In.html"
    })
}

if (upperLeftPicBtn)
{
    upperLeftPicBtn.addEventListener("click", (e) => {
        window.location.href = "../productsPages/productsPage_Bottoms.html"
    })
}

if (upperRightPicBtn)
{
    upperRightPicBtn.addEventListener("click", (e) => {
        window.location.href = "../productsPages/productsPage_Mats.html"
    })
}

if (lowerLeftPicBtn)
{
    lowerLeftPicBtn.addEventListener("click", (e) => {
        window.location.href = "../productsPages/productsPage_Bags.html"
    })
}

if (lowerRightPicBtn)
{
    lowerRightPicBtn.addEventListener("click", (e) => {
        window.location.href = "../productsPages/productsPage_Blocks.html"
    })
}
