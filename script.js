let lastData = []; //This var will keep track of the data that is last pulled from the API

document.addEventListener('DOMContentLoaded', function() {
    const locateBtn = document.getElementById('locate-btn');
    const presetLocations = document.getElementById('preset-locations');
    const customLocBtn = document.getElementById('custom-loc-btn');
    const customLocationInput = document.getElementById('custom-location');
    const filterSunrise = document.getElementById('filter-sunrise');
    const filterSunset = document.getElementById('filter-sunset');
    const filterSolarNoon = document.getElementById('filter-solar-noon');
    const filterDayLength = document.getElementById('filter-day-length');

    //The buton will say Geolocation is not supported by this browser as alert
    locateBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });

    
    presetLocations.addEventListener('change', function() {
        const [lat, lng] = this.value.split(',');
        getSunriseSunset(lat, lng);
    });

    customLocBtn.addEventListener('click', function() {
        const [lat, lng] = customLocationInput.value.split(',');
        if (lat && lng) {
            getSunriseSunset(lat, lng);
        } else {
            alert("Please enter a valid latitude and longitude.");
        }
    });

    filterSunrise.addEventListener('change', updateResults);
    filterSunset.addEventListener('change', updateResults);
    filterSolarNoon.addEventListener('change', updateResults);
    filterDayLength.addEventListener('change', updateResults);
});

function showPosition(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    getSunriseSunset(lat, lng);
}

function showError(error) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
}

function getSunriseSunset(lat, lng) {
    const urls = [
        `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=today&formatted=0`,
        `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=tomorrow&formatted=0`
    ];

    Promise.all(urls.map(url => fetch(url).then(resp => resp.json())))
        .then(data => {
            if (data[0].status === 'OK' && data[1].status === 'OK') {
                lastData = data; // Store the data for future use
                displayResults(data[0].results, 'Today');
                displayResults(data[1].results, 'Tomorrow');
            } else {
                throw new Error('Error retrieving data');
            }
        })
        .catch(error => {
            alert(error.message);
        });
}

function displayResults(data, day) {
    const resultsDiv = document.getElementById('results');
    if (day === 'Today') {
        resultsDiv.innerHTML = '';
    }

    const localSunrise = convertToLocalTime(data.sunrise);
    const localSunset = convertToLocalTime(data.sunset);
    const localSolarNoon = convertToLocalTime(data.solar_noon);

    const showSunrise = document.getElementById('filter-sunrise').checked;
    const showSunset = document.getElementById('filter-sunset').checked;
    const showSolarNoon = document.getElementById('filter-solar-noon').checked;
    const showDayLength = document.getElementById('filter-day-length').checked;

    let content = `<div class="results-day">
                <h3>${day}</h3>`;

    if (showSunrise) {
        content += `<p>Sunrise: ${localSunrise}</p>`;
    }
    if (showSunset) {
        content += `<p>Sunset: ${localSunset}</p>`;
    }
    if (showSolarNoon) {
        content += `<p>Solar Noon: ${localSolarNoon}</p>`;
    }
    if (showDayLength) {
        content += `<p>Day Length: ${data.day_length}</p>`;
    }

    content += `</div>`;

    resultsDiv.innerHTML += content;
}

function updateResults() {
    if (lastData.length > 0) {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = ''; 
        displayResults(lastData[0].results, 'Today');
        displayResults(lastData[1].results, 'Tomorrow');
    }
}

function convertToLocalTime(utcTime) {
    const date = new Date(utcTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
