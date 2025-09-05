import axios from "axios";

const TMDB_API_KEY = "b56be59cfcfc26fbad50e51fb6341736"; // 🔑 실제 TMDB API 키를 입력하세요.
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w780";

/**
 * KOFIC 국가 이름을 TMDB 언어 코드로 변환
 */
const convertNationToLangCode = (nationName) => {
  const langMap = {
    "한국": "ko", "미국": "en", "일본": "ja", "영국": "en",
    "프랑스": "fr", "중국": "zh", "홍콩": "zh", "대만": "zh",
    "캐나다": "en", "독일": "de", "스페인": "es", "이탈리아": "it",
  };
  return langMap[nationName] || null;
};

export const getPosterFromTMDB = async (title, year, options = {}) => {
  try {
    // 1. 한글/영문 제목으로 모든 후보군 검색 (기존과 동일)
    const searchPromises = [
      axios.get(`${BASE_URL}/search/movie`, { params: { api_key: TMDB_API_KEY, query: title, language: "ko-KR", include_adult: false } }),
    ];
    if (options.movieNmEn) {
      searchPromises.push(axios.get(`${BASE_URL}/search/movie`, { params: { api_key: TMDB_API_KEY, query: options.movieNmEn, language: "ko-KR", include_adult: false } }));
    }
    const responses = await Promise.all(searchPromises);
    const allResults = responses.flatMap(res => res.data.results);
    const uniqueResults = Array.from(new Map(allResults.map(movie => [movie.id, movie])).values());

    if (uniqueResults.length === 0) return null;

    // --- 새로운 매칭 로직 (연도 우선) ---
    const getYear = (dateString) => dateString?.substring(0, 4);
    const yearNum = year ? parseInt(year) : 0;
    const langCode = options.nation ? convertNationToLangCode(options.nation) : null;

    // 1순위: '언어'와 '연도(±2년)'가 모두 일치하는 최상의 경우
    if (langCode && yearNum) {
      const langAndFlexibleYearMatches = uniqueResults.filter(m => {
        const releaseYearStr = getYear(m.release_date);
        if (!releaseYearStr) return false;
        const yearDiff = Math.abs(parseInt(releaseYearStr) - yearNum);
        return m.original_language === langCode && yearDiff <= 2;
      });
      if (langAndFlexibleYearMatches.length > 0) {
        const mostPopular = langAndFlexibleYearMatches.sort((a,b) => b.popularity - a.popularity)[0];
        console.log(`✅ [언어+유연연도 일치] "${title}"`);
        return `${IMAGE_BASE_URL}${mostPopular.poster_path}`;
      }
    }

    // ⭐️ 2순위: (신설) 언어는 무시하고, '정확한 연도'가 일치하는 경우
    if (yearNum) {
      const perfectYearMatches = uniqueResults.filter(m => getYear(m.release_date) === year);
      if (perfectYearMatches.length > 0) {
        const mostPopular = perfectYearMatches.sort((a,b) => b.popularity - a.popularity)[0];
        console.log(`🤔 [정확한 연도 우선 일치] "${title}" (${year})`);
        return `${IMAGE_BASE_URL}${mostPopular.poster_path}`;
      }
    }
    
    // ⭐️ 3순위: (신설) '근접 연도(±2년)'라도 일치하는 경우
    if (yearNum) {
        const flexibleYearMatches = uniqueResults.filter(m => {
            const releaseYearStr = getYear(m.release_date);
            if (!releaseYearStr) return false;
            return Math.abs(parseInt(releaseYearStr) - yearNum) <= 2;
        });
        if (flexibleYearMatches.length > 0) {
            const mostPopular = flexibleYearMatches.sort((a,b) => b.popularity - a.popularity)[0];
            console.log(`⚠️ [근접 연도 우선 일치] "${title}" (${year}±2)`);
            return `${IMAGE_BASE_URL}${mostPopular.poster_path}`;
        }
    }

    // 4순위: 연도 정보가 없을 때, '언어'만으로 일치하는 경우
    if (langCode) {
      const langMatches = uniqueResults.filter(m => m.original_language === langCode);
      if (langMatches.length > 0) {
        const mostPopular = langMatches.sort((a,b) => b.popularity - a.popularity)[0];
        console.log(`💡 [언어 우선 일치] "${title}"`);
        return `${IMAGE_BASE_URL}${mostPopular.poster_path}`;
      }
    }

    // 5순위: 최후의 수단, 전체 결과에서 최고 인기 영화 선택
    const bestGuess = uniqueResults.sort((a, b) => b.popularity - a.popularity)[0];
    console.log(`❓ [최선 추측] "${title}"`);
    return `${IMAGE_BASE_URL}${bestGuess.poster_path}`;

  } catch (error) {
    console.error(`TMDB API 오류 (${title}):`, error.message);
    return null;
  }
};