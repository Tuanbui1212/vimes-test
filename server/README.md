# TEST-VIMES Backend Service

Backend REST API Service Quản lý Kho Dược & Vật Tư Y Tế xây dựng bằng **Node.js**, **Express 5**, **TypeScript**, và **PostgreSQL 16**.

---

## 🚀 Hướng dẫn khởi chạy

### Cách 1: Chạy bằng Docker Compose (Khuyên dùng)
```bash
docker compose up --build -d
```
> API chạy tại: **`http://localhost:8080`**

### Cách 2: Chạy trực tiếp (Local Machine)
1. Khởi tạo Database PostgreSQL `inventory_db` và chạy script `migrations/01_init_tables.sql`.
2. Cài đặt và khởi chạy:
```bash
npm install
npm start
```

---

## 🧪 Hướng dẫn chạy Unit Tests (78 Tests)

```bash
# Chạy toàn bộ 78 test cases
npm test

# Chạy riêng tầng Services
npm test -- tests/unit/services/

# Chạy riêng tầng Models (Zod Validation)
npm test -- tests/unit/models/
```
