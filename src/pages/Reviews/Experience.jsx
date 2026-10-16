// ============================================================
// VIẾT BÀI TRẢI NGHIỆM (khách viết bài, chờ kiểm duyệt, /experience?order=BKxxxx)
// Lưu ý: 2 bài mẫu cuối trang vẫn là dữ liệu mẫu cho tới khi có màn kiểm duyệt của nhân viên
// ============================================================

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import Header from "../../components/Header.jsx";
import { formatISO } from "../../data/dateUtils.js";
import { getOrdersByUser } from "../../data/ordersStore.js";
import { createPost, getPostsByUser } from "../../data/postsStore.js";
import "../../styles/Experience.css";

export default function Experience() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Đơn đã check-out của tài khoản (chỉ những đơn này mới được viết bài)
  const stayedOrders = getOrdersByUser(user.email).filter(
    (item) => item.status === "checked_out",
  );
  const [orderId, setOrderId] = useState(
    searchParams.get("order") || stayedOrders[0]?.id || "",
  );

  // Bài viết của tôi (đã lưu)
  const [myPosts, setMyPosts] = useState(() => getPostsByUser(user.email));

  // ===== LƯU TIÊU ĐỀ BÀI VIẾT =====
  const [title, setTitle] = useState("");

  // ===== LƯU NỘI DUNG BÀI VIẾT =====
  const [content, setContent] = useState("");

  // ===== THÔNG BÁO KHI GỬI BÀI =====
  const [message, setMessage] = useState("");

  // ===== HÀM GỬI BÀI VIẾT =====
  const handleSubmit = () => {
    // Kiểm tra chưa nhập tiêu đề
    if (title.trim() === "") {
      alert("Vui lòng nhập tiêu đề.");
      return;
    }

    // Kiểm tra nội dung phải có ít nhất 30 ký tự
    if (content.trim().length < 30) {
      alert("Nội dung phải có ít nhất 30 ký tự.");
      return;
    }

    if (!orderId) {
      alert("Bạn cần có đơn đã check-out để viết bài trải nghiệm.");
      return;
    }

    // Lưu bài viết (trạng thái chờ duyệt)
    createPost({
      userEmail: user.email,
      orderId,
      title: title.trim(),
      content: content.trim(),
    });
    setMyPosts(getPostsByUser(user.email));

    // Hiện thông báo sau khi gửi thành công
    setMessage("Bài viết đã được gửi và đang chờ homestay kiểm duyệt.");

    // Xóa nội dung trong ô sau khi gửi
    setTitle("");
    setContent("");
  };

  // ===== GIAO DIỆN TRANG =====
  return (
    <>
      <Header />
      <div className="experience-page">
        {/* ===== TÊN TRANG PHÍA TRÊN ===== */}
        <div className="experience-page-label">Viết bài trải nghiệm</div>

        <main className="experience-container">
          {/* ===== TIÊU ĐỀ TRANG ===== */}
          <h1>
            Viết bài trải nghiệm <span>(Khách hàng)</span>
          </h1>

          {/* ===== CHIA GIAO DIỆN THÀNH 2 CỘT ===== */}
          <div className="experience-layout">
            {/* ===== CỘT TRÁI: FORM VIẾT BÀI ===== */}
            <section className="experience-form-card">
              <h2>Chia sẻ trải nghiệm của bạn</h2>

              {/* ===== THÔNG BÁO BÀI BỊ ẨN ===== */}
              <div className="experience-warning">
                <span>
                  Đang chỉnh sửa bài bị ẩn. Sửa theo lý do rồi gửi lại.
                </span>

                <button type="button">Hủy sửa</button>
              </div>

              {/* ===== CHỌN ĐƠN ĐẶT PHÒNG ===== */}
              <label>
                Đơn đặt phòng
                <select
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                >
                  {stayedOrders.length === 0 && (
                    <option value="">Chưa có đơn đã check-out</option>
                  )}
                  {stayedOrders.map((item) => (
                    <option key={item.id} value={item.id}>
                      #{item.id} - {item.roomTypeName},{" "}
                      {formatISO(item.checkIn)}
                    </option>
                  ))}
                </select>
              </label>

              {/* ===== NHẬP TIÊU ĐỀ ===== */}
              <label>
                Tiêu đề
                <input
                  type="text"
                  placeholder="Ví dụ: Một cuối tuần giữa rừng thông"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              {/* ===== NHẬP NỘI DUNG ===== */}
              <label>
                Nội dung
                <textarea
                  placeholder="Phòng ốc, dịch vụ, nhân viên, điều bạn thích và điều có thể tốt hơn..."
                  maxLength="1500"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </label>

              {/* ===== ĐẾM SỐ KÝ TỰ ===== */}
              <div className="experience-count">
                <span>Tối thiểu 30 ký tự</span>
                <span>{content.length}/1500</span>
              </div>

              {/* ===== THÔNG BÁO KIỂM DUYỆT ===== */}
              <div className="experience-info">
                Bài viết sẽ ở trạng thái chờ duyệt. Nhân viên xem xét trong vòng
                24 giờ rồi mới công khai.
              </div>

              {/* ===== NÚT GỬI BÀI VIẾT ===== */}
              <button
                type="button"
                className="experience-submit"
                onClick={handleSubmit}
              >
                Gửi bài viết
              </button>

              {/* ===== THÔNG BÁO SAU KHI GỬI ===== */}
              {message && <p className="experience-message">{message}</p>}
            </section>

            {/* ===== CỘT PHẢI: BÀI VIẾT CỦA TÔI ===== */}
            <section className="my-posts-card">
              <h2>Bài viết của tôi</h2>

              {/* ===== BÀI VIẾT MỚI GỬI (chờ duyệt) ===== */}
              {myPosts.map((post) => (
                <div className="my-post" key={post.id}>
                  <div className="my-post-title">
                    <strong>{post.title}</strong>
                    <span className="post-pending">Chờ duyệt</span>
                  </div>

                  <p>Đơn #{post.orderId}</p>

                  <p>{post.content}</p>
                </div>
              ))}

              {/* ===== BÀI VIẾT SỐ 1 ===== */}
              <div className="my-post">
                <div className="my-post-title">
                  <strong>Kỳ nghỉ giữa rừng thông</strong>
                  <span className="post-public">Công khai</span>
                </div>

                <p>Đơn #BK0987</p>

                <p>
                  Phòng sạch, ban công nhìn ra rừng thông rất đẹp. Nhân viên
                  nhiệt tình, bữa sáng đa dạng. Chắc chắn sẽ quay lại
                </p>
              </div>

              {/* ===== BÀI VIẾT SỐ 2 ===== */}
              <div className="my-post">
                <div className="my-post-title">
                  <strong>Hơi ồn buổi tối</strong>
                  <span className="post-hidden">Ẩn</span>
                </div>

                <p>Đơn #BK0954</p>

                <p>
                  Buổi tối có nhóm khách phòng bên nói chuyện lớn, tôi nghe rõ
                  tên và số điện thoại của họ.
                </p>

                {/* ===== LÝ DO BÀI VIẾT BỊ ẨN ===== */}
                <div className="post-reason">
                  <strong>Lý do ẩn:</strong>

                  <span>
                    Nội dung có thông tin cá nhân của khách khác. Vui lòng xóa
                    phần này rồi gửi lại.
                  </span>
                </div>

                {/* ===== NÚT CHỈNH SỬA ===== */}
                <button type="button" className="post-edit-button">
                  Chỉnh sửa và gửi lại
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
