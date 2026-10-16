// ============================================================
// HERO + THANH TÌM KIẾM (ảnh lớn đầu trang chủ)
// ============================================================

import { useState } from "react";
import { Search, CalendarDays, MapPin } from "lucide-react";

export default function Hero({ onSearch }) {
  const [destination, setDestination] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("2 khách");

  function handleSubmit(event) {
    event.preventDefault();
    onSearch(destination);

    document.getElementById("homestays")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="hero" id="home">
      <img
        className="hero-background"
        src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=2000&q=85"
        alt="Ngôi nhà nghỉ dưỡng giữa thiên nhiên"
      />

      <div className="hero-overlay" />

      <div className="hero-card">
        <span className="eyebrow">CLOUDY NEST</span>

        <h1>Mỗi miền một chốn nghỉ nhỏ</h1>

        <p>
          Từ mây Đà Lạt đến phố cổ Hội An và biển Nha Trang.
          Đặt phòng trực tiếp, giá minh bạch, không qua trung gian.
        </p>

        <a className="primary-button" href="#homestays">
          Khám phá homestay →
        </a>
      </div>

      <form className="search-panel" onSubmit={handleSubmit}>
        <label className="search-field destination-field">
          <span>
            <MapPin size={15} />
            ĐỊA ĐIỂM
          </span>

          <input
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="Đà Lạt, Hội An, Nha Trang..."
          />
        </label>

        <label className="search-field">
          <span>
            <CalendarDays size={15} />
            NGÀY NHẬN PHÒNG
          </span>

          <input
            type="date"
            value={checkin}
            onChange={(event) => {
              const value = event.target.value;
              setCheckin(value);

              if (checkout && value > checkout) {
                setCheckout("");
              }
            }}
          />
        </label>

        <label className="search-field">
          <span>
            <CalendarDays size={15} />
            NGÀY TRẢ PHÒNG
          </span>

          <input
            type="date"
            min={checkin || undefined}
            value={checkout}
            onChange={(event) => setCheckout(event.target.value)}
          />
        </label>

        <label className="search-field">
          <span>SỐ KHÁCH</span>

          <select
            value={guests}
            onChange={(event) => setGuests(event.target.value)}
          >
            <option>1 khách</option>
            <option>2 khách</option>
            <option>3 khách</option>
            <option>4 khách</option>
            <option>5+ khách</option>
          </select>
        </label>

        <button className="search-button" type="submit">
          <Search size={16} />
          Tìm kiếm
        </button>
      </form>
    </section>
  );
}
