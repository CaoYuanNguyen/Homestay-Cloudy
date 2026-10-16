// ============================================================
// ĐÁNH GIÁ VÀ TRẢI NGHIỆM CỦA KHÁCH HÀNG (danh sách công khai, /customer-reviews)
// ============================================================

import { useState } from "react";
import Header from "../../components/Header.jsx";
import "../../styles/CustomerReviews.css";

export default function CustomerReviews() {
  // ===== LƯU MỨC SAO ĐANG LỌC =====
  const [filter, setFilter] = useState("Tất cả");

  // ===== DANH SÁCH BÀI ĐÁNH GIÁ =====
  const reviews = [
    {
      name: "Lê Minh C",
      room: "Phòng Deluxe, ở tháng 09/2025",
      stars: 5,
      title: "Kỳ nghỉ giữa rừng thông",
      content:
        "Phòng sạch, ban công nhìn ra rừng thông rất đẹp. Nhân viên nhiệt tình, bữa sáng đa dạng và luôn nóng. Chắc chắn sẽ quay...",
    },
    {
      name: "Phạm Thu H",
      room: "Phòng Deluxe, ở tháng 09/2025",
      stars: 5,
      title: "Cả nhà đều hài lòng",
      content:
        "Đi 4 người, phòng rộng, hai giường thoải mái. Bọn trẻ thích khu vườn. Chủ nhà hỗ trợ đưa đón sân bay rất đúng giờ.",
    },
    {
      name: "Vũ Hoàng E",
      room: "Phòng Deluxe, ở tháng 08/2025",
      stars: 5,
      title: "Yên tĩnh, hơi lạnh về đêm",
      content:
        "Không gian rất yên tĩnh, ngủ ngon. Đêm hơi lạnh nên bạn nào sợ lạnh nhớ mang thêm áo ấm. Giá hợp lý so với chất lượng.",
    },
    {
      name: "Trần Quốc B",
      room: "Phòng Deluxe, ở tháng 08/2025",
      stars: 5,
      title: "Đáng đồng tiền",
      content:
        "Dịch vụ spa thư giãn, nhân viên thân thiện. Phòng đúng như ảnh, không có gì phải chê.",
    },
  ];

  // ===== LỌC ĐÁNH GIÁ THEO SỐ SAO =====
  const filteredReviews =
    filter === "Tất cả"
      ? reviews
      : reviews.filter((review) => review.stars === Number(filter));

  // ===== GIAO DIỆN =====
  return (
    <>
      <Header />
      <div className="customer-reviews-page">
        {/* ===== TÊN TRANG PHÍA TRÊN ===== */}
        <div className="customer-reviews-label">
          Đánh giá và trải nghiệm của khách hàng
        </div>

        <main className="customer-reviews-container">
          {/* ===== TIÊU ĐỀ ===== */}
          <h1>
            Đánh giá và trải nghiệm <span>(Khách hàng)</span>
          </h1>

          {/* ===== KHUNG TỔNG ĐIỂM ===== */}
          <section className="rating-summary">
            {/* Điểm trung bình */}
            <div className="rating-main">
              <strong>4.9</strong>

              <div className="summary-stars">★★★★★</div>

              <span>120 đánh giá</span>
            </div>

            {/* ===== ĐIỂM TỪNG TIÊU CHÍ ===== */}
            <div className="rating-details">
              <div className="rating-detail">
                <span>Chất lượng phòng</span>

                <div className="rating-bar">
                  <div style={{ width: "98%" }}></div>
                </div>

                <strong>4.9</strong>
              </div>

              <div className="rating-detail">
                <span>Dịch vụ</span>

                <div className="rating-bar">
                  <div style={{ width: "96%" }}></div>
                </div>

                <strong>4.8</strong>
              </div>

              <div className="rating-detail">
                <span>Thái độ nhân viên</span>

                <div className="rating-bar">
                  <div style={{ width: "100%" }}></div>
                </div>

                <strong>5.0</strong>
              </div>

              <div className="rating-detail">
                <span>Giá cả</span>

                <div className="rating-bar">
                  <div style={{ width: "94%" }}></div>
                </div>

                <strong>4.7</strong>
              </div>
            </div>
          </section>

          {/* ===== BỘ LỌC SỐ SAO ===== */}
          <section className="review-filter">
            <div className="filter-buttons">
              {["Tất cả", "5", "4", "3", "2", "1"].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={filter === item ? "active" : ""}
                  onClick={() => setFilter(item)}
                >
                  {item === "Tất cả" ? "Tất cả" : `${item} sao`}
                </button>
              ))}
            </div>

            {/* ===== SẮP XẾP ===== */}
            <div className="review-sort">
              <span>Sắp xếp</span>

              <select>
                <option>Mới nhất</option>
                <option>Cũ nhất</option>
              </select>
            </div>
          </section>

          {/* ===== DANH SÁCH ĐÁNH GIÁ ===== */}
          <section className="reviews-list">
            {filteredReviews.map((review, index) => (
              <article className="customer-review-card" key={index}>
                {/* ===== THÔNG TIN KHÁCH HÀNG ===== */}
                <div className="review-user">
                  <div className="review-avatar">{review.name.charAt(0)}</div>

                  <div>
                    <strong>{review.name}</strong>
                    <p>{review.room}</p>
                  </div>

                  <span className="review-saved">Đã lưu trú</span>
                </div>

                {/* ===== SỐ SAO ===== */}
                <div className="customer-stars">{"★".repeat(review.stars)}</div>

                {/* ===== NỘI DUNG ĐÁNH GIÁ ===== */}
                <h3>{review.title}</h3>

                <p className="review-text">{review.content}</p>
              </article>
            ))}
          </section>

          {/* ===== NÚT XEM THÊM ===== */}
          <div className="reviews-bottom">
            <button type="button">Xem thêm bài viết</button>

            <p>Chỉ hiển thị các bài đã được homestay kiểm duyệt</p>
          </div>
        </main>
      </div>
    </>
  );
}
