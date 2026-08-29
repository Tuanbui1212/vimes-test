'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { supplierService, departmentService, warehouseService, productService } from '@/services';
import type { Supplier, Department, Warehouse, Product } from '@/types';

// ==================== 1. QUICK CREATE SUPPLIER ====================
export interface QuickCreateSupplierProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (supplier: Supplier) => void;
  initialName?: string;
}

export const QuickCreateSupplierModal: React.FC<QuickCreateSupplierProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialName = ''
}) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setError(null);
    }
  }, [isOpen, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tên đơn vị / nhà cung cấp không được để trống');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await supplierService.create({ name: name.trim(), status: 'ACTIVE' });
      if (res.data) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể thêm mới nhà cung cấp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Nhanh Nhà Cung Cấp"
      subtitle="Thêm nhanh đơn vị và tự động chọn vào phiếu nhập"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên Đơn Vị / Nhà Cung Cấp"
          required
          placeholder="Nhập tên nhà cung cấp..."
          value={name}
          error={error || undefined}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Lưu & Chọn Ngay
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ==================== 2. QUICK CREATE DEPARTMENT ====================
export interface QuickCreateDepartmentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (department: Department) => void;
  initialName?: string;
  supplierId?: number | null;
}

export const QuickCreateDepartmentModal: React.FC<QuickCreateDepartmentProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialName = '',
  supplierId
}) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setError(null);
    }
  }, [isOpen, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tên khoa / phòng ban không được để trống');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await departmentService.create({ name: name.trim(), supplier_id: supplierId ?? undefined, status: 'ACTIVE' });
      if (res.data) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể thêm mới phòng ban');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Nhanh Phòng Ban / Khoa"
      subtitle="Thêm nhanh đơn vị yêu cầu và tự động chọn vào phiếu"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên Khoa / Phòng Ban"
          required
          placeholder="Nhập tên khoa / phòng ban..."
          value={name}
          error={error || undefined}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Lưu & Chọn Ngay
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ==================== 3. QUICK CREATE WAREHOUSE ====================
export interface QuickCreateWarehouseProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (warehouse: Warehouse) => void;
  initialName?: string;
}

export const QuickCreateWarehouseModal: React.FC<QuickCreateWarehouseProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialName = ''
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState(initialName);
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setCode(initialName ? `KHO_${initialName.replace(/\s+/g, '_').toUpperCase().slice(0, 10)}` : '');
      setLocation('');
      setErrors({});
    }
  }, [isOpen, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!code.trim()) errs.code = 'Mã kho không được để trống';
    if (!name.trim()) errs.name = 'Tên kho không được để trống';
    if (!location.trim()) errs.location = 'Địa điểm không được để trống';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await warehouseService.create({
        code: code.trim(),
        name: name.trim(),
        location: location.trim(),
        status: 'ACTIVE'
      });
      if (res.data) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err: any) {
      setErrors({ form: err?.message || 'Không thể tạo mới kho bãi' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Nhanh Kho Bãi"
      subtitle="Thêm nhanh kho nhập và tự động chọn vào phiếu"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {errors.form}
          </div>
        )}

        <Input
          label="Mã Kho"
          required
          placeholder="Ví dụ: KHO_01, KHO_DUOC"
          value={code}
          error={errors.code}
          onChange={(e) => {
            setCode(e.target.value);
            if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
          }}
        />

        <Input
          label="Tên Kho Bãi"
          required
          placeholder="Ví dụ: Kho Dược Bệnh Viện"
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
        />

        <Input
          label="Vị Trí / Địa Điểm"
          required
          placeholder="Ví dụ: Tầng 1 - Tòa nhà A"
          value={location}
          error={errors.location}
          onChange={(e) => {
            setLocation(e.target.value);
            if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
          }}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Lưu & Chọn Ngay
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ==================== 4. QUICK CREATE PRODUCT ====================
export interface QuickCreateProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
  initialName?: string;
}

export const QuickCreateProductModal: React.FC<QuickCreateProductProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialName = ''
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState(initialName);
  const [unit, setUnit] = useState('Hộp');
  const [brand, setBrand] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [categoryType, setCategoryType] = useState('Thuốc');
  const [quality, setQuality] = useState('Mới 100%');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setCode(initialName ? `VT_${Math.floor(1000 + Math.random() * 9000)}` : '');
      setUnit('Hộp');
      setBrand('N/A');
      setSpecifications('Tiêu chuẩn');
      setCategoryType('Thuốc');
      setQuality('Mới 100%');
      setErrors({});
    }
  }, [isOpen, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!code.trim()) errs.code = 'Mã vật tư không được để trống';
    if (!name.trim()) errs.name = 'Tên vật tư không được để trống';
    if (!unit.trim()) errs.unit = 'Đơn vị tính không được để trống';
    if (!brand.trim()) errs.brand = 'Nhãn hiệu không được để trống';
    if (!specifications.trim()) errs.specifications = 'Quy cách không được để trống';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await productService.create({
        code: code.trim(),
        name: name.trim(),
        unit: unit.trim(),
        brand: brand.trim(),
        specifications: specifications.trim(),
        category_type: categoryType,
        quality: quality,
        status: 'ACTIVE'
      });
      if (res.data) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err: any) {
      setErrors({ form: err?.message || 'Không thể tạo mới vật tư/thuốc' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Nhanh Vật Tư / Dược Phẩm"
      subtitle="Thêm nhanh mặt hàng và tự động gán vào dòng phiếu nhập"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mã Vật Tư / Thuốc"
            required
            placeholder="Ví dụ: VT007, THUOC_01"
            value={code}
            error={errors.code}
            onChange={(e) => {
              setCode(e.target.value);
              if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
            }}
          />

          <Input
            label="Đơn Vị Tính"
            required
            placeholder="Ví dụ: Hộp, Chai, Lọ..."
            value={unit}
            error={errors.unit}
            onChange={(e) => {
              setUnit(e.target.value);
              if (errors.unit) setErrors((prev) => ({ ...prev, unit: '' }));
            }}
          />
        </div>

        <Input
          label="Tên Vật Tư / Dược Phẩm"
          required
          placeholder="Nhập tên thuốc, vật tư..."
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nhãn Hiệu / Hãng SX"
            required
            placeholder="Ví dụ: Dược Hậu Giang..."
            value={brand}
            error={errors.brand}
            onChange={(e) => {
              setBrand(e.target.value);
              if (errors.brand) setErrors((prev) => ({ ...prev, brand: '' }));
            }}
          />

          <Input
            label="Quy Cách Đóng Gói"
            required
            placeholder="Ví dụ: Hộp 10 vỉ x 10 viên"
            value={specifications}
            error={errors.specifications}
            onChange={(e) => {
              setSpecifications(e.target.value);
              if (errors.specifications) setErrors((prev) => ({ ...prev, specifications: '' }));
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phân Loại</label>
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20"
            >
              <option value="Thuốc">Thuốc</option>
              <option value="Vật tư tiêu hao">Vật tư tiêu hao</option>
              <option value="Hóa chất">Hóa chất</option>
              <option value="Thiết bị y tế">Thiết bị y tế</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phẩm Chất</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/20"
            >
              <option value="Mới 100%">Mới 100%</option>
              <option value="Tốt">Tốt</option>
              <option value="Trung bình">Trung bình</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Lưu & Chọn Ngay
          </Button>
        </div>
      </form>
    </Modal>
  );
};
