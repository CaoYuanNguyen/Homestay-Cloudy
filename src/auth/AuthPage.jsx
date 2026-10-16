// ============================================================
// TRANG ĐĂNG NHẬP / ĐĂNG KÝ (toàn màn hình, 2 tab)
// ============================================================

import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import "../styles/Auth.css";

export default function AuthPage({
  mode,
  notice,
  onModeChange,
  onClose,
  onLogin,
  onRegister,
}) {
  const isLogin = mode === "login";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Mở trang thì khóa cuộn trang phía sau, nhấn Esc để đóng
  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const updateField = (key) => (event) => {
    setForm({ ...form, [key]: event.target.value });
  };

  const switchMode = (nextMode) => {
    setError("");
    setShowPassword(false);
    setForm({ ...form, password: "", confirm: "" });
    onModeChange(nextMode);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    // ----- Đăng nhập -----
    if (isLogin) {
      if (!form.email.trim() || !form.password) {
        setError("Vui lòng nhập email và mật khẩu.");
        return;
      }
      const message = onLogin({ email: form.email, password: form.password });
      if (message) setError(message);
      return;
    }

    // ----- Đăng ký: kiểm tra từng ô -----
    if (!form.name.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Email chưa đúng định dạng.");
      return;
    }
    if (!/^\d{9,11}$/.test(form.phone.replace(/\s/g, ""))) {
      setError("Số điện thoại phải có từ 9 đến 11 chữ số.");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    const message = onRegister(form);
    if (message) setError(message);
  };

  return (
    <div
      className="nest-auth-page"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nest-auth-title"
    >
      <div className="nest-auth-card">
        {/* ----- Cột ảnh bên trái ----- */}
        <aside className="nest-auth-side">
          <img
            src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=85"
            alt=""
          />
          <div className="nest-auth-side-overlay" />
          <div className="nest-auth-side-text">
            <span className="nest-auth-brand">Cloudy Nest</span>
            <h2>Mỗi miền một chốn nghỉ nhỏ</h2>
            <p>
              Đăng nhập để đặt phòng, theo dõi đơn và nhận ưu đãi dành cho khách
              thân thiết.
            </p>
          </div>
        </aside>

        {/* ----- Cột form bên phải ----- */}
        <section className="nest-auth-main">
          <button
            type="button"
            className="nest-auth-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>

          {/* Hai tab chuyển Đăng nhập / Đăng ký */}
          <div className="nest-auth-tabs">
            <button
              type="button"
              className={isLogin ? "active" : ""}
              onClick={() => switchMode("login")}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={!isLogin ? "active" : ""}
              onClick={() => switchMode("register")}
            >
              Đăng ký
            </button>
          </div>

          <h1 id="nest-auth-title">
            {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
          </h1>
          <p className="nest-auth-subtitle">
            {isLogin
              ? "Đăng nhập để tiếp tục đặt phòng."
              : "Chỉ mất một phút để đăng ký."}
          </p>

          {notice && <div className="nest-auth-notice">{notice}</div>}

          <form className="nest-auth-form" onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <label className="nest-auth-field">
                <span>Họ và tên</span>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={updateField("name")}
                />
              </label>
            )}

            <label className="nest-auth-field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="ten@email.com"
                value={form.email}
                onChange={updateField("email")}
              />
            </label>

            {!isLogin && (
              <label className="nest-auth-field">
                <span>Số điện thoại</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="0901234567"
                  value={form.phone}
                  onChange={updateField("phone")}
                />
              </label>
            )}

            <label className="nest-auth-field">
              <span>Mật khẩu</span>
              <div className="nest-auth-password">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder={isLogin ? "Nhập mật khẩu" : "Ít nhất 6 ký tự"}
                  value={form.password}
                  onChange={updateField("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {!isLogin && (
              <label className="nest-auth-field">
                <span>Nhập lại mật khẩu</span>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirm}
                  onChange={updateField("confirm")}
                />
              </label>
            )}

            {error && (
              <p className="nest-auth-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="nest-auth-submit">
              {isLogin ? "Đăng nhập" : "Đăng ký"}
            </button>
          </form>

          <p className="nest-auth-switch">
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isLogin ? "register" : "login")}
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
            </button>
          </p>

          <small className="nest-auth-demo">
            Bản demo: tài khoản chỉ được lưu trên trình duyệt này.
          </small>
        </section>
      </div>
    </div>
  );
}
