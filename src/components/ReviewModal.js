import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import MovieSearchBar from './MovieSearchBar'
import { getPosterFromTMDB } from '../api/tmdbApi'

Modal.setAppElement('#root') // 웹 접근성을 위해 앱의 루트 요소를 알려줍니다.

function ReviewModal({ isOpen, onRequestClose, date, existingReview, onSave, onDelete }) {
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [posterPath, setPosterPath] = useState('')
  const [reviewText, setReviewText] = useState('')

  useEffect(() => {
    // 모달이 열릴 때 기존 리뷰 데이터로 상태를 설정
    if (existingReview) {
      setSelectedMovie(existingReview.movie)
      setPosterPath(existingReview.posterPath)
      setReviewText(existingReview.reviewText)
    } else {
      // 새 리뷰 작성을 위해 상태 초기화
      setSelectedMovie(null)
      setPosterPath('')
      setReviewText('')
    }
  }, [isOpen, existingReview])

  const handleMovieSelect = async (movie) => {
    setSelectedMovie(movie)
    const year = movie.openDt?.substring(0, 4) || ''
    const poster = await getPosterFromTMDB(movie.movieNm, year, {
      movieNmEn: movie.movieNmEn,
      nation: movie.repNationNm,
    })
    setPosterPath(poster || '')
  }

  const handleSave = () => {
    if (!selectedMovie) {
      alert('영화를 선택해주세요.')
      return
    }
    onSave({
      date,
      movie: selectedMovie,
      reviewText,
      posterPath,
    })
    onRequestClose()
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      onDelete(date)
      onRequestClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="review-modal"
      overlayClassName="review-modal-overlay"
    >
      <h2>{date.toLocaleDateString()} 관람 기록</h2>

      {!selectedMovie ? (
        <MovieSearchBar onMovieSelect={handleMovieSelect} />
      ) : (
        <div className="selected-movie-info">
          {posterPath && <img src={posterPath} alt={selectedMovie.movieNm} />}
          <div className="movie-text-info">
            <h3>{selectedMovie.movieNm}</h3>
            <button onClick={() => setSelectedMovie(null)} className="change-movie-btn">영화 변경</button>
          </div>
        </div>
      )}

      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="자유롭게 리뷰를 남겨보세요..."
        rows="6"
      />

      <div className="modal-buttons">
        {existingReview && <button onClick={handleDelete} className="delete-btn">삭제</button>}
        <div style={{ flexGrow: 1 }} /> {/* 버튼들을 양쪽 끝으로 밀기 위한 빈 div */}
        <button onClick={onRequestClose} className="cancel-btn">취소</button>
        <button onClick={handleSave} className="save-btn">저장</button>
      </div>
    </Modal>
  )
}

export default ReviewModal;