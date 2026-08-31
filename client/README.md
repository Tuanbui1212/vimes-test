# TEST-VIMES Frontend Client

Ứng dụng Frontend Quản lý Kho Dược & Vật Tư Y Tế (Chuẩn biểu mẫu **Mẫu số 01 - VT**) xây dựng bằng **Next.js 16 (App Router)**, **React 19**, và **Tailwind CSS v4**.

---

## 🚀 Hướng dẫn khởi chạy

### 1. Cài đặt dependencies:
```bash
npm install
```

### 2. Chạy môi trường phát triển (Dev):
```bash
npm run dev
```
> Truy cập ứng dụng tại: **`http://localhost:3000`**

### 3. Chạy Unit Tests:
```bash
npm test
```

### 4. Build Production:
```bash
npm run build
npm run start
```

---

## 📑 Các tính năng chính
- **Trang chủ (`/`):** Lập phiếu nhập kho Mẫu số 01 - VT với ComboBox tìm kiếm tức thì, tính toán tổng tiền & đọc tiền tự động.
- **Trang Lịch sử (`/receipts`):** Danh sách phiếu nhập kho, phân trang thông minh và xem chi tiết phiếu.
- **In & Xuất PDF:** Hỗ trợ in trực tiếp hoặc lưu file PDF chuẩn biểu mẫu A4.
