let currentFilm = null;

//******************************************************************//
//FETCH FUNCTIONS

//fetch single movie's details
function getFilmById(id) {
    return fetch(`http://localhost:3000/films/${id}`, {
        method: "GET",
    })
        .then(response => response.json())
        .then(data => data);
}

//display a menu of all movies
function getFilms() {
    return fetch(`http://localhost:3000/films`, {
        method: "GET",
    })
        .then(response => response.json())
        .then(data => data);
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
    return fetch(`http://localhost:3000/tickets`,{
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

//delete film by id
function deleteFilm(id){
    return fetch(`http://localhost:3000/films/${id}`, {
        method: "DELETE"
    });
}

//update an entire movie
function updateFilm(id, filmData) {
    return fetch(`http://localhost:3000/films/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(filmData)
    })
    .then(response => response.json())
    .then(data => data);
}

//******************************************************************//
//OTHER FUNCTIONS

//display single movie's details
async function displayFilmDetails(id) {
    try{
    const film = await getFilmById(id);
    currentFilm = film;

    //movie details
    const movieInfo = document.querySelector("#movie-info");
    movieInfo.innerHTML = `
        <div class="movie-content">
            <div class="poster-section">
                <img id="poster" class="movie-poster" src="" alt="Movie Poster">
                <h2 id="title"></h2>
            </div>
            <div class="details-sidebar">
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
                <button id="edit-button" onclick="updateFilmDetails('${id}')">Edit Movie</button>
            </div>
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

    //update the buy button for the movie tickets (availability-based)
    const buyButton = document.getElementById("buy-ticket");
    if (availableTickets <= 0){
        buyButton.disabled = true;
            buyButton.textContent = "Sold Out";
        } else {
            buyButton.disabled = false;
            buyButton.textContent = "Buy Ticket";
        }
        // Highlight selected film in sidebar
    document.querySelectorAll('.film.item').forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.filmId === film.id) {
            item.classList.add('selected');
        }
    })
    } catch (error) {
        console.error("Error Loading Film Details:", error);
    }
}

//display all movies in sidebar menu
async function displayFilms() {
    try{
    const films = await getFilms();
    const filmsContainer = document.getElementById("films");
    filmsContainer.innerHTML = "";
    films.forEach(film => {
        const availableTickets = film.capacity - film.tickets_sold;
        const soldOutClass = availableTickets <= 0 ? "sold-out" : "";
         //add delete buttons to each of the movies
        filmsContainer.innerHTML += `
            <li class="film item ${soldOutClass}" data-film-id="${film.id}" onclick="displayFilmDetails('${film.id}')">
                <span>${film.title}</span>
                <button class="delete-btn" onclick="event.stopPropagation(); removeFilm('${film.id}')">x</button>
            </li>
            `;
    })
    } catch (error) {
        console.error("Error Loading Films:", error);
    }
}

//buy ticket (prevents if sold out) 
async function buyTicket(){
    if (!currentFilm) return; //the film name must be valid

    const availableTickets = currentFilm.capacity - currentFilm.tickets_sold;
    if (availableTickets <= 0) {
        alert("No Tickets Available for this Showing");
        return;
    }
    try{
    const newTicketsSold = currentFilm.tickets_sold + 1;
    await updateFilmTickets(currentFilm.id, newTicketsSold); //update the tickets on server
    await createTicket(currentFilm.id, 1); //create ticket record
    // Refreshing the displays for updates
    await displayFilmDetails(currentFilm.id);
    await displayFilms();
    alert("Ticket Purchased Successfully!");
    } catch (error) {
        alert("Failed to Purchase Ticket");
        console.error("Error Buying Ticket:", error);
    }
}

//remove the film from list
async function removeFilm(id) {
    if (!confirm("Are You Sure You Want to Delete this Film?")) {
        return;
    }
    try {
        await deleteFilm(id);
        await displayFilms(); //displayed after delete
        
        // load first available film after deletion of current film
        if (currentFilm && currentFilm.id == id) {
            const films = await getFilms();
            if (films.length > 0) {
                await displayFilmDetails(films[0].id);
            } else {
                document.getElementById("movie-info").style.display = "none";
                document.getElementById("loading").innerHTML = "<p>No Movies Available</p>";
                document.getElementById("loading").style.display = "block";
            }
        }
        
        alert("Film Deleted Successfully");
        
    } catch (error) {
        alert("Failed to Delete Film");
        console.error("Error Deleting Film:", error);
    }
}

async function updateFilmDetails(id) {
    try {
        const film = await getFilmById(id);
        currentFilm = film;        
        // editable form with movie details
        const movieInfo = document.querySelector("#movie-info");
        movieInfo.innerHTML = `
            <form id="update-form">
                <img src="${film.poster}" class="movie-poster" alt="Movie Poster">
                <div class="form-group">
                    <label>Movie Title</label>
                    <input type="text" name="title" value="${film.title}">
                    <label>Runtime (minutes)</label>
                    <input type="number" name="runtime" value="${film.runtime}">
                    <label>Showtime</label>
                    <input type="text" name="showtime" value="${film.showtime}">
                    <label>Capacity</label>
                    <input type="number" name="capacity" value="${film.capacity}">
                    <label>Tickets Sold</label>
                    <input type="number" name="tickets_sold" value="${film.tickets_sold}">
                    <label>Description</label>
                    <textarea name="description">${film.description}</textarea>
                    <label>Poster URL</label>
                    <input type="text" name="poster" value="${film.poster}">
                </div>
                <button class="btn" type="submit">Update Movie</button>
                <button class="btn" type="button" onclick="displayFilmDetails('${id}')">Cancel</button>
            </form>
        `;
        
        // form submit handler to update the movie
        const form = document.querySelector("#update-form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const updatedFilm = {
                title: form.title.value,
                runtime: form.runtime.value,
                showtime: form.showtime.value,
                capacity: Number(form.capacity.value),
                tickets_sold: Number(form.tickets_sold.value),
                description: form.description.value,
                poster: form.poster.value
            };
            
            await updateFilm(id, updatedFilm);
            await displayFilmDetails(id);
            await displayFilms();
        });
        
    } catch (error) {
        console.error("Error Updating Film Details:", error);
    }
}

//******************************************************************//
//EVENT LISTENERS

document.addEventListener("DOMContentLoaded", async function () {
    await displayFilms();
    //loads the first film
    try{
        const films = await getFilms();
        if (films.length > 0) {
            await displayFilmDetails(films[0].id);
        } 
        }catch (error) {
        console.error("Error Loading Initial Film:", error);
    }

    //buy ticket button event listener
    document.getElementById("buy-ticket").addEventListener("click", function() {
        buyTicket();
    });
})