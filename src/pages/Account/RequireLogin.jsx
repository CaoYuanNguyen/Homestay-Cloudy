// ============================================================
// RequireLogin: bọc ngoài những trang BẮT BUỘC đăng nhập
// (Hồ sơ, Đơn đặt phòng, Đánh giá, Viết bài...).
// Chưa đăng nhập -> tự mở trang đăng nhập; đăng nhập xong hiện đúng trang đó.
// ============================================================

import { useEffect } from "react";
import Header from "../../components/Header.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import "../../styles/Account.css";

const NOTICE = "Vui lòng đăng nhập để xem trang này.";

export default function RequireLogin({ children }) {
  const { user, openAuth } = useAuth();

  useEffect(() => {
    if (!user) openAuth("login", NOTICE);
    // chỉ chạy khi trạng thái đăng nhập đổi, không chạy theo openAuth
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (user) return children;

  return (
    <div className="account-page">
      <Header />
      <main className="account-container account-empty-wrap">
        <div className="account-empty">
          <h1>Bạn chưa đăng nhập</h1>
          <p>{NOTICE}</p>
          <button
            type="button"
            className="account-primary"
            onClick={() => openAuth("login", NOTICE)}
          >
            Đăng nhập
          </button>
        </div>
      </main>
    </div>
  );
}
