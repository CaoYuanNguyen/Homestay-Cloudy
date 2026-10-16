// ============================================================
// TRANG HỒ SƠ CÁ NHÂN
//   1. Thông tin cá nhân (họ tên, số điện thoại, ngày sinh)
//   2. Thông tin xuất hóa đơn công ty (không bắt buộc)
//   3. Đổi mật khẩu
// ============================================================

import { useState } from "react";
import { useAuth } from "../../auth/AuthContext.jsx";
import AccountLayout from "./AccountLayout.jsx";

// Hiện thông báo thành công / lỗi dưới mỗi form
function Notice({ notice }) {
  if (!notice) return null;
  return (
    <p className={`account-notice ${notice.type}`} role="status">
      {notice.text}
    </p>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();

  // ----- 1. Thông tin cá nhân -----
  const [info, setInfo] = useState({
    name: user.name || "",
    phone: user.phone || "",
    birthday: user.birthday || "",
  });
  const [infoNotice, setInfoNotice] = useState(null);

  const saveInfo = (event) => {
    event.preventDefault();

    if (!info.name.trim()) {
      setInfoNotice({ type: "error", text: "Vui lòng nhập họ và tên." });
      return;
    }
    if (!/^\d{9,11}$/.test(info.phone.replace(/\s/g, ""))) {
      setInfoNotice({
        type: "error",
        text: "Số điện thoại phải có từ 9 đến 11 chữ số.",
      });
      return;
    }

    updateProfile({
      name: info.name.trim(),
      phone: info.phone.replace(/\s/g, ""),
      birthday: info.birthday,
    });
    setInfoNotice({ type: "success", text: "Đã lưu thông tin cá nhân." });
  };

  // ----- 2. Thông tin xuất hóa đơn -----
  const [company, setCompany] = useState({
    companyName: user.companyName || "",
    taxCode: user.taxCode || "",
    companyAddress: user.companyAddress || "",
  });
  const [companyNotice, setCompanyNotice] = useState(null);

  const saveCompany = (event) => {
    event.preventDefault();

    const taxCode = company.taxCode.replace(/\s/g, "");
    if (taxCode && !/^(\d{10}|\d{13})$/.test(taxCode)) {
      setCompanyNotice({
        type: "error",
        text: "Mã số thuế phải có 10 hoặc 13 chữ số.",
      });
      return;
    }

    updateProfile({
      companyName: company.companyName.trim(),
      taxCode,
      companyAddress: company.companyAddress.trim(),
    });
    setCompanyNotice({ type: "success", text: "Đã lưu thông tin hóa đơn." });
  };

  // ----- 3. Đổi mật khẩu -----
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordNotice, setPasswordNotice] = useState(null);

  const savePassword = (event) => {
    event.preventDefault();

    if (!passwords.current) {
      setPasswordNotice({
        type: "error",
        text: "Vui lòng nhập mật khẩu hiện tại.",
      });
      return;
    }
    if (passwords.next.length < 6) {
      setPasswordNotice({
        type: "error",
        text: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordNotice({
        type: "error",
        text: "Mật khẩu nhập lại không khớp.",
      });
      return;
    }

    const message = changePassword(passwords.current, passwords.next);
    if (message) {
      setPasswordNotice({ type: "error", text: message });
      return;
    }

    setPasswords({ current: "", next: "", confirm: "" });
    setPasswordNotice({ type: "success", text: "Đã đổi mật khẩu." });
  };

  return (
    <AccountLayout
      title="Hồ sơ cá nhân"
      subtitle="Thông tin này được dùng để điền sẵn khi bạn đặt phòng."
    >
      {/* ===== 1. THÔNG TIN CÁ NHÂN ===== */}
      <form className="account-card" onSubmit={saveInfo} noValidate>
        <h2>Thông tin cá nhân</h2>

        <div className="account-form-grid">
          <label>
            Họ và tên
            <input
              type="text"
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
            />
          </label>

          <label>
            Email (không đổi được)
            <input type="email" value={user.email} disabled />
          </label>

          <label>
            Số điện thoại
            <input
              type="tel"
              value={info.phone}
              onChange={(e) => setInfo({ ...info, phone: e.target.value })}
            />
          </label>

          <label>
            Ngày sinh
            <input
              type="date"
              value={info.birthday}
              onChange={(e) => setInfo({ ...info, birthday: e.target.value })}
            />
          </label>
        </div>

        <Notice notice={infoNotice} />
        <button type="submit" className="account-primary">
          Lưu thông tin
        </button>
      </form>

      {/* ===== 2. THÔNG TIN XUẤT HÓA ĐƠN ===== */}
      <form className="account-card" onSubmit={saveCompany} noValidate>
        <h2>Thông tin xuất hóa đơn công ty</h2>
        <p className="account-hint">
          Không bắt buộc, chỉ điền khi bạn cần hóa đơn.
        </p>

        <div className="account-form-grid">
          <label>
            Tên công ty
            <input
              type="text"
              value={company.companyName}
              onChange={(e) =>
                setCompany({ ...company, companyName: e.target.value })
              }
            />
          </label>

          <label>
            Mã số thuế
            <input
              type="text"
              value={company.taxCode}
              onChange={(e) =>
                setCompany({ ...company, taxCode: e.target.value })
              }
            />
          </label>

          <label className="wide">
            Địa chỉ công ty
            <input
              type="text"
              value={company.companyAddress}
              onChange={(e) =>
                setCompany({ ...company, companyAddress: e.target.value })
              }
            />
          </label>
        </div>

        <Notice notice={companyNotice} />
        <button type="submit" className="account-primary">
          Lưu thông tin hóa đơn
        </button>
      </form>

      {/* ===== 3. ĐỔI MẬT KHẨU ===== */}
      <form className="account-card" onSubmit={savePassword} noValidate>
        <h2>Đổi mật khẩu</h2>

        <div className="account-form-grid">
          <label className="wide">
            Mật khẩu hiện tại
            <input
              type="password"
              autoComplete="current-password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
            />
          </label>

          <label>
            Mật khẩu mới
            <input
              type="password"
              autoComplete="new-password"
              value={passwords.next}
              onChange={(e) =>
                setPasswords({ ...passwords, next: e.target.value })
              }
            />
          </label>

          <label>
            Nhập lại mật khẩu mới
            <input
              type="password"
              autoComplete="new-password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
            />
          </label>
        </div>

        <Notice notice={passwordNotice} />
        <button type="submit" className="account-primary">
          Đổi mật khẩu
        </button>
      </form>
    </AccountLayout>
  );
}
