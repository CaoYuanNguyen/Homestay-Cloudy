// ============================================================
// DỮ LIỆU MẪU TRANG CHỦ
// homestays (danh sách homestay), homeReviews (đánh giá bên phải),
// offers (ưu đãi), destinations (điểm đến)
// ============================================================

export const homestays = [
  {
    id: 1,
    name: "Cloudy Nest Đà Lạt",
    location: "Đà Lạt, Lâm Đồng",
    price: "800.000đ",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1000&q=85",
    description: "3 hạng phòng · Tối đa 6 khách",
    amenities: ["Rừng thông", "Ban công", "Săn mây"],
  },
  {
    id: 2,
    name: "Cloudy Nest Hội An",
    location: "Hội An, Quảng Nam",
    price: "950.000đ",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
    description: "2 hạng phòng · Tối đa 4 khách",
    amenities: ["Gần phố cổ", "Xe đạp miễn phí", "Hồ bơi"],
  },
  {
    id: 3,
    name: "Cloudy Nest Nha Trang",
    location: "Nha Trang, Khánh Hòa",
    price: "700.000đ",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1000&q=85",
    description: "4 hạng phòng · Tối đa 8 khách",
    amenities: ["View biển", "BBQ sân vườn", "Thuê xe"],
  },
];

export const homeReviews = [
  {
    name: "Lê Minh Chi",
    place: "Cloudy Nest Đà Lạt",
    comment:
      "Ban công nhìn ra rừng thông rất đẹp, nhân viên nhiệt tình.",
  },
  {
    name: "Phạm Thu Hương",
    place: "Cloudy Nest Hội An",
    comment:
      "Cách phố cổ 5 phút đi bộ, sáng nào cũng có bánh mì và cà phê.",
  },
  {
    name: "Vũ Hoàng",
    place: "Cloudy Nest Nha Trang",
    comment:
      "View biển rất đẹp, tối nướng BBQ ngoài sân vui lắm.",
  },
];

export const offers = [
  {
    badge: "10%",
    title: "Khách thân thiết",
    description:
      "Từ lượt lưu trú hoàn tất thứ 3, giảm 10% tiền phòng cho mọi lần đặt sau.",
  },
  {
    badge: "30%",
    title: "Đặt cọc chỉ 30%",
    description:
      "Giữ phòng bằng khoản cọc nhỏ, phần còn lại thanh toán khi check-out.",
  },
  {
    badge: "3 ngày",
    title: "Hủy linh hoạt",
    description:
      "Hủy trước giờ nhận phòng 3 ngày được hoàn 100%, từ 1 đến 3 ngày hoàn 50%.",
  },
];

export const destinations = [
  {
    name: "Đà Lạt",
    description: "Săn mây, đồi chè, chợ đêm",
    image:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=85",
    keyword: "Đà Lạt",
  },
  {
    name: "Hội An",
    description: "Phố cổ, đèn lồng, biển An Bàng",
    image:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=85",
    keyword: "Hội An",
  },
  {
    name: "Nha Trang",
    description: "Vinpearl, hải sản",
    image:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=85",
    keyword: "Nha Trang",
  },
];
