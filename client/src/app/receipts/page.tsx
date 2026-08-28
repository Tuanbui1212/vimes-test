'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Skeleton, Pagination, ReceiptVoucherPreviewModal } from '@/components';
import { useDebounce } from '@/hooks';
import { receiptService } from '@/services';
import type { ReceiptVoucher } from '@/types';
import { formatCurrency } from '@/utils/format';
import { APP_PATHS } from '@/constants';
import {
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
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [selectedReceiptDetail, setSelectedReceiptDetail] = useState<ReceiptVoucher | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination state (default 24 rows)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

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
    if (!debouncedSearch) return true;
    const term = debouncedSearch.toLowerCase();
    return (
      r.voucher_code.toLowerCase().includes(term) ||
      (r.supplier_name && r.supplier_name.toLowerCase().includes(term)) ||
      (r.department_name && r.department_name.toLowerCase().includes(term)) ||
      (r.warehouse_name && r.warehouse_name.toLowerCase().includes(term)) ||
      (r.deliverer_name && r.deliverer_name.toLowerCase().includes(term))
    );
  });

  const totalPages = Math.ceil(filteredReceipts.length / pageSize) || 1;
  const paginatedReceipts = filteredReceipts.slice((page - 1) * pageSize, page * pageSize);

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

      <main className="p-6 max-w-[1480px] w-full mx-auto space-y-6">
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 shadow-md border ${notification.type === 'success'
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
                placeholder="Tìm theo số phiếu, đơn vị, kho, phòng ban..."
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
                  <th className="py-3 px-4">Đơn Vị</th>
                  <th className="py-3 px-4">Phòng Ban / Kho</th>
                  <th className="py-3 px-4">Người Giao</th>
                  <th className="py-3 px-4 text-right">Tổng Tiền</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`skeleton-row-${idx}`} className="animate-pulse">
                      <td className="py-4 px-4 text-center">
                        <Skeleton className="h-4 w-6 mx-auto" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-36" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Skeleton className="h-4 w-24 ml-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Skeleton className="h-8 w-16 mx-auto rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : paginatedReceipts.length > 0 ? (
                  paginatedReceipts.map((r, index) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center text-xs text-slate-400 font-semibold">
                        {(page - 1) * pageSize + index + 1}
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
                      Không tìm thấy phiếu nhập kho nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls with 4 Navigation Buttons (<<, <, >, >>) */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredReceipts.length}
            pageSize={pageSize}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        </div>

        {/* Modal Xem chi tiết Phiếu Nhập Kho (Mẫu số 01 - VT) */}
        <ReceiptVoucherPreviewModal
          isOpen={!!selectedReceiptDetail}
          onClose={() => setSelectedReceiptDetail(null)}
          receipt={selectedReceiptDetail}
        />

      </main>
    </>
  );
}
