import axios from "axios";

const BASE_URL = "https://www.kobis.or.kr/kobisopenapi/webservice/rest/movie";
const API_KEY = "d8e32f85c0227cc1338f9f4ac7cedb94"; // 실제 키로 변경

export const searchMovies = async (query) => {
  try {
    // ⭐️ 수정된 부분: URL 경로에서 중복되는 '/movie' 제거
    const response = await axios.get(`${BASE_URL}/searchMovieList.json`, {
      params: {
        key: API_KEY,
        movieNm: query,
        itemPerPage: "40",
      },
    });
    return response.data.movieListResult.movieList;
  } catch (error) {
    console.error("KOFIC 영화 목록 검색 API 호출 오류:", error);
    return [];
  }
};

export const getMovieDetail = async (movieCd) => {
  // 이 함수는 기존 코드가 정확하므로 수정할 필요가 없습니다.
  const response = await axios.get(`${BASE_URL}/searchMovieInfo.json`, {
    params: {
      key: API_KEY,
      movieCd,
    },
  });
  return response.data.movieInfoResult.movieInfo;
};