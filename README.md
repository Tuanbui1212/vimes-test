# TEST-VIMES - Hệ Thống Quản Lý Kho Dược & Vật Tư Y Tế
> Ứng dụng Quản lý Nhập Xuất Tồn kho Dược & Vật tư Y tế (Chuẩn biểu mẫu **Mẫu số 01 - VT** theo Thông tư Bộ Tài chính & Bộ Y Tế) phát triển theo phong cách thương hiệu công nghệ y tế **TEST-VIMES**.

---

## 📑 Mục lục
1. [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
2. [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
3. [Các tính năng nổi bật](#-các-tính-năng-nổi-bật)
4. [Hướng dẫn cài đặt & khởi chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
   - [Cách 1: Chạy bằng Docker Compose (Khuyên dùng)](#cách-1-chạy-bằng-docker-compose-nhanh-nhất--khuyên-dùng)
   - [Cách 2: Chạy trực tiếp trên máy (Manual)](#cách-2-chạy-thông-thường-trên-máy-local-machine)
5. [🧪 Hướng dẫn chạy Unit Tests](#-hướng-dẫn-chạy-unit-tests)
6. [Danh sách API Endpoints](#-danh-sách-api-endpoints)
7. [Cấu trúc thư mục](#-cấu-trúc-thư-mục)

---

## 🛠️ Công nghệ sử dụng

### Frontend (`client/`)
- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Ngôn ngữ:** TypeScript 5
- **Styling:** Tailwind CSS v4, Modern Glassmorphism & Custom TEST-VIMES Cyan/Teal Palette
- **Icons:** Lucide React
- **Testing:** Jest, ts-jest

### Backend (`server/`)
- **Runtime & Framework:** Node.js, [Express 5](https://expressjs.com/)
- **Ngôn ngữ:** TypeScript 5 (Strict mode)
- **Database:** PostgreSQL 16
- **Database Driver:** `pg` (`node-postgres` Connection Pool)
- **Validation:** Zod Schema Validation
- **Testing:** Jest, ts-jest (85/85 tests PASS)

### DevOps & Containerization
- **Docker & Docker Compose** (PostgreSQL 16 Alpine + Node.js 20 Alpine)

---

## 🏛️ Kiến trúc hệ thống

Dự án áp dụng mô hình phân lớp rõ ràng (**3-Tier Clean Layered Architecture**):

```mermaid
graph TD
    Client["Client (Next.js 16 / React 19)"] -->|HTTP / REST API :8080| Controller["Controllers (Xử lý Request & Validation)"]
    Controller --> Service["Services (Nghiệp vụ, Tính tiền & ACID Transaction)"]
    Service --> Repository["Repositories (Truy vấn SQL Parameterized)"]
    Repository --> DB[("PostgreSQL Database :5432")]
```

### 1. Cơ sở dữ liệu (6 bảng chuẩn hóa)
1. **`suppliers`**: Quản lý danh sách Nhà cung cấp thuốc, vật tư y tế.
2. **`departments`**: Quản lý các Khoa / Phòng ban / Đơn vị yêu cầu.
3. **`warehouses`**: Quản lý danh sách Kho bãi (Kho Chẵn, Kho Lẻ, Kho Dược, Kho Vật tư).
4. **`products`**: Quản lý danh mục Vật tư, Thuốc, Hóa chất, Nhãn hiệu, Quy cách, Phân loại, Đơn vị tính.
5. **`receipt_vouchers`**: Quản lý thông tin chung của Phiếu nhập kho (Số phiếu, Ngày lập, Người giao, TK Nợ/Có, Chứng từ gốc, Tổng tiền).
6. **`receipt_voucher_details`**: Quản lý danh sách chi tiết các mặt hàng thực nhập trong phiếu (SL Chứng từ, SL Thực nhập, Đơn giá, Thành tiền).

### 2. Đảm bảo toàn vẹn dữ liệu (ACID Transactions)
Khi lập phiếu nhập kho, toàn bộ thông tin phiếu mẹ (`receipt_vouchers`) cùng toàn bộ các dòng hàng con (`receipt_voucher_details`) được thực thi trong cùng một **PostgreSQL Transaction** (`BEGIN` ➔ `COMMIT` / `ROLLBACK`).

---

## ✨ Các tính năng nổi bật

- **📋 Lập Phiếu Nhập Kho Chuẩn Mẫu 01-VT**: Đầy đủ các trường nghiệp vụ: Số phiếu, Ngày lập, Nhà cung cấp, Đơn vị yêu cầu, Kho nhập, Người giao hàng, Tài khoản Nợ/Có (152/331), Số & ngày chứng từ gốc.
- **🖨️ In & Xuất PDF Phiếu Nhập Kho Chuẩn A4**:
  - Hỗ trợ in trực tiếp hoặc lưu thành file PDF vector sắc nét thông qua công nghệ Isolated Iframe Printing.
  - Tự động ẩn menu/sidebar, chỉ in biểu mẫu chuẩn có đầy đủ 4 chữ ký và số tiền bằng chữ.
- **🔍 Custom ComboBox Searchable**: Tìm kiếm tức thì theo mã, tên, quy cách, nhãn hiệu.
- **⚡ Tính toán Real-time & Đọc tiền tự động**:
  - Tự động nhân `SL Thực nhập × Đơn giá = Thành tiền`.
  - Tự động cộng tổng tiền toàn phiếu.
  - Tự động dịch số tiền thành chữ tiếng Việt chuẩn kế toán (Ví dụ: *"Bốn triệu hai trăm năm mươi nghìn đồng chẵn."*).
- **📊 Trang Lịch sử & Phân trang Thông minh (`/receipts`)**:
  - Bộ điều hướng 4 nút (`<<`, `<`, `>`, `>>`), chọn số lượng dòng hiển thị (`12`, `24`, `48`, `96` dòng/trang).
  - Modal xem chi tiết phiếu nhập và bảng kê danh mục vật tư.
- **🎨 Giao diện TEST-VIMES Dark Theme Sidebar**: Sidebar thu phóng mượt mà, hiển thị trạng thái kết nối máy chủ real-time.

---

## 🚀 Hướng dẫn cài đặt & khởi chạy

### Cách 1: Chạy bằng Docker Compose (Nhanh nhất & Khuyên dùng)

Hệ thống đã được đóng gói sẵn toàn bộ Database và Backend Service trong thư mục `server/`.

#### Bước 1: Khởi động Backend & PostgreSQL bằng Docker
Mở Terminal tại thư mục `server`:
```powershell
cd d:\tbui\test\server
docker compose up --build -d
```
> *Lệnh trên sẽ tự động dựng container PostgreSQL (cổng 5432), tự động nạp bảng & dữ liệu mẫu từ `migrations/01_init_tables.sql`, và khởi chạy Backend API tại cổng `8080`.*

- Kiểm tra trạng thái: `docker compose ps`
- Xem log backend: `docker compose logs -f server`
- Tắt hệ thống: `docker compose down`

#### Bước 2: Chạy Frontend Client
Mở Terminal mới tại thư mục `client`:
```powershell
cd d:\tbui\test\client
npm install
npm run dev
```
> Mở trình duyệt tại **`http://localhost:3000`** để sử dụng.

---

### Cách 2: Chạy thông thường trên máy (Local Machine)

#### Yêu cầu môi trường:
- Node.js >= 18.x
- PostgreSQL Server đang chạy trên cổng `5432`

#### Bước 1: Khởi tạo Database PostgreSQL
1. Tạo Database tên: `inventory_db`
2. Chạy file script SQL: [`server/migrations/01_init_tables.sql`](server/migrations/01_init_tables.sql) (bằng pgAdmin, DBeaver hoặc lệnh `psql`).

#### Bước 2: Khởi chạy Backend Service
```powershell
cd d:\tbui\test\server
npm install
npm start
```
> Backend chạy tại **`http://localhost:8080`**

#### Bước 3: Khởi chạy Frontend Client
```powershell
cd d:\tbui\test\client
npm install
npm run dev
```
> Frontend chạy tại **`http://localhost:3000`**

---

## 🧪 Hướng dẫn chạy Unit Tests

Dự án có tổng cộng **85 Unit Tests** phủ khắp 2 phân hệ Backend và Frontend:

### 1. Chạy Test Backend (78 Tests - 10 Test Suites)
Mở Terminal tại thư mục `server`:
```powershell
cd d:\tbui\test\server

# Chạy toàn bộ test
npm test

# Chạy riêng tầng Services (Business logic & Transactions)
npm test -- tests/unit/services/

# Chạy riêng tầng Models (Zod Validation Schemas)
npm test -- tests/unit/models/
```

### 2. Chạy Test Frontend (7 Tests)
Mở Terminal tại thư mục `client`:
```powershell
cd d:\tbui\test\client

# Chạy test logic dịch tiền & format tiền tệ
npm test
```

---

## 📡 Danh sách API Endpoints

Base URL: `http://localhost:8080/api`

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/health` | Kiểm tra trạng thái hoạt động của Backend |
| `GET` | `/api/suppliers` | Lấy danh sách Nhà cung cấp |
| `GET` | `/api/departments` | Lấy danh sách Phòng ban / Đơn vị |
| `GET` | `/api/warehouses` | Lấy danh sách Kho bãi |
| `GET` | `/api/products` | Lấy danh mục Vật tư & Dược phẩm |
| `GET` | `/api/products/:id` | Xem chi tiết 1 vật tư theo ID |
| `GET` | `/api/products/code/:code` | Tra cứu vật tư theo Mã (VD: `VT001`) |
| `GET` | `/api/receipts` | Lấy danh sách lịch sử phiếu nhập kho |
| `GET` | `/api/receipts/:id` | Lấy chi tiết phiếu nhập kho & danh sách mặt hàng |
| `POST` | `/api/receipts` | Tạo mới phiếu nhập kho (Master-Detail Transaction) |

---

## 📁 Cấu trúc thư mục

```
d:/tbui/test/
├── README.md                     # Tài liệu hướng dẫn dự án chi tiết
├── .gitignore                    # Cấu hình bỏ qua file cho Git
│
├── server/                      # BACKEND SERVICE (Node.js/Express/PostgreSQL)
│   ├── Dockerfile                # Dockerfile build Backend container
│   ├── docker-compose.yml        # Compose chạy PostgreSQL & Backend
│   ├── .env                      # Biến môi trường Backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js            # Cấu hình Jest test runner cho TypeScript
│   ├── migrations/
│   │   └── 01_init_tables.sql    # DDL 6 bảng & Seed dữ liệu mẫu ban đầu
│   ├── src/
│   │   ├── config/               # Cấu hình Pool kết nối PostgreSQL
│   │   ├── models/               # Zod Schemas & TypeScript Types
│   │   ├── repositories/         # Tương tác CSDL qua Parameterized Raw SQL
│   │   ├── services/             # Xử lý nghiệp vụ & ACID Transactions
│   │   ├── controllers/          # Nhận request, validation & response
│   │   └── routes/               # Định tuyến API
│   └── tests/
│       └── unit/
│           ├── models/           # 23 Unit tests cho Zod Schemas
│           └── services/         # 55 Unit tests cho 5 Services
│
└── client/                       # FRONTEND CLIENT (Next.js 16/React 19/Tailwind)
    ├── .env                      # Biến môi trường Client
    ├── package.json
    ├── tsconfig.json
    ├── jest.config.js            # Cấu hình Jest cho Client
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx        # Shell layout tổng nhúng Sidebar
    │   │   ├── page.tsx          # Trang Lập Phiếu Nhập Kho (Mẫu 01-VT)
    │   │   └── receipts/
    │   │       └── page.tsx      # Trang Danh Sách & Lịch Sử Phiếu Nhập
    │   ├── components/           # UI Components (Button, ComboBox, Modal In/Xuất PDF...)
    │   ├── constants/            # Quản lý đường dẫn APP_PATHS
    │   ├── services/             # Tầng gọi API Backend (fetch wrapper)
    │   ├── types/                # Types định nghĩa dữ liệu đồng bộ
    │   └── utils/
    │       └── format.ts         # Tiện ích định dạng tiền VND & dịch số thành chữ
    └── tests/
        └── unit/
            └── utils/            # 7 Unit tests cho format & numberToWords
```
