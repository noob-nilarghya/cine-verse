import { useState } from "react";
import PropTypes from 'prop-types'; // this package is used to check data type of props

const containerStyle= {
    display: "flex",
    alignItems: "center",
    gap: "16px"
};
const starContainerStyle= {
    display: "flex",
};


/*
 ** we define 2 states: 'rating' take care of permanent rating (change during click), and 'tempRating' take care of temp rating (change during hoverIn, hoverOut)
 ** Star should be filled with mouseHover (based on 'tempRating' status), when we mouseOut, we want permanent one to display (based on 'rating')
*/

// ----- we want to make this 'StarRating' component flexible and robust (so end developer can customize this component using props) -----

StarRating.propTypes = {
    maxRating: PropTypes.number, // 'PropTypes.number.isRequired' for mandatory props
    defaultRating: PropTypes.number,
    color: PropTypes.string,
    size: PropTypes.number,
    onSetRating: PropTypes.func
}

export default function StarRating({maxRating = 5, color= '#fcc419', size= 48, className="", defaultRating=0, onSetRating}) {
    const [rating, setRating]= useState(defaultRating);
    const [tempRating, setTempRating]= useState(0);

    const arr= [];
    for(let i=0; i<maxRating; i++){ arr.push(i+1); }
    function handleRating(rate){ setRating(rate); onSetRating(rate); } // 'onSetRating' is just a handler so that we can access rating outside of this component as well (see, index.js 'Test' component to understand better)
    function handleHoverIn(rate){ setTempRating(rate); }
    function handleHoverOut(){ setTempRating(0); }

    const textStyle= {
        lineHeight: "0",
        margin: "0",
        color: color,
        fontSize: `${size/1.5}px`
    };

    return (
        <div style={containerStyle} className={className}>
            <div style={starContainerStyle}>
                {arr.map((ele)=>{
                    return (<Star
                                onRate={()=>handleRating(ele)} 
                                onHoverIn={()=>handleHoverIn(ele)}
                                onHoverOut={()=>handleHoverOut()}
                                full={tempRating ? ele<=tempRating : ele<=rating} 
                                color={color} size={size}
                                key={ele}>
                            </Star>)
                })}
            </div>
            <div style={textStyle}>{tempRating || rating || ""}</div>
        </div> 
    );
}


function Star({onRate, full, onHoverIn, onHoverOut, color, size}){
    const starStyle= {
        width: `${size}px`,
        height: `${size}px`,
        display: "block",
        cursor: "pointer"
    }
    // conditional rendering
    if(full===false){
        return ( // hollow star
            <span onClick={onRate} onMouseEnter={onHoverIn} onMouseLeave={onHoverOut} role="button" style={starStyle}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke={color}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="{2}" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
            </span>
        );
    }
    return ( // full star
        <span onClick={onRate} onMouseEnter={onHoverIn} onMouseLeave={onHoverOut} role="button" style={starStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={color} stroke={color}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
        </span>
    );
}