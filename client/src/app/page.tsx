'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Button,
  Input,
  ComboBox,
  type ComboBoxOption
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
  ArrowRight
} from 'lucide-react';

interface FormRowItem {
  id: string;
  product_id: number | null;
  selectedProduct?: Product;
  doc_quantity: number;
  actual_quantity: number;
  price: number;
  total_amount: number;
}

export default function CreateReceiptPage() {
  // Master Data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Form State
  const [voucherCode, setVoucherCode] = useState(
    `PNK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(
      Math.floor(Math.random() * 900) + 100
    )}`
  );
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [delivererName, setDelivererName] = useState('');
  const [debitAccount, setDebitAccount] = useState('152');
  const [creditAccount, setCreditAccount] = useState('331');
  const [refDocNo, setRefDocNo] = useState('');
  const [refDocDate, setRefDocDate] = useState('');
  const [attachedDocs, setAttachedDocs] = useState('01 bản Hóa đơn GTGT');

  // Form Item Rows
  const [items, setItems] = useState<FormRowItem[]>([
    {
      id: 'row-1',
      product_id: null,
      doc_quantity: 1,
      actual_quantity: 1,
      price: 0,
      total_amount: 0
    }
  ]);

  // Status & Notifications
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    showViewLink?: boolean;
  } | null>(null);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    setIsLoadingMasterData(true);
    try {
      const [supRes, depRes, whRes, prodRes] = await Promise.all([
        supplierService.getAll(),
        departmentService.getAll(),
        warehouseService.getAll(),
        productService.getAll()
      ]);

      if (supRes.data) setSuppliers(supRes.data);
      if (depRes.data) setDepartments(depRes.data);
      if (whRes.data) {
        setWarehouses(whRes.data);
        if (whRes.data.length > 0) setWarehouseId(whRes.data[0].id);
      }
      if (prodRes.data) setProducts(prodRes.data);
    } catch (err) {
      console.error('Error loading master data:', err);
      showNotification('error', 'Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra lại!');
    } finally {
      setIsLoadingMasterData(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string, showViewLink = false) => {
    setNotification({ type, message, showViewLink });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const supplierOptions: ComboBoxOption[] = suppliers.map((s) => ({
    value: s.id,
    label: s.name,
    badge: 'NCC'
  }));

  const departmentOptions: ComboBoxOption[] = departments.map((d) => ({
    value: d.id,
    label: d.name,
    badge: 'Bộ phận'
  }));

  const warehouseOptions: ComboBoxOption[] = warehouses.map((w) => ({
    value: w.id,
    label: `${w.name} (${w.code})`,
    subLabel: w.location,
    badge: 'Kho'
  }));

  const productOptions: ComboBoxOption[] = products.map((p) => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
    subLabel: `QC: ${p.specifications || 'N/A'} | Hiệu: ${p.brand || 'N/A'}`,
    badge: p.unit
  }));

  const handleAddItem = () => {
    const newRow: FormRowItem = {
      id: `row-${Date.now()}`,
      product_id: null,
      doc_quantity: 1,
      actual_quantity: 1,
      price: 0,
      total_amount: 0
    };
    setItems([...items, newRow]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      showNotification('error', 'Phiếu nhập phải có ít nhất 1 mặt hàng');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: number | null) => {
    const updated = [...items];
    const targetProd = products.find((p) => p.id === productId);
    updated[index].product_id = productId;
    updated[index].selectedProduct = targetProd;
    setItems(updated);
  };

  const handleItemFieldChange = (
    index: number,
    field: 'doc_quantity' | 'actual_quantity' | 'price',
    val: number
  ) => {
    const updated = [...items];
    const numVal = isNaN(val) || val < 0 ? 0 : val;
    updated[index][field] = numVal;

    const actualQty = field === 'actual_quantity' ? numVal : updated[index].actual_quantity;
    const price = field === 'price' ? numVal : updated[index].price;
    updated[index].total_amount = actualQty * price;

    setItems(updated);
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total_amount, 0);

  const handleResetForm = () => {
    setVoucherCode(
      `PNK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(
        Math.floor(Math.random() * 900) + 100
      )}`
    );
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setSupplierId(null);
    setDepartmentId(null);
    setDelivererName('');
    setDebitAccount('152');
    setCreditAccount('331');
    setRefDocNo('');
    setRefDocDate('');
    setAttachedDocs('01 bản Hóa đơn GTGT');
    setItems([
      {
        id: `row-${Date.now()}`,
        product_id: null,
        doc_quantity: 1,
        actual_quantity: 1,
        price: 0,
        total_amount: 0
      }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!voucherCode.trim()) {
      showNotification('error', 'Vui lòng nhập Mã số phiếu nhập');
      return;
    }

    if (items.some((item) => !item.product_id)) {
      showNotification('error', 'Vui lòng chọn đầy đủ Vật tư / Hàng hóa cho tất cả các dòng');
      return;
    }

    if (items.some((item) => item.actual_quantity <= 0)) {
      showNotification('error', 'Số lượng thực nhập phải lớn hơn 0');
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
        ref_document_no: refDocNo.trim() || undefined,
        ref_document_date: refDocDate ? new Date(refDocDate).toISOString() : undefined,
        attached_docs: attachedDocs.trim() || undefined,
        status: 'COMPLETED' as const,
        items: items.map((item) => ({
          product_id: item.product_id!,
          doc_quantity: Number(item.doc_quantity),
          actual_quantity: Number(item.actual_quantity),
          price: Number(item.price),
          total_amount: Number(item.total_amount)
        }))
      };

      const res = await receiptService.create(payload);

      if (res.success) {
        showNotification(
          'success',
          `Đã lưu thành công Phiếu nhập kho: ${voucherCode}!`,
          true
        );
        handleResetForm();
      } else {
        showNotification('error', res.message || 'Lỗi khi lưu phiếu nhập');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      showNotification('error', err.message || 'Lỗi kết nối khi gửi dữ liệu lên máy chủ');
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

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 shadow-md border animate-in fade-in slide-in-from-top-3 duration-200 ${
              notification.type === 'success'
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
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
                    <FileText className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">PHIẾU NHẬP KHO VẬT TƯ & HÀNG HÓA</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Input
                label="Số phiếu nhập"
                required
                placeholder="Mã phiếu..."
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                leftIcon={<Hash className="w-4 h-4" />}
              />

              <Input
                label="Ngày tháng lập phiếu"
                type="date"
                required
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
              />

              <ComboBox
                label="Nhà cung cấp"
                placeholder="-- Chọn Nhà Cung Cấp --"
                searchPlaceholder="Tìm tên nhà cung cấp..."
                options={supplierOptions}
                value={supplierId}
                onChange={setSupplierId}
                allowClear
              />

              <ComboBox
                label="Đơn vị / Bộ phận yêu cầu"
                placeholder="-- Chọn Đơn Vị / Phòng Ban --"
                searchPlaceholder="Tìm tên phòng ban..."
                options={departmentOptions}
                value={departmentId}
                onChange={setDepartmentId}
                allowClear
              />

              <ComboBox
                label="Nhập tại kho"
                required
                placeholder="-- Chọn Kho Nhập --"
                searchPlaceholder="Tìm kiếm kho..."
                options={warehouseOptions}
                value={warehouseId}
                onChange={setWarehouseId}
              />

              <Input
                label="Họ tên người giao hàng"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={delivererName}
                onChange={(e) => setDelivererName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Tài khoản Nợ"
                placeholder="152, 156..."
                value={debitAccount}
                onChange={(e) => setDebitAccount(e.target.value)}
                leftIcon={<CreditCard className="w-4 h-4" />}
              />

              <Input
                label="Tài khoản Có"
                placeholder="331, 111..."
                value={creditAccount}
                onChange={(e) => setCreditAccount(e.target.value)}
                leftIcon={<CreditCard className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
              <Input
                label="Theo chứng từ số"
                placeholder="Số hóa đơn / Lệnh giao hàng..."
                value={refDocNo}
                onChange={(e) => setRefDocNo(e.target.value)}
              />

              <Input
                label="Ngày chứng từ gốc"
                type="date"
                value={refDocDate}
                onChange={(e) => setRefDocDate(e.target.value)}
              />

              <Input
                label="Số chứng từ gốc kèm theo"
                placeholder="Ví dụ: 01 bản Hóa đơn GTGT..."
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

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3 min-w-[280px]">Tên, Quy cách, Nhãn hiệu vật tư</th>
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
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center text-xs font-semibold text-slate-400">
                          {index + 1}
                        </td>

                        <td className="py-3 px-3">
                          <ComboBox
                            placeholder="-- Chọn vật tư / hàng hóa --"
                            searchPlaceholder="Tìm mã hoặc tên thuốc/vật tư..."
                            options={productOptions}
                            value={item.product_id}
                            onChange={(val) => handleProductChange(index, val)}
                            className="w-full"
                          />
                          {prod && (
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                              {prod.brand && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                  Hiệu: {prod.brand}
                                </span>
                              )}
                              {prod.specifications && (
                                <span className="px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700">
                                  QC: {prod.specifications}
                                </span>
                              )}
                              {prod.quality && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700">
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
                            className="w-full text-right bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20"
                            value={item.doc_quantity}
                            onChange={(e) =>
                              handleItemFieldChange(index, 'doc_quantity', parseFloat(e.target.value))
                            }
                          />
                        </td>

                        <td className="py-3 px-3 text-right">
                          <input
                            type="number"
                            min="1"
                            className="w-full text-right bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-cyan-900 focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20"
                            value={item.actual_quantity}
                            onChange={(e) =>
                              handleItemFieldChange(index, 'actual_quantity', parseFloat(e.target.value))
                            }
                          />
                        </td>

                        <td className="py-3 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            className="w-full text-right bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20"
                            value={item.price}
                            onChange={(e) =>
                              handleItemFieldChange(index, 'price', parseFloat(e.target.value))
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
                  "{numberToWords(grandTotal)}"
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
    </>
  );
}
