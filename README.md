# 📝 BÀI TEST TUYỂN DỤNG - VIMES
> **Dự án:** Hệ Thống Quản Lý Nhập Kho Dược & Vật Tư Y Tế (Biểu mẫu **Mẫu số 01 - VT**)

---
## 🚀 Hướng Dẫn Chạy Dự Án (Quick Start)

### Cách 1: Chạy bằng Docker Compose (Khuyên dùng - Nhanh nhất)
```bash
# 1. Khởi động Backend & PostgreSQL Database
cd server && docker compose up --build -d

# 2. Khởi động Frontend Client
cd ../client && npm install && npm run dev
```
> 🌐 **Client Web UI:** `http://localhost:3000`  
> ⚡ **Backend API Server:** `http://localhost:8080`

### Cách 2: Chạy trực tiếp trên máy (Manual)
* **Backend:** `cd server && npm install && npm start` *(Yêu cầu PostgreSQL 16 chạy cổng 5432, db: `inventory_db`)*
* **Frontend:** `cd client && npm install && npm run dev`

---

## 🧪 Hướng Dẫn Chạy Unit Tests (85 Tests PASS)

```bash
# 1. Test Backend
cd server && npm test

# 2. Test Frontend
cd client && npm test
```

---

## 📡 Danh Sách Toàn Bộ API Endpoints (`http://localhost:8080/api`)

### 📦 1. Nhà Cung Cấp (`/api/suppliers`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/suppliers` | Lấy danh sách tất cả nhà cung cấp |
| `GET` | `/api/suppliers/with-departments` | Lấy danh sách nhà cung cấp kèm danh sách khoa/phòng |
| `GET` | `/api/suppliers/:id` | Xem chi tiết thông tin nhà cung cấp theo ID |
| `POST` | `/api/suppliers` | Tạo mới nhà cung cấp |
| `PUT` | `/api/suppliers/:id` | Cập nhật thông tin nhà cung cấp |
| `DELETE` | `/api/suppliers/:id` | Xóa nhà cung cấp |

### 🏢 2. Khoa / Phòng Ban (`/api/departments`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/departments` | Lấy danh sách tất cả khoa / phòng ban |
| `GET` | `/api/departments/:id` | Xem chi tiết khoa / phòng ban theo ID |
| `POST` | `/api/departments` | Tạo mới khoa / phòng ban |
| `PUT` | `/api/departments/:id` | Cập nhật thông tin khoa / phòng ban |
| `DELETE` | `/api/departments/:id` | Xóa khoa / phòng ban |

### 🏪 3. Kho Bãi (`/api/warehouses`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/warehouses` | Lấy danh sách tất cả kho bãi |
| `GET` | `/api/warehouses/:id` | Xem chi tiết kho bãi theo ID |
| `GET` | `/api/warehouses/code/:code` | Tìm kiếm kho bãi theo mã kho |
| `POST` | `/api/warehouses` | Tạo mới kho bãi |
| `PUT` | `/api/warehouses/:id` | Cập nhật thông tin kho bãi |
| `DELETE` | `/api/warehouses/:id` | Xóa kho bãi |

### 💊 4. Vật Tư & Dược Phẩm (`/api/products`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Lấy danh mục vật tư & dược phẩm |
| `GET` | `/api/products/:id` | Xem chi tiết sản phẩm theo ID |
| `GET` | `/api/products/code/:code` | Tìm kiếm sản phẩm theo mã vật tư |
| `POST` | `/api/products` | Tạo mới vật tư / dược phẩm |
| `PUT` | `/api/products/:id` | Cập nhật thông tin vật tư / dược phẩm |
| `DELETE` | `/api/products/:id` | Xóa vật tư / dược phẩm |

### 📄 5. Phiếu Nhập Kho (`/api/receipts`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/receipts` | Lấy lịch sử tất cả phiếu nhập kho |
| `GET` | `/api/receipts/:id` | Xem chi tiết phiếu nhập kho (bao gồm danh sách vật tư nhập) |
| `POST` | `/api/receipts` | Lập phiếu nhập kho mới (Mẫu số 01 - VT) |

---

## 🛠 Công Nghệ Sử Dụng (Tech Stack)

### Frontend (Client)
* **Framework:** Next.js 16 (React 19, App Router architecture)
* **Language:** TypeScript 5
* **Styling:** TailwindCSS v4
* **UI Utilities & Icons:** Lucide React, Sonner (Toast notifications)
* **Testing:** Jest & `@types/jest` (Unit testing cho helpers formatting tiền tệ & đọc số thành chữ)

### Backend (Server)
* **Runtime & Framework:** Node.js, Express.js (v5)
* **Language:** TypeScript 5
* **Database:** PostgreSQL 16 (`pg` driver)
* **Validation:** Zod Schema Validation
* **Testing:** Jest & Supertest (78 unit & integration tests cho Services, Schemas & Endpoints)

### DevOps & Environment
* **Containerization:** Docker & Docker Compose
* **Config Management:** Environment variables (`.env`)

---

## 🏗 Kiến Trúc Dự Án & Cấu Trúc Thư Mục

```text
vimes-test/
├── client/                     # Frontend Application (Next.js 16)
│   ├── src/
│   │   ├── app/                # Pages / Routes (App Router)
│   │   │   ├── departments/    # Quản lý Khoa / Phòng
│   │   │   ├── products/       # Quản lý Vật tư / Dược phẩm
│   │   │   ├── receipts/       # Lịch sử Phiếu nhập kho & Xem chi tiết
│   │   │   ├── suppliers/      # Quản lý Nhà cung cấp
│   │   │   └── warehouses/     # Quản lý Kho bãi
│   │   ├── components/         # Reusable UI Components (Modal, Header, Table, Preview...)
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── services/           # API Integration Layer
│   │   ├── types/              # TypeScript Interfaces & Types
│   │   └── utils/              # Utility Functions (Formatting VND, Convert number to words)
│   ├── package.json
│   └── dockerfile
│
└── server/                     # Backend REST API (Express.js + TypeScript)
    ├── src/
    │   ├── config/             # Database connection & Environment configs
    │   ├── controllers/        # Request & Response Handlers
    │   ├── models/             # Data Models & Zod Schemas
    │   ├── repositories/       # Database Data Access Layer (SQL Queries)
    │   ├── routes/             # Express API Routes Definition
    │   └── services/           # Business Logic Layer
    ├── migrations/             # SQL Migration Scripts & DDL
    ├── docker-compose.yml
    └── package.json
```

---

## ✨ Các Tính Năng Nổi Bật

1. **Lập Phiếu Nhập Kho Dược & Vật Tư Y Tế (Mẫu số 01 - VT):**
   - Hỗ trợ nhập đầy đủ thông tin: Người giao, Theo chứng từ số/ngày, Khóa/Phòng ban, Nhà cung cấp, Kho nhập.
   - Thêm/xóa danh sách vật tư nhập kho động, tự động tính tổng tiền, thuế VAT và tiền chiết khấu.
   - Tự động chuyển đổi tổng số tiền thanh toán thành chữ bằng Tiếng Việt chuẩn.

2. **Chế Độ Xem & In Phiếu (Print Mode):**
   - Giao diện xem trước và in phiếu nhập kho khớp hoàn toàn với mẫu chuẩn Bộ Y Tế / Tài Chính (Mẫu số 01 - VT).
   - Tự động loại bỏ các thành phần UI dư thừa khi bấm in (CSS `@media print`).

3. **Quản Lý Danh Mục Hệ Thống:**
   - Quản lý linh hoạt danh mục Nhà cung cấp, Khoa/Phòng ban, Kho bãi và Vật tư Dược phẩm.

4. **Đảm Bảo Chất Lượng & Xử Lý Lỗi (Robust Validation):**
   - Kiểm tra dữ liệu đầu vào chặt chẽ bằng **Zod Schema** ở Backend và Validation ở Client.
   - Hệ thống Unit Test bao phủ 85 test cases PASS cho toàn bộ logic quan trọng.

---

## 🗄️ Mô Hình Cơ Sở Dữ Liệu (Database Schema)

Dự án sử dụng cơ sở dữ liệu PostgreSQL với 6 bảng chính được chuẩn hóa:

* `suppliers`: Lưu thông tin các nhà cung cấp (Mã nhà cung cấp, tên, địa chỉ, MST, SĐT...).
* `departments`: Lưu thông tin Khoa / Phòng ban trong bệnh viện / cơ sở y tế.
* `warehouses`: Lưu danh sách các kho lưu trữ (Kho dược, Kho vật tư...).
* `products`: Lưu danh mục vật tư y tế, thuốc, dược phẩm, đơn vị tính, đơn giá.
* `receipts`: Lưu thông tin chung của phiếu nhập kho (Số phiếu, ngày lập, nhà cung cấp, kho nhập, người giao, tổng tiền, thuế, chiết khấu...).
* `receipt_details`: Lưu chi tiết các mặt hàng trong từng phiếu nhập (Mã sản phẩm, số lượng theo chứng từ, số lượng thực nhập, đơn giá, thành tiền...).
