'use client';

import React from 'react';
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 24,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [12, 24, 48, 96],
  className = ''
}) => {
  // Tự động ẩn thanh phân trang nếu tổng số bản ghi nhỏ hơn hoặc bằng số dòng/trang
  if (currentPage === 1 && totalItems <= pageSize) {
    return null;
  }

  const safeTotalPages = Math.max(1, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (safeTotalPages <= maxVisible) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', safeTotalPages);
      } else if (currentPage >= safeTotalPages - 2) {
        pages.push(1, '...', safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', safeTotalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white border-t border-slate-200 text-xs text-slate-600 ${className}`}
    >
      {/* Left: Record summary & Page size selector */}
      <div className="flex items-center gap-3">
        <span>
          Hiển thị <span className="font-semibold text-slate-900">{startItem}</span> -{' '}
          <span className="font-semibold text-slate-900">{endItem}</span> trên{' '}
          <span className="font-semibold text-slate-900">{totalItems}</span> bản ghi
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span className="text-slate-500">Số dòng:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-cyan-600 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: 4 Nav Buttons (<<, <, >, >>) + Page numbers */}
      <div className="flex items-center gap-1 select-none">
        {/* 1. ĐẨY LÊN ĐẦU (FIRST PAGE) */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="Trang đầu tiên"
          className={`p-1.5 rounded-lg border transition-colors ${currentPage <= 1
              ? 'text-slate-300 border-slate-100 cursor-not-allowed bg-slate-50'
              : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-cyan-700 cursor-pointer bg-white'
            }`}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* 2. VỀ TRƯỚC (PREVIOUS PAGE) */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Trang trước"
          className={`p-1.5 rounded-lg border transition-colors ${currentPage <= 1
              ? 'text-slate-300 border-slate-100 cursor-not-allowed bg-slate-50'
              : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-cyan-700 cursor-pointer bg-white'
            }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Number Pills */}
        <div className="hidden sm:flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400">
                  ...
                </span>
              );
            }

            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(Number(p))}
                className={`min-w-[30px] h-[30px] px-2 rounded-lg text-xs font-semibold transition-colors ${isCurrent
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 bg-white'
                  }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Mobile current page indicator */}
        <span className="sm:hidden px-2 font-medium text-slate-700">
          {currentPage} / {safeTotalPages}
        </span>

        {/* 3. SANG TIẾP (NEXT PAGE) */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= safeTotalPages}
          title="Trang tiếp theo"
          className={`p-1.5 rounded-lg border transition-colors ${currentPage >= safeTotalPages
              ? 'text-slate-300 border-slate-100 cursor-not-allowed bg-slate-50'
              : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-cyan-700 cursor-pointer bg-white'
            }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* 4. XUỐNG CUỐI (LAST PAGE) */}
        <button
          type="button"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={currentPage >= safeTotalPages}
          title="Trang cuối cùng"
          className={`p-1.5 rounded-lg border transition-colors ${currentPage >= safeTotalPages
              ? 'text-slate-300 border-slate-100 cursor-not-allowed bg-slate-50'
              : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-cyan-700 cursor-pointer bg-white'
            }`}
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
