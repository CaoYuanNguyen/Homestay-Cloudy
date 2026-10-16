// ============================================================
// ĐIỀU HƯỚNG (ROUTES) + BỌC AuthProvider
// Đây là file "tổng": mỗi đường dẫn trỏ tới một trang trong thư mục pages/.
//
//   /                       Trang chủ -> Chi tiết phòng -> Đặt phòng
//   /room-detail            Chi tiết phòng (mở thẳng)
//   /customer-reviews       Đánh giá và trải nghiệm của khách hàng (công khai)
//   /review?order=BKxxxx    Đánh giá trải nghiệm   (phải đăng nhập)
//   /experience             Viết bài trải nghiệm   (phải đăng nhập)
//   /account/profile        Hồ sơ cá nhân          (phải đăng nhập)
//   /account/orders         Đơn đặt phòng của tôi  (phải đăng nhập)
//   /account/orders/:id     Chi tiết đơn           (phải đăng nhập)
// ============================================================

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import "./styles/App.css"; // CSS nền chung (header, footer, trang chủ, đặt phòng)

import { AuthProvider } from "./auth/AuthContext.jsx";
import HomePage from "./pages/Home/HomePage.jsx";
import RoomDetail from "./pages/RoomDetail/RoomDetail.jsx";
import Review from "./pages/Reviews/Review.jsx";
import Experience from "./pages/Reviews/Experience.jsx";
import CustomerReviews from "./pages/Reviews/CustomerReviews.jsx";
import RequireLogin from "./pages/Account/RequireLogin.jsx";
import ProfilePage from "./pages/Account/ProfilePage.jsx";
import OrdersPage from "./pages/Account/OrdersPage.jsx";
import OrderDetailPage from "./pages/Account/OrderDetailPage.jsx";

export default function AppTong() {
  return (
    <BrowserRouter>
      {/* AuthProvider bọc ngoài cùng để mọi trang đều dùng được useAuth() */}
      <AuthProvider>
        <Routes>
          {/* Trang chủ -> Chi tiết phòng -> Đặt phòng (tự chuyển bằng state) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/room-detail" element={<RoomDetail />} />

          {/* Trang công khai */}
          <Route path="/customer-reviews" element={<CustomerReviews />} />

          {/* Các trang bắt buộc đăng nhập */}
          <Route
            path="/review"
            element={
              <RequireLogin>
                <Review />
              </RequireLogin>
            }
          />
          <Route
            path="/experience"
            element={
              <RequireLogin>
                <Experience />
              </RequireLogin>
            }
          />
          <Route
            path="/account"
            element={<Navigate to="/account/orders" replace />}
          />
          <Route
            path="/account/profile"
            element={
              <RequireLogin>
                <ProfilePage />
              </RequireLogin>
            }
          />
          <Route
            path="/account/orders"
            element={
              <RequireLogin>
                <OrdersPage />
              </RequireLogin>
            }
          />
          <Route
            path="/account/orders/:orderId"
            element={
              <RequireLogin>
                <OrderDetailPage />
              </RequireLogin>
            }
          />

          {/* Đường dẫn lạ -> về Trang chủ */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
