// ============================================================
// THẺ HOMESTAY (1 homestay trong danh sách)
// ============================================================

import { useState } from "react";
import { Heart, Star, MapPin } from "lucide-react";

export default function HomestayCard({ stay, onViewRoom }) {
  const [favorite, setFavorite] = useState(false);

  return (
    <article className="homestay-card">
      <div className="homestay-image-wrap">
        <img
          src={stay.image}
          alt={stay.name}
          className="homestay-image"
          loading="lazy"
        />

        <span className="image-tag">Được yêu thích</span>

        <button
          type="button"
          className={`favorite-button ${favorite ? "is-favorite" : ""}`}
          onClick={() => setFavorite((value) => !value)}
          aria-label={favorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          aria-pressed={favorite}
        >
          <Heart
            size={22}
            fill={favorite ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="homestay-info">
        <div className="homestay-title-row">
          <h3>{stay.name}</h3>

          <span className="rating">
            <Star size={16} fill="currentColor" />
            {stay.rating}
          </span>
        </div>

        <p className="location">
          <MapPin size={16} />
          {stay.location}
        </p>

        <p className="description">{stay.description}</p>

        <div className="amenities">
          {stay.amenities.map((amenity) => (
            <span className="amenity-tag" key={amenity}>
              {amenity}
            </span>
          ))}
        </div>

        <div className="homestay-bottom">
          <div className="price-block">
            <span className="price-label">Giá từ</span>
            <strong className="price">{stay.price}</strong>
            <span className="per-night">/ đêm</span>
          </div>

          <button
            className="view-button"
            type="button"
            onClick={() => onViewRoom(stay)}
          >
            Xem phòng
          </button>
        </div>
      </div>
    </article>
  );
}
