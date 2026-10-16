// ============================================================
// TRANG "ĐƠN ĐẶT PHÒNG CỦA TÔI" - danh sách đơn + lọc theo trạng thái
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { STATUS_LABEL, getOrdersByUser } from "../../data/ordersStore.js";
import { formatISO, formatMoney } from "../../data/dateUtils.js";
import AccountLayout from "./AccountLayout.jsx";

const FILTERS = [
  ["all", "Tất cả"],
  ["booked", "Đã đặt"],
  ["staying", "Đang ở"],
  ["checked_out", "Đã check-out"],
  ["cancelled", "Đã hủy"],
];

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const orders = getOrdersByUser(user.email);
  const shown =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  const countOf = (key) =>
    key === "all"
      ? orders.length
      : orders.filter((o) => o.status === key).length;

  return (
    <AccountLayout
      title="Đơn đặt phòng của tôi"
      subtitle="Xem, thêm dịch vụ, đổi hoặc hủy đơn đặt phòng của bạn."
    >
      {/* ===== BỘ LỌC TRẠNG THÁI ===== */}
      <div className="account-filters">
        {FILTERS.map(([key, label]) => (
          <button
            type="button"
            key={key}
            className={filter === key ? "active" : ""}
            onClick={() => setFilter(key)}
          >
            {label} ({countOf(key)})
          </button>
        ))}
      </div>

      {/* ===== DANH SÁCH ĐƠN ===== */}
      {shown.length === 0 ? (
        <div className="account-empty">
          <h2>
            {orders.length === 0
              ? "Bạn chưa có đơn đặt phòng nào"
              : "Không có đơn nào ở trạng thái này"}
          </h2>
          {orders.length === 0 && (
            <>
              <p>Chọn một homestay và đặt phòng đầu tiên của bạn nhé.</p>
              <button
                type="button"
                className="account-primary"
                onClick={() => navigate("/")}
              >
                Khám phá homestay
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="order-list">
          {shown.map((order) => (
            <article className="order-card" key={order.id}>
              <img src={order.image} alt={order.homestayName} />

              <div className="order-card-info">
                <div className="order-card-top">
                  <strong>Đơn #{order.id}</strong>
                  <span className={`order-status ${order.status}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>

                <h3>
                  {order.homestayName} · {order.roomTypeName}
                </h3>
                <p>
                  {formatISO(order.checkIn)} - {formatISO(order.checkOut)} (
                  {order.nights} đêm) · {order.guests} khách
                </p>
                <p className="order-card-total">{formatMoney(order.total)}</p>
              </div>

              <div className="order-card-actions">
                <button
                  type="button"
                  className="account-primary"
                  onClick={() => navigate(`/account/orders/${order.id}`)}
                >
                  Xem chi tiết
                </button>

                {order.status === "checked_out" && !order.reviewed && (
                  <button
                    type="button"
                    className="account-outline"
                    onClick={() => navigate(`/review?order=${order.id}`)}
                  >
                    Đánh giá
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
