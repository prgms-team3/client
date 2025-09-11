/**
 * 날짜를 YYYY-MM-DD 형식의 문자열로 변환
 */
export const formatDateToString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(date.getDate()).padStart(2, '0')}`;
};
