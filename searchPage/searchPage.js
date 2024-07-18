import {fetchSearchResult} from "../persist/persist.js";

const searchBtn = document.getElementById('searchBtn');
const searchBar = document.getElementById('searchBar');

// ****** Header Search Bar ******

if (searchBtn)
{
    searchBtn.addEventListener('click', function (e) {
        searchBar.style.display = "block"
        document.getElementById("mainHomePageImg").style.margin = "0";
        document.getElementById("mainImage").style.margin = "0";
    })
}

searchBar.addEventListener('keypress', async function (keyPressed) {
    if (keyPressed.key === 'Enter') {
        await fetchSearchResult(document.getElementById("search").value)
        keyPressed.preventDefault()
    }
})
