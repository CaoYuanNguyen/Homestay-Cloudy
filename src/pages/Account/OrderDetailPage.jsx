// ============================================================
// TRANG CHI TIẾT ĐƠN ĐẶT PHÒNG
//   - Xem thông tin đơn, dịch vụ, tiền
//   - Thêm dịch vụ (khi đơn "Đã đặt" hoặc "Đang ở")
//   - Đổi ngày ở và Hủy đơn (khi đơn "Đã đặt")
//   - Sau check-out: Đánh giá + Viết bài trải nghiệm
//   - Có khung "Demo" để giả lập nhân viên check-in / check-out
// ============================================================

import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import {
  STATUS_LABEL,
  calcTotal,
  getOrder,
  getRefundPercent,
  updateOrder,
} from "../../data/ordersStore.js";
import {
  formatISO,
  formatMoney,
  fromISODate,
  nightsBetween,
  startOfToday,
  toISODate,
} from "../../data/dateUtils.js";
import { EXTRA_SERVICES } from "../Booking/bookingData.js";
import AccountLayout from "./AccountLayout.jsx";

const PAYMENT_OPTION = {
  full: "Thanh toán toàn bộ",
  deposit: "Đặt cọc 30%",
  later: "Thanh toán khi check-out",
};
const PAYMENT_METHOD = {
  qr: "Quét mã QR",
  card: "Thẻ ngân hàng",
  cash: "Tiền mặt",
};

// Đặt key = orderId để mỗi lần đổi đơn là một bản mới, khỏi lẫn dữ liệu
export default function OrderDetailPage() {
  const { orderId } = useParams();
  return <OrderDetail key={orderId} orderId={orderId} />;
}

function OrderDetail({ orderId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [order, setOrder] = useState(() => getOrder(orderId));
  // panel đang mở: null | "service" | "change" | "cancel"
  const [panel, setPanel] = useState(
    params.get("addService") ? "service" : null,
  );
  const [picked, setPicked] = useState([]);
  const [dates, setDates] = useState({
    checkIn: order?.checkIn || "",
    checkOut: order?.checkOut || "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ----- Không có đơn, hoặc đơn của người khác -----
  if (!order || order.userEmail !== user.email) {
    return (
      <AccountLayout title="Không tìm thấy đơn">
        <div className="account-empty">
          <p>Đơn này không tồn tại hoặc không thuộc tài khoản của bạn.</p>
          <button
            type="button"
            className="account-primary"
            onClick={() => navigate("/account/orders")}
          >
            Về danh sách đơn
          </button>
        </div>
      </AccountLayout>
    );
  }

  const canAddService = order.status === "booked" || order.status === "staying";
  const canChange = order.status === "booked";

  const openPanel = (name) => {
    setPanel(panel === name ? null : name);
    setPicked([]);
    setError("");
    setMessage("");
  };

  // ----- Thêm dịch vụ -----
  const ownedIds = order.services.map((service) => service.id);
  const availableServices = EXTRA_SERVICES.filter(
    (s) => !ownedIds.includes(s.id),
  );

  const togglePick = (id) =>
    setPicked(
      picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id],
    );

  const confirmAddService = () => {
    if (picked.length === 0) {
      setError("Vui lòng chọn ít nhất một dịch vụ.");
      return;
    }

    const added = EXTRA_SERVICES.filter((s) => picked.includes(s.id)).map(
      (s) => ({
        id: s.id,
        title: s.title,
        price: s.price,
      }),
    );

    const next = updateOrder(order.id, (old) => {
      const services = [...old.services, ...added];
      return { services, total: calcTotal({ ...old, services }) };
    });

    setOrder(next);
    setPanel(null);
    setPicked([]);
    setMessage(`Đã thêm ${added.length} dịch vụ vào đơn.`);
  };

  // ----- Đổi ngày ở -----
  const previewNights =
    dates.checkIn &&
    dates.checkOut &&
    fromISODate(dates.checkOut) > fromISODate(dates.checkIn)
      ? nightsBetween(fromISODate(dates.checkIn), fromISODate(dates.checkOut))
      : 0;

  const confirmChangeDates = () => {
    if (!dates.checkIn || !dates.checkOut) {
      setError("Vui lòng chọn đủ ngày nhận và ngày trả phòng.");
      return;
    }

    const from = fromISODate(dates.checkIn);
    const to = fromISODate(dates.checkOut);

    if (from < startOfToday()) {
      setError("Ngày nhận phòng không được ở trong quá khứ.");
      return;
    }
    if (to <= from) {
      setError("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }

    const nights = nightsBetween(from, to);
    const next = updateOrder(order.id, (old) => ({
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      nights,
      total: calcTotal({ ...old, nights }),
    }));

    setOrder(next);
    setPanel(null);
    setMessage("Đã đổi ngày ở. Tổng tiền được tính lại theo số đêm mới.");
  };

  // ----- Hủy đơn -----
  const refundPercent = getRefundPercent(order.checkIn);
  const refundAmount = Math.round((order.paidNow * refundPercent) / 100);

  const confirmCancel = () => {
    const next = updateOrder(order.id, {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      refundPercent,
      refundAmount,
    });
    setOrder(next);
    setPanel(null);
    setMessage("Đã hủy đơn.");
  };

  // ----- Demo: giả lập nhân viên đổi trạng thái -----
  const setStatus = (status) => {
    setOrder(updateOrder(order.id, { status }));
    setMessage(`(Demo) Đơn chuyển sang "${STATUS_LABEL[status]}".`);
  };

  const servicesTotal = order.services.reduce((sum, s) => sum + s.price, 0);
  const remaining = Math.max(0, order.total - order.paidNow);

  return (
    <AccountLayout title={`Đơn #${order.id}`}>
      <button
        type="button"
        className="account-back"
        onClick={() => navigate("/account/orders")}
      >
        ← Về danh sách đơn
      </button>

      {message && <p className="account-notice success">{message}</p>}

      <div className="order-detail-grid">
        {/* ================= CỘT TRÁI ================= */}
        <div className="order-detail-main">
          {/* ----- Thông tin phòng ----- */}
          <section className="account-card">
            <div className="order-card-top">
              <h2>{order.homestayName}</h2>
              <span className={`order-status ${order.status}`}>
                {STATUS_LABEL[order.status]}
              </span>
            </div>

            <div className="order-room">
              <img src={order.image} alt={order.homestayName} />
              <div>
                <strong>{order.roomTypeName}</strong>
                <p>{order.location}</p>
                <p>
                  Nhận phòng: <b>{formatISO(order.checkIn)}</b> (từ 14:00)
                </p>
                <p>
                  Trả phòng: <b>{formatISO(order.checkOut)}</b> (trước 12:00)
                </p>
                <p>
                  {order.nights} đêm · {order.guests} khách
                </p>
              </div>
            </div>

            <div className="order-contact">
              <p>
                <span>Người đặt</span> {order.contact.fullName}
              </p>
              <p>
                <span>Số điện thoại</span> {order.contact.phone}
              </p>
              <p>
                <span>Email</span> {order.contact.email || "—"}
              </p>
              {order.contact.note && (
                <p>
                  <span>Ghi chú</span> {order.contact.note}
                </p>
              )}
              {order.invoice && order.invoice.name && (
                <p>
                  <span>Hóa đơn công ty</span> {order.invoice.name} (MST{" "}
                  {order.invoice.taxCode})
                </p>
              )}
            </div>
          </section>

          {/* ----- Dịch vụ ----- */}
          <section className="account-card">
            <div className="order-card-top">
              <h2>Dịch vụ tính thêm</h2>
              {canAddService && (
                <button
                  type="button"
                  className="account-outline"
                  onClick={() => openPanel("service")}
                >
                  + Thêm dịch vụ
                </button>
              )}
            </div>

            {order.services.length === 0 ? (
              <p className="account-hint">Chưa có dịch vụ tính thêm nào.</p>
            ) : (
              <ul className="order-services">
                {order.services.map((service) => (
                  <li key={service.id}>
                    <span>{service.title}</span>
                    <strong>{formatMoney(service.price)}</strong>
                  </li>
                ))}
              </ul>
            )}

            {panel === "service" && (
              <div className="order-panel">
                <h3>Chọn dịch vụ muốn thêm</h3>
                {availableServices.length === 0 ? (
                  <p className="account-hint">
                    Bạn đã thêm tất cả dịch vụ hiện có.
                  </p>
                ) : (
                  <div className="order-service-picks">
                    {availableServices.map((service) => (
                      <label key={service.id}>
                        <input
                          type="checkbox"
                          checked={picked.includes(service.id)}
                          onChange={() => togglePick(service.id)}
                        />
                        <span>
                          {service.title}
                          <small>{service.desc}</small>
                        </span>
                        <strong>{formatMoney(service.price)}</strong>
                      </label>
                    ))}
                  </div>
                )}
                {error && <p className="account-notice error">{error}</p>}
                <div className="order-panel-actions">
                  <button
                    type="button"
                    className="account-primary"
                    onClick={confirmAddService}
                  >
                    Xác nhận thêm
                  </button>
                  <button
                    type="button"
                    className="account-outline"
                    onClick={() => openPanel("service")}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* ----- Đổi ngày / Hủy đơn ----- */}
          {canChange && (
            <section className="account-card">
              <h2>Đổi hoặc hủy đơn</h2>
              <div className="order-panel-actions">
                <button
                  type="button"
                  className="account-outline"
                  onClick={() => openPanel("change")}
                >
                  Đổi ngày ở
                </button>
                <button
                  type="button"
                  className="account-danger"
                  onClick={() => openPanel("cancel")}
                >
                  Hủy đơn
                </button>
              </div>

              {panel === "change" && (
                <div className="order-panel">
                  <h3>Chọn ngày ở mới</h3>
                  <div className="account-form-grid">
                    <label>
                      Ngày nhận phòng
                      <input
                        type="date"
                        min={toISODate(startOfToday())}
                        value={dates.checkIn}
                        onChange={(e) =>
                          setDates({ ...dates, checkIn: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Ngày trả phòng
                      <input
                        type="date"
                        min={dates.checkIn || toISODate(startOfToday())}
                        value={dates.checkOut}
                        onChange={(e) =>
                          setDates({ ...dates, checkOut: e.target.value })
                        }
                      />
                    </label>
                  </div>
                  {previewNights > 0 && (
                    <p className="account-hint">
                      {previewNights} đêm · tổng tiền mới:{" "}
                      <b>
                        {formatMoney(
                          calcTotal({ ...order, nights: previewNights }),
                        )}
                      </b>
                    </p>
                  )}
                  {error && <p className="account-notice error">{error}</p>}
                  <div className="order-panel-actions">
                    <button
                      type="button"
                      className="account-primary"
                      onClick={confirmChangeDates}
                    >
                      Xác nhận đổi ngày
                    </button>
                    <button
                      type="button"
                      className="account-outline"
                      onClick={() => openPanel("change")}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}

              {panel === "cancel" && (
                <div className="order-panel cancel">
                  <h3>Hủy đơn #{order.id}?</h3>
                  <p>
                    Theo chính sách, bạn được hoàn <b>{refundPercent}%</b> số
                    tiền đã thanh toán trước ({formatMoney(order.paidNow)}), tức{" "}
                    <b>{formatMoney(refundAmount)}</b>.
                  </p>
                  <div className="order-panel-actions">
                    <button
                      type="button"
                      className="account-danger"
                      onClick={confirmCancel}
                    >
                      Xác nhận hủy đơn
                    </button>
                    <button
                      type="button"
                      className="account-outline"
                      onClick={() => openPanel("cancel")}
                    >
                      Giữ đơn
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ----- Đơn đã hủy ----- */}
          {order.status === "cancelled" && (
            <section className="account-card">
              <h2>Thông tin hủy đơn</h2>
              <p>
                Đơn đã hủy. Hoàn <b>{order.refundPercent}%</b> số tiền đã thanh
                toán trước: <b>{formatMoney(order.refundAmount)}</b>.
              </p>
            </section>
          )}

          {/* ----- Sau check-out: đánh giá + viết bài ----- */}
          {order.status === "checked_out" && (
            <section className="account-card">
              <h2>Cảm ơn bạn đã lưu trú!</h2>
              <p className="account-hint">
                Chia sẻ trải nghiệm để giúp những khách sau.
              </p>
              <div className="order-panel-actions">
                {order.reviewed ? (
                  <span className="order-status checked_out">Đã đánh giá</span>
                ) : (
                  <button
                    type="button"
                    className="account-primary"
                    onClick={() => navigate(`/review?order=${order.id}`)}
                  >
                    Đánh giá trải nghiệm
                  </button>
                )}
                <button
                  type="button"
                  className="account-outline"
                  onClick={() => navigate(`/experience?order=${order.id}`)}
                >
                  Viết bài trải nghiệm
                </button>
              </div>
            </section>
          )}
        </div>

        {/* ================= CỘT PHẢI ================= */}
        <aside className="order-detail-side">
          <section className="account-card">
            <h2>Thanh toán</h2>
            <div className="order-sum">
              <p>
                <span>
                  {formatMoney(order.pricePerNight)} x {order.nights} đêm
                </span>
                <b>{formatMoney(order.pricePerNight * order.nights)}</b>
              </p>
              {order.discount > 0 && (
                <p>
                  <span>Giảm giá</span>
                  <b>-{formatMoney(order.discount)}</b>
                </p>
              )}
              {servicesTotal > 0 && (
                <p>
                  <span>Dịch vụ thêm</span>
                  <b>{formatMoney(servicesTotal)}</b>
                </p>
              )}
              <p className="order-sum-total">
                <span>Tổng cộng</span>
                <b>{formatMoney(order.total)}</b>
              </p>
            </div>

            <div className="order-sum small">
              <p>
                <span>Hình thức</span>
                <b>{PAYMENT_OPTION[order.paymentOption] || "—"}</b>
              </p>
              <p>
                <span>Phương thức</span>
                <b>{PAYMENT_METHOD[order.payMethod] || "—"}</b>
              </p>
              <p>
                <span>Thanh toán trước</span>
                <b>{formatMoney(order.paidNow)}</b>
              </p>
              <p>
                <span>Còn lại (trả khi check-out)</span>
                <b>{formatMoney(remaining)}</b>
              </p>
            </div>
          </section>

          <section className="account-card">
            <h2>Chính sách hủy</h2>
            <ul className="order-policy">
              <li>Hủy trước giờ nhận phòng từ 3 ngày: hoàn 100%</li>
              <li>Hủy từ 1 đến dưới 3 ngày: hoàn 50%</li>
              <li>Hủy dưới 1 ngày hoặc không đến: không hoàn</li>
            </ul>
          </section>

          {/* ----- Khung demo ----- */}
          {(order.status === "booked" || order.status === "staying") && (
            <section className="account-card order-demo">
              <h2>Demo: giả lập nhân viên</h2>
              <p className="account-hint">
                Chỉ để bạn thử luồng đánh giá. Sau này nhân viên sẽ làm việc này
                ở màn hình của họ.
              </p>
              {order.status === "booked" && (
                <button
                  type="button"
                  className="account-outline"
                  onClick={() => setStatus("staying")}
                >
                  Check-in cho khách
                </button>
              )}
              {order.status === "staying" && (
                <button
                  type="button"
                  className="account-outline"
                  onClick={() => setStatus("checked_out")}
                >
                  Check-out cho khách
                </button>
              )}
            </section>
          )}
        </aside>
      </div>
    </AccountLayout>
  );
}
