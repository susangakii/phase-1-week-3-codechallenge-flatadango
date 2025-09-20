//GET first movie's details
function getMovieDetails(){
    fetch (`http://localhost:3000/films/${id}`,{
        method: "GET",
    })
    .then (response => response.json())
    .then (data => data);
}

//GET a menu of all movies
function getAllMovieDetails(){
    fetch (`http://localhost:3000/films`,{
        method: "GET",
    })
    .then (response => response.json())
    .then (data => data);
}