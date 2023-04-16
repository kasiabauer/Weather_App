
document.addEventListener('DOMContentLoaded', () => {

    // Main Nodes
    const section = document.querySelector('#app')
    const templateWeatherModule = document.querySelector('.module__weather');

    // Cloning template module
    const weatherModule = templateWeatherModule.cloneNode(true)
    section.appendChild(weatherModule);

    // Secondary Nodes
    const addCityBtn = document.querySelector('#add-city');
    const searchModule = document.querySelector('.module__form');
    // templateWeatherModule.removeAttribute('hidden'); // jak usunąć atrybut hidden?
    const currentWeatherTemp = document.getElementsByClassName('temperature__value');
    const currentWeatherIcon = document.querySelector('.weather__icon').querySelector('img')
    const currentWeatherCity = document.querySelector('.city__name')
    const currentWeatherPressure = document.querySelector('.weather__details').querySelector('.pressure__value');
    const currentWeatherHumidity = document.querySelector('.weather__details').querySelector('.humidity__value');
    const currentWeatherWindSpeed = document.querySelector('.weather__details').querySelector('.wind-speed__value');
    const currentForecast = document.querySelector('.weather__forecast').querySelectorAll('li');
    const allWeatherModules = document.querySelectorAll('.module__weather')
    const closeSearchBtn = searchModule.querySelector('.btn--close');
    const searchFrom = document.querySelector('.find-city');


    // Get User IP  & Weather Data
    const getIpAsync2 = async () => {

        try {
            // Get User IP
            const response = await fetch('https://api64.ipify.org');
            const ip = await response.text();

            // Get Weather data with User IP
            const apiKey = '8e424e27a8804b3eaf694904231604'
            const response2 = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${ip}&days=6`);
            const { location, current, forecast } = await response2.json();

            // Getting Weather Data from Weather API based on User IP or City
            const getWeather = async (cityOrIp) => {
                const response2 = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityOrIp}&days=6`);
                const { location, current, forecast } = await response2.json();
                return {location: location, current: current, forecast: forecast}
            }

            const defaultResult = await getWeather(ip);

            //// For testing purposes - reviewing getWeather API data for a specific city
            // const myResult = await getWeather('wroclaw');
            // console.log(myResult['location'])

            //// For Testing purposes - reviewing getWeather API data - forecast
            // console.log(forecast);


            // Structured Current Weather data from Weather API based on User IP or City
            const getCurrentWeather = async (cityResult) => {
                return {
                    'city': cityResult.location['name'],
                    'condition': cityResult.current['condition'].text,
                    'icon': cityResult.current['condition']['icon'],
                    'temp': cityResult.current['temp_c'],
                    'humidity': cityResult.current['humidity'],
                    'pressure': cityResult.current['pressure_mb'],
                    'wind': cityResult.current['wind_kph'],
                };
            }

            let currentWeather = await getCurrentWeather(defaultResult);

            // Structured Forecast data from Weather API based on User IP or City
            const get5DayForecast = async (cityResult) => {
                const forecast5day = [];
                cityResult.forecast['forecastday'].forEach( (forecastDay) => {
                    // console.log(forecastDay['day']['condition'].text)
                    forecast5day.push({
                        date: forecastDay['date'],
                        temp: forecastDay['day']['avgtemp_c'],
                        condition: forecastDay['day']['condition'].text,
                        icon: forecastDay['day']['condition']['icon']
                    });
                });
                return forecast5day;
            }

            const forecast5day = await get5DayForecast(defaultResult);




            // TODO: Function for choosing weather icon based on Weather conditions
            // Now working properly
            // const findIconFunc = (currCondition) => {  // dlaczego funkcje nie działają?
            //     const conditionsIcon = {
            //         Sunny: 'clear-day.svg',
            //         Clear: 'clear-night.svg',
            //         Cloudy: 'cloudy.svg',
            //         Fog: 'fog.svg',
            //         Hail: 'hail.svg',
            //         PartlyCloudy: 'partly-cloudy-day.svg',
            //         PartlyCloudyNigh: 'partly-cloudy-night.svg',
            //         Rain: 'rain.svg',
            //         Sleet: 'sleet.svg',
            //         Snow: 'snow.svg',
            //         Thunderstorm: 'thunderstorm.svg',
            //         Tornado: 'tornado.svg',
            //         Wind: 'wind.svg'
            //     }
            //     // console.log(conditionsIcon[currCondition])
            //     return conditionsIcon['currCondition'];
            // }

            // TODO: Simplified structured data for choosing weather icon based on Weather conditions
            // Not using currently
            // const findIcon = {
            //     Sunny: 'clear-day.svg',
            //     Clear: 'clear-night.svg',
            //     Cloudy: 'cloudy.svg',
            //     Fog: 'fog.svg',
            //     Hail: 'hail.svg',
            //     PartlyCloudy: 'partly-cloudy-day.svg',
            //     PartlyCloudyNigh: 'partly-cloudy-night.svg',
            //     Rain: 'rain.svg',
            //     Mist: 'rain.svg', // no icon
            //     Overcast: 'rain.svg', // no icon
            //     Sleet: 'sleet.svg',
            //     Snow: 'snow.svg',
            //     Thunderstorm: 'thunderstorm.svg',
            //     Tornado: 'tornado.svg',
            //     Wind: 'wind.svg'
            // }

            // Structured data 5-day forecast based on User IP

            // Filling Weather Card with currentWeather
            currentWeatherTemp[0].innerHTML = currentWeather['temp'];
            // let icon = findIcon[currentWeather['condition']]
            let icon = currentWeather['icon']
            currentWeatherIcon.src = `https://${icon}`
            currentWeatherCity.innerText = currentWeather['city'];
            currentWeatherPressure.innerText = `${currentWeather['pressure']} hPa`;
            currentWeatherHumidity.innerText = `${currentWeather['humidity']}%`;
            currentWeatherWindSpeed.innerText = `${currentWeather['wind']} m/s`;

            // Filling Weather Card with 5-day forecast from 'forecast5day'
            // If 3-day forecast instead of 5 is showing that means paid Weather API ended and switched to free plan
            currentForecast.forEach((li, i) => {
                let day = li.querySelector('.day');
                day.innerHTML = forecast5day[i].date;
                let img = li.querySelector('img');
                let icon = forecast5day[i].icon;
                img.src = `https://${icon}`; // na module2
                let temperature = li.querySelector('.temperature__value')
                temperature.innerHTML = forecast5day[i].temp;
                i++;
            })

            // Module Management - Closing Weather Modules
            allWeatherModules.forEach((weatherModule) => {
                const closeModuleBtn = weatherModule.querySelector('.btn--close');
                closeModuleBtn.addEventListener('click', () => {
                    weatherModule.remove();
                })
            })

            // Module Management - Opening Search Module
            addCityBtn.addEventListener('click', () => {
                searchModule.removeAttribute('hidden');
            });

            // Module Management - Closing Search Module
            closeSearchBtn.addEventListener('click', () => {
                searchModule.setAttribute('hidden', null);
            });

            //TODO Adding a City
            searchFrom.addEventListener('submit', async(e) => {
                e.preventDefault();
                let input = searchFrom.querySelector('input');
                let inputValue = (input.value).toLowerCase();
                searchModule.setAttribute('hidden', null);

                // Fetching Weather Data based on input
                const newCityResult = await getWeather(inputValue);
                const newCityCurrentWeather = await getCurrentWeather(newCityResult);
                const newCityForecast = await get5DayForecast(newCityResult);


                // For testing purposes - reviewing inputValue & getWeather API data for new City
                // console.log(inputValue);
                // console.log(newCityCurrentWeather);
                // console.log(newCityForecast);
                // console.log(newModule);

                // Creating new Weather Module for city from input
                const newModule = document.querySelector('.module__weather').cloneNode(true);

                let newCityTemp = newModule.getElementsByClassName('temperature__value');
                let newCityIcon = newModule.querySelector('.weather__icon').querySelector('img')
                let newCityName = newModule.querySelector('.city__name');
                let newCityPressure = newModule.querySelector('.weather__details').querySelector('.pressure__value');
                let newCityHumidity = newModule.querySelector('.weather__details').querySelector('.humidity__value');
                let newCityWindSpeed = newModule.querySelector('.weather__details').querySelector('.wind-speed__value');

                // Filling New Weather Module with Current Weather data
                newCityTemp[0].innerHTML = newCityCurrentWeather['temp'];
                let newIcon = newCityCurrentWeather['icon'];
                newCityIcon.src = `https://${newIcon}`;
                newCityName.innerHTML = newCityCurrentWeather['city'];
                newCityPressure.innerText = `${newCityCurrentWeather['pressure']} hPa`;
                newCityHumidity.innerText = `${newCityCurrentWeather['humidity']}%`;
                newCityWindSpeed.innerText = `${newCityCurrentWeather['wind']} m/s`;

                //TODO Filling New Weather Module with forecast data (newCityForecast)

                // Adding New Weather Module to HTML
                weatherModule.parentNode.insertBefore(newModule, weatherModule.nextSibling);

                // Clearing inputValue after adding new City
                input.value = '';

            })

        } catch (err) {
            console.log(err)
        }


}
getIpAsync2();
})