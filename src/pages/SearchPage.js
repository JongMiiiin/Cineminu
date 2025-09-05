// src/pages/SearchPage.js

import React, { useState } from "react";
import { searchMovies, getMovieDetail } from "../api/movieApi";
import { getPosterFromTMDB } from "../api/tmdbApi";
import MovieCard from "../components/MovieCard";
import '../styles.css';

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setMovies([]);
    setHasSearched(true);

    try {
      const results = await searchMovies(query);

      // ⭐️ 1. 검색어와 연관성이 높은 결과만 1차 필터링
      const relevantResults = results.filter(movie => 
        movie.movieNm.toLowerCase().startsWith(query.toLowerCase())
      );

      if (relevantResults.length === 0) {
        setErrorMsg(`'${query}'에 대한 검색 결과가 없습니다.`);
        setLoading(false);
        return;
      }
      
      const enrichedMovies = await Promise.all(
        relevantResults.map(async (movie) => {
          const detail = await getMovieDetail(movie.movieCd);
          const year = detail.openDt?.substring(0, 4) || "";
          const posterUrl = await getPosterFromTMDB(movie.movieNm, year, {
            movieNmEn: detail.movieNmEn,
            nation: detail.nations?.[0]?.nationNm,
          });

          return {
            id: movie.movieCd,
            rank: null,
            title: movie.movieNm,
            englishTitle: detail.movieNmEn || "N/A",
            posterPath: posterUrl, // 포스터 URL을 임시로 저장
            summary: { salesShare: 'N/A', audiAcc: 'N/A' },
            details: {
              "개봉일": detail.openDt ? detail.openDt.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3') : "N/A",
              "감독": detail.directors?.[0]?.peopleNm || null, // 정보 없으면 null
              "출연": detail.actors?.slice(0, 3).map(a => a.peopleNm).join(', ') + (detail.actors?.length > 3 ? '...' : ''),
              "장르": detail.genres?.map(g => g.genreNm).join(', ') || "N/A",
              "상영 시간": `${detail.showTm || "N/A"}분`,
            },
          };
        })
      );
      
      // ⭐️ 2. 상세 정보와 포스터가 없는 영화를 최종 필터링
      const finalMovies = enrichedMovies.filter(movie => 
        movie.posterPath && // 포스터 URL이 있는지 확인
        movie.details.감독 // 감독 정보가 있는지 확인 (다른 정보로 변경 가능)
      );

      if (finalMovies.length === 0) {
        setErrorMsg(`'${query}'에 대한 유효한 검색 결과가 없습니다.`);
      }

      setMovies(finalMovies);

    } catch (error) {
      setErrorMsg("영화 검색 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="search-page-container">
      <h1 className="page-title">영화 검색</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="영화 제목을 입력하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">검색</button>
      </div>

      {loading && <div className="page-message">🔍 검색 중...</div>}
      {errorMsg && <div className="page-message">{errorMsg}</div>}
      
      { !loading && movies.length > 0 && (
        <div className="search-results-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;