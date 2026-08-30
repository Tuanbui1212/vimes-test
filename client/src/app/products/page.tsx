'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Skeleton, Modal, ConfirmModal, Input, Pagination, LoadingOverlay } from '@/components';
import { useDebounce } from '@/hooks';
import { productService } from '@/services';
import type { Product } from '@/types';
import { APP_PATHS } from '@/constants';
import { Package, Search, RefreshCw, Plus, AlertCircle, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [error, setError] = useState<string | null>(null);

  // Pagination state (default 24 rows)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal Create / Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    brand: string;
    specifications: string;
    quality: string;
    category_type: string;
    unit: string;
    status: string;
  }>({
    code: '',
    name: '',
    brand: '',
    specifications: '',
    quality: 'Mới 100%',
    category_type: 'Vật tư tiêu hao',
    unit: 'Hộp',
    status: 'ACTIVE'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm Delete state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = useCallback(async (p = page, size = pageSize, query = debouncedSearch) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productService.getAll({
        search: query.trim() || undefined,
        page: p,
        limit: size
      });
      if (res.data) setProducts(res.data);
      if (res.pagination) {
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    loadProducts(1, pageSize, debouncedSearch);
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      code: '',
      name: '',
      brand: '',
      specifications: '',
      quality: 'Mới 100%',
      category_type: 'Vật tư tiêu hao',
      unit: 'Hộp',
      status: 'ACTIVE'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      code: p.code,
      name: p.name,
      brand: p.brand || '',
      specifications: p.specifications || '',
      quality: p.quality || 'Mới 100%',
      category_type: p.category_type || 'Vật tư tiêu hao',
      unit: p.unit,
      status: p.status || 'ACTIVE'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = 'Mã vật tư/dược phẩm không được để trống';
    } else if (formData.code.length > 50) {
      errors.code = 'Mã vật tư không được vượt quá 50 ký tự';
    }

    if (!formData.name.trim()) {
      errors.name = 'Tên vật tư/dược phẩm không được để trống';
    } else if (formData.name.length > 255) {
      errors.name = 'Tên vật tư không được vượt quá 255 ký tự';
    }

    if (!formData.unit.trim()) {
      errors.unit = 'Đơn vị tính không được để trống';
    } else if (formData.unit.length > 50) {
      errors.unit = 'Đơn vị tính không được vượt quá 50 ký tự';
    }

    if (!formData.brand.trim()) {
      errors.brand = 'Nhãn hiệu/Hãng SX không được để trống';
    } else if (formData.brand.length > 255) {
      errors.brand = 'Nhãn hiệu không được vượt quá 255 ký tự';
    }

    if (!formData.specifications.trim()) {
      errors.specifications = 'Quy cách đóng gói không được để trống';
    } else if (formData.specifications.length > 255) {
      errors.specifications = 'Quy cách không được vượt quá 255 ký tự';
    }

    if (!formData.quality.trim()) {
      errors.quality = 'Phẩm chất không được để trống';
    }

    if (!formData.category_type.trim()) {
      errors.category_type = 'Loại hàng hóa không được để trống';
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
      toast.warning('Vui lòng kiểm tra và điền đầy đủ các trường bắt buộc (đang báo viền đỏ)!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        const res = await productService.update(editingProduct.id, formData);
        toast.success(res.message || 'Cập nhật vật tư thành công');
      } else {
        const res = await productService.create(formData);
        toast.success(res.message || 'Thêm mới vật tư thành công');
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      const res = await productService.delete(deletingProduct.id);
      toast.success(res.message || 'Xóa vật tư thành công');
      setDeletingProduct(null);
      loadProducts();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xóa vật tư');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = products.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.code.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      (p.brand && p.brand.toLowerCase().includes(term)) ||
      (p.specifications && p.specifications.toLowerCase().includes(term)) ||
      (p.category_type && p.category_type.toLowerCase().includes(term))
    );
  });

  return (
    <>

      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 flex items-center justify-between shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700">
              <Package className="w-4 h-4" />
            </span>
            Danh Mục Vật Tư & Dược Phẩm
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý toàn bộ danh sách thuốc, hóa chất và thiết bị y tế</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadProducts()}
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
            Thêm Vật Tư / Thuốc
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
            <Button variant="secondary" size="sm" onClick={() => loadProducts()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
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
                placeholder="Tìm mã, tên thuốc, nhãn hiệu, quy cách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 transition-all"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Tổng số: <span className="font-bold text-slate-800">{total}</span> mặt hàng
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4 w-14 text-center">STT</th>
                  <th className="py-3 px-4 w-28">Mã VT</th>
                  <th className="py-3 px-4">Tên Vật Tư / Dược Phẩm</th>
                  <th className="py-3 px-4 w-24">Đơn Vị</th>
                  <th className="py-3 px-4">Quy Cách & Nhãn Hiệu</th>
                  <th className="py-3 px-4 w-32">Phân Loại</th>
                  <th className="py-3 px-4 w-32">Trạng Thái</th>
                  <th className="py-3 px-4 w-24 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-4 text-center"><Skeleton className="h-4 w-6 mx-auto" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-48" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3.5 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Không tìm thấy vật tư nào phù hợp
                    </td>
                  </tr>
                ) : (
                  products.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-500">
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-cyan-800">{item.code}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{item.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                          {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {item.specifications || item.brand ? (
                          <span>{[item.brand, item.specifications].filter(Boolean).join(' - ')}</span>
                        ) : (
                          <span className="text-slate-300 italic">--</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.category_type || 'Chưa phân loại'}
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
                            onClick={() => setDeletingProduct(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa vật tư"
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
              loadProducts(newPage, pageSize, searchTerm);
            }}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
              loadProducts(1, newSize, searchTerm);
            }}
          />
        </div>
      </main>

      {/* Modal Create / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Chỉnh Sửa Vật Tư / Dược Phẩm' : 'Thêm Mới Vật Tư / Dược Phẩm'}
        subtitle={editingProduct ? `ID: #${editingProduct.id}` : 'Nhập thông tin danh mục thuốc & vật tư y tế'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mã Vật Tư / Dược Phẩm"
              required
              placeholder="Ví dụ: THUOC_001, GANG_TAY_Y_TE"
              value={formData.code}
              error={formErrors.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
            />

            <Input
              label="Đơn Vị Tính"
              required
              placeholder="Ví dụ: Hộp, Chai, Lọ, Gói, Viên, Cái..."
              value={formData.unit}
              error={formErrors.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
            />
          </div>

          <Input
            label="Tên Vật Tư / Dược Phẩm"
            required
            placeholder="Ví dụ: Paracetamol 500mg, Bơm tiêm vô trùng 5ml"
            value={formData.name}
            error={formErrors.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nhãn Hiệu / Hãng SX"
              required
              placeholder="Ví dụ: Dược Hậu Giang, B.Braun..."
              value={formData.brand}
              error={formErrors.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
            />

            <Input
              label="Quy Cách Đóng Gói"
              required
              placeholder="Ví dụ: Hộp 10 vỉ x 10 viên"
              value={formData.specifications}
              error={formErrors.specifications}
              onChange={(e) => handleInputChange('specifications', e.target.value)}
            />
          </div>

          <div className={`grid grid-cols-1 ${editingProduct ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phân Loại <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                value={formData.category_type}
                onChange={(e) => handleInputChange('category_type', e.target.value)}
                className={`w-full text-xs bg-slate-50 border rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                  formErrors.category_type
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20'
                    : 'border-slate-200 focus:border-cyan-600 focus:ring-cyan-600/20'
                }`}
              >
                <option value="Thuốc">Thuốc</option>
                <option value="Vật tư tiêu hao">Vật tư tiêu hao</option>
                <option value="Hóa chất">Hóa chất</option>
                <option value="Thiết bị y tế">Thiết bị y tế</option>
              </select>
              {formErrors.category_type && (
                <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                  {formErrors.category_type}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phẩm Chất <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                value={formData.quality}
                onChange={(e) => handleInputChange('quality', e.target.value)}
                className={`w-full text-xs bg-slate-50 border rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
                  formErrors.quality
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20'
                    : 'border-slate-200 focus:border-cyan-600 focus:ring-cyan-600/20'
                }`}
              >
                <option value="Mới 100%">Mới 100%</option>
                <option value="Tốt">Tốt</option>
                <option value="Trung bình">Trung bình</option>
              </select>
              {formErrors.quality && (
                <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                  {formErrors.quality}
                </span>
              )}
            </div>

            {editingProduct && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng Thái Hoạt Động
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20"
                >
                  <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
                  <option value="INACTIVE">INACTIVE (Ngưng hoạt động)</option>
                </select>
              </div>
            )}
          </div>

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
              {editingProduct ? 'Lưu Thay Đổi' : 'Thêm Mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác Nhận Xóa Vật Tư / Dược Phẩm"
        message={`Bạn có chắc chắn muốn xóa mặt hàng "${deletingProduct?.name}" (${deletingProduct?.code})? Hệ thống sẽ tự động kiểm tra: nếu đã từng phát sinh trong phiếu nhập kho sẽ được chuyển sang xóa mềm (ngưng sử dụng), nếu chưa dùng sẽ được xóa hoàn toàn.`}
        confirmText="Xác Nhận Xóa"
        isLoading={isDeleting}
      />

      <LoadingOverlay
        isOpen={isSubmitting || isDeleting}
        title="Đang lưu danh mục vật tư..."
        message="Hệ thống đang cập nhật danh mục dược phẩm và vật tư y tế, vui lòng chờ trong giây lát."
      />
    </>
  );
}
