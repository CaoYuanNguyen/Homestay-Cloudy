// ============================================================
// FOOTER (chân trang)
// ============================================================

export default function SiteFooter() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <a href="#home" className="footer-logo">
            Cloudy Nest
          </a>

          <p>
            Hệ thống homestay tại Đà Lạt, Hội An, Nha Trang.
          </p>
        </div>

        <div className="footer-column" id="contact">
          <h3>Liên hệ</h3>
          <a href="tel:0901234567">0901 234 567</a>
          <a href="mailto:hello@cloudynest.vn">
            hello@cloudynest.vn
          </a>
          <p>Nhận phòng từ 14:00, trả phòng trước 12:00</p>
        </div>

        <div className="footer-column">
          <h3>Các homestay</h3>
          <a href="#homestays">Cloudy Nest Đà Lạt</a>
          <a href="#homestays">Cloudy Nest Hội An</a>
          <a href="#homestays">Cloudy Nest Nha Trang</a>
        </div>

        <div className="footer-column">
          <h3>Chính sách</h3>
          <a href="#offers">Chính sách hủy phòng</a>
          <a href="#offers">Điều khoản sử dụng</a>
          <a href="#offers">Bảo mật thông tin</a>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Cloudy Nest. Thông tin phòng và giá trên trang là dữ liệu mẫu.
      </div>
    </footer>
  );
}
