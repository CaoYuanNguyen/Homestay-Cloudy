// ============================================================
// LƯU BÀI VIẾT TRẢI NGHIỆM (localStorage - chỉ để demo)
// Bài mới luôn ở trạng thái "pending" (chờ homestay kiểm duyệt).
// ============================================================

const POSTS_KEY = "cloudynest_posts";

function readPosts() {
  try {
    return JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
  } catch {
    return [];
  }
}

export function getPostsByUser(email) {
  return readPosts()
    .filter((post) => post.userEmail === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createPost({ userEmail, orderId, title, content }) {
  const post = {
    id: `P${Date.now()}`,
    userEmail,
    orderId,
    title,
    content,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify([...readPosts(), post]));
  } catch {
    // bỏ qua
  }
  return post;
}
