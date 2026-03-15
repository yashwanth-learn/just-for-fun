import React from 'react';
import { Star } from 'lucide-react';

const MovieCard = ({ title, releaseDate, posterPath, voteAverage }) => {
  const imageUrl = posterPath 
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  const formattedDate = new Date(releaseDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="movie-poster-card">
      <img src={imageUrl} alt={title} className="poster-image" loading="lazy" />
      
      {voteAverage > 0 && (
        <div className="poster-rating">
          <Star size={12} fill="#fbbf24" color="#fbbf24" />
          {voteAverage.toFixed(1)}
        </div>
      )}
      
      <div className="poster-info">
        <h4 className="poster-title" title={title}>{title}</h4>
        <div className="poster-date">{formattedDate}</div>
      </div>
    </div>
  );
};

export default MovieCard;
