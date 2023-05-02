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

    const currentWeatherTemp = weatherModule.getElementsByClassName('temperature__value');
    const currentWeatherIcon = weatherModule.querySelector('.weather__icon').querySelector('img')
    const currentWeatherCity = weatherModule.querySelector('.city__name')
    const currentWeatherPressure = weatherModule.querySelector('.weather__details').querySelector('.pressure__value');
    const currentWeatherHumidity = weatherModule.querySelector('.weather__details').querySelector('.humidity__value');
    const currentWeatherWindSpeed = weatherModule.querySelector('.weather__details').querySelector('.wind-speed__value');
    const currentForecast = weatherModule.querySelector('.weather__forecast').querySelectorAll('li');
    const allWeatherModules = document.querySelectorAll('.module__weather')
    const closeSearchBtn = searchModule.querySelector('.btn--close');
    const searchFrom = document.querySelector('.find-city');
    const loading = document.querySelector('.loading')

    // Showing loading indicator (dual-ring) before API fetch data
    loading.setAttribute('style', 'display: block');
    loading.children[0].style.padding = '5% 50%'

    // Util function: Get weekday from date
    // Accepts a Date object or date string that is recognized by the Date.parse() method
    function getDayOfWeek(date) {
        const dayOfWeek = new Date(date).getDay();
        return isNaN(dayOfWeek) ? null :
            ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'][dayOfWeek];
    }

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

            // // For Testing purposes - reviewing getWeather API data - forecast
            // console.log(forecast);

            // Hiding loading indicator (dual-ring) after API fetch data
            loading.setAttribute('style', 'display: none');

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
                        date: getDayOfWeek(forecastDay['date']),
                        temp: forecastDay['day']['avgtemp_c'],
                        condition: forecastDay['day']['condition'].text,
                        icon: forecastDay['day']['condition']['icon']
                    });
                });
                return forecast5day;
            }

            // Showing weather module with fully loaded weather data
            weatherModule.removeAttribute('hidden');

            const forecast5day = await get5DayForecast(defaultResult);

            // TODO: Function for choosing custom weather icon based on Weather conditions
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
            currentForecast.forEach((li, i) => {
                try {
                    let day = li.querySelector('.day');
                    day.innerHTML = forecast5day[i].date;
                    let img = li.querySelector('img');
                    let icon = forecast5day[i].icon;
                    img.src = `https://${icon}`; // na module2
                    let temperature = li.querySelector('.temperature__value')
                    temperature.innerHTML = forecast5day[i].temp;
                    i++;
                }
                catch (err) {
                    if (i === 3) {
                        console.log(`API Free Trail expired: Forecast is limited to 3 days.`,
                        err)
                    }
                    else if (i > 3) {
                        // If 3-day forecast instead of 5-day is showing that means paid Weather API ended and
                        // switched to free plan.
                    }
                    else {
                        console.log(err)
                    }
                }
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

            // Adding a City
            searchFrom.addEventListener('submit', async(e) => {
                e.preventDefault();
                let input = searchFrom.querySelector('input');
                let inputValue = (input.value).toLowerCase();
                searchModule.setAttribute('hidden', null);

                // Fetching Weather Data based on input
                const newCityResult = await getWeather(inputValue);
                const newCityCurrentWeather = await getCurrentWeather(newCityResult);
                const newCityCurrentForecast = await get5DayForecast(newCityResult);

                // For testing purposes - reviewing inputValue & getWeather API data for new City
                // console.log(inputValue);
                // console.log(newCityCurrentWeather);
                // console.log(newCityForecast);
                // console.log(newModule);

                // Creating new Weather Module for city from input
                const newModule = templateWeatherModule.cloneNode(true);
                newModule.removeAttribute('hidden');

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

                //TODO: Write a function for filling current weather data so it works with both default weather module
                // & newly added. Do the same for forecast.

                // Filling New Weather Module with forecast data (newCityForecast)
                const newCityForecast = newModule.querySelector('.weather__forecast').querySelectorAll('li');

                newCityForecast.forEach((li, i) => {
                    try {
                        let day = li.querySelector('.day');
                        day.innerHTML = forecast5day[i].date;
                        let img = li.querySelector('img');
                        let icon = newCityCurrentForecast[i].icon;
                        img.src = `https://${icon}`; // na module2
                        let temperature = li.querySelector('.temperature__value')
                        temperature.innerHTML = newCityCurrentForecast[i].temp;
                        i++;
                    }
                    catch (err) {
                        if (i > 2) {
                            console.log(`API Free Trail expired: Forecast is limited to 3 days.`,
                                err)
                        }
                        else {
                            console.log(err)
                        }
                    }
                })

                // Closing new city weather modules
                const closeModuleBtn = newModule.querySelector('.btn--close');
                closeModuleBtn.addEventListener('click', () => {
                    newModule.remove();
                })


                // Adding New Weather Module to HTML
                section.insertBefore(newModule, section.children[1]);

                // Clearing inputValue after adding new City
                input.value = '';

            })
            //TODO: Return Error message for 'Bukareszt' or 'Sforne gacie'

        } catch (err) {
            console.log(err)
        }
}
getIpAsync2();
})