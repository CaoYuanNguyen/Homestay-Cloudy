// ============================================================
// KHUNG CHUNG CỦA CÁC TRANG TÀI KHOẢN: Header + menu bên trái + nội dung
// ============================================================

import { NavLink } from "react-router-dom";
import { ClipboardList, FileText, UserRound } from "lucide-react";
import Header from "../../components/Header.jsx";
import "../../styles/Account.css";

const MENU = [
  {
    to: "/account/profile",
    label: "Hồ sơ cá nhân",
    icon: <UserRound size={17} />,
  },
  {
    to: "/account/orders",
    label: "Đơn đặt phòng",
    icon: <ClipboardList size={17} />,
  },
  {
    to: "/experience",
    label: "Bài viết của tôi",
    icon: <FileText size={17} />,
  },
];

export default function AccountLayout({ title, subtitle, children }) {
  return (
    <div className="account-page">
      <Header />

      <main className="account-container">
        <aside className="account-sidebar">
          <nav>
            {MENU.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {item.icon} {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <section className="account-content">
          <h1>{title}</h1>
          {subtitle && <p className="account-subtitle">{subtitle}</p>}
          {children}
        </section>
      </main>
    </div>
  );
}
