'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Skeleton, Modal, ConfirmModal, Input, Pagination } from '@/components';
import { useDebounce } from '@/hooks';
import { supplierService, departmentService } from '@/services';
import type { SupplierWithDepartments, Supplier, Department } from '@/types';
import { APP_PATHS } from '@/constants';
import {
  Building2,
  Search,
  RefreshCw,
  Plus,
  AlertCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Users,
  FolderOpen,
  Folder
} from 'lucide-react';
import { toast } from 'sonner';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierWithDepartments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [error, setError] = useState<string | null>(null);

  // Pagination state (default 15 rows)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Expand / Collapse state for Accordion
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Modal Create / Edit Supplier
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<{ name: string; status: string }>({ name: '', status: 'ACTIVE' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Confirm Delete Supplier
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal Create Department under a Supplier
  const [addDeptModal, setAddDeptModal] = useState<{ open: boolean; supplier: Supplier | null }>({
    open: false,
    supplier: null
  });
  const [deptName, setDeptName] = useState('');
  const [isSubmittingDept, setIsSubmittingDept] = useState(false);

  // Fetch Suppliers with Departments from API
  const loadSuppliers = useCallback(async (p = page, size = pageSize, query = debouncedSearch) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await supplierService.getAllWithDepartments({
        search: query.trim() || undefined,
        page: p,
        limit: size
      });
      if (res.data) {
        setSuppliers(res.data);
      }
      if (res.pagination) {
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err: any) {
      console.error('Error loading suppliers with departments:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    loadSuppliers(1, pageSize, debouncedSearch);
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(suppliers.map((s) => s.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Handle Supplier CRUD
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
        toast.success(res.message || 'Cập nhật đơn vị thành công');
      } else {
        const res = await supplierService.create(formData);
        toast.success(res.message || 'Thêm mới đơn vị thành công');
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSupplier) return;
    setIsDeleting(true);
    try {
      const res = await supplierService.delete(deletingSupplier.id);
      toast.success(res.message || 'Xóa đơn vị thành công');
      setDeletingSupplier(null);
      loadSuppliers();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa đơn vị');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Quick Add Department to a Supplier
  const handleAddDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDeptModal.supplier || !deptName.trim()) return;

    setIsSubmittingDept(true);
    try {
      const res = await departmentService.create({
        name: deptName.trim(),
        supplier_id: addDeptModal.supplier.id,
        status: 'ACTIVE'
      });
      toast.success(res.message || `Đã thêm phòng ban "${deptName.trim()}" thuộc ${addDeptModal.supplier.name}`);
      setAddDeptModal({ open: false, supplier: null });
      setDeptName('');
      loadSuppliers();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể thêm phòng ban');
    } finally {
      setIsSubmittingDept(false);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 flex items-center justify-between shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700">
              <Building2 className="w-4 h-4" />
            </span>
            Danh Mục Đơn Vị & Phòng Ban Trực Thuộc
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Sơ đồ phân cấp Ngăn xếp (Cha - Con): 1 Đơn vị quản lý nhiều Phòng ban / Khoa</p>
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
            Thêm Đơn Vị Mới
          </Button>
        </div>
      </header>

      {/* Main Content */}
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
          {/* Top Bar: Search & Expand Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3 max-w-lg w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn vị..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={expandAll}
                className="text-xs text-cyan-700 hover:text-cyan-800 font-medium px-2 py-1 rounded hover:bg-cyan-50 transition-colors cursor-pointer"
              >
                + Mở tất cả
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                - Thu gọn
              </button>
              <span className="text-slate-300">|</span>
              <div className="text-xs text-slate-500 font-medium">
                Tổng số: <span className="font-bold text-slate-800">{total}</span> đơn vị
              </div>
            </div>
          </div>

          {/* Accordion Table List */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4 w-12 text-center"></th>
                  <th className="py-3 px-4 w-14 text-center">STT</th>
                  <th className="py-3 px-4">Tên Đơn Vị / Nhà Cung Cấp</th>
                  <th className="py-3 px-4 w-44">Phòng Ban Trực Thuộc</th>
                  <th className="py-3 px-4 w-32">Trạng Thái</th>
                  <th className="py-3 px-4 w-56 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-4 text-center"><Skeleton className="h-4 w-4 mx-auto" /></td>
                      <td className="py-3.5 px-4 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-64" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-28 ml-auto" /></td>
                    </tr>
                  ))
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      Không tìm thấy đơn vị nào phù hợp
                    </td>
                  </tr>
                ) : (
                  suppliers.map((item, index) => {
                    const isExpanded = expandedIds.has(item.id);
                    const deptCount = item.departments?.length || 0;

                    return (
                      <React.Fragment key={item.id}>
                        {/* Parent Row: Supplier */}
                        <tr
                          className={`hover:bg-cyan-50/40 transition-colors cursor-pointer ${
                            isExpanded ? 'bg-cyan-50/30' : ''
                          }`}
                          onClick={() => toggleExpand(item.id)}
                        >
                          <td className="py-3 px-4 text-center text-slate-400">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-cyan-700 mx-auto" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400 mx-auto" />
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-medium text-slate-500">
                            {(page - 1) * pageSize + index + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="p-1 rounded bg-slate-100 text-slate-600">
                                <Building2 className="w-4 h-4" />
                              </span>
                              <span className="font-bold text-slate-900">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                deptCount > 0
                                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              <Users className="w-3 h-3 text-cyan-600" />
                              {deptCount > 0 ? `${deptCount} phòng ban` : 'Chưa có phòng ban'}
                            </span>
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
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setAddDeptModal({ open: true, supplier: item })}
                                className="p-1.5 text-cyan-700 hover:bg-cyan-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap"
                                title="Thêm phòng ban trực thuộc"
                              >
                                <Plus className="w-3.5 h-3.5" /> Thêm Khoa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                                title="Chỉnh sửa đơn vị"
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

                        {/* Child Rows: Sub-Departments Accordion Dropdown */}
                        {isExpanded && (
                          <tr className="bg-slate-50/70 border-b border-slate-200/80">
                            <td colSpan={6} className="py-3 px-4 pl-14">
                              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <FolderOpen className="w-3.5 h-3.5 text-cyan-600" />
                                    Danh sách Phòng Ban / Khoa thuộc "{item.name}"
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setAddDeptModal({ open: true, supplier: item })}
                                    leftIcon={<Plus className="w-3 h-3" />}
                                  >
                                    Thêm Phòng Ban Mới
                                  </Button>
                                </div>

                                {deptCount === 0 ? (
                                  <div className="py-4 text-center text-slate-400 text-xs italic">
                                    Đơn vị này chưa gán phòng ban trực thuộc nào. Bấm nút "+ Thêm Phòng Ban Mới" để tạo nhanh!
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                                    {item.departments.map((dept) => (
                                      <div
                                        key={dept.id}
                                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-cyan-200 hover:shadow-2xs transition-all"
                                      >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <Users className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                          <span className="font-medium text-slate-800 text-xs truncate">
                                            {dept.name}
                                          </span>
                                        </div>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                                          ACTIVE
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
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

      {/* Modal Create / Edit Supplier */}
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

      {/* Modal Quick Add Department under Supplier */}
      <Modal
        isOpen={addDeptModal.open}
        onClose={() => setAddDeptModal({ open: false, supplier: null })}
        title="Thêm Phòng Ban / Khoa Mới"
        subtitle={addDeptModal.supplier ? `Đơn vị trực thuộc: ${addDeptModal.supplier.name}` : ''}
      >
        <form onSubmit={handleAddDeptSubmit} className="space-y-4">
          <Input
            label="Tên Phòng Ban / Khoa"
            required
            placeholder="Ví dụ: Khoa Cấp Cứu - Hồi Sức Tích Cực"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddDeptModal({ open: false, supplier: null })}
              disabled={isSubmittingDept}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingDept}
            >
              Tạo & Gán Vào Đơn Vị
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
