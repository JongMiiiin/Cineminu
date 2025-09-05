import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import ReviewModal from '../components/ReviewModal';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import '../Calendar.css';

// 날짜를 'YYYY-MM-DD' 형식의 문자열 키로 변환하는 헬퍼 함수
const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function CalendarPage() {
  const [reviews, setReviews] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("로그인이 필요합니다.");
        return;
      }

      try {
        const response = await axios.get('http://localhost:4000/api/reviews', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const reviewsData = response.data.reduce((acc, review) => {
          const dateKey = getDateKey(new Date(review.review_date));
          acc[dateKey] = {
            date: new Date(review.review_date),
            movie: { movieCd: review.movie_cd, movieNm: review.movie_title },
            posterPath: review.poster_path,
            reviewText: review.review_text,
          };
          return acc;
        }, {});
        setReviews(reviewsData);

      } catch (error) {
        console.error("리뷰 데이터를 불러오는 데 실패했습니다.", error);
      }
    };
    fetchReviews();
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  // 리뷰 저장 함수 (API 호출)
  const handleSaveReview = async (reviewData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    // ⭐️ 핵심 수정: 서버(server.js)가 기대하는 데이터 구조로 payload를 변경합니다.
    const payload = {
      date: getDateKey(reviewData.date), // 'review_date' -> 'date'
      movie: reviewData.movie,           // movieCd, movieTitle 대신 movie 객체 통째로
      posterPath: reviewData.posterPath, // 'poster_path' -> 'posterPath'
      reviewText: reviewData.reviewText, // 'review_text' -> 'reviewText'
    };

    try {
      // 수정된 payload 객체를 서버로 전송
      await axios.post('http://localhost:4000/api/reviews', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const dateKey = getDateKey(reviewData.date);
      setReviews(prev => ({ ...prev, [dateKey]: reviewData }));
    } catch (error) {
      console.error("리뷰 저장에 실패했습니다.", error);
      alert("리뷰 저장 중 오류가 발생했습니다.");
    }
  };

  // 리뷰 삭제 함수 (API 호출)
  const handleDeleteReview = async (date) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const dateKey = getDateKey(date);
    try {
      await axios.delete(`http://localhost:4000/api/reviews/${dateKey}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(prev => {
        const newReviews = { ...prev };
        delete newReviews[dateKey];
        return newReviews;
      });
    } catch (error) {
      console.error("리뷰 삭제에 실패했습니다.", error);
      alert("리뷰 삭제 중 오류가 발생했습니다.");
    }
  };

  // 캘린더 날짜 칸에 포스터를 렌더링하는 함수
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateKey = getDateKey(date);
      const review = reviews[dateKey];
      if (review?.posterPath) {
        return (
          <div className="calendar-poster-wrapper">
            <img src={review.posterPath} alt={review.movie.movieNm} className="calendar-poster" />
          </div>
        );
      }
    }
    return null;
  };
  
  return (
    <div className="calendar-page-container">
      <h1 className="page-title">관람 캘린더</h1>
      <Calendar
        onClickDay={handleDateClick}
        tileContent={tileContent}
        formatDay={(locale, date) => date.getDate()}
        calendarType="gregory"
        className="my-calendar"
      />
      <ReviewModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        date={selectedDate}
        existingReview={reviews[getDateKey(selectedDate)]}
        onSave={handleSaveReview}
        onDelete={handleDeleteReview}
      />
    </div>
  );
}

export default CalendarPage;