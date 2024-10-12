document.addEventListener('DOMContentLoaded', function() {
    const locateBtn = document.getElementById('locate-btn');
    const presetLocations = document.getElementById('preset-locations');

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
        `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=today`,
        `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=tomorrow`
    ];

    Promise.all(urls.map(url => fetch(url).then(resp => resp.json())))
        .then(data => {
            if (data[0].status === 'OK' && data[1].status === 'OK') {
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
    
    resultsDiv.innerHTML += `
        <div class="results-day">
            <h3>${day}</h3>
            <p>Sunrise: ${data.sunrise}</p>
            <p>Sunset: ${data.sunset}</p>
            <p>Solar Noon: ${data.solar_noon}</p>
            <p>Day Length: ${data.day_length}</p>
        </div>
    `;
}