// ============================================================
// ƯU ĐÃI VÀ CHÍNH SÁCH
// ============================================================

import { offers } from "./homeData.js";

export default function OffersSection() {
  return (
    <section className="extra-section offers-section" id="offers">
      <div className="extra-heading">
        <h2>Ưu đãi và chính sách</h2>
        <p>Minh bạch ngay từ lúc đặt phòng.</p>
      </div>

      <div className="offers-grid">
        {offers.map((offer) => (
          <article className="offer-card" key={offer.title}>
            <div className="offer-badge">{offer.badge}</div>
            <h3>{offer.title}</h3>
            <p>{offer.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
