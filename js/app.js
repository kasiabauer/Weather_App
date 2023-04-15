
document.addEventListener('DOMContentLoaded', (e) => {
    const weatherModule = document.querySelector('.module__weather');
    const addCityBtn = document.querySelector('#add-city');
    const searchModule = document.querySelector('.module__form');
    // weatherModule.removeAttribute('hidden'); // jak usunąć atrybut hidden?
    const currentWeatherTemp = document.getElementsByClassName('temperature__value');
    const currentWeatherIcon = document.querySelector('.weather__icon').querySelector('img')
    const currentWeatherCity = document.querySelector('.city__name')
    const currentWeatherPressure = document.querySelector('.weather__details').querySelector('.pressure__value');
    const currentWeatherHumidity = document.querySelector('.weather__details').querySelector('.humidity__value');
    const currentWeatherWindSpeed = document.querySelector('.weather__details').querySelector('.wind-speed__value');
    const currentForecast = document.querySelector('.weather__forecast').querySelectorAll('li');
    const closeModuleBtn = weatherModule.querySelector('.btn--close');
    const closeSearchBtn = searchModule.querySelector('.btn--close');
    const closeBtns = document.querySelectorAll('.btn--close');
    const searchFrom = document.querySelector('.find-city');

    // Get User IP  & Weather Data
    const getIpAsync2 = async () => {

        try {
            // Get User IP
            const response = await fetch('https://api64.ipify.org');
            const ip = await response.text();

            // Get Weather data with User IP
            const response2 = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=b8605740c0e34753bc7204147230102&q=${ip}&days=6`);
            const { location, current, forecast } = await response2.json();

            // Getting Weather Data from Weather API based on User IP or City
            const getWeather = async (cityOrIp) => {
                const response2 = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=b8605740c0e34753bc7204147230102&q=${cityOrIp}&days=6`);
                const { location, current, forecast } = await response2.json();
                return {location: location, current: current, forecast: forecast}
            }

            const defaultResult = await getWeather(ip);


            // some test
            // const myResult = await getWeather('wroclaw');
            // console.log(myResult['location'])


            // Structured Current Weather data from Weather API based on User IP or City
            const getCurrentWeather = async (cityResult) => {
                let currentWeather = {
                    'city': location['name'],
                    'condition': current['condition'].text,
                    'icon': current['condition']['icon'],
                    'temp': current['temp_c'],
                    'humidity': current['humidity'],
                    'pressure': current['pressure_mb'],
                    'wind': current['wind_kph'],
                }
                return currentWeather;
            }

            let currentWeather = await getCurrentWeather(defaultResult);

            // Structured Forecast data from Weather API based on User IP or City
            const get5DayForecast = async (cityResult) => {
                const forecast5day = [];
                forecast['forecastday'].forEach( (forcastDay, i) => {
                    // console.log(forcastDay['day']['condition'].text)
                    forecast5day.push({
                        date: forcastDay['date'],
                        temp: forcastDay['day']['avgtemp_c'],
                        condition: forcastDay['day']['condition'].text,
                        icon: forcastDay['day']['condition']['icon']
                    });
                });
                return forecast5day;
            }

            const forecast5day = await get5DayForecast(defaultResult);



            // Now working properly
            // Function for choosing weather icon based on Weather conditions
            const findIconFunc = (currCondition) => {  // dlaczego funkcje nie działają?
                const conditionsIcon = {
                    Sunny: 'clear-day.svg',
                    Clear: 'clear-night.svg',
                    Cloudy: 'cloudy.svg',
                    Fog: 'fog.svg',
                    Hail: 'hail.svg',
                    PartlyCloudy: 'partly-cloudy-day.svg',
                    PartlyCloudyNigh: 'partly-cloudy-night.svg',
                    Rain: 'rain.svg',
                    Sleet: 'sleet.svg',
                    Snow: 'snow.svg',
                    Thunderstorm: 'thunderstorm.svg',
                    Tornado: 'tornado.svg',
                    Wind: 'wind.svg'
                }
                // console.log(conditionsIcon[currCondition])
                return conditionsIcon['currCondition'];

            }

            // Not using currently
            // Simplified structured data for choosing weather icon based on Weather conditions
            const findIcon = {
                Sunny: 'clear-day.svg',
                Clear: 'clear-night.svg',
                Cloudy: 'cloudy.svg',
                Fog: 'fog.svg',
                Hail: 'hail.svg',
                PartlyCloudy: 'partly-cloudy-day.svg',
                PartlyCloudyNigh: 'partly-cloudy-night.svg',
                Rain: 'rain.svg',
                Mist: 'rain.svg', // no icon
                Overcast: 'rain.svg', // no icon
                Sleet: 'sleet.svg',
                Snow: 'snow.svg',
                Thunderstorm: 'thunderstorm.svg',
                Tornado: 'tornado.svg',
                Wind: 'wind.svg'
            }

            // console.log(forecast);

            // Structured data 5-day forecast based on User IP


            // Filling Weather Card with currentWeather
            currentWeatherTemp[0].innerHTML = currentWeather['temp'];
            // let icon = findIcon[currentWeather['condition']]
            let icon = currentWeather['icon']
            currentWeatherIcon.src = `http://${icon}`
            currentWeatherCity.innerText = currentWeather['city'];
            currentWeatherPressure.innerText = `${currentWeather['pressure']} hPa`;
            currentWeatherHumidity.innerText = `${currentWeather['humidity']}%`;
            currentWeatherWindSpeed.innerText = `${currentWeather['wind']} m/s`;

            // Filling Weather Card with 5-day forecast from forecast5day
            currentForecast.forEach((li, i) => {
                let day = li.querySelector('.day');
                day.innerHTML = forecast5day[i].date;   // 5 Day forecast is available in paid Weather API plan
                let img = li.querySelector('img');
                let icon = forecast5day[i].icon;
                img.src = `http://${icon}`; // na module2
                let temperature = li.querySelector('.temperature__value')
                temperature.innerHTML = forecast5day[i].temp;
                i++;
            })

            // const newModule = document.querySelector('.module__weather').cloneNode(true);
            // console.log(newModule);
            // weatherModule.parentNode.insertBefore(newModule, weatherModule.nextSibling);

            // Module Management - Closing Weather Module
            closeModuleBtn.addEventListener('click', () => {
                weatherModule.remove();
            });

            // Module Management - Opening Search Module
            addCityBtn.addEventListener('click', () => {
                searchModule.removeAttribute('hidden');
            });

            // Module Management - Closing Search Module
            closeSearchBtn.addEventListener('click', () => {
                searchModule.setAttribute('hidden', null);
            });


            searchFrom.addEventListener('submit', async(e) => {
                e.preventDefault();
                let input = searchFrom.querySelector('input');
                let inputValue = (input.value).toLowerCase();
                console.log(inputValue);
                searchModule.setAttribute('hidden', null);
                // const getNewCityData = async () => {
                const newCityResult = await getWeather(inputValue);
                const newCityCurrentWeather = await getCurrentWeather(newCityResult);
                const newCityForecast = await get5DayForecast(newCityResult);
                const newModule = document.querySelector('.module__weather').cloneNode(true);
                // console.log(newModule);
                weatherModule.parentNode.insertBefore(newModule, weatherModule.nextSibling);
                // }
                // getNewCityData();
            })


            // Not using this
            // How to get to current button with 'this'?
            closeBtns.forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    console.log('close');
                    console.log(btn);
                    console.log(this);
                });
            })
        } catch (err) {
            console.log(err)
        }


}
getIpAsync2();
})