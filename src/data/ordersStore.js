// ============================================================
// LƯU ĐƠN ĐẶT PHÒNG (localStorage - chỉ để demo)
// Sau này có backend thì thay nội dung các hàm bên dưới bằng gọi API,
// các trang bên ngoài vẫn dùng y như cũ.
//
// Trạng thái đơn:
//   booked      = Đã đặt, chờ nhận phòng
//   staying     = Đang ở      (nhân viên bấm check-in)
//   checked_out = Đã check-out (nhân viên bấm check-out) -> được đánh giá
//   cancelled   = Đã hủy
// ============================================================

import { fromISODate } from "./dateUtils.js";

const ORDERS_KEY = "cloudynest_orders";

export const STATUS_LABEL = {
  booked: "Đã đặt",
  staying: "Đang ở",
  checked_out: "Đã check-out",
  cancelled: "Đã hủy",
};

function readOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  } catch {
    return [];
  }
}

function writeOrders(list) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
  } catch {
    // trình duyệt chặn lưu trữ thì bỏ qua
  }
}

// Đơn của 1 tài khoản, mới nhất lên đầu
export function getOrdersByUser(email) {
  return readOrders()
    .filter((order) => order.userEmail === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOrder(id) {
  return readOrders().find((order) => order.id === id) || null;
}

// Tạo đơn mới, tự cấp mã BK1001, BK1002, ...
export function createOrder(data) {
  const list = readOrders();
  const lastNumber = list.reduce(
    (max, order) => Math.max(max, Number(order.id.replace(/\D/g, "")) || 0),
    1000,
  );

  const order = {
    ...data,
    id: `BK${lastNumber + 1}`,
    status: "booked",
    reviewed: false,
    createdAt: new Date().toISOString(),
  };

  writeOrders([...list, order]);
  return order;
}

// Sửa đơn. patch là object, hoặc hàm (đơn cũ) => object
export function updateOrder(id, patch) {
  let updated = null;
  const list = readOrders().map((order) => {
    if (order.id !== id) return order;
    updated = {
      ...order,
      ...(typeof patch === "function" ? patch(order) : patch),
    };
    return updated;
  });
  writeOrders(list);
  return updated;
}

// Tính lại tổng tiền: giá phòng x số đêm - giảm giá + dịch vụ thêm
export function calcTotal(order) {
  const servicesTotal = (order.services || []).reduce(
    (sum, service) => sum + service.price,
    0,
  );
  return (
    order.pricePerNight * order.nights - (order.discount || 0) + servicesTotal
  );
}

// Chính sách hủy: nhận phòng lúc 14:00
//   còn từ 3 ngày trở lên -> hoàn 100%
//   còn từ 1 đến dưới 3 ngày -> hoàn 50%
//   dưới 1 ngày -> không hoàn
export function getRefundPercent(checkInISO, now = new Date()) {
  const checkInAt = fromISODate(checkInISO).getTime() + 14 * 3600 * 1000;
  const days = (checkInAt - now.getTime()) / 86400000;
  if (days >= 3) return 100;
  if (days >= 1) return 50;
  return 0;
}
