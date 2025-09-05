import React from 'react';
import '../styles.css';

function MovieCard({ movie, showSummary = false }) {
  const detailItems = movie.details && typeof movie.details === 'object' 
    ? Object.entries(movie.details) 
    : [];

  return (
    <div className="movie-card-item">
      <div className="poster-box">
        {movie.rank && <div className="rank-badge">{movie.rank}</div>}
        
        <img src={movie.posterPath} alt={movie.title} className="poster-img" />
        
        <div className="details-overlay">
          <h3 className="overlay-title-ko">{movie.title}</h3>
          <p className="overlay-title-en">{movie.englishTitle}</p>
          <div className="overlay-details">
            {detailItems.map(([key, value]) => (
              <div key={key} className="detail-item">
                <span className="detail-key">{key}</span>
                <span className="detail-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ 조건부로 summary 보여주기 */}
      {showSummary && (
        <div className="summary-box">
          <h4 className="summary-title">{movie.title}</h4>
          <p className="summary-info">
            예매율 {movie.summary.salesShare}% | 누적 {movie.summary.audiAcc}
          </p>
        </div>
      )}
    </div>
  );
}

export default MovieCard;
