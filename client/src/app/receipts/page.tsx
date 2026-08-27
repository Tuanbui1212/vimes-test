'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components';
import { receiptService } from '@/services';
import type { ReceiptVoucher } from '@/types';
import { formatCurrency, numberToWords } from '@/utils/format';
import { APP_PATHS } from '@/constants';
import {
  FileText,
  Plus,
  RefreshCw,
  Eye,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck
} from 'lucide-react';

export default function ReceiptsListPage() {
  const [receipts, setReceipts] = useState<ReceiptVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceiptDetail, setSelectedReceiptDetail] = useState<ReceiptVoucher | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    setIsLoading(true);
    try {
      const res = await receiptService.getAll();
      if (res.data) setReceipts(res.data);
    } catch (err) {
      console.error('Error loading receipts:', err);
      setNotification({ type: 'error', message: 'Không thể tải danh sách phiếu nhập kho' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const res = await receiptService.getById(id);
      if (res.data) {
        setSelectedReceiptDetail(res.data);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Không thể lấy chi tiết phiếu' });
    }
  };

  const filteredReceipts = receipts.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.voucher_code.toLowerCase().includes(term) ||
      (r.supplier_name && r.supplier_name.toLowerCase().includes(term)) ||
      (r.department_name && r.department_name.toLowerCase().includes(term)) ||
      (r.warehouse_name && r.warehouse_name.toLowerCase().includes(term)) ||
      (r.deliverer_name && r.deliverer_name.toLowerCase().includes(term))
    );
  });

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 flex items-center justify-between shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700">
              <FileCheck className="w-4 h-4" />
            </span>
            Danh Sách & Lịch Sử Phiếu Nhập Kho
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý toàn bộ các phiếu nhập vật tư và dược phẩm</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadReceipts}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Tải Lại
          </Button>
          <Link href={APP_PATHS.HOME}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Lập Phiếu Mới
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 shadow-md border ${
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
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo số phiếu, nhà cung cấp, kho, phòng ban..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 transition-all"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Tổng số: <span className="font-bold text-slate-800">{filteredReceipts.length}</span> phiếu
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-y border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Số Phiếu</th>
                  <th className="py-3 px-4">Ngày Nhập</th>
                  <th className="py-3 px-4">Nhà Cung Cấp</th>
                  <th className="py-3 px-4">Bộ Phận / Kho</th>
                  <th className="py-3 px-4">Người Giao</th>
                  <th className="py-3 px-4 text-right">Tổng Tiền</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredReceipts.length > 0 ? (
                  filteredReceipts.map((r, index) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center text-xs text-slate-400 font-semibold">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-cyan-800">{r.voucher_code}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {r.receipt_date ? new Date(r.receipt_date).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{r.supplier_name || '-'}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        <div>{r.department_name || '-'}</div>
                        <div className="text-slate-400 font-medium">Kho: {r.warehouse_name || '-'}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{r.deliverer_name || '-'}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(Number(r.total_amount))}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {r.status || 'COMPLETED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewDetail(r.id)}
                          leftIcon={<Eye className="w-3.5 h-3.5 text-cyan-600" />}
                        >
                          Xem
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                      {isLoading ? 'Đang tải dữ liệu...' : 'Không tìm thấy phiếu nhập kho nào.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedReceiptDetail && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
                    <FileText className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Chi Tiết Phiếu Nhập: {selectedReceiptDetail.voucher_code}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ngày lập: {selectedReceiptDetail.receipt_date ? new Date(selectedReceiptDetail.receipt_date).toLocaleDateString('vi-VN') : '-'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceiptDetail(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block">Nhà cung cấp:</span>
                    <span className="font-semibold text-slate-800">{selectedReceiptDetail.supplier_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Đơn vị / Phòng ban:</span>
                    <span className="font-semibold text-slate-800">{selectedReceiptDetail.department_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Kho nhập:</span>
                    <span className="font-semibold text-slate-800">{selectedReceiptDetail.warehouse_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Người giao:</span>
                    <span className="font-semibold text-slate-800">{selectedReceiptDetail.deliverer_name || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Danh sách mặt hàng</h4>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3">Mã - Tên Vật tư</th>
                        <th className="py-2.5 px-3">Quy cách / Nhãn hiệu</th>
                        <th className="py-2.5 px-3 text-center">ĐVT</th>
                        <th className="py-2.5 px-3 text-right">SL Chứng từ</th>
                        <th className="py-2.5 px-3 text-right">SL Thực nhập</th>
                        <th className="py-2.5 px-3 text-right">Đơn giá</th>
                        <th className="py-2.5 px-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedReceiptDetail.items?.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {it.product_code} - {it.product_name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {it.specifications || '-'} / {it.brand || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">{it.unit || '-'}</td>
                          <td className="py-2.5 px-3 text-right">{it.doc_quantity}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-cyan-800">{it.actual_quantity}</td>
                          <td className="py-2.5 px-3 text-right">{formatCurrency(Number(it.price))}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {formatCurrency(Number(it.total_amount))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl bg-cyan-50 border border-cyan-100">
                  <span className="text-xs text-cyan-900 font-medium italic">
                    {numberToWords(Number(selectedReceiptDetail.total_amount))}
                  </span>
                  <div className="text-right">
                    <span className="text-[11px] text-cyan-700 block">Tổng tiền thanh toán:</span>
                    <span className="text-xl font-black text-cyan-800">
                      {formatCurrency(Number(selectedReceiptDetail.total_amount))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <Button variant="secondary" onClick={() => setSelectedReceiptDetail(null)}>
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
