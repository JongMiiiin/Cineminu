import axios from "axios";

const KOFIC_API_KEY = "d8e32f85c0227cc1338f9f4ac7cedb94";
const BASE_URL = "https://www.kobis.or.kr/kobisopenapi/webservice/rest";

// 🎯 일별 박스오피스 조회
export const getDailyBoxOffice = async (targetDt) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/boxoffice/searchDailyBoxOfficeList.json`,
      {
        params: {
          key: KOFIC_API_KEY,
          targetDt,
        },
      }
    );

    return response.data.boxOfficeResult.dailyBoxOfficeList;
  } catch (error) {
    console.error("일별 박스오피스 API 호출 오류:", error);
    return [];
  }
};

// 🎯 영화 상세 정보 조회 (영화 코드 기반)
export const getMovieDetail = async (movieCd) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/movie/searchMovieInfo.json`,
      {
        params: {
          key: KOFIC_API_KEY,
          movieCd,
        },
      }
    );

    return response.data.movieInfoResult.movieInfo;
  } catch (error) {
    console.error("영화 상세정보 API 호출 오류:", error);
    return {};
  }
};
