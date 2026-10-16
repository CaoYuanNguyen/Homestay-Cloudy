// ============================================================
// CHI TIẾT PHÒNG (ảnh, tiện nghi, loại phòng, chính sách)
// Bấm "Đặt ngay" -> kiểm tra đăng nhập (requireLogin) rồi mới đặt
// ============================================================

import { useEffect, useState } from "react";
import { Wifi, Utensils, Waves, Building, Wind, Car, Star, MapPin } from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import "../../styles/RoomDetail.css";

const defaultRoom = {
  name: "Cloudy Nest Đà Lạt",
  rating: 4.9,
  reviews: 120,
  location: "Đà Lạt, Lâm Đồng",
  price: 600000,
  image:
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1600&q=85",
  description:
    "Cloudy Nest nằm giữa rừng thông, mang đến không gian nghỉ dưỡng yên tĩnh và thoáng mát. Thiết kế hiện đại, gần trung tâm và thuận tiện di chuyển.",
  amenities: [
    { label: "Wifi miễn phí", icon: <Wifi size={16} /> },
    { label: "Bếp chung", icon: <Utensils size={16} /> },
    { label: "Hồ bơi", icon: <Waves size={16} /> },
    { label: "Ban công", icon: <Building size={16} /> },
    { label: "Điều hòa", icon: <Wind size={16} /> },
    { label: "Chỗ đậu xe", icon: <Car size={16} /> },
  ],
};

const roomImages = [
  "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
];

const roomTypes = [
  {
    id: 1,
    name: "Phòng Standard",
    badge: "STAND",
    description: "22 m² • Tối đa 2 người lớn, 1 trẻ em • Còn 3 phòng trống",
    freebies: "Miễn phí: Wifi, Nước uống",
    paidExtras: "Tính thêm: Ăn sáng, Spa, Giặt ủi, Đưa đón",
    price: 600000,
    totalNightsPrice: 1800000,
    image: roomImages[0],
  },
  {
    id: 2,
    name: "Phòng Deluxe",
    badge: "DELUXE",
    description: "28 m² • Tối đa 2 người lớn, 2 trẻ em • Còn 5 phòng trống",
    freebies: "Miễn phí: Wifi, Nước uống, Ăn sáng",
    paidExtras: "Tính thêm: Spa, Giặt ủi, Đưa đón, BBQ",
    price: 800000,
    totalNightsPrice: 2400000,
    image: roomImages[1],
  },
  {
    id: 3,
    name: "Phòng VIP Loft",
    badge: "VIP",
    description: "45 m² • Tối đa 3 người lớn, 2 trẻ em • Còn 2 phòng trống",
    freebies: "Miễn phí: Wifi, Nước uống, Ăn sáng, Minibar, Bồn tắm",
    paidExtras: "Tính thêm: Spa, Đưa đón, BBQ, Thuê xe máy",
    price: 1500000,
    totalNightsPrice: 4500000,
    image: roomImages[2],
  },
];

function getNumericPrice(price) {
  if (typeof price === "number") return price;
  return Number(String(price ?? "").replace(/[^\d]/g, "")) || 600000;
}

export default function RoomDetail({
  room: selectedRoom,
  onBack,
  onBook,
}) {
  const room = {
    ...defaultRoom,
    ...(selectedRoom || {}),
    name: selectedRoom?.name || defaultRoom.name,
    description: defaultRoom.description,
  };

  const price = getNumericPrice(room.price);

  const images = [
    room.image || defaultRoom.image,
    ...roomImages,
  ];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [activeTab, setActiveTab] = useState("Tổng quan");

  // State cho phần chọn ngày và số khách
  const [checkIn, setCheckIn] = useState("10/18/2026");
  const [checkOut, setCheckOut] = useState("10/21/2026");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  useEffect(() => {
    setActiveImage(images[0]);
    setActiveTab("Tổng quan");
  }, [selectedRoom]);

  const formatPrice = (value) =>
    `${getNumericPrice(value).toLocaleString("vi-VN")}đ`;

  const sections = ["Tổng quan", "Tiện nghi", "Đánh giá", "Vị trí"];

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  }

  const { requireLogin } = useAuth();

  function handleBooking(type) {
    // Chưa đăng nhập -> hiện trang đăng nhập, đăng nhập xong mới đặt tiếp
    requireLogin(() => {
      if (onBook) {
        onBook(room, type);
      } else {
        alert(`Bạn đã chọn ${type.name} tại ${room.name}`);
      }
    });
  }

  return (
    <div className="room-detail-page">
      {/* Breadcrumb / Quay lại */}
      <div className="room-detail-label">
        <button
          type="button"
          className="room-back-button"
          onClick={handleBack}
        >
          ← Trang chủ › Homestay › Cloudy Nest Đà Lạt
        </button>
      </div>

      <main className="room-detail-container">
        {/* Hero Banner Ảnh Lớn */}
        <div className="room-hero">
          <img
            src={activeImage}
            alt={room.name}
            onError={(event) => {
              event.currentTarget.src = roomImages[0];
            }}
          />
        </div>

        {/* Gallery Thumbnails */}
        <div className="room-gallery">
          {images.slice(0, 4).map((image, index) => (
            <button
              type="button"
              key={`${image}-${index}`}
              className={`room-thumbnail ${
                activeImage === image ? "active" : ""
              }`}
              onClick={() => setActiveImage(image)}
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <img src={image} alt={`${room.name} ${index + 1}`} />
            </button>
          ))}
        </div>

        <div className="room-detail-content">
          {/* Title, Giá từ, Đánh giá, Địa điểm */}
          <div className="room-title-price">
            <div className="room-title-info">
              <h1>{room.name}</h1>

              <p className="room-rating-location">
                <span className="room-location-text">
                  <MapPin size={14} style={{ display: "inline", marginRight: 4 }} />
                  {room.location}
                </span>
                <span className="dot-sep">•</span>
                <span className="room-rating">
                  <Star size={14} fill="#f87171" color="#f87171" style={{ display: "inline", marginRight: 2 }} />
                  <strong style={{ color: "#f87171" }}>{room.rating}</strong>
                  <span className="room-review-count">
                    ({room.reviews || 120} đánh giá)
                  </span>
                </span>
              </p>
            </div>

            <div className="room-price">
              <span className="price-from-label">Giá từ </span>
              <strong>{formatPrice(price)}</strong>
              <small>/phòng/đêm</small>
            </div>
          </div>

          {/* Amenities Badges */}
          <div className="room-amenities">
            {defaultRoom.amenities.map((item, index) => (
              <span className="room-amenity" key={index}>
                {item.icon} {item.label}
              </span>
            ))}
          </div>

          {/* Tabs Navigation */}
          <nav className="room-tabs">
            {sections.map((tab) => (
              <button
                type="button"
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => {
                  setActiveTab(tab);
                  document
                    .getElementById(`room-section-${sections.indexOf(tab)}`)
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                }}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Mô tả & Các tiện ích phụ (Cách chợ, sân bay...) */}
          <section
            id="room-section-0"
            className="room-description-section"
          >
            <p>{room.description}</p>
            <ul className="room-highlights-list">
              <li>✓ Cách chợ đêm Đà Lạt 10 phút</li>
              <li>✓ Cách sân bay Liên Khương 30 phút</li>
              <li>✓ Lễ tân 24/7</li>
              <li>✓ Nhận phòng 14:00, trả phòng 12:00</li>
            </ul>
          </section>

          {/* Cụm Chọn ngày và số khách */}
          <section className="booking-filter-section">
            <h2>Chọn ngày và số khách</h2>
            <div className="booking-filter-grid">
              <div className="filter-field">
                <label>Ngày nhận phòng</label>
                <input
                  type="text"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className="filter-field">
                <label>Ngày trả phòng</label>
                <input
                  type="text"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <div className="filter-field counter-field">
                <label>Người lớn</label>
                <div className="counter-controls">
                  <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                  <span>{adults}</span>
                  <button type="button" onClick={() => setAdults(adults + 1)}>+</button>
                </div>
              </div>
              <div className="filter-field counter-field">
                <label>Trẻ em</label>
                <div className="counter-controls">
                  <button type="button" onClick={() => setChildren(Math.max(0, children - 1))}>-</button>
                  <span>{children}</span>
                  <button type="button" onClick={() => setChildren(children + 1)}>+</button>
                </div>
              </div>
            </div>
          </section>

          {/* Danh sách loại phòng */}
          <section className="room-types">
            <h2>Loại phòng tại {room.name}</h2>
            <p className="room-types-subtitle">
              Bấm "Xem chi tiết phòng" để xem ảnh, tiện nghi và bảng giá dịch vụ. "Đặt ngay" sẽ chuyển sang bước chọn phòng.
            </p>

            <div className="room-type-list">
              {roomTypes.map((type, index) => (
                <article className="room-type-card" key={index}>
                  <img
                    src={type.image}
                    alt={type.name}
                    className="room-type-image"
                  />

                  <div className="room-type-info">
                    <div className="room-type-header-row">
                      <strong>{type.name}</strong>
                      <span className="room-badge">{type.badge}</span>
                    </div>
                    <span className="room-specs">{type.description}</span>
                    <div className="room-tags-info">
                      <span className="tag-free">{type.freebies}</span>
                      <span className="tag-paid">{type.paidExtras}</span>
                    </div>
                  </div>

                  <div className="room-type-price-action">
                    <div className="room-type-price">
                      <strong>{formatPrice(type.price)}</strong>
                      <span>/phòng/đêm</span>
                      <small className="total-nights-text">3 đêm: {formatPrice(type.totalNightsPrice)}</small>
                    </div>

                    <div className="room-type-buttons">
                      <button
                        type="button"
                        className="room-detail-btn"
                        onClick={() => handleBooking(type)}
                      >
                        Xem chi tiết phòng
                      </button>
                      <button
                        type="button"
                        className="room-book-button"
                        onClick={() => handleBooking(type)}
                      >
                        Đặt ngay
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Quy định và chính sách */}
          <section className="room-policies-section">
            <h2>Quy định và chính sách</h2>
            <div className="policy-table">
              <div className="policy-row">
                <span>Nhận phòng / trả phòng</span>
                <strong>Từ 14:00 / trước 12:00</strong>
              </div>
              <div className="policy-row">
                <span>Hủy trước giờ nhận phòng từ 3 ngày</span>
                <strong>Hoàn 100%</strong>
              </div>
              <div className="policy-row">
                <span>Hủy từ 1 đến dưới 3 ngày</span>
                <strong>Hoàn 50%</strong>
              </div>
              <div className="policy-row">
                <span>Hủy dưới 1 ngày hoặc không đến</span>
                <strong>Không hoàn</strong>
              </div>
              <div className="policy-row">
                <span>Đặt cọc</span>
                <strong>30% tiền phòng</strong>
              </div>
              <div className="policy-row">
                <span>Trẻ em</span>
                <strong>Tính theo quy định của homestay</strong>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
