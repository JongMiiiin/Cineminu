// src/components/MovieSearchBar.js

import React, { useState } from 'react';
import { searchMovies } from '../api/movieApi';

function MovieSearchBar({ onMovieSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const movies = await searchMovies(query);
    setResults(movies.slice(0, 5));
  };

  const handleSelectMovie = (movie) => {
    onMovieSelect(movie);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="movie-search-bar">
      <form onSubmit={handleSearch} className="search-input-group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="관람한 영화를 검색하세요"
        />
        <button type="submit" className="search-button">검색</button>
      </form>
      {results.length > 0 && (
        <ul className="search-results-list">
          {results.map((movie) => (
            <li key={movie.movieCd} onClick={() => handleSelectMovie(movie)}>
              {/* ⭐️ 이 부분에 감독 이름(directors) 정보를 추가합니다. */}
              {movie.movieNm} ({movie.openDt?.substring(0, 4) || 'N/A'})
              {movie.directors && movie.directors.length > 0 && ` - ${movie.directors.map(d => d.peopleNm).join(', ')}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MovieSearchBar;