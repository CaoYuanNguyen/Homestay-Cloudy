// ============================================================
// TRANG CHỦ (điều phối: Trang chủ -> Chi tiết phòng -> Đặt phòng)
// Việc chuyển màn hình do state trong file này quyết định
// ============================================================

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import Header from "../../components/Header.jsx";
import SiteFooter from "../../components/SiteFooter.jsx";
import Booking from "../Booking/Booking.jsx";
import DestinationsSection from "./DestinationsSection.jsx";
import Hero from "./Hero.jsx";
import HomestaySection from "./HomestaySection.jsx";
import OffersSection from "./OffersSection.jsx";
import RoomDetail from "../RoomDetail/RoomDetail.jsx";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Đăng xuất giữa chừng thì thoát khỏi bước đặt phòng
  useEffect(() => {
    if (!user) setIsBooking(false);
  }, [user]);

  // Từ trang khác bấm menu (Homestay, Ưu đãi...) thì cuộn tới đúng khu vực
  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target) return undefined;

    const timer = setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    }, 60);
    return () => clearTimeout(timer);
  }, [location.state]);

  const handleGoHome = () => {
    setSelectedStay(null);
    setSelectedRoomType(null);
    setIsBooking(false);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (isBooking) {
      setIsBooking(false);
    } else {
      setSelectedStay(null);
    }
    window.scrollTo(0, 0);
  };

  if (isBooking && user) {
    return (
      <Booking
        room={selectedStay}
        selectedRoomType={selectedRoomType}
        onBack={handleBack}
        onHome={handleGoHome}
      />
    );
  }

  if (selectedStay) {
    return (
      <RoomDetail
        key={selectedStay.id}
        room={selectedStay}
        onBack={handleBack}
        onBook={(room, type) => {
          setSelectedStay(room);
          setSelectedRoomType(type);
          setIsBooking(true);
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  return (
    <div className="app">
      <Header />

      <Hero onSearch={setSearchTerm} />

      <HomestaySection
        searchTerm={searchTerm}
        onViewRoom={setSelectedStay}
      />

      <OffersSection />

      <DestinationsSection
        onSelectDestination={setSearchTerm}
      />

      <SiteFooter />
    </div>
  );
}
