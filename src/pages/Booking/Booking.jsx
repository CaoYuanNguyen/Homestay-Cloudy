// ============================================================
// ĐẶT PHÒNG (4 bước: chọn ngày -> thông tin phòng -> thanh toán -> thành công)
// Đặt xong sẽ lưu đơn (data/ordersStore.js) và hiện mã đơn thật
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Plus, Check } from "lucide-react";
import { useAuth } from "../../auth/AuthContext.jsx";
import Header from "../../components/Header.jsx";
import { addDays, formatDate, sameDate, startOfToday, toISODate } from "../../data/dateUtils.js";
import { createOrder } from "../../data/ordersStore.js";
import { EXTRA_SERVICES, WEEKDAYS } from "./bookingData.js";

export default function Booking({ room, selectedRoomType, onBack, onHome }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = startOfToday(); // không cho chọn ngày đã qua

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [checkIn, setCheckIn] = useState(addDays(today, 2));
  const [checkOut, setCheckOut] = useState(addDays(today, 4));
  const [orderId, setOrderId] = useState(""); // mã đơn sau khi đặt thành công
  
  const [guestsCount, setGuestsCount] = useState(2);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const [selectedServices, setSelectedServices] = useState([]);
  
  const [bookingInfo, setBookingInfo] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    note: "",
  });

  const [paymentOption, setPaymentOption] = useState(null);
  const [payMethod, setPayMethod] = useState(null);

  const [needInvoice, setNeedInvoice] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    taxCode: "",
  });

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
    "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
    "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];

  const changeMonth = (amount) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + amount,
        1
      )
    );
  };

  const handleSelectDate = (date) => {
    if (date < today) return;
    setError("");
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
      return;
    }

    if (date <= checkIn) {
      setCheckIn(date);
      setCheckOut(null);
    } else {
      setCheckOut(date);
    }
  };

  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const startOffset = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const daysInPreviousMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    0
  ).getDate();

  const calendarDays = [];

  for (let i = 0; i < 42; i++) {
    let day;
    let date;
    let outsideMonth = false;

    if (i < startOffset) {
      day = daysInPreviousMonth - startOffset + i + 1;
      date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        day
      );
      outsideMonth = true;
    } else if (i >= startOffset + daysInMonth) {
      day = i - startOffset - daysInMonth + 1;
      date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        day
      );
      outsideMonth = true;
    } else {
      day = i - startOffset + 1;
      date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
    }

    calendarDays.push({ day, date, outsideMonth });
  }

  const isBetween = (date) =>
    checkIn && checkOut && date > checkIn && date < checkOut;

  const handleContinueStep1 = () => {
    if (!checkIn || !checkOut) {
      setError("Vui lòng chọn ngày nhận và trả phòng.");
      return;
    }
    setStep(2);
  };

  const handleContinueStep2 = () => {
    setStep(3);
  };

  const handleConfirmBooking = () => {
    if (!paymentOption) {
      alert("Vui lòng chọn hình thức thanh toán.");
      return;
    }
    if (!payMethod) {
      alert("Vui lòng chọn phương thức thanh toán.");
      return;
    }
    if (!bookingInfo.fullName || !bookingInfo.phone) {
      alert("Vui lòng điền đầy đủ họ tên và số điện thoại.");
      return;
    }

    // Lưu đơn đặt phòng để hiện trong "Đơn đặt phòng của tôi"
    const order = createOrder({
      userEmail: user.email,
      homestayName: displayRoomName,
      location: displayLocation,
      image: displayImage,
      roomTypeName: displayTypeName,
      pricePerNight,
      discount,
      checkIn: toISODate(checkIn),
      checkOut: toISODate(checkOut),
      nights,
      guests: guestsCount,
      services: selectedServices
        .map((id) => EXTRA_SERVICES.find((item) => item.id === id))
        .filter(Boolean)
        .map((item) => ({ id: item.id, title: item.title, price: item.price })),
      total: finalTotal,
      paymentOption,
      payMethod,
      paidNow:
        paymentOption === "full"
          ? finalTotal
          : paymentOption === "deposit"
            ? depositAmount
            : 0,
      contact: bookingInfo,
      invoice: needInvoice ? companyInfo : null,
    });

    setOrderId(order.id);
    setStep(4);
  };

  const toggleService = (id) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((sId) => sId !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 2;
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const nights = calculateNights();

  const displayRoomName = room ? room.name : "The Green House";
  const displayLocation = room ? room.location : "Đà Lạt, Lâm Đồng";
  const displayRating = room ? room.rating : "4.9";
  const displayImage =
    selectedRoomType?.image ||
    room?.image ||
    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=800&q=85";
  const displayTypeName = selectedRoomType ? selectedRoomType.name : "Phòng Deluxe";
  
  const pricePerNight = selectedRoomType ? selectedRoomType.price : 800000;
  const rawTotal = pricePerNight * nights;
  const discount = 100000;

  const servicesTotal = selectedServices.reduce((acc, serviceId) => {
    const s = EXTRA_SERVICES.find((item) => item.id === serviceId);
    return acc + (s ? s.price : 0);
  }, 0);

  const finalTotal = rawTotal - discount + servicesTotal;
  const depositAmount = Math.round(finalTotal * 0.3);
  const remainingAmount = finalTotal - depositAmount;

  const goHomeAction = (e) => {
    if (e) e.preventDefault();
    if (onHome) onHome();
    else if (onBack) onBack();
  };

  return (
    <div className="booking-page-container">
      <Header />

      <main className="booking-content-box">
        {step < 4 && (
          <div className="booking-header-row">
            <h2>
              {step === 1
                ? "Đặt phòng"
                : step === 2
                ? "Thông tin phòng"
                : "Thanh toán"}
            </h2>

            <div className="stepper-group">
              <div
                className={`step-item ${step >= 1 ? "active" : ""}`}
                onClick={() => setStep(1)}
                style={{ cursor: "pointer" }}
              >
                <span className={`step-circle ${step > 1 ? "checked" : ""}`}>
                  {step > 1 ? "✓" : "1"}
                </span>
                <span>Chọn ngày</span>
              </div>
              <div className="step-connector" />
              <div
                className={`step-item ${step >= 2 ? "active" : ""}`}
                onClick={() => {
                  if (checkIn && checkOut) setStep(2);
                }}
                style={{ cursor: "pointer" }}
              >
                <span className={`step-circle ${step > 2 ? "checked" : ""}`}>
                  {step > 2 ? "✓" : "2"}
                </span>
                <span>Thông tin phòng</span>
              </div>
              <div className="step-connector" />
              <div className={`step-item ${step === 3 ? "active" : ""}`}>
                <span className="step-circle">3</span>
                <span>Thanh toán</span>
              </div>
            </div>
          </div>
        )}

        {/* 1/ BƯỚC 1: CHỌN NGÀY */}
        {step === 1 ? (
          <div className="booking-columns-grid">
            <div className="bk-card room-card-info">
              <img src={displayImage} alt={displayRoomName} />
              <div className="bk-card-body">
                <h3>{displayRoomName}</h3>
                <p style={{ color: "#f87171", fontWeight: "600", fontSize: "13px", margin: "2px 0 6px 0" }}>
                  {displayTypeName} - {pricePerNight.toLocaleString("vi-VN")}đ/đêm
                </p>
                <p className="bk-rating">
                  <strong style={{ color: "#10b981" }}>{displayRating}</strong>{" "}
                  <span>(120 đánh giá)</span>
                </p>
                <p className="bk-location">{displayLocation}</p>
                <div className="bk-amenities">
                  <span>✓ Wifi miễn phí</span>
                  <span>✓ Bếp đầy đủ</span>
                  <span>✓ Hồ bơi</span>
                  <span>✓ Ban công</span>
                </div>
              </div>
            </div>

            <div className="bk-card calendar-card-box">
              <div className="cal-header-top">
                <h3>Chọn ngày</h3>
                <div className="cal-switcher">
                  <button onClick={() => changeMonth(-1)} className="cal-nav-btn">‹</button>
                  <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                  <button onClick={() => changeMonth(1)} className="cal-nav-btn">›</button>
                </div>
              </div>

              <div className="cal-grid-view">
                {WEEKDAYS.map((w, idx) => (
                  <div key={idx} className="cal-week-name">{w}</div>
                ))}

                {calendarDays.map(({ day, date, outsideMonth }, index) => {
                  const isCheckIn = sameDate(date, checkIn);
                  const isCheckOut = sameDate(date, checkOut);
                  const isSelected = isCheckIn || isCheckOut;

                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={date < today}
                      onClick={() => handleSelectDate(date)}
                      className={[
                        "cal-day-cell",
                        outsideMonth ? "outside" : "",
                        isBetween(date) ? "in-range" : "",
                        isSelected ? "selected-active" : "",
                      ].filter(Boolean).join(" ")}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bk-card summary-card-box">
              <h3>Thông tin đặt phòng</h3>
              <div className="sum-row">
                <span>Ngày nhận phòng</span>
                <strong>{formatDate(checkIn)}</strong>
              </div>
              <div className="sum-row">
                <span>Ngày trả phòng</span>
                <strong>{formatDate(checkOut)}</strong>
              </div>
              
              <div className="sum-row" style={{ alignItems: "center" }}>
                <span>Số khách</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button 
                    type="button"
                    onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                    style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontWeight: "bold" }}
                  >
                    -
                  </button>
                  <strong>{guestsCount} khách</strong>
                  <button 
                    type="button"
                    onClick={() => setGuestsCount(guestsCount + 1)}
                    style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontWeight: "bold" }}
                  >
                    +
                  </button>
                </div>
              </div>

              {error && <p className="error-txt">{error}</p>}

              <button className="proceed-btn" onClick={handleContinueStep1}>
                Tiếp tục
              </button>
            </div>
          </div>
        ) : 
        
        /* 2/ BƯỚC 2: THÔNG TIN PHÒNG & DỊCH VỤ THÊM */
        step === 2 ? (
          <div 
            className="step2-layout-grid" 
            style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "24px", alignItems: "start" }}
          >
            <div className="step2-summary-card" style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #f3e8e8" }}>
              <div className="step2-card-header" style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                <div className="home-icon-bg" style={{ background: "#fee2e2", padding: "10px", borderRadius: "8px" }}>
                  <Home size={22} color="#f87171" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px" }}>{displayRoomName}</h3>
                  <p className="sub-text" style={{ margin: "4px 0 0", color: "#666", fontSize: "13px" }}>{displayTypeName}, {guestsCount} khách</p>
                  <p className="sub-text" style={{ margin: "2px 0 0", color: "#666", fontSize: "13px" }}>{formatDate(checkIn)} - {formatDate(checkOut)} ({nights} đêm)</p>
                </div>
              </div>

              <div className="step2-price-details" style={{ borderTop: "1px solid #eee", borderBottom: "1px solid #eee", padding: "12px 0", marginBottom: "16px" }}>
                <div className="price-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span>{pricePerNight.toLocaleString("vi-VN")}đ/đêm x {nights}</span>
                  <strong>{rawTotal.toLocaleString("vi-VN")}đ</strong>
                </div>
                
                {selectedServices.map((serviceId) => {
                  const s = EXTRA_SERVICES.find((item) => item.id === serviceId);
                  if (!s) return null;
                  return (
                    <div key={s.id} className="price-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                      <span>{s.title} x 1</span>
                      <strong>+{s.price.toLocaleString("vi-VN")}đ</strong>
                    </div>
                  );
                })}

                <div className="price-row discount-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#10b981" }}>
                  <span>Giảm giá</span>
                  <span className="discount-txt">-{discount.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              <div className="step2-total-block" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <span style={{ fontSize: "15px", fontWeight: "600" }}>Thành tiền</span>
                <strong className="final-price" style={{ fontSize: "18px", color: "#f87171" }}>{finalTotal.toLocaleString("vi-VN")}đ</strong>
              </div>

              <button
                className="proceed-btn step2-btn"
                onClick={handleContinueStep2}
                style={{ width: "100%", padding: "12px", background: "#f87171", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
              >
                Tiếp tục thanh toán
              </button>
            </div>

            <div className="step2-services-container">
              <div className="services-title-block" style={{ marginBottom: "16px" }}>
                <h3 style={{ margin: "0 0 4px 0" }}>Dịch vụ thêm</h3>
                <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>Không bao gồm trong giá phòng. Bấm vào ô để thêm, bấm lần nữa để bỏ.</p>
              </div>

              <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {EXTRA_SERVICES.map((item) => {
                  const isSelected = selectedServices.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`service-card ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleService(item.id)}
                      style={{
                        background: "#fff",
                        border: isSelected ? "1px solid #f87171" : "1px solid #eee",
                        borderRadius: "12px",
                        padding: "16px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                      }}
                    >
                      <div>
                        <div className="service-card-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <h4 style={{ margin: 0, fontSize: "14px" }}>{item.title}</h4>
                          <div className={`add-icon-btn ${isSelected ? "checked" : ""}`} style={{
                            width: "24px", height: "24px", borderRadius: "50%",
                            background: isSelected ? "#f87171" : "#f3f4f6",
                            color: isSelected ? "#fff" : "#333",
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}>
                            {isSelected ? <Check size={14} /> : <Plus size={14} />}
                          </div>
                        </div>
                        <p className="service-desc" style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#666", lineHeight: "1.4" }}>{item.desc}</p>
                      </div>
                      <div className="service-price" style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                        <strong style={{ fontSize: "14px", color: "#333" }}>{item.price.toLocaleString("vi-VN")}đ</strong>
                        <span style={{ fontSize: "11px", color: "#888" }}>{item.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : 
        
        /* 3/ BƯỚC 3: THANH TOÁN */
        step === 3 ? (
          <div 
            className="step3-layout-grid" 
            style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", alignItems: "start" }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #f3e8e8" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Thông tin người đặt</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#444" }}>Họ và tên</label>
                    <input 
                      type="text" 
                      value={bookingInfo.fullName} 
                      onChange={(e) => setBookingInfo({...bookingInfo, fullName: e.target.value})}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #fecdd3", background: "#fff5f5", outline: "none", fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#444" }}>Số điện thoại</label>
                    <input 
                      type="text" 
                      value={bookingInfo.phone} 
                      onChange={(e) => setBookingInfo({...bookingInfo, phone: e.target.value})}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #fecdd3", background: "#fff5f5", outline: "none", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#444" }}>Email</label>
                  <input 
                    type="email" 
                    value={bookingInfo.email} 
                    onChange={(e) => setBookingInfo({...bookingInfo, email: e.target.value})}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #fecdd3", background: "#fff5f5", outline: "none", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#444" }}>Ghi chú cho Homestay</label>
                  <input 
                    type="text" 
                    placeholder="Giờ đến dự kiến, yêu cầu đặc biệt"
                    value={bookingInfo.note} 
                    onChange={(e) => setBookingInfo({...bookingInfo, note: e.target.value})}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #fecdd3", background: "#fff5f5", outline: "none", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #f3e8e8" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Hình thức thanh toán</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div 
                    onClick={() => setPaymentOption("full")}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: paymentOption === "full" ? "1px solid #f87171" : "1px solid #eee",
                      background: paymentOption === "full" ? "#fff5f5" : "#fff",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>Trả trước 100%</div>
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>Thanh toán toàn bộ khi đặt, giữ chỗ chắc chắn</div>
                    </div>
                    <strong style={{ fontSize: "15px", color: "#333" }}>{finalTotal.toLocaleString("vi-VN")}đ</strong>
                  </div>

                  <div 
                    onClick={() => setPaymentOption("deposit")}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: paymentOption === "deposit" ? "1px solid #f87171" : "1px solid #eee",
                      background: paymentOption === "deposit" ? "#fff5f5" : "#fff",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>Đặt cọc 30%</div>
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>Cọc 30% tiền phòng, phần còn lại trả khi check-out</div>
                    </div>
                    <strong style={{ fontSize: "15px", color: "#333" }}>{depositAmount.toLocaleString("vi-VN")}đ</strong>
                  </div>

                  <div 
                    onClick={() => setPaymentOption("later")}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: paymentOption === "later" ? "1px solid #f87171" : "1px solid #eee",
                      background: paymentOption === "later" ? "#fff5f5" : "#fff",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>Trả sau</div>
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>Chỉ dành cho khách thân thiết (từ 3 lượt lưu trú)</div>
                    </div>
                    <strong style={{ fontSize: "15px", color: "#333" }}>0đ</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #f3e8e8" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Phương thức</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div 
                    onClick={() => setPayMethod("qr")}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: payMethod === "qr" ? "1px solid #f87171" : "1px solid #eee",
                      background: payMethod === "qr" ? "#fff5f5" : "#fff",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>Chuyển khoản QR</div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>Mã QR hiện sau khi xác nhận</div>
                  </div>

                  <div 
                    onClick={() => setPayMethod("card")}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: payMethod === "card" ? "1px solid #f87171" : "1px solid #eee",
                      background: payMethod === "card" ? "#fff5f5" : "#fff",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>Thẻ ngân hàng</div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>Nhập thông tin thẻ ở bước xác nhận</div>
                  </div>

                  <div 
                    onClick={() => setPayMethod("cash")}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: payMethod === "cash" ? "1px solid #f87171" : "1px solid #eee",
                      background: payMethod === "cash" ? "#fff5f5" : "#fff",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>Tiền mặt tại quầy</div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>Nhân viên xác nhận khi bạn đến Homestay</div>
                  </div>
                </div>
              </div>

              <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #f3e8e8" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: needInvoice ? "16px" : "0" }}>
                  <input 
                    type="checkbox" 
                    id="invoice-check" 
                    checked={needInvoice}
                    onChange={(e) => setNeedInvoice(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#f87171", cursor: "pointer" }}
                  />
                  <label htmlFor="invoice-check" style={{ fontSize: "16px", fontWeight: "600", cursor: "pointer" }}>
                    Xuất hóa đơn công ty
                  </label>
                </div>

                {needInvoice && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#444" }}>Tên công ty</label>
                      <input 
                        type="text" 
                        placeholder="Tên công ty đầy đủ"
                        value={companyInfo.name} 
                        onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #fecdd3", background: "#fff5f5", outline: "none", fontSize: "14px" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#444" }}>Mã số thuế</label>
                      <input 
                        type="text" 
                        placeholder="Mã số thuế"
                        value={companyInfo.taxCode} 
                        onChange={(e) => setCompanyInfo({...companyInfo, taxCode: e.target.value})}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #fecdd3", background: "#fff5f5", outline: "none", fontSize: "14px" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #f3e8e8" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Chính sách hủy phòng</h3>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
                      <th style={{ paddingBottom: "10px", color: "#333" }}>Thời điểm hủy</th>
                      <th style={{ paddingBottom: "10px", textAlign: "right", color: "#333" }}>Hoàn tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px 0", color: "#555" }}>Từ 3 ngày trở lên trước giờ nhận phòng</td>
                      <td style={{ padding: "12px 0", textAlign: "right", fontWeight: "600" }}>100%</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px 0", color: "#555" }}>Từ 1 đến dưới 3 ngày</td>
                      <td style={{ padding: "12px 0", textAlign: "right", fontWeight: "600" }}>50%</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "12px 0", color: "#555" }}>Dưới 1 ngày hoặc không đến</td>
                      <td style={{ padding: "12px 0", textAlign: "right", fontWeight: "600" }}>0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #f3e8e8", position: "sticky", top: "20px" }}>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>{displayRoomName}</h3>
              <p style={{ margin: "0 0 4px 0", color: "#666", fontSize: "13px" }}>{displayTypeName}, {guestsCount} khách</p>
              <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "13px" }}>{formatDate(checkIn)} - {formatDate(checkOut)} ({nights} đêm)</p>

              <div style={{ borderTop: "1px solid #eee", borderBottom: "1px solid #eee", padding: "12px 0", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span>{pricePerNight.toLocaleString("vi-VN")}đ/đêm x {nights}</span>
                  <strong>{rawTotal.toLocaleString("vi-VN")}đ</strong>
                </div>

                {selectedServices.map((serviceId) => {
                  const s = EXTRA_SERVICES.find((item) => item.id === serviceId);
                  if (!s) return null;
                  return (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                      <span>{s.title} x 1</span>
                      <strong>+{s.price.toLocaleString("vi-VN")}đ</strong>
                    </div>
                  );
                })}

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span>Tổng tiền</span>
                  <strong>{(rawTotal + servicesTotal).toLocaleString("vi-VN")}đ</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#10b981" }}>
                  <span>Giảm giá</span>
                  <span>-{discount.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "16px", fontWeight: "600" }}>Thành tiền</span>
                <strong style={{ fontSize: "20px", color: "#f87171" }}>{finalTotal.toLocaleString("vi-VN")}đ</strong>
              </div>

              {paymentOption ? (
                <div style={{ background: "#fdf2f2", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
                  {paymentOption === "full" && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Thanh toán ngay</span>
                      <strong>{finalTotal.toLocaleString("vi-VN")}đ</strong>
                    </div>
                  )}
                  {paymentOption === "deposit" && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span>Thanh toán ngay</span>
                        <strong>{depositAmount.toLocaleString("vi-VN")}đ</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                        <span>Trả khi check-out</span>
                        <strong>{remainingAmount.toLocaleString("vi-VN")}đ</strong>
                      </div>
                    </>
                  )}
                  {paymentOption === "later" && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Thanh toán khi check-out</span>
                      <strong>{finalTotal.toLocaleString("vi-VN")}đ</strong>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: "12px", color: "#f87171", textAlign: "center", marginBottom: "16px", fontStyle: "italic" }}>
                  * Vui lòng chọn hình thức thanh toán bên trái
                </p>
              )}

              <p style={{ fontSize: "11px", color: "#888", textAlign: "center", marginBottom: "16px" }}>
                Chưa xác nhận thanh toán trong 24 giờ, đơn sẽ tự hủy tại chỗ
              </p>

              <button
                onClick={handleConfirmBooking}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: (paymentOption && payMethod) ? "#f87171" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "15px",
                  cursor: (paymentOption && payMethod) ? "pointer" : "not-allowed"
                }}
              >
                Xác nhận đặt phòng
              </button>
            </div>
          </div>
        ) : 
        
        /* 4/ BƯỚC 4: THÀNH CÔNG */
        (
          <div>
            <div className="stepper-group" style={{ justifyContent: "center", marginBottom: "30px" }}>
              <div className="step-item active">
                <span className="step-circle checked">✓</span>
                <span>Chọn ngày</span>
              </div>
              <div className="step-connector active" />
              <div className="step-item active">
                <span className="step-circle checked">✓</span>
                <span>Thông tin phòng</span>
              </div>
              <div className="step-connector active" />
              <div className="step-item active">
                <span className="step-circle checked">✓</span>
                <span>Thanh toán</span>
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#f87171", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "30px" }}>
                ✓
              </div>
              <h2 style={{ fontSize: "24px", margin: "12px 0 6px 0" }}>Đặt phòng thành công</h2>
              <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>Chúng tôi đã gửi thông tin đặt phòng đến email của bạn</p>
              
              <div style={{ marginTop: "12px" }}>
                <span style={{ background: "#fde8e8", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", color: "#444" }}>
                  Mã đặt phòng <strong style={{ color: "#f87171" }}>{orderId}</strong>{" "}
                  <button onClick={() => {
                    navigator.clipboard?.writeText(orderId);
                    alert(`Đã sao chép mã ${orderId}`);
                  }} style={{ border: "none", background: "none", color: "#888", cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}>Sao chép</button>
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", alignItems: "start" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                <div style={{ background: "#fde8e8", padding: "20px", borderRadius: "12px", border: "1px solid #fecdd3" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <strong style={{ color: "#f87171", fontSize: "15px", display: "block" }}>Chờ thanh toán cọc</strong>
                      <span style={{ fontSize: "12px", color: "#666" }}>Giữ chỗ đến khi hết thời gian bên cạnh</span>
                    </div>
                    <span style={{ background: "#fee2e2", color: "#f87171", padding: "4px 12px", borderRadius: "6px", fontWeight: "bold", fontSize: "16px" }}>
                      23:58:06
                    </span>
                  </div>

                  <div style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px" }}>Chuyển khoản để giữ chỗ</div>

                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "16px", alignItems: "center", background: "#fff", padding: "16px", borderRadius: "8px" }}>
                    <div>
                      <svg width="120" height="120" viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="#fff" />
                        <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,10 h10 v20 h-10 z M40,40 h20 v10 h-20 z M10,40 h20 v20 h-20 z M70,50 h20 v20 h-20 z M40,70 h10 v20 h-10 z M60,80 h30 v10 h-30 z" fill="#000" />
                      </svg>
                    </div>

                    <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666" }}>Ngân hàng</span>
                        <strong>Vietcombank</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666" }}>Số tài khoản</span>
                        <strong>0123456789</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666" }}>Chủ tài khoản</span>
                        <strong>The Green House</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666" }}>Số tiền cọc 30%</span>
                        <strong style={{ color: "#f87171" }}>{depositAmount.toLocaleString("vi-VN")}đ</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666" }}>Nội dung</span>
                        <strong>{orderId}</strong>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => alert("Hệ thống đã ghi nhận! Nhân viên sẽ xác nhận sau khi kiểm tra tiền cọc.")}
                    style={{ width: "100%", padding: "12px", background: "#f87171", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", marginTop: "16px", cursor: "pointer" }}
                  >
                    Tôi đã chuyển khoản
                  </button>
                  <p style={{ fontSize: "11px", color: "#888", textAlign: "center", margin: "8px 0 0 0" }}>
                    Thanh toán trong hệ thống là mô phỏng. Nhân viên sẽ xác nhận khoản cọc sau khi nhận được tiền.
                  </p>
                </div>

                <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee" }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Việc cần làm tiếp theo</h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "12px", background: "#fdf2f2", padding: "12px", borderRadius: "8px", alignItems: "center" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#f87171", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>1</div>
                      <div>
                        <strong style={{ fontSize: "13px", display: "block" }}>Chuyển khoản cọc trong 24 giờ</strong>
                        <span style={{ fontSize: "11px", color: "#666" }}>Quá hạn mà chưa xác nhận, đơn sẽ tự hủy giữ chỗ.</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", background: "#fdf2f2", padding: "12px", borderRadius: "8px", alignItems: "center" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#f87171", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>2</div>
                      <div>
                        <strong style={{ fontSize: "13px", display: "block" }}>Nhận xác nhận từ Homestay</strong>
                        <span style={{ fontSize: "11px", color: "#666" }}>Trạng thái đơn chuyển sang "Đã đặt" khi nhân viên xác nhận cọc.</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", background: "#fdf2f2", padding: "12px", borderRadius: "8px", alignItems: "center" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#f87171", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>3</div>
                      <div>
                        <strong style={{ fontSize: "13px", display: "block" }}>Nhận phòng từ 14:00 ngày {formatDate(checkIn)}</strong>
                        <span style={{ fontSize: "11px", color: "#666" }}>Mang theo CCCD hoặc hộ chiếu của tất cả khách. Trả phòng trước 12:00 ngày {formatDate(checkOut)}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #eee" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>{displayRoomName}</h3>
                <p style={{ margin: "0 0 4px 0", color: "#666", fontSize: "13px" }}>{displayTypeName}, {guestsCount} khách</p>
                <p style={{ margin: "0 0 4px 0", color: "#666", fontSize: "13px" }}>{formatDate(checkIn)} - {formatDate(checkOut)} ({nights} đêm)</p>
                <p style={{ margin: "0 0 16px 0", color: "#888", fontSize: "12px" }}>Đà Lạt, Lâm Đồng</p>

                <div style={{ borderTop: "1px solid #eee", borderBottom: "1px solid #eee", padding: "12px 0", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                    <span>{pricePerNight.toLocaleString("vi-VN")}đ/đêm x {nights}</span>
                    <strong>{rawTotal.toLocaleString("vi-VN")}đ</strong>
                  </div>

                  {selectedServices.map((serviceId) => {
                    const s = EXTRA_SERVICES.find((item) => item.id === serviceId);
                    if (!s) return null;
                    return (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                        <span>{s.title} x 1</span>
                        <strong>+{s.price.toLocaleString("vi-VN")}đ</strong>
                      </div>
                    );
                  })}

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                    <span>Tổng tiền</span>
                    <strong>{(rawTotal + servicesTotal).toLocaleString("vi-VN")}đ</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", color: "#10b981" }}>
                    <span>Giảm giá</span>
                    <span>-{discount.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "600" }}>Thành tiền</span>
                  <strong style={{ fontSize: "18px", color: "#f87171" }}>{finalTotal.toLocaleString("vi-VN")}đ</strong>
                </div>

                <div style={{ background: "#fdf2f2", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "600" }}>Đặt cọc 30%</span>
                    <strong style={{ color: "#f87171" }}>{depositAmount.toLocaleString("vi-VN")}đ (chờ thu)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                    <span>Trả khi check-out</span>
                    <span>{remainingAmount.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button 
                    onClick={() => navigate(`/account/orders/${orderId}`)}
                    style={{ width: "100%", padding: "12px", background: "#f87171", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                  >
                    Xem đơn của tôi
                  </button>

                  <button 
                    onClick={() => navigate(`/account/orders/${orderId}?addService=1`)}
                    style={{ width: "100%", padding: "12px", background: "#fff", color: "#f87171", border: "1px solid #fecdd3", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                  >
                    Đặt thêm dịch vụ
                  </button>

                  <button 
                    onClick={goHomeAction}
                    style={{ width: "100%", padding: "12px", background: "#fff", color: "#f87171", border: "1px solid #fecdd3", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                  >
                    Về trang chủ
                  </button>
                </div>

                <p style={{ fontSize: "11px", color: "#888", textAlign: "center", marginTop: "16px" }}>
                  Hủy từ 3 ngày trở lên trước giờ nhận phòng được hoàn 100%. Xem đủ chính sách trong chi tiết đơn.
                </p>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
