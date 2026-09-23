import React, { useState } from "react";

const StarRating = ({ totalStars = 5, onRatingChange }) => {
    const [rating, setRating] = useState(0);

    const handleStarClick = (index) => {
        const newRating = index + 1;
        setRating(newRating);
        if (onRatingChange) onRatingChange(newRating);
    };

    return (
        <div style={{ display: "flex", cursor: "pointer" }}>
            {Array.from({ length: totalStars }).map((_, index) => (
                <span
                    key={index}
                    style={{
                        fontSize: "2.8rem",
                        color: index < rating ? "gold" : "gray",
                    }}
                    onClick={() => handleStarClick(index)}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;