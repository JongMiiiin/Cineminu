import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ReviewForm from '../components/ReviewForm';

// 임시 상세 데이터
const MOCK_DETAIL = {
    id: 1,
    title: '영화 A',
    overview: '이 영화는 매우 흥미로운 내용을 담고 있습니다.',
    poster_path: 'https://via.placeholder.com/250x375',
    reviews: [
        { id: 101, author: '김리뷰', content: '정말 재밌었어요!' },
        { id: 102, author: '이평론', content: '시간 가는 줄 모르고 봤네요.' }
    ]
};

function MovieDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        // TODO: 실제로는 id를 사용해 영화 상세 정보와 리뷰 목록을 API로 가져와야 함
        // const fetchedMovie = await getMovieDetail(id);
        // const fetchedReviews = await getMovieReviews(id);
        setMovie(MOCK_DETAIL);
        setReviews(MOCK_DETAIL.reviews);
    }, [id]);

    const handleAddReview = (newReviewContent) => {
        // TODO: 서버에 리뷰 작성 요청 보내기
        const newReview = {
            id: Date.now(), // 임시 ID
            author: user.name,
            content: newReviewContent,
        };
        setReviews([...reviews, newReview]);
    };

    if (!movie) return <div>로딩 중...</div>;

    return (
        <div>
            <div style={{ display: 'flex' }}>
                <img src={movie.poster_path} alt={movie.title} />
                <div style={{ marginLeft: '1rem' }}>
                    <h1>{movie.title}</h1>
                    <p>{movie.overview}</p>
                    {/* 여기에 영화 추천 로직을 추가할 수 있습니다. (e.g. 비슷한 장르 영화) */}
                </div>
            </div>

            <hr style={{ margin: '2rem 0' }} />

            <div>
                <h2>리뷰</h2>
                {user && <ReviewForm onSubmit={handleAddReview} />}
                <ul>
                    {reviews.map(review => (
                        <li key={review.id}><strong>{review.author}:</strong> {review.content}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default MovieDetailPage;