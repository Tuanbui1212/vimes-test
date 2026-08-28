-- ==============================================================================
-- MIGRATION 03: SEED EXTENSIVE MOCK DATA (Dược phẩm & Vật tư y tế quy mô lớn)
-- Phục vụ kiểm thử phân trang (Pagination), tìm kiếm (Search), cuộn vô tận (Infinite Scroll)
-- ==============================================================================

-- 1. SEED DANH SÁCH NHÀ CUNG CẤP (SUPPLIERS ~ 35 Đơn vị)
INSERT INTO suppliers (name, status) VALUES 
('Công ty Cổ phần Dược Hậu Giang (DHG Pharma)', 'ACTIVE'),
('Công ty TNHH Sanofi-Aventis Việt Nam', 'ACTIVE'),
('Công ty Cổ phần Traphaco', 'ACTIVE'),
('Công ty TNHH B. Braun Việt Nam', 'ACTIVE'),
('Công ty Cổ phần Dược phẩm Imexpharm', 'ACTIVE'),
('Công ty Cổ phần Dược phẩm TV.Pharm', 'ACTIVE'),
('Công ty Cổ phần Dược phẩm Cửu Long (Pharimexco)', 'ACTIVE'),
('Công ty Cổ phần Pymepharco (Stada AG)', 'ACTIVE'),
('Công ty Cổ phần Dược phẩm Nam Hà (Namha Pharma)', 'ACTIVE'),
('Công ty Cổ phần Dược - Trang thiết bị Y tế Bình Định (Bidiphar)', 'ACTIVE'),
('Công ty Cổ phần Dược phẩm OPC', 'ACTIVE'),
('Công ty TNHH Terumo Vietnam Medical Equipment', 'ACTIVE'),
('Công ty TNHH Thiết bị Y tế Roche Việt Nam', 'ACTIVE'),
('Công ty TNHH Abbott Healthcare Việt Nam', 'ACTIVE'),
('Công ty TNHH Thiết bị Y tế Medtronic Việt Nam', 'ACTIVE'),
('Công ty TNHH Thiết bị Y tế Nipro Vietnam', 'ACTIVE'),
('Công ty Cổ phần Dược phẩm Boston Việt Nam', 'ACTIVE'),
('Công ty Cổ phần Dược phẩm Hà Tây (Hataphar)', 'ACTIVE'),
('Công ty TNHH Dược phẩm Shinpoong Daewoo', 'ACTIVE'),
('Công ty Cổ phần Dược phẩm Danapha', 'ACTIVE'),
('Công ty Cổ phần Xuất nhập khẩu Y tế Domesco', 'ACTIVE'),
('Công ty Cổ phần Y Dược phẩm Vimedimex', 'ACTIVE'),
('Công ty Cổ phần Thiết bị Y tế MEDIPLUS', 'ACTIVE'),
('Công ty TNHH Dược phẩm Sang Pharma', 'ACTIVE'),
('Công ty TNHH Dược phẩm Việt Pháp', 'ACTIVE'),
('Công ty Cổ phần Thiết bị Y tế Hoàng Long', 'ACTIVE'),
('Công ty Cổ phần Dược Khoa (DK Pharma)', 'ACTIVE'),
('Công ty TNHH Dược phẩm GlaxoSmithKline Việt Nam (GSK)', 'ACTIVE'),
('Công ty TNHH AstraZeneca Việt Nam', 'ACTIVE'),
('Công ty TNHH Novartis Pharma Việt Nam', 'ACTIVE'),
('Công ty TNHH Becton Dickinson (BD) Việt Nam', 'ACTIVE'),
('Công ty TNHH Johnson & Johnson Medical Việt Nam', 'ACTIVE'),
('Công ty Cổ phần Vật tư Y tế Hà Nội (HMT)', 'ACTIVE'),
('Công ty Cổ phần Dược phẩm Vĩnh Phúc (Vinphaco)', 'ACTIVE'),
('Công ty Cổ phần Hóa Dược Phẩm Mekophar', 'ACTIVE')
ON CONFLICT (name) DO NOTHING;

-- 2. SEED DANH SÁCH PHÒNG BAN / KHOA (DEPARTMENTS ~ 30 Đơn vị)
INSERT INTO departments (name, status) VALUES 
('Khoa Cấp cứu & Chống độc (A1)', 'ACTIVE'),
('Khoa Hồi sức tích cực & Chống độc (ICU)', 'ACTIVE'),
('Khoa Phẫu thuật - Gây mê hồi sức', 'ACTIVE'),
('Khoa Ngoại Tổng hợp & Tiêu hóa', 'ACTIVE'),
('Khoa Ngoại Chấn thương chỉnh hình', 'ACTIVE'),
('Khoa Nội Tim mạch & Can thiệp', 'ACTIVE'),
('Khoa Nội Tiết - Đái tháo đường', 'ACTIVE'),
('Khoa Nội Hô hấp & Thăm dò chức năng', 'ACTIVE'),
('Khoa Nội Tiêu hóa & Gan mật', 'ACTIVE'),
('Khoa Nội Thần kinh & Đột quỵ', 'ACTIVE'),
('Khoa Thận nhân tạo & Lọc máu', 'ACTIVE'),
('Khoa Nhi & Sơ sinh', 'ACTIVE'),
('Khoa Phụ sản & Kế hoạch hóa gia đình', 'ACTIVE'),
('Khoa Ung bướu & Xạ trị', 'ACTIVE'),
('Khoa Tai Mũi Họng', 'ACTIVE'),
('Khoa Răng Hàm Mặt', 'ACTIVE'),
('Khoa Mắt & Khúc xạ', 'ACTIVE'),
('Khoa Da liễu & Thẩm mỹ y học', 'ACTIVE'),
('Khoa Y học cổ truyền & Phục hồi chức năng', 'ACTIVE'),
('Khoa Khám bệnh Ngoại trú (Cơ sở 1)', 'ACTIVE'),
('Khoa Khám bệnh Ngoại trú (Cơ sở 2)', 'ACTIVE'),
('Khoa Xét nghiệm Huyết học & Truyền máu', 'ACTIVE'),
('Khoa Hóa sinh - Miễn dịch', 'ACTIVE'),
('Khoa Vi sinh & Ký sinh trùng', 'ACTIVE'),
('Khoa Chẩn đoán hình ảnh (X-Quang, CT, MRI)', 'ACTIVE'),
('Khoa Thăm dò chức năng & Nội soi', 'ACTIVE'),
('Khoa Kiểm soát nhiễm khuẩn & Tiệt trùng trung tâm', 'ACTIVE'),
('Khoa Dược Bệnh viện', 'ACTIVE'),
('Phòng Vật tư & Trang thiết bị y tế', 'ACTIVE'),
('Phòng Kế hoạch tổng hợp & Quản lý chất lượng', 'ACTIVE')
ON CONFLICT (name) DO NOTHING;

-- 3. SEED DANH SÁCH KHO BÃI (WAREHOUSES ~ 18 Kho)
INSERT INTO warehouses (code, name, location, status) VALUES 
('KHO_CHAN_DUOC', 'Kho Chẵn Dược Phẩm Tổng', 'Tòa nhà A - Tầng hầm B1', 'ACTIVE'),
('KHO_LE_CAP_PHAT', 'Kho Lẻ Cấp Phát Nội Trú', 'Tòa nhà A - Tầng 1 (P.102)', 'ACTIVE'),
('KHO_VT_TIEU_HAO', 'Kho Vật Tư Tiêu Hao & Dụng Cụ', 'Tòa nhà B - Tầng 1 (P.105)', 'ACTIVE'),
('KHO_HOA_CHAT_XN', 'Kho Hóa Chất & Sinh Phẩm Xét Nghiệm', 'Tòa nhà Kỹ thuật C - Tầng 2', 'ACTIVE'),
('KHO_HUONG_THAN', 'Kho Thuốc Hướng Thần & Gây Nghiện (Kiểm soát đặc biệt)', 'Tòa nhà A - Phòng Két Dược (P.108)', 'ACTIVE'),
('KHO_DICH_TRUYEN', 'Kho Dịch Truyền Khối Lượng Lớn', 'Tòa nhà Logistics D - Khu tiếp nhận', 'ACTIVE'),
('KHO_DUNG_CU_MO', 'Kho Dụng Cụ & Vật Tư Phẫu Thuật Vô Trùng', 'Tòa nhà A - Tầng 3 (Khu mổ sạch)', 'ACTIVE'),
('KHO_VACCINE_LANH', 'Kho Bảo Quản Vaccine & Sinh Phẩm Lạnh (2-8°C)', 'Tòa nhà Dược - Phòng lạnh L1', 'ACTIVE'),
('KHO_AM_SAU', 'Kho Sinh Phẩm Âm Sâu (-20°C đến -80°C)', 'Tòa nhà Xét nghiệm - Phòng lạnh L2', 'ACTIVE'),
('KHO_CAP_CUU_01', 'Kho Tủ Thuốc Trực Cấp Cứu 24/7', 'Khoa Cấp cứu A1 - Tầng trệt', 'ACTIVE'),
('KHO_NGOAI_TRU', 'Kho Dược Cấp Phát Bảo Hiểm Y Tế', 'Tòa nhà Khám bệnh - Tầng 1', 'ACTIVE'),
('KHO_DU_TRU_TH', 'Kho Dự Trữ Y Tế Thảm Họa & Phòng Chống Dịch', 'Tòa nhà Logistics D - Tầng 2', 'ACTIVE'),
('KHO_DONG_Y', 'Kho Dược Liệu & Vị Thuốc Cổ Truyền', 'Tòa nhà E - Khoa Y học cổ truyền', 'ACTIVE'),
('KHO_OXY_KHI_YT', 'Trạm Kho Khí Y Tế & Bình Oxy Áp Lực', 'Khu kỹ thuật hậu cần H1', 'ACTIVE'),
('KHO_THAY_THE_TB', 'Kho Phụ Tùng & Linh Kiện Thiết Bị Y Tế', 'Phòng Vật tư TBYT - Tầng 2', 'ACTIVE'),
('KHO_CHUYEN_DUNG', 'Kho Vật Tư Can Thiệp Tim Mạch & Đặt Stent', 'Phòng Cathlab - Tầng 4', 'ACTIVE'),
('KHO_X_QUANG_CT', 'Kho Phim & Thuốc Cản Quang Chẩn Đoán Hình Ảnh', 'Khoa CĐHA - Tầng hầm B1', 'ACTIVE'),
('KHO_TAM_THU_HOI', 'Kho Lưu Trữ Tạm Hàng Chờ Trả / Thu Hồi', 'Khu tiếp nhận Dược - Cửa số 3', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- 4. SEED DANH MỤC VẬT TƯ & DƯỢC PHẨM (PRODUCTS ~ 60 Mặt hàng đa dạng)
INSERT INTO products (code, name, brand, specifications, quality, category_type, unit, status) VALUES 
-- Dược phẩm - Kháng sinh & Kháng viêm
('DP_AMOX_500', 'Amoxicillin 500mg', 'DHG Pharma', 'Hộp 10 vỉ x 10 viên nang', 'Mới 100%', 'Thuốc', 'Hộp', 'ACTIVE'),
('DP_AUGM_1G', 'Augmentin 1g (Amoxicillin/Acid Clavulanic)', 'GSK', 'Hộp 2 vỉ x 7 viên nén', 'Mới 100%', 'Thuốc', 'Hộp', 'ACTIVE'),
('DP_CEFTR_1G', 'Ceftriaxone 1g tiêm/truyền', 'Imexpharm', 'Hộp 10 lọ bột pha tiêm + nước cất', 'Mới 100%', 'Thuốc', 'Lọ', 'ACTIVE'),
('DP_CEFU_500', 'Cefuroxim 500mg (Zinnat)', 'GSK', 'Hộp 1 vỉ x 10 viên nén bao phim', 'Mới 100%', 'Thuốc', 'Hộp', 'ACTIVE'),
('DP_CIPRO_500', 'Ciprofloxacin 500mg', 'Pymepharco', 'Hộp 10 vỉ x 10 viên', 'Mới 100%', 'Thuốc', 'Hộp', 'ACTIVE'),
('DP_AZITH_500', 'Azithromycin 500mg', 'Stada', 'Hộp 1 vỉ x 3 viên nén', 'Mới 100%', 'Thuốc', 'Hộp', 'ACTIVE'),
('DP_METHYL_16', 'Methylprednisolon 16mg (Medrol)', 'Pfizer', 'Hộp 3 vỉ x 10 viên', 'Mới 100%', 'Thuốc', 'Hộp', 'ACTIVE'),
('DP_DEXA_4MG', 'Dexamethason 4mg/1ml', 'Vinphaco', 'Hộp 10 ống x 1ml tiêm', 'Mới 100%', 'Thuốc', 'Ống', 'ACTIVE'),

-- Dược phẩm - Giảm đau, Hạ sốt & Tiêu hóa
('DP_PARA_500', 'Paracetamol 500mg (Hapacol)', 'DHG Pharma', 'Hộp 10 vỉ x 10 viên nén', 'Mới 100%', 'Thuốc', 'Hộp', 'ACTIVE'),
('DP_PARA_INF', 'Paracetamol 1000mg/100ml truyền tĩnh mạch', 'B. Braun', 'Chai 100ml dịch truyền', 'Mới 100%', 'Thuốc', 'Chai', 'ACTIVE'),
('DP_IBU_400', 'Ibuprofen 400mg', 'Domesco', 'Hộp 10 vỉ x 10 viên', 'Mới 100%', 'Thuốc', 'Hộp', 'ACTIVE'),
('DP_TRAMA_50', 'Tramadol Hydroclorid 50mg/1ml', 'Sanofi', 'Hộp 5 ống x 1ml', 'Mới 100%', 'Thuốc', 'Ống', 'ACTIVE'),
('DP_OMEP_20', 'Omeprazol 20mg', 'Traphaco', 'Hộp 3 vỉ x 10 viên nang tan trong ruột', 'Mới 100%', 'Thuốc', 'Hộp', 'ACTIVE'),
('DP_ESOM_40', 'Esomeprazol 40mg bột đông khô pha tiêm (Nexium)', 'AstraZeneca', 'Hộp 1 lọ bột đông khô', 'Mới 100%', 'Thuốc', 'Lọ', 'ACTIVE'),
('DP_PHOSPH_G', 'Phosphalugel (Gel nhôm phosphat)', 'Boehringer Ingelheim', 'Hộp 26 gói x 20g', 'Mới 100%', 'Thuốc', 'Hộp', 'ACTIVE'),

-- Dược phẩm - Tim mạch, Huyết áp & Cấp cứu
('DP_AMLO_5MG', 'Amlodipin 5mg', 'Stella', 'Hộp 3 vỉ x 10 viên', 'Mới 100%', 'Thuốc', 'Hộp', 'ACTIVE'),
('DP_LOSAR_50', 'Losartan Potassium 50mg', 'Boston Pharma', 'Hộp 3 vỉ x 10 viên', 'Mới 100%', 'Thuốc', 'Hộp', 'ACTIVE'),
('DP_ADREN_1MG', 'Adrenalin (Epinephrin) 1mg/1ml', 'Vinphaco', 'Hộp 10 ống x 1ml cấp cứu', 'Mới 100%', 'Thuốc', 'Ống', 'ACTIVE'),
('DP_ATROP_025', 'Atropin Sulfat 0.25mg/1ml', 'Danapha', 'Hộp 10 ống x 1ml', 'Mới 100%', 'Thuốc', 'Ống', 'ACTIVE'),
('DP_FURO_20MG', 'Furosemid 20mg/2ml tiêm', 'Sanofi', 'Hộp 5 ống x 2ml', 'Mới 100%', 'Thuốc', 'Ống', 'ACTIVE'),
('DP_GLUCO_30', 'Glucose 30% x 10ml tiêm chống hạ đường huyết', 'Bidiphar', 'Hộp 20 ống x 10ml', 'Mới 100%', 'Thuốc', 'Hộp', 'ACTIVE'),

-- Dịch truyền y tế khối lượng lớn
('DT_NACL_09_500', 'Natri Clorid 0.9% 500ml (Nước muối sinh lý)', 'B. Braun', 'Chai nhựa Polyethylene 500ml', 'Mới 100%', 'Dược phẩm', 'Chai', 'ACTIVE'),
('DT_GLUC_5_500', 'Glucose 5% 500ml dịch truyền đẳng trương', 'B. Braun', 'Chai nhựa 500ml', 'Mới 100%', 'Dược phẩm', 'Chai', 'ACTIVE'),
('DT_RL_500', 'Ringer Lactat 500ml dịch truyền điện giải', 'B. Braun', 'Chai nhựa 500ml', 'Mới 100%', 'Dược phẩm', 'Chai', 'ACTIVE'),
('DT_MANNI_20', 'Mannitol 20% 250ml chống phù não', 'B. Braun', 'Chai thủy tinh 250ml', 'Mới 100%', 'Dược phẩm', 'Chai', 'ACTIVE'),

-- Vật tư tiêu hao - Bơm tiêm & Kim tiêm các cỡ
('VT_BOM_1ML', 'Bơm tiêm dùng 1 lần 1ml (Kim 26G x 1/2")', 'Vinahankook', 'Hộp 100 cây tiệt trùng', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('VT_BOM_3ML', 'Bơm tiêm dùng 1 lần 3ml (Kim 23G x 1")', 'Vinahankook', 'Hộp 100 cây tiệt trùng', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('VT_BOM_5ML', 'Bơm tiêm dùng 1 lần 5ml (Kim 23G x 1")', 'Vinahankook', 'Hộp 100 cây tiệt trùng', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('VT_BOM_10ML', 'Bơm tiêm dùng 1 lần 10ml (Kim 21G x 1-1/2")', 'Vinahankook', 'Hộp 100 cây tiệt trùng', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('VT_BOM_20ML', 'Bơm tiêm dùng 1 lần 20ml không kim', 'B. Braun', 'Hộp 50 cây tiệt trùng', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('VT_BOM_50ML', 'Bơm tiêm dùng 1 lần 50ml đuôi xoắn (cho bơm tiêm điện)', 'B. Braun', 'Hộp 25 cây tiệt trùng', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),

-- Vật tư tiêu hao - Kim luồn & Dây truyền
('VT_KIM_LUON_18', 'Kim luồn tĩnh mạch ngoại vi 18G (Màu xanh lá)', 'Becton Dickinson (BD)', 'Hộp 50 cây tiệt trùng có van', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('VT_KIM_LUON_20', 'Kim luồn tĩnh mạch ngoại vi 20G (Màu hồng)', 'Becton Dickinson (BD)', 'Hộp 50 cây tiệt trùng có van', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('VT_KIM_LUON_22', 'Kim luồn tĩnh mạch ngoại vi 22G (Màu xanh dương)', 'Becton Dickinson (BD)', 'Hộp 50 cây tiệt trùng có van', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('VT_KIM_LUON_24', 'Kim luồn tĩnh mạch sơ sinh 24G (Màu vàng)', 'Becton Dickinson (BD)', 'Hộp 50 cây tiệt trùng có van', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('VT_DAY_TRUYEN_DICH', 'Dây truyền dịch có bầu đếm giọt & màng lọc', 'B. Braun', 'Bịch 25 sợi tiệt trùng', 'Mới 100%', 'Vật tư tiêu hao', 'Bịch', 'ACTIVE'),
('VT_DAY_TRUYEN_MAU', 'Dây truyền máu có bầu lọc cục máu đông 200 micron', 'B. Braun', 'Bịch 20 sợi tiệt trùng', 'Mới 100%', 'Vật tư tiêu hao', 'Bịch', 'ACTIVE'),
('VT_KHOA_3_NGAH', 'Khóa 3 ngạc truyền dịch nối dài tĩnh mạch', 'B. Braun', 'Hộp 50 cái tiệt trùng', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),

-- Dụng cụ bảo hộ & Băng gạc y tế
('BH_GANG_KHAM_S', 'Găng tay y tế khám bệnh không bột Size S', 'VRP Gloves', 'Hộp 100 chiếc (50 đôi)', 'Mới 100%', 'Dụng cụ bảo hộ', 'Hộp', 'ACTIVE'),
('BH_GANG_KHAM_M', 'Găng tay y tế khám bệnh không bột Size M', 'VRP Gloves', 'Hộp 100 chiếc (50 đôi)', 'Mới 100%', 'Dụng cụ bảo hộ', 'Hộp', 'ACTIVE'),
('BH_GANG_KHAM_L', 'Găng tay y tế khám bệnh không bột Size L', 'VRP Gloves', 'Hộp 100 chiếc (50 đôi)', 'Mới 100%', 'Dụng cụ bảo hộ', 'Hộp', 'ACTIVE'),
('BH_GANG_MO_75', 'Găng tay phẫu thuật vô trùng Size 7.5', 'Ansell Gammex', 'Hộp 50 đôi đóng gói tiệt trùng riêng', 'Mới 100%', 'Dụng cụ bảo hộ', 'Hộp', 'ACTIVE'),
('BH_KHAU_TRANG_4L', 'Khẩu trang y tế kháng khuẩn 4 lớp chuẩn BV', 'Famapro', 'Hộp 50 cái', 'Mới 100%', 'Dụng cụ bảo hộ', 'Hộp', 'ACTIVE'),
('BH_KHAU_TRANG_N95', 'Khẩu trang phòng dịch N95 có màng lọc hạt mịn', '3M Healthcare', 'Hộp 20 cái', 'Mới 100%', 'Dụng cụ bảo hộ', 'Hộp', 'ACTIVE'),
('VT_BANG_GAC_10X2', 'Băng gạc cuộn y tế tiệt trùng 10cm x 2m', 'Bảo Thạch', 'Gói 10 cuộn', 'Mới 100%', 'Vật tư tiêu hao', 'Gói', 'ACTIVE'),
('VT_GAC_MIENG_8X10', 'Gạc miếng vô trùng 8 lớp 8cm x 10cm', 'Bảo Thạch', 'Hộp 100 miếng tiệt trùng riêng', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('VT_BANG_DINH_LUA', 'Băng dính lụa y tế cuộn nhôm 2.5cm x 5m (Urgosyval)', 'Urgo Medical', 'Hộp 12 cuộn', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),

-- Hóa chất sát trùng & Sinh phẩm xét nghiệm
('HC_CON_70', 'Cồn y tế sát trùng Ethanol 70 độ', 'Vimedimex', 'Can 5 lít', 'Đạt chuẩn', 'Hóa chất', 'Can', 'ACTIVE'),
('HC_CON_90', 'Cồn y tế sát trùng Ethanol 90 độ', 'Vimedimex', 'Can 5 lít', 'Đạt chuẩn', 'Hóa chất', 'Can', 'ACTIVE'),
('HC_POVIDINE_10', 'Dung dịch sát trùng Povidine 10% (Povidone Iodine)', 'Pharmedic', 'Chai 500ml', 'Đạt chuẩn', 'Hóa chất', 'Chai', 'ACTIVE'),
('HC_ANIOS_SURF', 'Dung dịch khử khuẩn bề mặt & môi trường Aniospray', 'Anios France', 'Chai xịt 1000ml', 'Đạt chuẩn', 'Hóa chất', 'Chai', 'ACTIVE'),
('XN_ONG_EDTA', 'Ống nghiệm chân không nắp tím chống đông K2 EDTA 2ml', 'BD Vacutainer', 'Hộp 100 ống', 'Đạt chuẩn', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('XN_ONG_SERUM', 'Ống nghiệm chân không nắp đỏ tách huyết thanh 4ml', 'BD Vacutainer', 'Hộp 100 ống', 'Đạt chuẩn', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('XN_ONG_HEPARIN', 'Ống nghiệm chân không nắp xanh lá Lithium Heparin 3ml', 'BD Vacutainer', 'Hộp 100 ống', 'Đạt chuẩn', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),

-- Sonde & Thiết bị đặt can thiệp
('VT_SONDE_FOLEY_16', 'Ống thông tiểu 2 nhánh Sonde Foley Silicon số 16', 'B. Braun', 'Cái đóng gói tiệt trùng', 'Mới 100%', 'Thiết bị y tế', 'Cái', 'ACTIVE'),
('VT_TUI_CHUA_NT', 'Túi chứa nước tiểu có van chống trào ngược 2000ml', 'B. Braun', 'Cái tiệt trùng', 'Mới 100%', 'Vật tư tiêu hao', 'Cái', 'ACTIVE'),
('VT_SONDE_DA_DAY_16', 'Ống thông dạ dày Levin số 16 Fr x 120cm', 'Nipro Medical', 'Cái tiệt trùng', 'Mới 100%', 'Thiết bị y tế', 'Cái', 'ACTIVE'),
('VT_CHI_VICRYL_30', 'Chỉ phẫu thuật tự tiêu Vicryl 3-0 kim tròn 26mm', 'Ethicon (Johnson & Johnson)', 'Hộp 36 tép', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('VT_CHI_PROLENE_40', 'Chỉ phẫu thuật không tiêu Prolene 4-0 kim tam giác 19mm', 'Ethicon (Johnson & Johnson)', 'Hộp 36 tép', 'Mới 100%', 'Vật tư tiêu hao', 'Hộp', 'ACTIVE'),
('TB_MAY_DO_HA_OMRON', 'Máy đo huyết áp điện tử bắp tay tự động', 'Omron Healthcare', 'Bộ (Thân máy + Vòng bít + Adapter)', 'Mới 100%', 'Thiết bị y tế', 'Bộ', 'ACTIVE'),
('TB_MAY_SPO2_KEM', 'Máy đo nồng độ bão hòa oxy trong máu SpO2 kẹp ngón', 'Beurer Germany', 'Cái', 'Mới 100%', 'Thiết bị y tế', 'Cái', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;
