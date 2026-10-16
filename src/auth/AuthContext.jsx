// ============================================================
// ĐĂNG NHẬP: kho dữ liệu dùng chung (AuthContext)
// useAuth() -> { user, openAuth, requireLogin, logout, updateProfile, changePassword }
// AuthProvider bọc ngoài cùng ở AppTong.jsx
// ============================================================

import { createContext, useContext, useRef, useState } from "react";
import AuthPage from "./AuthPage.jsx";

const USERS_KEY = "cloudynest_users";
const CURRENT_USER_KEY = "cloudynest_current_user";

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // trình duyệt chặn lưu trữ thì bỏ qua
  }
}

// ----- 6.1 AuthContext: chỗ lưu "ai đang đăng nhập" dùng chung toàn app -----
// Component nào cũng gọi được: const { user, requireLogin, ... } = useAuth();

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// ----- 6.2 AuthProvider: xử lý đăng nhập / đăng ký / đăng xuất -----

export function AuthProvider({ children }) {
  // Người đang đăng nhập (null = chưa đăng nhập). Đọc lại từ localStorage khi tải trang
  const [user, setUser] = useState(() => readStorage(CURRENT_USER_KEY, null));

  // Trạng thái trang đăng nhập: đang mở không, tab nào, thông báo gì
  const [authView, setAuthView] = useState({
    open: false,
    mode: "login",
    notice: "",
  });

  // Việc đang chờ đăng nhập xong mới làm (ví dụ: chuyển sang bước đặt phòng)
  const pendingAction = useRef(null);

  const openAuth = (mode = "login", notice = "") => {
    setAuthView({ open: true, mode, notice });
  };

  const closeAuth = () => {
    pendingAction.current = null;
    setAuthView((view) => ({ ...view, open: false }));
  };

  // Gọi hàm này ở những chỗ BẮT BUỘC đăng nhập.
  // Đã đăng nhập -> chạy action ngay. Chưa -> mở trang đăng nhập,
  // đăng nhập xong mới chạy action.
  const requireLogin = (
    action,
    notice = "Vui lòng đăng nhập để đặt phòng.",
  ) => {
    if (user) {
      action();
      return;
    }
    pendingAction.current = action;
    openAuth("login", notice);
  };

  // Đăng nhập thành công: lưu người dùng, đóng trang, chạy việc đang chờ
  const completeLogin = (account) => {
    // Bỏ mật khẩu ra khỏi dữ liệu người đang đăng nhập
    const safeUser = { ...account };
    delete safeUser.password;
    writeStorage(CURRENT_USER_KEY, safeUser);
    setUser(safeUser);
    setAuthView((view) => ({ ...view, open: false }));

    const action = pendingAction.current;
    pendingAction.current = null;
    if (action) action();
  };

  // Các hàm login/register trả về "" nếu thành công, hoặc chuỗi báo lỗi
  const register = ({ name, email, phone, password }) => {
    const users = readStorage(USERS_KEY, []);
    const mail = email.trim().toLowerCase();

    if (users.some((item) => item.email === mail)) {
      return "Email này đã được đăng ký. Hãy chuyển sang Đăng nhập.";
    }

    const account = {
      name: name.trim(),
      email: mail,
      phone: phone.replace(/\s/g, ""),
      password,
    };
    writeStorage(USERS_KEY, [...users, account]);
    completeLogin(account);
    return "";
  };

  const login = ({ email, password }) => {
    const users = readStorage(USERS_KEY, []);
    const mail = email.trim().toLowerCase();
    const account = users.find(
      (item) => item.email === mail && item.password === password,
    );

    if (!account) return "Email hoặc mật khẩu không đúng.";
    completeLogin(account);
    return "";
  };

  const logout = () => {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch {
      // bỏ qua
    }
    setUser(null);
  };

  // Cập nhật hồ sơ (họ tên, số điện thoại, ngày sinh, thông tin hóa đơn...)
  const updateProfile = (patch) => {
    if (!user) return;
    const users = readStorage(USERS_KEY, []);
    writeStorage(
      USERS_KEY,
      users.map((item) =>
        item.email === user.email ? { ...item, ...patch } : item,
      ),
    );

    const nextUser = { ...user, ...patch };
    writeStorage(CURRENT_USER_KEY, nextUser);
    setUser(nextUser);
  };

  // Đổi mật khẩu: trả về "" nếu thành công, hoặc chuỗi báo lỗi
  const changePassword = (currentPassword, newPassword) => {
    if (!user) return "Bạn chưa đăng nhập.";
    const users = readStorage(USERS_KEY, []);
    const account = users.find((item) => item.email === user.email);

    if (!account || account.password !== currentPassword) {
      return "Mật khẩu hiện tại không đúng.";
    }

    writeStorage(
      USERS_KEY,
      users.map((item) =>
        item.email === user.email ? { ...item, password: newPassword } : item,
      ),
    );
    return "";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        openAuth,
        requireLogin,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}

      {authView.open && (
        <AuthPage
          mode={authView.mode}
          notice={authView.notice}
          onModeChange={(mode) => setAuthView((view) => ({ ...view, mode }))}
          onClose={closeAuth}
          onLogin={login}
          onRegister={register}
        />
      )}
    </AuthContext.Provider>
  );
}
