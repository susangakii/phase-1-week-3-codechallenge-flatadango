let currentFilm = null;

//fetch single movie's details
function getFilmById(id) {
    return fetch(`http://localhost:3000/films/${id}`, {
        method: "GET",
    })
        .then(response => response.json())
        .then(data => data)
        .catch(error => {
            console.error("Error loading film details:", error);
        })
}

//display a menu of all movies
function getFilms() {
    return fetch(`http://localhost:3000/films`, {
        method: "GET",
    })
        .then(response => response.json())
        .then(data => data)
        .catch(error => {
            console.error("Error loading films:", error);
        })
}

//update the number of tickets sold (1 field: PATCH)
function updateFilmTickets(id, ticketsSold) {
    return fetch(`http://localhost:3000/films/${id}`, {
        method: "PATCH",
        headers:{
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({ tickets_sold: ticketsSold })
    })
        .then(response => response.json())
        .then(data => data)
        .catch(error => {
            console.error("Error loading tickets:", error);
        })
}

//create ticket record (POST)
function createTicket(filmId, numberOfTickets){
    return fetch(`http://localhost:3000/films`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            film_id: filmId, 
            number_of_tickets: numberOfTickets 
        })
    });
}

//display single movie's details
async function displayFilmDetails(id) {
    const film = await getFilmById(id);
    currentFilm = film;

    //movie details
    const movieInfo = document.querySelector("#movie-info");
    movieInfo.innerHTML = `
        <div class="movie-info">
            <h2 id="title"></h2>
            <img id="poster" class="movie-poster" src="" alt="Movie Poster">
            <div class="movie-meta">
                <div class="meta-item">
                    <strong>Runtime</strong>
                    <div id="runtime" class="meta-value"></div>
                </div>
                <div class="meta-item">
                    <strong>Showtime</strong>
                    <div id="showtime" class="meta-value"></div>
                </div>
                <div class="meta-item">
                    <strong>Available Tickets</strong>
                    <div id="ticket-num" class="meta-value"></div>
                </div>
            </div>
            <div class="description">
                <p id="film-info"></p>
            </div>
            <button id="buy-ticket">Buy Ticket</button>
        </div>
        `;

    document.getElementById("poster").src = film.poster;
    document.getElementById("title").textContent = film.title;
    document.getElementById("runtime").textContent = `${film.runtime} Minutes`;
    document.getElementById("showtime").textContent = film.showtime;
    document.getElementById("film-info").textContent = film.description;

    //available tickets (capacity - tickets_sold)
    const availableTickets = film.capacity - film.tickets_sold;
    document.getElementById("ticket-num").textContent = availableTickets;

    //update the buy button for the movie tickets
    const buyButton = document.getElementById("buy-ticket");
    if (availableTickets <= 0){
        buyButton.disabled = true;
            buyButton.textContent = "Sold Out";
        } else {
            buyButton.disabled = false;
            buyButton.textContent = "Buy Ticket";
        }
}

//display all movies in sidebar menu
async function displayFilms() {
    const films = await getFilms();
    const filmsContainer = document.getElementById("films");
    filmsContainer.innerHTML = "";
    films.forEach(film => {
        filmsContainer.innerHTML += `
            <li class="film item" data-film-id="${film.id}">
                <span>${film.title}</span>
            </li>
        `;
    }
    )
}

//buy ticket 
async function buyTicket(){
    if (!currentFilm) return; //the film name must be valid

    const availableTickets = currentFilm.capacity - currentFilm.tickets_sold;
    if (availableTickets <= 0) {
        alert("No tickets available for this showing");
        return;
    }
    try{
    const newTicketsSold = currentFilm.tickets_sold + 1;
    await updateFilmTickets(currentFilm.id, newTicketsSold); //update the tickets on server
    await createTicket(currentFilm.id, 1); //create ticket record
    // Refreshing the displays for updates
    await displayFilmDetails(currentFilm.id);
    await displayFilms();
    alert("Ticket purchased successfully!");
    } catch (error) {
        alert("Failed to purchase ticket");
        console.error("Error buying ticket:", error);
    }
}


document.addEventListener("DOMContentLoaded", async function () {
    await displayFilmDetails("2");
    await displayFilms();

    //buy ticket button event listener
    document.getElementById("buy-ticket").addEventListener("click", function() {
        buyTicket();
    });
})