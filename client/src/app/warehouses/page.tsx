'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Skeleton, Toast, Modal, ConfirmModal, Input, Pagination } from '@/components';
import { useDebounce } from '@/hooks';
import { warehouseService } from '@/services';
import type { Warehouse } from '@/types';
import { APP_PATHS } from '@/constants';
import { Warehouse as WarehouseIcon, Search, RefreshCw, Plus, AlertCircle, MapPin, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
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
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<{ code: string; name: string; location: string; status: string }>({
    code: '',
    name: '',
    location: '',
    status: 'ACTIVE'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm Delete state
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadWarehouses = useCallback(async (p = page, size = pageSize, query = debouncedSearch) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await warehouseService.getAll({
        search: query.trim() || undefined,
        page: p,
        limit: size
      });
      if (res.data) setWarehouses(res.data);
      if (res.pagination) {
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err: any) {
      console.error('Error loading warehouses:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    loadWarehouses(1, pageSize, debouncedSearch);
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const handleOpenCreate = () => {
    setEditingWarehouse(null);
    setFormData({ code: '', name: '', location: '', status: 'ACTIVE' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w: Warehouse) => {
    setEditingWarehouse(w);
    setFormData({
      code: w.code,
      name: w.name,
      location: w.location || '',
      status: w.status || 'ACTIVE'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = 'Mã kho không được để trống';
    } else if (formData.code.length > 50) {
      errors.code = 'Mã kho không được vượt quá 50 ký tự';
    }

    if (!formData.name.trim()) {
      errors.name = 'Tên kho không được để trống';
    } else if (formData.name.length > 255) {
      errors.name = 'Tên kho không được vượt quá 255 ký tự';
    }

    if (!formData.location.trim()) {
      errors.location = 'Vị trí / Địa điểm không được để trống';
    } else if (formData.location.length > 255) {
      errors.location = 'Địa điểm không được vượt quá 255 ký tự';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setToast({ 
        type: 'warning', 
        message: 'Vui lòng kiểm tra và điền đầy đủ các trường bắt buộc (đang báo viền đỏ)!' 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingWarehouse) {
        const res = await warehouseService.update(editingWarehouse.id, formData);
        setToast({ type: 'success', message: res.message || 'Cập nhật kho bãi thành công' });
      } else {
        const res = await warehouseService.create(formData);
        setToast({ type: 'success', message: res.message || 'Thêm mới kho bãi thành công' });
      }
      setIsModalOpen(false);
      loadWarehouses();
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Có lỗi xảy ra khi lưu dữ liệu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingWarehouse) return;
    setIsDeleting(true);
    try {
      const res = await warehouseService.delete(deletingWarehouse.id);
      setToast({ type: 'success', message: res.message || 'Xóa kho bãi thành công' });
      setDeletingWarehouse(null);
      loadWarehouses();
    } catch (err: any) {
      setToast({ type: 'error', message: err?.message || 'Không thể xóa kho bãi' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = warehouses.filter((w) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      w.code.toLowerCase().includes(term) ||
      w.name.toLowerCase().includes(term) ||
      (w.location && w.location.toLowerCase().includes(term))
    );
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
              <WarehouseIcon className="w-4 h-4" />
            </span>
            Danh Mục Kho Bãi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý hệ thống kho dược, kho vật tư y tế và địa điểm lưu trữ</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadWarehouses()}
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
            Thêm Kho Bãi
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
            <Button variant="secondary" size="sm" onClick={() => loadWarehouses()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
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
                placeholder="Tìm mã kho, tên kho, vị trí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 transition-all"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Tổng số: <span className="font-bold text-slate-800">{total}</span> kho bãi
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4 w-14 text-center">STT</th>
                  <th className="py-3 px-4 w-28">Mã Kho</th>
                  <th className="py-3 px-4">Tên Kho Bãi</th>
                  <th className="py-3 px-4">Vị Trí / Địa Điểm</th>
                  <th className="py-3 px-4 w-36">Trạng Thái</th>
                  <th className="py-3 px-4 w-28 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-4 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-48" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : warehouses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Không tìm thấy kho bãi nào phù hợp
                    </td>
                  </tr>
                ) : (
                  warehouses.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-500">
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-cyan-800">{item.code}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {item.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {item.location}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">Chưa cập nhật</span>
                        )}
                      </td>
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
                            onClick={() => setDeletingWarehouse(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa kho bãi"
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
              loadWarehouses(newPage, pageSize, searchTerm);
            }}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
              loadWarehouses(1, newSize, searchTerm);
            }}
          />
        </div>
      </main>

      {/* Modal Create / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? 'Chỉnh Sửa Kho Bãi' : 'Thêm Mới Kho Bãi'}
        subtitle={editingWarehouse ? `ID: #${editingWarehouse.id}` : 'Nhập thông tin kho bãi lưu trữ'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mã Kho Bãi"
            required
            placeholder="Ví dụ: KHO_CHINH, KHO_DUOC_01"
            value={formData.code}
            error={formErrors.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
          />

          <Input
            label="Tên Kho Bãi"
            required
            placeholder="Ví dụ: Kho Chẵn Thuốc Bệnh Viện"
            value={formData.name}
            error={formErrors.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />

          <Input
            label="Vị Trí / Địa Điểm"
            required
            placeholder="Ví dụ: Tầng 1 - Tòa nhà A"
            value={formData.location}
            error={formErrors.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />

          {editingWarehouse && (
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
              {editingWarehouse ? 'Lưu Thay Đổi' : 'Thêm Mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingWarehouse}
        onClose={() => setDeletingWarehouse(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác Nhận Xóa Kho Bãi"
        message={`Bạn có chắc chắn muốn xóa kho "${deletingWarehouse?.name}" (${deletingWarehouse?.code})? Hệ thống sẽ tự động kiểm tra: nếu đã từng phát sinh phiếu nhập sẽ được chuyển sang xóa mềm (ngưng hoạt động), nếu chưa dùng sẽ được xóa hoàn toàn.`}
        confirmText="Xác Nhận Xóa"
        isLoading={isDeleting}
      />
    </>
  );
}
