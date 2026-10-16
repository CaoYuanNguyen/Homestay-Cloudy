// ============================================================
// CỘT ĐÁNH GIÁ BÊN PHẢI TRANG CHỦ
// Nút "Xem tất cả trải nghiệm" dẫn sang /customer-reviews
// ============================================================

import { useNavigate } from "react-router-dom";
import { homeReviews } from "./homeData.js";

export default function ReviewSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="review-sidebar" id="reviews">
      <div className="review-summary">
        <span className="review-label">ĐÁNH GIÁ</span>

        <div className="review-score">
          <strong>4.8</strong>

          <div className="review-score-detail">
            <div className="stars">★★★★★</div>
            <p>270 đánh giá đã duyệt</p>
          </div>
        </div>
      </div>

      {homeReviews.map((review) => (
        <article className="review-card" key={review.name}>
          <h4>
            {review.name}, {review.place}
          </h4>

          <p>“{review.comment}”</p>

          <div className="stars">★★★★★</div>
        </article>
      ))}

      <a
        className="all-reviews"
        href="/customer-reviews"
        onClick={(event) => {
          event.preventDefault();
          navigate("/customer-reviews");
        }}
      >
        Xem tất cả trải nghiệm →
      </a>
    </aside>
  );
}
