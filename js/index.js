//display first movie's details
function getFilmById(){
    fetch (`http://localhost:3000/films/${id}`,{
        method: "GET",
    })
    .then (response => response.json())
    .then (data => data);
}

//display a menu of all movies
function getFilms(){
    fetch (`http://localhost:3000/films`,{
        method: "GET",
    })
    .then (response => response.json())
    .then (data => data);
}


document.addEventListener("DOMContentLoaded", function(){

} )