'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Skeleton, Toast, Modal, ConfirmModal, Input, Pagination } from '@/components';
import { useDebounce } from '@/hooks';
import { supplierService } from '@/services';
import type { Supplier } from '@/types';
import { APP_PATHS } from '@/constants';
import { Building2, Search, RefreshCw, Plus, AlertCircle, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [error, setError] = useState<string | null>(null);

  // Pagination state (default 24 rows)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);

  // Modal Create / Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<{ name: string; status: string }>({ name: '', status: 'ACTIVE' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm Delete state
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSuppliers = useCallback(async (p = page, size = pageSize, query = debouncedSearch) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await supplierService.getAll({
        search: query.trim() || undefined,
        page: p,
        limit: size
      });
      if (res.data) setSuppliers(res.data);
      if (res.pagination) {
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err: any) {
      console.error('Error loading suppliers:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    loadSuppliers(1, pageSize, debouncedSearch);
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({ name: '', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({ name: supplier.name, status: supplier.status || 'ACTIVE' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingSupplier) {
        const res = await supplierService.update(editingSupplier.id, formData);
        setToast({ type: 'success', message: res.message || 'Cập nhật đơn vị thành công' });
      } else {
        const res = await supplierService.create(formData);
        setToast({ type: 'success', message: res.message || 'Thêm mới đơn vị thành công' });
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Có lỗi xảy ra khi lưu dữ liệu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSupplier) return;
    setIsDeleting(true);
    try {
      const res = await supplierService.delete(deletingSupplier.id);
      setToast({ type: 'success', message: res.message || 'Xóa đơn vị thành công' });
      setDeletingSupplier(null);
      loadSuppliers();
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Không thể xóa đơn vị' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = suppliers.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term);
  });

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 flex items-center justify-between shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700">
              <Building2 className="w-4 h-4" />
            </span>
            Danh Mục Đơn Vị
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý danh sách các đơn vị giao hàng và đối tác</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadSuppliers()}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Tải Lại
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Thêm Đơn Vị
          </Button>
          <Link href={APP_PATHS.HOME}>
            <Button variant="outline" size="sm">
              Lập Phiếu Nhập
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-6 max-w-[1480px] w-full mx-auto space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => loadSuppliers()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Thử Lại
            </Button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên đơn vị..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 transition-all"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Tổng số: <span className="font-bold text-slate-800">{total}</span> đơn vị
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4 w-14 text-center">STT</th>
                  <th className="py-3 px-4">Tên Đơn Vị / Nhà Cung Cấp</th>
                  <th className="py-3 px-4 w-36">Trạng Thái</th>
                  <th className="py-3 px-4 w-28 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-4 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-64" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Không tìm thấy đơn vị nào phù hợp
                    </td>
                  </tr>
                ) : (
                  suppliers.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-500">
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{item.name}</td>
                      <td className="py-3 px-4">
                        {item.status === 'ACTIVE' || !item.status ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Đang dùng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <XCircle className="w-3 h-3" /> Ngưng dùng
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingSupplier(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa đơn vị"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls with 4 Navigation Buttons (<<, <, >, >>) */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={(newPage) => {
              setPage(newPage);
              loadSuppliers(newPage, pageSize, searchTerm);
            }}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
              loadSuppliers(1, newSize, searchTerm);
            }}
          />
        </div>
      </main>

      {/* Modal Create / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Chỉnh Sửa Đơn Vị' : 'Thêm Mới Đơn Vị'}
        subtitle={editingSupplier ? `ID: #${editingSupplier.id}` : 'Nhập thông tin đơn vị đối tác'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên Đơn Vị / Nhà Cung Cấp"
            required
            placeholder="Ví dụ: Công ty Dược phẩm TW1"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          {editingSupplier && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng Thái Hoạt Động
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20"
              >
                <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
                <option value="INACTIVE">INACTIVE (Ngưng hoạt động)</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {editingSupplier ? 'Lưu Thay Đổi' : 'Thêm Mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác Nhận Xóa Đơn Vị"
        message={`Bạn có chắc chắn muốn xóa đơn vị "${deletingSupplier?.name}"? Hệ thống sẽ tự động kiểm tra: nếu đã từng phát sinh phiếu nhập sẽ được chuyển sang xóa mềm (ngưng hoạt động), nếu chưa dùng sẽ được xóa hoàn toàn.`}
        confirmText="Xác Nhận Xóa"
        isLoading={isDeleting}
      />
    </>
  );
}
