import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/*
import StarRating from './StarRating';

function Test(){
  const [movieRating, setMovieRating] = useState(0);
  
  function handleRating(rating){ setMovieRating(rating); }
  return (
    <div>
      <StarRating color='green' onSetRating={handleRating}></StarRating>
      <p>Current movie is rated {movieRating} stars</p>
    </div>
  );
}
*/

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <Test></Test> */}
  </React.StrictMode>
);
