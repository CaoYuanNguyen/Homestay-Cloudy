// ============================================================
// HEADER (thanh menu trên cùng) - dùng chung cho mọi trang khách hàng
// - Chưa đăng nhập: nút Đăng ký / Đăng nhập
// - Đã đăng nhập: menu tài khoản (Hồ sơ, Đơn đặt phòng, Bài viết, Đăng xuất)
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ClipboardList,
  FileText,
  LogOut,
  UserRound,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";

// target = id của khu vực ở Trang chủ, path = chuyển sang trang khác
const LINKS = [
  { label: "Trang chủ", id: "home", target: "home" },
  { label: "Homestay", id: "homestays", target: "homestays" },
  { label: "Ưu đãi", id: "offers", target: "offers" },
  { label: "Khám phá", id: "destinations", target: "destinations" },
  { label: "Trải nghiệm", id: "reviews", path: "/customer-reviews" },
  { label: "Liên hệ", id: "contact", target: "contact" },
];

export default function Header() {
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { user, openAuth, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onHome = pathname === "/";

  // Tô đậm mục đang xem
  let current = "";
  if (onHome) current = active;
  else if (pathname === "/customer-reviews") current = "reviews";

  // Bấm ra ngoài menu tài khoản hoặc nhấn Esc thì đóng menu
  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  // Bấm vào 1 mục trên thanh menu
  const handleLink = (event, link) => {
    setActive(link.id);

    // Mục dẫn sang trang khác
    if (link.path) {
      event.preventDefault();
      navigate(link.path);
      return;
    }

    // Đang ở trang khác: về Trang chủ rồi cuộn tới đúng khu vực
    if (!onHome) {
      event.preventDefault();
      navigate("/", { state: { scrollTo: link.target } });
    }
  };

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    if (!onHome) navigate("/");
  };

  return (
    <header className="header">
      <a
        className="logo"
        href="#home"
        onClick={(event) => handleLink(event, LINKS[0])}
      >
        Cloudy Nest
      </a>

      <nav className="navigation">
        {LINKS.map((link) => (
          <a
            key={link.id}
            className={current === link.id ? "selected" : ""}
            href={link.path || `#${link.target}`}
            onClick={(event) => handleLink(event, link)}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        {user ? (
          <div className="account-menu" ref={menuRef}>
            <button
              type="button"
              className="account-menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="account-avatar">
                {user.name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="header-user">
                Xin chào, <strong>{user.name.trim().split(" ").pop()}</strong>
              </span>
              <ChevronDown size={14} />
            </button>

            {menuOpen && (
              <div className="account-dropdown" role="menu">
                <div className="account-dropdown-head">
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => goTo("/account/profile")}
                >
                  <UserRound size={16} /> Hồ sơ cá nhân
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => goTo("/account/orders")}
                >
                  <ClipboardList size={16} /> Đơn đặt phòng của tôi
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => goTo("/experience")}
                >
                  <FileText size={16} /> Bài viết của tôi
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="danger"
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              className="register-btn"
              type="button"
              onClick={() => openAuth("register")}
            >
              Đăng ký
            </button>

            <button
              className="login-button"
              type="button"
              onClick={() => openAuth("login")}
            >
              Đăng nhập
            </button>
          </>
        )}
      </div>
    </header>
  );
}
