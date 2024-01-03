
import { useEffect, useRef, useState } from "react";
import React from 'react';
import StarRating from './StarRating';

const APIKEY= "180ca29e";

const average = (arr) => { return arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0); }


//--------------------------------------------- NAVBAR ----------------------------------------------------

function Logo() {
    return (
        <div className="logo">
            <span role="img">🎥🍿</span>
            <h1>CineVerse</h1>
        </div>
    );
}
function Search({query, setQuery}) {
    //const [query, setQuery] = useState(""); // we need to lift that state up, as we need this in App, to search from API

    // suppose we want a functionality that whenever this component mounts, we want to focus on searchBox (autometically cursor on search)
    // useEffect(function(){
    //     document.querySelector('.search').focus();
    // },[])   // 👉 But this is not the react way of doing things (coz we are directly touching DOM)

    // We use useRef hook to achieve that functionality
    const inputEl= useRef(null);
    useEffect(function(){
        // 'inputEl.current' is the DOM element [ document.querySelector('.search') ]
        inputEl.current.focus();
    });

    return (
        <input className="search" type="text" placeholder="Search any movies......." value={query} onChange={(e) => setQuery(e.target.value)} ref={inputEl} />
        // Basically we are connecting useRef hook with this html element so that we can manupulate DOM without touching it
    );
}
function NumResults({movies}) {
    return (
        <p className="num-results">
            Found <strong>{(movies) ? movies.length : 0}</strong> results
        </p>
    );
}

function Navbar({children, query, setQuery}) {
    return (
        <nav className="nav-bar">
            <Logo></Logo>
            <Search query={query} setQuery={setQuery}></Search>
            {/* As we need to drill prop(movies) twice for <NumResult>, which we can get rid of using COMPONEMT COMPOSITION */}
            {children}
        </nav>
    );
}

async function fetchMovies(query, setIsLoading, setMovies, setError){ // fetch movies with query strings
    try{
        setIsLoading(true); // start loading
        const res= await fetch(`http://www.omdbapi.com/?apikey=${APIKEY}&s=${query}`);
        // http://www.omdbapi.com/?apikey=180ca29e&s=interstellar
        if(!res.ok){ throw new Error("Something went wrong !"); }

        const data= await res.json();
        if(data.Response==="False"){ throw new Error(data.Error); }

        setMovies(data.Search); // data found -> set movie list
        setIsLoading(false); // data found -> stop loading
        setError(""); // data found -> reset error message
    } 
    catch(err){
        setMovies([]); // error ocuured -> reset movies
        setIsLoading(false); // error occured -> stop loading
        if(query) setError(err.message); //error ocuured -> set error message
    }
}

async function fetchMovieDetails(selectedId, setMovieDetail, setIsLoading, setError){
    try{
        setIsLoading(true); // start loading before fetching 
        const res= await fetch(`http://www.omdbapi.com/?apikey=${APIKEY}&i=${selectedId}`); 
        if(!res.ok){ throw new Error("Something went wrong !"); }

        const data= await res.json();
        if(data.Response==="False"){ throw new Error(data.Error); }

        setMovieDetail(data); // data found -> set movie details
        setIsLoading(false); // data found -> stop loading
        setError(""); // data found -> reset error message
    }
    catch(err){
        setMovieDetail({}); // error ocuured -> reset movie detail
        setIsLoading(false); // error occured -> stop loading
        setError(err.message); // error ocuured -> set error message
    }
}

function SelectedMovieDetails({selectedId, setSelectedId, onAddWatched, watched}){
    const [movieDetail, setMovieDetail]= useState({});
    const [isLoading, setIsLoading]= useState(false); // boolean state to track wheather loading or not (iska apna loading status [right side movieDetail])
    const [error, setError]= useState(""); // string state to store error message (iska apna error message [right side movieDetail])

    const [userRating, setUserRating]= useState(0); // userRating coming from the 'StarRating' component 
    // As we have provided 'onSetRating' prop in 'StarRating', so we can access rating outside of this component as well
    function handleUserRating(rating){ setUserRating(rating); }

    // Now I need to check whether selectedMovie with (imdbID===selectedId), already appeared before in 'watched' array or not
    let isWatched= false; let watchedMovieUserRating;
    for(let i=0; i<watched?.length; i++){
        if(watched[i].imdbID === selectedId){ isWatched=true; watchedMovieUserRating=watched[i].UserRating; break; }
    }

    useEffect(function(){

        fetchMovieDetails(selectedId, setMovieDetail, setIsLoading, setError);
    }, [selectedId]); // we want this with every 'selectedId' state update

    
    useEffect(function(){ // We want to change website title dynamically (depending on which page we are in)
        if(!movieDetail.Title) return;
        document.title=`Movie | ${movieDetail.Title}` // as we are changing/interacting with external data [Title], so we need useEffect

        return function(){ document.title="CineVerse"; } // cleanup function (execute during unmount and re-render)
    }, [movieDetail.Title]); // every time the title change, we want to update


    //We want to remove movieDetail with not only 'back button', but also on pressing 'escape' key  
    // For this we need Global (document) eventListener [As we are interacting with external things, so we need useEffect]
    // And we will define useEffect in this component, coz we only want to listen to that 'keydown' event only when 'SelectedMovieDetails' component is there in UI
    useEffect(function(){
        function cb(evt){ if(evt.code === "Escape") { setSelectedId(null); } } // remove that moveDetail pane

        document.addEventListener('keydown', cb);
        return function(){ document.removeEventListener('keydown', cb); } // cleanup
    }, [setSelectedId]);

// ----- NOTHING TO DO WITH THIS WEBSITE (Just for useRef learning purpose [Another usecase of ref]) -----
    // We want to store the amount of click happen on rating before the movie is added to watchlist. But we don't want to create a re-render. [we want to persist data]
    // So, ref is perfect for this use case. Normal count variable wont work (coz, it will reset after every re-render)
    const countRef= useRef(0); let cnt=0;
    useEffect(function() {
        if(userRating>0) {
            countRef.current++;
            cnt++; // wont work
        }
    }, [userRating, cnt]);
    console.log(countRef.current, cnt);
//----------------------------------------------------------------------------------------------------------

    // State: Triggers re-render and Persisted across re-render
    // Ref:   NOT trigger re-render but Persisted across re-render

    if(isLoading===true){
        return (
            <div className="details">
                <Loader></Loader>
            </div>
        );
    }
    else if(error){
        return (
            <div className="details">
                <ErrorComponent message={error}></ErrorComponent>
            </div>
        );
    }

    function handleAddWatchedMovie(){
        // creating new obj to append in watchedMovieList using 'onAddWatched' handler
        const newWatchedMovie={
            imdbID: selectedId,
            Title: movieDetail.Title,
            Year: movieDetail.Year,
            Poster: movieDetail.Poster,
            imdbRating: Number(movieDetail.imdbRating),
            Runtime: Number(movieDetail.Runtime.split(' ')[0]),
            UserRating: Number(userRating)
        }
        onAddWatched(newWatchedMovie);
        setSelectedId(null); // close the Movie Detail pen
    }

    return (
        <div className="details">
            <header>
                <button className="btn-back" onClick={()=> setSelectedId(null)}>&larr;</button>
                <img src={movieDetail.Poster} alt={`Poster of ${movieDetail.Title} movie`}></img>
                <div className="details-overview">
                    <h2>{movieDetail.Title}</h2>
                    <p>{movieDetail.Released} &bull; {movieDetail.Runtime}</p>
                    <p>{movieDetail.Genre}</p>
                    <p><span>⭐</span>{movieDetail.imdbRating} IMDb Rating</p>
                </div>
            </header>

            <section>
                <div className="rating">
                {(isWatched===false) ? 
                    (<>
                        <StarRating maxRating={10} size={24} onSetRating={handleUserRating}></StarRating>
                        {userRating>0 ? <button className="btn-add" onClick={handleAddWatchedMovie}>Add to Watchlist</button> : <></>}
                    </>) : 
                    (<p>You already rated this movie with {watchedMovieUserRating} stars</p>)
                }
                </div>
                <p><em>{movieDetail.Plot}</em></p>
                <p>Starring : {movieDetail.Actors}</p>
                <p>Directed by : {movieDetail.Director}</p>
            </section>

        </div>
    );
}

export default function App() {
    const [movies, setMovies] = useState([]); // 'movieList' state for left box
    // const [watched, setWatched] = useState([]); // 'watchList' state for right box
    const [watched, setWatched] = useState(function(){ // we can also provide a callback in default value of useState
        if(localStorage.getItem('watched') === null){ return []; }
        return JSON.parse(localStorage.getItem('watched'));
    });
    // so whenever the initial value of state depends on some sort of computation, we should always pass in a function like above
    const [query, setQuery] = useState(""); // serach string state

    const [isLoading, setIsLoading]= useState(false); // boolean state to track wheather loading or not (in the left box while fetching)
    const [error, setError]= useState(""); // string state to store error message (in the left box after fetching)

    // SideEffects: R/W external variable/resources inside render logic (e.g fetching API)
    // SideEffects should only be done inside eventHandler or useEffect hook.
    // This is because, after API call, you would update movieList, which will re-render this component --> So, again the same API would be called. Endless Loop
    
    // -------- useEffect can be considered as an eventlistener for 'props/state' present in dependency array -----------
    useEffect(function(){

        fetchMovies(query, setIsLoading, setMovies, setError); // we have to define another function coz useEffect do not support async function as arg
    },[query]); // This effect will update each time 'query' state is updated !

    function handleAddWatched(newWatchedMovie){ // This func needed to be called on 'SelectedMovieDetails'
        setWatched((oldWatchList)=> [...oldWatchList, newWatchedMovie]);
    }
    function handleDeleteWatched(id){
        setWatched((oldWatchList)=> oldWatchList.filter((mv)=> mv.imdbID!==id ));
    }
    useEffect(function(){
        localStorage.setItem('watched', JSON.stringify(watched));
    },[watched]); // each time 'watched' is updated, this component will re-render and localStorage will be updated with watchedList array

    // now we want to select a movie (by clicking) on the left box, and show the detail on right box (that state is also needed in right box as well), so we will lift that state up (in App)
    const [selectedId, setSelectedId]= useState(null);

    return (
        <React.Fragment>
            {/* This is component COMPOSITION */}
            <Navbar query={query} setQuery={setQuery}> 
                <NumResults movies={movies}></NumResults>
            </Navbar>

            <Main>
                {/* ListBox */}
                <Box>
                    {(isLoading===true) ? <Loader></Loader> : (error) ? <ErrorComponent message={error}></ErrorComponent> : <MovieList movies={movies} setSelectedId={setSelectedId}></MovieList>}
                </Box>

                {/* WatchBox */}
                <Box>
                    {(selectedId) ? (<SelectedMovieDetails selectedId={selectedId} setSelectedId={setSelectedId} onAddWatched={handleAddWatched} watched={watched}></SelectedMovieDetails>) :
                                    <>
                                        <WatchedSummary watched={watched}></WatchedSummary>
                                        <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteWatched}></WatchedMovieList>
                                    </>
                    }
                </Box>
            </Main>
        </React.Fragment>
    );
}

function Loader(){ return <p className="loader">Loading ...</p>; }
function ErrorComponent({message}){ return <p className="error">❌ {message}</p>}


function Movie({ movie, setSelectedId}) {
    return (
        <li onClick={()=> setSelectedId(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓️</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    )
}
function MovieList({movies, setSelectedId}) {
    return (
        <ul className="list list-movies">
            {movies?.map((movie) => (
                <Movie movie={movie} setSelectedId={setSelectedId} key={movie.imdbID}></Movie>
            ))}
        </ul>
    );
}
function Box({children}) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="box">
            <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}> {isOpen ? "–" : "+"} </button>
            {isOpen && children}
        </div>
    );
}

// 😏😎 We find that ListBox is very very similar to WatchBox (so we can reuse this component)
/*
function WatchedBox() {
    const [watched, setWatched] = useState(tempWatchedData);
    const [isOpen2, setIsOpen2] = useState(true);

    return (
        <div className="box">
            <button className="btn-toggle" onClick={() => setIsOpen2((open) => !open)}>{isOpen2 ? "–" : "+"}</button>
            {isOpen2 && (
                <>
                    <WatchedSummary watched={watched}></WatchedSummary>
                    <WatchedMovieList watched={watched}></WatchedMovieList>
                </>
            )}
        </div>
    );
}
*/


function WatchedSummary({ watched }) {
    // Derived state
    const avgImdbRating = (!watched) ? 0 : average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = (!watched) ? 0 : average(watched.map((movie) => movie.UserRating));
    const avgRuntime = (!watched) ? 0 : average(watched.map((movie) => movie.Runtime));

    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{(!watched) ? 0 :watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime.toFixed(0)} min</span>
                </p>
            </div>
        </div>
    )
}

function WatchedMovie({ movie, onDeleteWatched }) {
    return (
        <li>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.UserRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.Runtime} min</span>
                </p>
                <button className="btn-delete" onClick={()=>onDeleteWatched(movie.imdbID)}>X</button>
            </div>
        </li>
    );
}

function WatchedMovieList({ watched, onDeleteWatched }) {
    return (
        <ul className="list">
            {watched?.map((movie) => (
                <WatchedMovie movie={movie} onDeleteWatched={onDeleteWatched} key={movie.imdbID}></WatchedMovie>
            ))}
        </ul>
    );
}

function Main({children}) {
    return (
        <main className="main">
            {children}
        </main>
    );
}

