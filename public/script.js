'use strict';
class Travel {

    date = new Date();
    id = (Date.now() + '').slice(-10);
    clicks = 0;
    constructor(coords, distance, duration) {
        this.coords = coords; // [lat, log]
        this.distance = distance; // in km
        this.duration = duration; // in min
        
    }

    _setDescription() {
    // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
    click() {
        this.clicks++;
    }
}

class CarTravel extends Travel{
    type = 'cabride';
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.type = 'cabride'
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed
    }
 }
class BikeTravel extends Travel{
    type = 'bikeride';
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.type = 'bikeride'
        this.calcSpeed();
        this._setDescription();
    }
    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed
    }
 }

class WalkingTravel extends Travel{
    type = 'walking';
     constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.type = 'walking'
         this.calcPace();
         this._setDescription();
    }
    // min/km
    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace
    }
}

const run1 = new WalkingTravel([39, -12], 5.2, 24, 178);
const vehicle1 = new CarTravel([39, -12], 27, 95, 523);
const vehicle2 = new BikeTravel([39, -12], 21, 80, 478);

/////////////////////////////
// Application Architecture
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');



class App {
    #map;
    #mapZoomLevel = 13;
    #mapEvent;
    #travels = [];
    constructor() {

        // Get user's position
        this._getPosition();

        // Get data from local storage
        this._getLocalStorage();

        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    }
    
    _getPosition() {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
        function () {
            alert('Could not get your position');
        }
        );
    }
    
    _loadMap(position) {
        
        
            const { latitude } = position.coords;
            const { longitude } = position.coords;
            console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

            const coords = [latitude, longitude]; // A variable for coorrdinates array;
            this.#map = L.map('map').setView(coords, this.#mapZoomLevel);// basically here I used leaflet for maps form here to
            //used .fr/hot in place of .org after openstreetmap
            L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
            // Handling clicks on map
            this.#map.on('click', this._showForm.bind(this));

            this.#travels.forEach(work => {
                this._renderWorkoutMarker(work);
            });
        
    }
    
    _showForm(mapE) {
        this.#mapEvent = mapE;
                form.classList.remove('hidden');
                inputDistance.focus();
    }

    _hideForm() {

        // Empty inputs
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000);
    }
    
    _toggleElevationField() {

        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
     }
    
    _newWorkout(e) {
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));

        const allPositive = (...inputs) => inputs.every(inp => inp > 0);

        e.preventDefault();

        // Get data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let travel;


        // Check if data is valid

        // If travel walking, create walking object
        if (type === 'walking') {
            const cadence =+ inputCadence.value;
            //check if data is valid

            // if (
            //     !validInputs(distance, duration, cadence) || allPositive(distance,duration, cadence)
            // )
            //     return alert('Inputs have to be positive numbers!')
            
            travel = new WalkingTravel([lat, lng], distance, duration, cadence);
            
        }
        // If travel with Car, create car object
        if (type === 'cabride') {
            const elevation =+ inputElevation.value;

        //    if (
        //         !validInputs(distance, duration, elevation)|| allPositive(distance,duration)
        //     )
        //        return alert('Inputs have to be positive numbers!')
            travel = new CarTravel([lat, lng], distance, duration, elevation);

        }
        
        // If travel with Bike, create bike object
        if (type === 'bikeride') {
            const elevation =+ inputElevation.value;
 
        //    if (
        //         !validInputs(distance, duration, elevation)|| allPositive(distance,duration)
        //     )
        //        return alert('Inputs have to be positive numbers!')
            travel = new BikeTravel([lat, lng], distance, duration, elevation);


        }
        
        // Add new object to workout array
        this.#travels.push(travel);

        // Render workout on map as marker
        this._renderWorkoutMarker(travel);
                    
        // Render workout on list            
        this._renderWorkout(travel);

    // Hide form + clear input fields
        this._hideForm();
      
    // Set local storage to all workouts 
        this._setLocalStorage();
                   
    }

    _renderWorkoutMarker(travel) {
        L.marker(travel.coords).addTo(this.#map)
                        .bindPopup(L.popup({
                            maxWidth: 250,
                            minWidth: 100,
                            autoClose: false,
                            closeOnClick: false,
                            className: `${travel.type}-popup`,
                        })
                        )
                        .setPopupContent(`${travel.type === 'walking'? '🏃‍♂️' : (travel.type === 'cabride'? '🚗': '🛵')} ${travel.description}`)
                        .openPopup();

    }

    _renderWorkout(travel) {
        let html = `<li class="workout workout--${travel.type}" data-id="${travel.id}">
          <h2 class="workout__title">${travel.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${travel.type === 'walking'? '🏃‍♂️' : (travel.type === 'cabride'? '🚗': '🛵') 
    }</span>
            <span class="workout__value">${travel.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${travel.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;
        
        if (travel.type === 'walking')
            html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${travel.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${travel.cadence}</span>
            <span class="workout__unit">spm</span>
        </div>
    </li> `;
        
        if (travel.type === 'cabride' || travel.type === 'bikeride')
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${travel.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${travel.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;

        form.insertAdjacentHTML('afterend', html);
        
    }
    _moveToPopup(e) {

        if (!this.#map) return;
        const travelEl = e.target.closest('.travel');
        

        if (!travelEl) return;

        const travel = this.#travels.find(work => work.id === travelEl.dataset.id);
        

        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            },
        });

        // using the public interface
        travel.click();
    }

    _setLocalStorage() {
        localStorage.setItem('travels', JSON.stringify(this.#travels));
    }

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('travels'));

        if (!data) return;

        this.#travels = data;

        this.#travels.forEach(work => {
            this._renderWorkout(work);
        });
    }
    reset() {
        localStorage.removeItem('workouts');
        location.reload();
    }
}

const app = new App();


