let currentFilm = null;

//fetch single movie's details
function getFilmById(id) {
    return fetch(`http://localhost:3000/films/${id}`, {
        method: "GET",
    })
        .then(response => response.json())
        .then(data => data)
        .catch (error => {
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
        .catch (error => {
            console.error("Error loading films:", error);
        })
}

//display single movie's details
async function displayFilmDetails(id) {
    const film = await getFilmById(id);
    currentFilm = film;

    //movie details
    const movieInfo = document.querySelector("#movie-info");
    movieInfo.innerHTML = `
        <img id="poster" class="movie-poster" src="" alt="Movie Poster">
        <div class="movie-info">
            <h2 id="title"></h2>
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
}

document.addEventListener("DOMContentLoaded", async function(){
    
})