// ============================================================
// KHÁM PHÁ ĐIỂM ĐẾN
// ============================================================

import { destinations } from "./homeData.js";

export default function DestinationsSection({ onSelectDestination }) {
  function chooseDestination(keyword) {
    onSelectDestination(keyword);

    document.getElementById("homestays")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="extra-section destinations-section" id="destinations">
      <div className="extra-heading">
        <h2>Khám phá điểm đến</h2>
        <p>Chọn một điểm đến để xem homestay Cloudy Nest tại đó.</p>
      </div>

      <div className="destinations-grid">
        {destinations.map((destination) => (
          <button
            type="button"
            className="destination-card"
            key={destination.name}
            onClick={() => chooseDestination(destination.keyword)}
          >
            <img
              src={destination.image}
              alt={destination.name}
              className="destination-image"
              loading="lazy"
            />

            <span className="destination-info">
              <strong>{destination.name}</strong>
              <span>{destination.description}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
