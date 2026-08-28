CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    specifications VARCHAR(255),
    quality VARCHAR(255),
    category_type VARCHAR(100),
    unit VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS receipt_vouchers (
    id SERIAL PRIMARY KEY,
    voucher_code VARCHAR(50) UNIQUE NOT NULL,
    receipt_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE RESTRICT,
    deliverer_name VARCHAR(255),
    debit_account VARCHAR(50),
    credit_account VARCHAR(50),
    ref_document_type VARCHAR(100),
    ref_document_no VARCHAR(100),
    ref_document_date TIMESTAMP,
    attached_docs VARCHAR(255),
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receipt_voucher_details (
    id SERIAL PRIMARY KEY,
    voucher_id INTEGER NOT NULL REFERENCES receipt_vouchers(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    doc_quantity INTEGER NOT NULL CHECK (doc_quantity >= 0),
    actual_quantity INTEGER NOT NULL CHECK (actual_quantity > 0),
    price DECIMAL(15, 2) NOT NULL CHECK (price >= 0),
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0
);

INSERT INTO suppliers (name) VALUES 
('Đơn vị 1'),
('Đơn vị 2'),
('Đơn vị 3'),
('Đơn vị 4'),
('Đơn vị 5')
ON CONFLICT (name) DO NOTHING;

INSERT INTO departments (name) VALUES 
('Phòng 1'),
('Phòng 2'),
('Phòng 3'),
('Phòng 4'),
('Phòng 5')
ON CONFLICT (name) DO NOTHING;

INSERT INTO warehouses (code, name, location) VALUES 
('KHO_01', 'Kho 1', 'Khu A'),
('KHO_02', 'Kho 2', 'Khu B'),
('KHO_03', 'Kho 3', 'Khu C'),
('KHO_04', 'Kho 4', 'Khu D'),
('KHO_05', 'Kho 5', 'Khu E')
ON CONFLICT (code) DO NOTHING;

INSERT INTO products (code, name, brand, specifications, quality, category_type, unit) VALUES 
('VT001', 'Bơm tiêm 5ml', 'Nhãn hiệu A', '5ml, kim 25G', 'Loại 1', 'Vật tư tiêu hao', 'Hộp'),
('VT002', 'Băng gạc y tế', 'Nhãn hiệu B', '10cm x 2m', 'Vô trùng', 'Vật tư tiêu hao', 'Cuộn'),
('VT003', 'Cồn sát trùng 70 độ', 'Nhãn hiệu C', 'Chai 500ml', 'Đạt chuẩn', 'Hóa chất', 'Chai'),
('VT004', 'Găng tay y tế', 'Nhãn hiệu D', 'Size M', 'Loại 1', 'Dụng cụ bảo hộ', 'Hộp'),
('VT005', 'Khẩu trang y tế', 'Nhãn hiệu A', '4 lớp', 'Kháng khuẩn', 'Dụng cụ bảo hộ', 'Hộp'),
('VT006', 'Nước muối sinh lý', 'Nhãn hiệu C', 'Chai 500ml', 'Đạt chuẩn', 'Dược phẩm', 'Chai')
ON CONFLICT (code) DO NOTHING;
