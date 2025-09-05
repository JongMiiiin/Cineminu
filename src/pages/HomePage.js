import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { getDailyBoxOffice, getMovieDetail } from "../api/boxofficeApi"; 
import { getPosterFromTMDB } from "../api/tmdbApi"; 
import MovieCard from "../components/MovieCard"; 
import '../styles.css';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// '다음' 화살표 컴포넌트
function NextArrow(props) {
  const { onClick } = props;
  return (
    <div className="custom-arrow custom-next-arrow" onClick={onClick}>
      ❯
    </div>
  );
}

// '이전' 화살표 컴포넌트
function PrevArrow(props) {
  const { onClick } = props;
  return (
    <div className="custom-arrow custom-prev-arrow" onClick={onClick}>
      ❮
    </div>
  );
}

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoxOffice = async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        today.setDate(today.getDate() - 1);
        const targetDt = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
        
        const boxOfficeList = await getDailyBoxOffice(targetDt);
        const top10Movies = boxOfficeList.slice(0, 10); 

        const enrichedMovies = await Promise.all(
          top10Movies.map(async (movie) => {
            const detail = await getMovieDetail(movie.movieCd);
            const year = detail.openDt?.substring(0, 4) || "";
            const posterUrl = await getPosterFromTMDB(movie.movieNm, year, {
              movieNmEn: detail.movieNmEn,
              nation: detail.nations?.[0]?.nationNm,
            });

            return {
              id: movie.movieCd,
              rank: movie.rank,
              title: movie.movieNm,
              englishTitle: detail.movieNmEn || "N/A",
              posterPath: posterUrl || "https://via.placeholder.com/400x600?text=No+Image",
              summary: {
                salesShare: movie.salesShare,
                audiAcc: parseInt(movie.audiAcc).toLocaleString(),
              },
              details: {
                "개봉일": detail.openDt ? detail.openDt.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3') : "N/A",
                "감독": detail.directors?.[0]?.peopleNm || "N/A",
                "출연": detail.actors?.slice(0, 3).map(a => a.peopleNm).join(', ') + (detail.actors?.length > 3 ? '...' : ''),
                "장르": detail.genres?.map(g => g.genreNm).join(', ') || "N/A",
                "상영 시간": `${detail.showTm || "N/A"}분`,
              },
            };
          })
        );
        setMovies(enrichedMovies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBoxOffice();
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3, arrows: false } }, // 작은 화면에서는 화살표 숨김
      { breakpoint: 768, settings: { slidesToShow: 2, arrows: false } },
      { breakpoint: 480, settings: { slidesToShow: 1, arrows: false } },
    ],
  };

  if (loading) return <div className="page-message">로딩 중...</div>;
  if (error) return <div className="page-message">에러: {error}</div>;

  return (
    <div className="homepage-container">
      <h1 className="page-title">박스오피스</h1>
      <div className="box-office-carousel">
        <Slider {...sliderSettings}>
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} showSummary={true} />
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default HomePage;
