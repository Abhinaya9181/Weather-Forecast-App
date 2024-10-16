document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = "19e5c2b1849f279748cd78c51f06aa56";  // API key for OpenWeatherMap
    const searchBtn = document.getElementById("searchBtn");
    const locationBtn = document.getElementById("locationBtn");
    const searchCity = document.getElementById("searchCity");
    const recentCitiesDropdown = document.getElementById("recentCitieS");

    // Event listeners for search button, current location button, and input field focus
    searchBtn.addEventListener("click", handleCitysearch);
    locationBtn.addEventListener("click", fetchCurrentloc);
    searchCity.addEventListener("focus", getRecentCities);

    // Function to handle city search when the search button is clicked
    function handleCitysearch() {
        const cityName = searchCity.value.trim();   // Get the city name from input field
        if (cityName) {
            storeRecentCity(cityName);  // Save the city to recent searches
            retrieveWeatherDataByCity(cityName);  // Fetch weather data for the city
            searchCity.value="";
        } else {
            alert("Please enter city name");   // Alert if no city name is provided
        }
    }

    // Function to fetch weather data by city name using the OpenWeatherMap API
    function retrieveWeatherDataByCity(cityName) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);   // Handle HTTP errors
                }
                return response.json();
            })
            .then(data => {
                if (data.cod === 200) {
                    const { coord } = data;     // Get coordinates from the response
                    retrieveWeatherDataByCoords(coord.lat, coord.lon);   // Fetch weather by coordinates
                    storeRecentCity(data.name); // Save the city name from API response
                } else {
                    alert(data.message);  // Alert if city is not found
                }
            })
            .catch(error => {
                alert("Failed to fetch weather data");
            });
    }

     // Function to fetch weather data by geographic coordinates (latitude, longitude)

    function retrieveWeatherDataByCoords(lat, lon) {
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

         // Fetch current weather data
        fetch(currentWeatherUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`); // Handle HTTP errors
                }
                return response.json();
            })
            .then(data => {
                displayCurrentWeather(data);  // Display current weather data
                storeRecentCity(data.name); // Save the city name to recent searches
            })
            .catch(() => {
                alert("Failed to fetch current weather");
            });

         // Fetch 5-day weather forecast data
        fetch(forecastUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                displayExtendedForecast(data.list);  // Display extended forecast data
            })
            .catch(() => {
                alert("Failed to fetch forecast data");
            });
    }

    // Function to display current weather data on the page
    function displayCurrentWeather(data) {
        const weatherData = document.getElementById("weather-data");
        weatherData.style.backgroundColor = "white";
        weatherData.style.width = "300px";
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
        weatherData.innerHTML = `
            <h2>${data.name} <span>(${formattedDate})</span></h2>
            <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
            <p>${data.weather[0].description}</p>
            <p>Temp: ${data.main.temp}°C</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind: ${data.wind.speed} m/s</p>`;
        weatherData.classList.remove("hidden");
    }

     // Function to display the 5-day weather forecast data
    function displayExtendedForecast(forecastList) {
        const forecastDiv = document.getElementById("extended-forecast");
        forecastDiv.innerHTML = forecastList.filter((_, index) => index % 8 === 0).slice(0, 5).map(day => `
            <div class="text-white  p-2 bg-black lg:p-4 rounded-lg shadow-md text-center">
                <h3 class="text-2xl mt-2">(${new Date(day.dt * 1000).toLocaleDateString()})</h3>
                <div class="flex justify-center"><img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}"></div>
                <p class="text-lg">Temp: ${day.main.temp}°C</p>
                <p class="text-lg">Humidity: ${day.main.humidity}%</p>
                <p class="text-lg mb-2">Wind: ${day.wind.speed} m/s</p>
            </div>
        `).join('');
    }

     // Function to save recent city searches in local storage
    function storeRecentCity(cityName) {
        let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
        recentSearches = recentSearches.filter(search => search.toLowerCase() !== cityName.toLowerCase());
        recentSearches.unshift(cityName);
        if (recentSearches.length > 6) {
            recentSearches.pop();
        }
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
        getRecentCities();
    }

    // Function to retrieve recent cities from local storage and update the dropdown
    function getRecentCities() {
        const recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
        if (recentSearches.length > 0) {
            recentCitiesDropdown.innerHTML = recentSearches.map(cityName => `<option value="${cityName}">${cityName}</option>`).join('');
            recentCitiesDropdown.classList.remove("hidden");
        } else {
            recentCitiesDropdown.classList.add("hidden");
        }
    }

     // Function to get the current location using the browser's geolocation API
    function fetchCurrentloc() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                retrieveWeatherDataByCoords(latitude, longitude);
            }, error => {
                alert(error.message);
            });
        } else {
            alert("Geolocation is not supported");
        }
    }
      // Event listener for recent cities dropdown selection
    recentCitiesDropdown.addEventListener("change", (e) => {
        const selectedCity = e.target.value;
        if (selectedCity) {
            retrieveWeatherDataByCity(selectedCity);
        }
        recentCitiesDropdown.classList.add("hidden");
    });
});
