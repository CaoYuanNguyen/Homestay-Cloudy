// ============================================================
// ĐÁNH GIÁ TRẢI NGHIỆM (khách chấm sao sau khi check-out, /review?order=BKxxxx)
// ============================================================

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import Header from "../../components/Header.jsx";
import { formatISO } from "../../data/dateUtils.js";
import {
  getOrder,
  getOrdersByUser,
  updateOrder,
} from "../../data/ordersStore.js";
import "../../styles/Review.css";

export default function Review() {
  // Dùng để chuyển sang trang khác
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Đơn cần đánh giá: lấy từ ?order=BKxxxx; không có thì lấy đơn đã check-out gần nhất chưa đánh giá
  const [order] = useState(() => {
    const orderParam = searchParams.get("order");
    if (orderParam) return getOrder(orderParam);
    return (
      getOrdersByUser(user.email).find(
        (item) => item.status === "checked_out" && !item.reviewed,
      ) || null
    );
  });

  let orderError = "";
  if (!order) orderError = "Chưa có đơn nào đã check-out để đánh giá.";
  else if (order.userEmail !== user.email)
    orderError = "Đơn này không thuộc tài khoản của bạn.";
  else if (order.status !== "checked_out")
    orderError = "Đơn này chưa check-out nên chưa thể đánh giá.";
  else if (order.reviewed)
    orderError = "Đơn này đã được đánh giá, bạn không thể gửi lại.";

  // ===== LƯU SỐ SAO NGƯỜI DÙNG CHỌN =====
  // Ban đầu tất cả đều bằng 0 vì chưa đánh giá
  const [ratings, setRatings] = useState({
    room: 0,
    service: 0,
    staff: 0,
    price: 0,
    overall: 0,
  });

  // ===== KIỂM TRA ĐÃ GỬI ĐÁNH GIÁ CHƯA =====
  const [submitted, setSubmitted] = useState(false);

  // ===== DANH SÁCH CÁC MỤC CẦN ĐÁNH GIÁ =====
  const ratingItems = [
    {
      key: "room",
      title: "Chất lượng phòng",
      description: "Sạch sẽ, tiện nghi, đúng mô tả",
    },
    {
      key: "service",
      title: "Dịch vụ",
      description: "Ăn uống, spa, đưa đón,...",
    },
    {
      key: "staff",
      title: "Thái độ nhân viên",
      description: "Thân thiện, hỗ trợ nhanh",
    },
    {
      key: "price",
      title: "Giá cả",
      description: "Tương xứng với chất lượng",
    },
  ];

  // ===== HÀM CHỌN SỐ SAO =====
  // key là mục đang đánh giá
  // value là số sao người dùng chọn
  const chooseRating = (key, value) => {
    setRatings({
      ...ratings,
      [key]: value,
    });
  };

  // ===== TẠO 5 NGÔI SAO =====
  const renderStars = (key) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            className={ratings[key] >= star ? "selected" : ""}
            onClick={() => chooseRating(key, star)}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  // ===== ĐIỂM TRUNG BÌNH CỦA 4 MỤC (gợi ý cho đánh giá tổng thể) =====
  const rated = [
    ratings.room,
    ratings.service,
    ratings.staff,
    ratings.price,
  ].filter((value) => value > 0);
  const averageText = rated.length
    ? (rated.reduce((sum, value) => sum + value, 0) / rated.length).toFixed(1)
    : "chưa có";

  // ===== HÀM GỬI ĐÁNH GIÁ =====
  const handleSubmit = () => {
    // Kiểm tra người dùng đã chọn đủ các mục chưa
    if (
      ratings.room === 0 ||
      ratings.service === 0 ||
      ratings.staff === 0 ||
      ratings.price === 0 ||
      ratings.overall === 0
    ) {
      alert("Vui lòng đánh giá đầy đủ các mục.");
      return;
    }

    // Lưu đánh giá vào đơn, rồi hiện thông báo thành công
    updateOrder(order.id, { reviewed: true, ratings });
    setSubmitted(true);
  };

  // Không có đơn hợp lệ để đánh giá
  if (orderError) {
    return (
      <>
        <Header />
        <div className="review-page">
          <main className="review-container">
            <h1>
              Đánh giá trải nghiệm <span>(Khách hàng)</span>
            </h1>
            <p>{orderError}</p>
            <button
              type="button"
              className="review-submit-button"
              style={{ maxWidth: 280 }}
              onClick={() => navigate("/account/orders")}
            >
              Về đơn đặt phòng của tôi
            </button>
          </main>
        </div>
      </>
    );
  }

  // ===== GIAO DIỆN TRANG =====
  return (
    <>
      <Header />
      <div className="review-page">
        {/* ===== TÊN TRANG PHÍA TRÊN ===== */}
        <div className="review-page-label">Đánh giá trải nghiệm</div>

        <main className="review-container">
          {/* ===== TIÊU ĐỀ ===== */}
          <h1>
            Đánh giá trải nghiệm <span>(Khách hàng)</span>
          </h1>

          <div className="review-layout">
            {/* ===== THÔNG TIN ĐƠN ĐẶT PHÒNG BÊN TRÁI ===== */}
            <section className="review-booking-card">
              <div className="review-booking-top">
                <span className="review-status">Đã check-out</span>

                <strong>Đơn {order.id}</strong>
              </div>

              <p>
                {order.homestayName}, {order.roomTypeName}
              </p>

              <p>
                {formatISO(order.checkIn)} - {formatISO(order.checkOut)} (
                {order.nights} đêm)
              </p>

              <p>{order.guests} khách</p>

              <p className="review-note">
                Mỗi đơn chỉ được đánh giá một lần. Điểm sao được tính vào thống
                kê của homestay.
              </p>
            </section>

            {/* ===== KHUNG ĐÁNH GIÁ BÊN PHẢI ===== */}
            <section className="review-form-card">
              <h2>Bạn cảm thấy kỳ nghỉ thế nào?</h2>

              {/* ===== 4 MỤC ĐÁNH GIÁ ===== */}
              {ratingItems.map((item) => (
                <div className="review-rating-row" key={item.key}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>

                  {/* 5 ngôi sao */}
                  {renderStars(item.key)}
                </div>
              ))}

              {/* ===== ĐÁNH GIÁ TỔNG THỂ ===== */}
              <div className="review-rating-row review-overall">
                <div>
                  <strong>Đánh giá tổng thể</strong>
                  <p>Gợi ý theo trung bình: {averageText}</p>
                </div>

                {renderStars("overall")}
              </div>

              {/* ===== NÚT GỬI ĐÁNH GIÁ ===== */}
              <button
                type="button"
                className="review-submit-button"
                onClick={handleSubmit}
              >
                Gửi đánh giá
              </button>

              {/* ===== THÔNG BÁO SAU KHI GỬI ===== */}
              {submitted && (
                <div className="review-success">
                  <div>
                    <strong>Cảm ơn bạn đã đánh giá</strong>

                    <p>Đơn này đã được đánh giá, bạn không thể gửi lại</p>
                  </div>

                  {/* Chuyển sang trang Viết bài trải nghiệm */}
                  <button
                    type="button"
                    onClick={() => navigate(`/experience?order=${order.id}`)}
                  >
                    Viết thêm bài trải nghiệm
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
