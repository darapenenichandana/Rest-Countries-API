//API URL with fields required
const API_URL = "https://restcountries.com/v3.1/all?fields=name,capital,region,flags,cca2";

//container- where all the country cards will be displayed
const container = document.getElementById("countriesContainer");

//Filter inputs
const nameFilter = document.getElementById("nameFilter");
const codeFilter = document.getElementById("codeFilter");
const regionFilter = document.getElementById("regionFilter");
const capitalFilter = document.getElementById("capitalFilter");

//pagination buttons
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const viewFavoritesBtn = document.getElementById("viewFavoritesBtn"); // button in HTML

let allCountries = [];
let filteredCountries = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 24;
let showingFavorites = false; // toggle flag

//Fetch data from API URL
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    allCountries = data.sort((a, b) =>
      a.name.common.localeCompare(b.name.common)
    );
    filteredCountries = allCountries;
    render();
  });


function render() {
  container.innerHTML = "";

  if (filteredCountries.length === 0) {
    // Error message for no countries found or no favorites
    container.innerHTML = `
      <div class="text-center text-danger mt-5">
        <h4>${showingFavorites ? "No favorites yet" : "No country found"}</h4>
      </div>`;
    return;
  }
 
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageData = filteredCountries.slice(start, end);
 //creates each country card
  pageData.forEach(c => {
    container.innerHTML += `
      <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
        <div class="card h-100">
          <img src="${c.flags.png}" class="card-img-top flag">
          <div class="card-body">
            <h5>${c.name.common}</h5>
            <p><b>Capital:</b> ${c.capital ? c.capital[0] : "N/A"}</p>
            <p><b>Region:</b> ${c.region}</p>
            <p><b>Code:</b> ${c.cca2}</p>
            <button class="btn btn-sm btn-warning favorite-btn" data-code="${c.cca2}">
              ⭐ Favorite
            </button>
          </div>
        </div>
      </div>`;
  });

  // disables prev/next buttons based on the page
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = end >= filteredCountries.length;

  // Favorite button logic (add/remove)
  document.querySelectorAll(".favorite-btn").forEach(btn => {
    const code = btn.getAttribute("data-code");
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    
    // Highlight if already favorite
    if (favorites.includes(code)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }

    btn.addEventListener("click", () => {
      let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

      if (favorites.includes(code)) {
        // Remove from favorites
        favorites = favorites.filter(c => c !== code);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        btn.classList.remove("active");
        alert("Removed from favorites!");
      } else {
        // Add to favorites
        favorites.push(code);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        btn.classList.add("active");
        alert("Added to favorites!");
      }
    });
  });
}

//Filter's country based on the field entered or button choosen
function applyFilters() {
  const name = nameFilter.value.trim().toLowerCase();
  const code = codeFilter.value.trim().toLowerCase();
  const region = regionFilter.value.trim().toLowerCase();
  const capital = capitalFilter.value.trim().toLowerCase();

  filteredCountries = allCountries.filter(c => {
    const countryRegion = c.region ? c.region.toLowerCase() : "";
    const countryCapital =
      c.capital && c.capital.length > 0 ? c.capital[0].toLowerCase() : "";

    return (
      (!name || c.name.common.toLowerCase().includes(name)) &&
      (!code || c.cca2.toLowerCase().includes(code)) &&
      (!region || region === "all" || countryRegion.includes(region)) &&
      (!capital || countryCapital.includes(capital))
    );
  });

  currentPage = 1;
  showingFavorites = false;
  viewFavoritesBtn.textContent = "View Favorites";
  render();
}


//Handles filters and pagination button clicks
nameFilter.addEventListener("input", applyFilters);
codeFilter.addEventListener("input", applyFilters);
regionFilter.addEventListener("change", applyFilters);
capitalFilter.addEventListener("input", applyFilters);

prevBtn.addEventListener("click", () => {
  currentPage--;
  render();
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  render();
});

// Toggle Favorites / All Countries
viewFavoritesBtn.addEventListener("click", () => {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (!showingFavorites) {
    // Show favorites
    if (favorites.length === 0) {
      alert("No favorites yet!");
      return;
    }
    filteredCountries = allCountries.filter(c => favorites.includes(c.cca2));
    currentPage = 1;
    showingFavorites = true;
    viewFavoritesBtn.textContent = "Show All Countries";
  } else {
    // Show all countries
    filteredCountries = allCountries;
    currentPage = 1;
    showingFavorites = false;
    viewFavoritesBtn.textContent = "View Favorites";
  }
  render();
});