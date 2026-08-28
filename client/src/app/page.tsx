'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Button,
  Input,
  ComboBox,
  type ComboBoxOption,
  QuickCreateSupplierModal,
  QuickCreateDepartmentModal,
  QuickCreateWarehouseModal,
  QuickCreateProductModal
} from '@/components';
import {
  supplierService,
  departmentService,
  warehouseService,
  productService,
  receiptService
} from '@/services';
import type {
  Supplier,
  Department,
  Warehouse,
  Product
} from '@/types';
import { formatCurrency, numberToWords } from '@/utils/format';
import { APP_PATHS } from '@/constants';
import {
  Plus,
  Trash2,
  Save,
  FileText,
  Calendar,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Hospital,
  Package,
  FileCheck,
  Hash,
  X,
  MapPin,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface FormRowItem {
  id: string;
  product_id: number | null;
  selectedProduct?: Product;
  selectedProductOpt?: ComboBoxOption | null;
  doc_quantity: number | '';
  actual_quantity: number | '';
  price: number | '';
  total_amount: number;
}

export default function CreateReceiptPage() {
  // Form State
  const [voucherCode, setVoucherCode] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);

  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [selectedSupplierOpt, setSelectedSupplierOpt] = useState<ComboBoxOption | null>(null);

  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [selectedDepartmentOpt, setSelectedDepartmentOpt] = useState<ComboBoxOption | null>(null);

  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [selectedWarehouseOpt, setSelectedWarehouseOpt] = useState<ComboBoxOption | null>(null);

  const [delivererName, setDelivererName] = useState('');
  const [debitAccount, setDebitAccount] = useState('');
  const [creditAccount, setCreditAccount] = useState('');
  const [refDocType, setRefDocType] = useState('');
  const [refDocNo, setRefDocNo] = useState('');
  const [refDocDate, setRefDocDate] = useState('');
  const [attachedDocs, setAttachedDocs] = useState('');

  // Form Item Rows (không hardcode mặc định là 1 nữa)
  const [items, setItems] = useState<FormRowItem[]>([
    {
      id: 'row-1',
      product_id: null,
      selectedProduct: undefined,
      selectedProductOpt: null,
      doc_quantity: '',
      actual_quantity: '',
      price: '',
      total_amount: 0
    }
  ]);

  // Quick Create Modals State
  const [quickSupplier, setQuickSupplier] = useState<{ open: boolean; initialName: string }>({
    open: false,
    initialName: ''
  });
  const [quickDepartment, setQuickDepartment] = useState<{ open: boolean; initialName: string }>({
    open: false,
    initialName: ''
  });
  const [quickWarehouse, setQuickWarehouse] = useState<{ open: boolean; initialName: string }>({
    open: false,
    initialName: ''
  });
  const [quickProduct, setQuickProduct] = useState<{ open: boolean; rowIndex: number; initialName: string }>({
    open: false,
    rowIndex: 0,
    initialName: ''
  });

  // Status & Notifications
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    showViewLink?: boolean;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string, showViewLink = false) => {
    setNotification({ type, message, showViewLink });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  // ==================== ASYNC FETCHERS FOR COMBOBOXES ====================
  const fetchSuppliers = useCallback(async (search: string, page: number) => {
    const res = await supplierService.getAll({
      search,
      page,
      limit: 15,
      status: 'ACTIVE'
    });
    const items = res.data || [];
    const pagination = res.pagination || { total: items.length, hasMore: false };
    return {
      options: items.map((s) => ({
        value: s.id,
        label: s.name,
        badge: 'Đơn vị'
      })),
      total: pagination.total,
      hasMore: pagination.hasMore
    };
  }, []);

  const fetchDepartments = useCallback(async (search: string, page: number) => {
    const res = await departmentService.getAll({
      search,
      page,
      limit: 15,
      status: 'ACTIVE'
    });
    const items = res.data || [];
    const pagination = res.pagination || { total: items.length, hasMore: false };
    return {
      options: items.map((d) => ({
        value: d.id,
        label: d.name,
        badge: 'Phòng ban'
      })),
      total: pagination.total,
      hasMore: pagination.hasMore
    };
  }, []);

  const fetchWarehouses = useCallback(async (search: string, page: number) => {
    const res = await warehouseService.getAll({
      search,
      page,
      limit: 15,
      status: 'ACTIVE'
    });
    const items = res.data || [];
    const pagination = res.pagination || { total: items.length, hasMore: false };
    return {
      options: items.map((w) => ({
        value: w.id,
        label: `${w.name} (${w.code})`,
        subLabel: w.location ? `Vị trí: ${w.location}` : undefined,
        badge: 'Kho'
      })),
      total: pagination.total,
      hasMore: pagination.hasMore
    };
  }, []);

  const fetchProducts = useCallback(async (search: string, page: number) => {
    const res = await productService.getAll({
      search,
      page,
      limit: 15,
      status: 'ACTIVE'
    });
    const items = res.data || [];
    const pagination = res.pagination || { total: items.length, hasMore: false };
    return {
      options: items.map((p) => ({
        value: p.id,
        label: `${p.code} - ${p.name}`,
        subLabel: `QC: ${p.specifications || 'N/A'} | Hiệu: ${p.brand || 'N/A'}`,
        badge: p.unit
      })),
      total: pagination.total,
      hasMore: pagination.hasMore
    };
  }, []);

  // ==================== ROW ITEM HANDLERS ====================
  const handleAddItem = () => {
    const newRow: FormRowItem = {
      id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      product_id: null,
      selectedProduct: undefined,
      selectedProductOpt: null,
      doc_quantity: '',
      actual_quantity: '',
      price: '',
      total_amount: 0
    };
    setItems((prev) => [...prev, newRow]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      showNotification('error', 'Phiếu nhập phải có ít nhất 1 mặt hàng');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = async (index: number, productId: number | null, opt?: ComboBoxOption) => {
    if (!productId) {
      setItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
              ...item,
              product_id: null,
              selectedProduct: undefined,
              selectedProductOpt: null
            }
            : item
        )
      );
      return;
    }

    try {
      const res = await productService.getById(Number(productId));
      const targetProd = res.data;
      setItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
              ...item,
              product_id: Number(productId),
              selectedProduct: targetProd,
              selectedProductOpt: opt || {
                value: productId,
                label: targetProd ? `${targetProd.code} - ${targetProd.name}` : String(productId),
                badge: targetProd?.unit
              }
            }
            : item
        )
      );
    } catch (err) {
      console.error('Error loading selected product details:', err);
    }
  };

  const handleItemFieldChange = (
    index: number,
    field: 'doc_quantity' | 'actual_quantity' | 'price',
    rawVal: string | number
  ) => {
    let numVal: number | '' = '';
    if (typeof rawVal === 'number') {
      numVal = isNaN(rawVal) || rawVal < 0 ? '' : rawVal;
    } else {
      const cleanStr = rawVal.replace(/[^0-9.]/g, '');
      if (cleanStr === '') {
        numVal = '';
      } else {
        const parsed = parseFloat(cleanStr);
        numVal = isNaN(parsed) || parsed < 0 ? '' : parsed;
      }
    }

    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const actualQty = field === 'actual_quantity' ? (numVal === '' ? 0 : Number(numVal)) : (item.actual_quantity === '' ? 0 : Number(item.actual_quantity));
        const price = field === 'price' ? (numVal === '' ? 0 : Number(numVal)) : (item.price === '' ? 0 : Number(item.price));
        return {
          ...item,
          [field]: numVal,
          total_amount: actualQty * price
        };
      })
    );
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total_amount, 0);

  const handleResetForm = () => {
    setVoucherCode('');
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setSupplierId(null);
    setSelectedSupplierOpt(null);
    setDepartmentId(null);
    setSelectedDepartmentOpt(null);
    setWarehouseId(null);
    setSelectedWarehouseOpt(null);
    setDelivererName('');
    setDebitAccount('');
    setCreditAccount('');
    setRefDocType('');
    setRefDocNo('');
    setRefDocDate('');
    setAttachedDocs('');
    setItems([
      {
        id: `row-${Date.now()}`,
        product_id: null,
        selectedProduct: undefined,
        selectedProductOpt: null,
        doc_quantity: '',
        actual_quantity: '',
        price: '',
        total_amount: 0
      }
    ]);
  };

  // ==================== QUICK CREATE CALLBACKS ====================
  const handleSupplierCreated = (supplier: Supplier) => {
    setSupplierId(supplier.id);
    setSelectedSupplierOpt({
      value: supplier.id,
      label: supplier.name,
      badge: 'Đơn vị'
    });
    showNotification('success', `Đã tạo nhanh nhà cung cấp "${supplier.name}" và chọn vào phiếu!`);
  };

  const handleDepartmentCreated = (department: Department) => {
    setDepartmentId(department.id);
    setSelectedDepartmentOpt({
      value: department.id,
      label: department.name,
      badge: 'Phòng ban'
    });
    showNotification('success', `Đã tạo nhanh phòng ban "${department.name}" và chọn vào phiếu!`);
  };

  const handleWarehouseCreated = (warehouse: Warehouse) => {
    setWarehouseId(warehouse.id);
    setSelectedWarehouseOpt({
      value: warehouse.id,
      label: `${warehouse.name} (${warehouse.code})`,
      subLabel: warehouse.location ? `Vị trí: ${warehouse.location}` : undefined,
      badge: 'Kho'
    });
    showNotification('success', `Đã tạo nhanh kho bãi "${warehouse.name}" và chọn vào phiếu!`);
  };

  const handleProductCreated = (product: Product) => {
    const rowIndex = quickProduct.rowIndex;
    handleProductChange(rowIndex, product.id, {
      value: product.id,
      label: `${product.code} - ${product.name}`,
      subLabel: `QC: ${product.specifications || 'N/A'} | Hiệu: ${product.brand || 'N/A'}`,
      badge: product.unit
    });
    showNotification('success', `Đã tạo nhanh mặt hàng "${product.name}" và gắn vào dòng ${rowIndex + 1}!`);
  };

  // ==================== SUBMIT FORM ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!voucherCode.trim()) {
      showNotification('error', 'Vui lòng nhập Số phiếu nhập kho');
      return;
    }

    if (!warehouseId) {
      showNotification('error', 'Vui lòng chọn Kho nhập hàng');
      return;
    }

    if (items.some((item) => !item.product_id)) {
      showNotification('error', 'Vui lòng chọn đầy đủ Vật tư / Hàng hóa cho tất cả các dòng');
      return;
    }

    if (items.some((item) => !item.actual_quantity || Number(item.actual_quantity) <= 0)) {
      showNotification('error', 'Vui lòng nhập Số lượng thực nhập lớn hơn 0 cho tất cả các dòng');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        voucher_code: voucherCode.trim(),
        receipt_date: receiptDate ? new Date(receiptDate).toISOString() : undefined,
        supplier_id: supplierId,
        department_id: departmentId,
        warehouse_id: warehouseId,
        deliverer_name: delivererName.trim() || undefined,
        debit_account: debitAccount.trim() || undefined,
        credit_account: creditAccount.trim() || undefined,
        ref_document_type: refDocType.trim() || undefined,
        ref_document_no: refDocNo.trim() || undefined,
        ref_document_date: refDocDate ? new Date(refDocDate).toISOString() : undefined,
        attached_docs: attachedDocs.trim() || undefined,
        status: 'COMPLETED' as const,
        items: items.map((item) => ({
          product_id: item.product_id!,
          doc_quantity: Number(item.doc_quantity) || 0,
          actual_quantity: Number(item.actual_quantity) || 0,
          price: Number(item.price) || 0,
          total_amount: item.total_amount
        }))
      };

      const res = await receiptService.create(payload);

      if (res.success) {
        showNotification(
          'success',
          `Lập phiếu nhập kho ${voucherCode} thành công!`,
          true
        );
        handleResetForm();
      }
    } catch (err: any) {
      console.error('Error submitting receipt voucher:', err);
      showNotification('error', err?.message || 'Có lỗi xảy ra khi lưu phiếu nhập kho. Vui lòng kiểm tra lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 flex items-center justify-between shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700">
              <Hospital className="w-4 h-4" />
            </span>
            Lập Phiếu Nhập Kho Vật Tư & Dược Phẩm (Mẫu 01-VT)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Hệ thống quản lý vật tư y tế VIMES</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={APP_PATHS.RECEIPTS.ROOT}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileCheck className="w-3.5 h-3.5 text-cyan-600" />}
            >
              Xem Danh Sách Phiếu
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-6 max-w-[1480px] w-full mx-auto space-y-6">
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 shadow-md border animate-in fade-in slide-in-from-top-3 duration-200 ${notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{notification.message}</span>
                {notification.showViewLink && (
                  <Link
                    href={APP_PATHS.RECEIPTS.ROOT}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                  >
                    <span>Xem danh sách</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
                    <FileText className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">PHIẾU NHẬP KHO VẬT TƯ & HÀNG HÓA</h2>
                    <p className="text-xs text-slate-500">
                      Mẫu số: 01 - VT (Ban hành theo Thông tư BTC chuẩn Bộ Y Tế)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleResetForm}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Làm Mới
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Lưu & Hoàn Tất
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {/* Dòng 1 */}
              <Input
                label="Số phiếu nhập"
                required
                placeholder="Ví dụ: PNK-2026/08-001"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
              />

              <Input
                label="Ngày lập phiếu"
                type="date"
                required
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
              />

              <ComboBox
                label="Đơn vị"
                required
                placeholder="-- Tìm & chọn đơn vị --"
                searchPlaceholder="Tìm kiếm nhà cung cấp..."
                fetchOptions={fetchSuppliers}
                initialOption={selectedSupplierOpt}
                value={supplierId}
                onChange={(val, opt) => {
                  setSupplierId(val);
                  setSelectedSupplierOpt(opt || null);
                }}
                onCreateNew={(search) => setQuickSupplier({ open: true, initialName: search })}
                createButtonLabel="Thêm mới Đơn vị / NCC"
                allowClear
              />

              <ComboBox
                label="Phòng ban"
                required
                placeholder="-- Tìm & chọn phòng ban --"
                searchPlaceholder="Tìm kiếm phòng ban..."
                fetchOptions={fetchDepartments}
                initialOption={selectedDepartmentOpt}
                value={departmentId}
                onChange={(val, opt) => {
                  setDepartmentId(val);
                  setSelectedDepartmentOpt(opt || null);
                }}
                onCreateNew={(search) => setQuickDepartment({ open: true, initialName: search })}
                createButtonLabel="Thêm mới Phòng ban / Khoa"
                allowClear
              />

              {/* Dòng 2 */}
              <Input
                label="Họ tên người giao hàng"
                required
                placeholder="Ví dụ: Nguyễn Văn A"
                value={delivererName}
                onChange={(e) => setDelivererName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />

              <div>
                <ComboBox
                  label="Nhập tại kho"
                  required
                  placeholder="-- Tìm & chọn kho nhập --"
                  searchPlaceholder="Tìm kiếm kho bãi..."
                  fetchOptions={fetchWarehouses}
                  initialOption={selectedWarehouseOpt}
                  value={warehouseId}
                  onChange={(val, opt) => {
                    setWarehouseId(val);
                    setSelectedWarehouseOpt(opt || null);
                  }}
                  onCreateNew={(search) => setQuickWarehouse({ open: true, initialName: search })}
                  createButtonLabel="Thêm mới Kho bãi"
                  allowClear
                />
                {selectedWarehouseOpt?.subLabel && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-lg w-fit animate-in fade-in slide-in-from-top-1 duration-150">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-medium">{selectedWarehouseOpt.subLabel}</span>
                  </div>
                )}
              </div>

              <Input
                label="Tài khoản Nợ"
                required
                placeholder="152, 156..."
                value={debitAccount}
                onChange={(e) => setDebitAccount(e.target.value)}
                leftIcon={<CreditCard className="w-4 h-4" />}
              />

              <Input
                label="Tài khoản Có"
                required
                placeholder="331, 111, 112..."
                value={creditAccount}
                onChange={(e) => setCreditAccount(e.target.value)}
                leftIcon={<CreditCard className="w-4 h-4" />}
              />

              {/* Dòng 3 */}
              <Input
                label="Theo"
                required
                placeholder="Hóa đơn GTGT, Phiếu xuất kho..."
                value={refDocType}
                onChange={(e) => setRefDocType(e.target.value)}
                leftIcon={<FileText className="w-4 h-4" />}
              />

              <Input
                label="Số"
                required
                placeholder="Ví dụ: 0098421"
                value={refDocNo}
                onChange={(e) => setRefDocNo(e.target.value)}
              />

              <Input
                label="Ngày chứng từ gốc"
                type="date"
                required
                value={refDocDate}
                onChange={(e) => setRefDocDate(e.target.value)}
              />

              <Input
                label="Số chứng từ gốc kèm theo"
                required
                placeholder="Ví dụ: 01 bản HĐ đỏ, 01 biên bản..."
                value={attachedDocs}
                onChange={(e) => setAttachedDocs(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                  <Package className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-800">Danh mục Vật tư & Hàng hóa Thực nhập</h2>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Thêm Dòng Hàng
              </Button>
            </div>

            <div className="mt-4 overflow-visible">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3 min-w-[320px]">Tên, Quy cách, Nhãn hiệu vật tư</th>
                    <th className="py-3 px-3 w-24 text-center">ĐVT</th>
                    <th className="py-3 px-3 w-32 text-right">SL Chứng từ</th>
                    <th className="py-3 px-3 w-32 text-right">
                      SL Thực nhập <span className="text-rose-500">*</span>
                    </th>
                    <th className="py-3 px-3 w-40 text-right">Đơn giá (VNĐ)</th>
                    <th className="py-3 px-3 w-44 text-right">Thành tiền (VNĐ)</th>
                    <th className="py-3 px-3 w-12 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {items.map((item, index) => {
                    const prod = item.selectedProduct;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors relative"
                        style={{ zIndex: items.length - index }}
                      >
                        <td className="py-3 px-3 text-center text-xs font-semibold text-slate-400">
                          {index + 1}
                        </td>

                        <td className="py-3 px-3 relative min-w-[320px]">
                          <ComboBox
                            placeholder="-- Tìm & chọn vật tư / thuốc --"
                            searchPlaceholder="Tìm mã hoặc tên thuốc/vật tư..."
                            fetchOptions={fetchProducts}
                            initialOption={item.selectedProductOpt}
                            value={item.product_id}
                            onChange={(val, opt) => handleProductChange(index, val, opt)}
                            onCreateNew={(search) =>
                              setQuickProduct({ open: true, rowIndex: index, initialName: search })
                            }
                            createButtonLabel="Thêm mới Vật tư / Dược phẩm"
                            className="w-full"
                            allowClear
                          />
                          {prod && (
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                              {prod.brand && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  Hiệu: {prod.brand}
                                </span>
                              )}
                              {prod.specifications && (
                                <span className="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700">
                                  QC: {prod.specifications}
                                </span>
                              )}
                              {prod.quality && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                                  {prod.quality}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="inline-block px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
                            {prod?.unit || '-'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full text-right bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20"
                            value={item.doc_quantity}
                            onChange={(e) =>
                              handleItemFieldChange(index, 'doc_quantity', e.target.value)
                            }
                          />
                        </td>

                        <td className="py-3 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full text-right bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-cyan-900 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20"
                            value={item.actual_quantity}
                            onChange={(e) =>
                              handleItemFieldChange(index, 'actual_quantity', e.target.value)
                            }
                          />
                        </td>

                        <td className="py-3 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            placeholder="0"
                            className="w-full text-right bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20"
                            value={item.price}
                            onChange={(e) =>
                              handleItemFieldChange(index, 'price', e.target.value)
                            }
                          />
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(item.total_amount)}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa dòng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-medium">Tổng số tiền viết bằng chữ:</div>
                <div className="text-sm font-bold text-cyan-900 italic">
                  &ldquo;{numberToWords(grandTotal)}&rdquo;
                </div>
              </div>

              <div className="flex items-center gap-6 justify-between md:justify-end">
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Tổng cộng thành tiền:</span>
                  <span className="text-2xl font-black text-cyan-700 tracking-tight">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  leftIcon={<Save className="w-5 h-5" />}
                  className="shadow-md shadow-cyan-600/20"
                >
                  Lưu Phiếu Nhập
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* ==================== QUICK CREATE MODALS ==================== */}
      <QuickCreateSupplierModal
        isOpen={quickSupplier.open}
        initialName={quickSupplier.initialName}
        onClose={() => setQuickSupplier({ open: false, initialName: '' })}
        onSuccess={handleSupplierCreated}
      />

      <QuickCreateDepartmentModal
        isOpen={quickDepartment.open}
        initialName={quickDepartment.initialName}
        onClose={() => setQuickDepartment({ open: false, initialName: '' })}
        onSuccess={handleDepartmentCreated}
      />

      <QuickCreateWarehouseModal
        isOpen={quickWarehouse.open}
        initialName={quickWarehouse.initialName}
        onClose={() => setQuickWarehouse({ open: false, initialName: '' })}
        onSuccess={handleWarehouseCreated}
      />

      <QuickCreateProductModal
        isOpen={quickProduct.open}
        initialName={quickProduct.initialName}
        onClose={() => setQuickProduct({ open: false, rowIndex: 0, initialName: '' })}
        onSuccess={handleProductCreated}
      />
    </>
  );
}
