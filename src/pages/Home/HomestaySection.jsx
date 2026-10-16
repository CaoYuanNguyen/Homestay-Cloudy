// ============================================================
// DANH SÁCH HOMESTAY (có tìm kiếm)
// ============================================================

import HomestayCard from "./HomestayCard.jsx";
import ReviewSidebar from "./ReviewSidebar.jsx";
import { homestays } from "./homeData.js";

export default function HomestaySection({ searchTerm, onViewRoom }) {
  const normalize = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLocaleLowerCase("vi")
      .trim();

  const keyword = normalize(searchTerm);

  const filtered = homestays.filter((stay) => {
    const text = normalize(
      `${stay.name} ${stay.location} ${stay.description} ${stay.amenities.join(" ")}`
    );

    return text.includes(keyword);
  });

  return (
    <main className="content" id="homestays">
      <div className="section-heading">
        <div>
          <h2>Khám phá homestay tại Cloudy Nest</h2>
          <p>Ba homestay, mỗi nơi một trải nghiệm riêng.</p>
        </div>

        <button
          className="filter-button"
          type="button"
          onClick={() => window.alert("Bộ lọc đang được phát triển.")}
        >
          ☷ Bộ lọc
        </button>
      </div>

      {filtered.length > 0 ? (
        <div className="listing-layout">
          <div className="homestay-grid">
            {filtered.map((stay) => (
              <HomestayCard
                key={stay.id}
                stay={stay}
                onViewRoom={onViewRoom}
              />
            ))}
          </div>

          <ReviewSidebar />
        </div>
      ) : (
        <div className="empty-state">
          <h3>Chưa tìm thấy homestay phù hợp</h3>
          <p>Hãy thử tìm Đà Lạt, Hội An hoặc Nha Trang.</p>
          <button
            type="button"
            className="view-button"
            onClick={() => window.location.hash = "homestays"}
          >
            Xem lại danh sách
          </button>
        </div>
      )}
    </main>
  );
}
