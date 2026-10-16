// ============================================================
// HÀM TIỆN ÍCH VỀ NGÀY THÁNG VÀ TIỀN
// Ngày được lưu dạng chuỗi "YYYY-MM-DD" (theo giờ máy) để khỏi lệch múi giờ.
// ============================================================

// Date -> "dd/mm/yyyy"
export const formatDate = (date) => {
  if (!date) return "--/--/----";
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("/");
};

// So sánh 2 ngày có cùng ngày/tháng/năm không
export const sameDate = (a, b) =>
  !!a &&
  !!b &&
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear();

// Date -> "YYYY-MM-DD"
export const toISODate = (date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

// "YYYY-MM-DD" -> Date (0h giờ máy)
export const fromISODate = (text) => {
  const [year, month, day] = text.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// "YYYY-MM-DD" -> "dd/mm/yyyy"
export const formatISO = (text) => (text ? formatDate(fromISODate(text)) : "");

export const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const addDays = (date, amount) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

// Số đêm giữa 2 ngày (tối thiểu 1)
export const nightsBetween = (from, to) =>
  Math.max(1, Math.round((to - from) / 86400000));

// 1800000 -> "1.800.000đ"
export const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;
