'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ReceiptVoucher } from '@/types';
import { formatCurrency, numberToWords } from '@/utils/format';
import { Button } from './Button';

interface ReceiptVoucherPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptVoucher | null;
}

export function ReceiptVoucherPreviewModal({
  isOpen,
  onClose,
  receipt
}: ReceiptVoucherPreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !receipt) return null;

  const receiptDateObj = receipt.receipt_date ? new Date(receipt.receipt_date) : new Date();
  const day = receiptDateObj.getDate().toString().padStart(2, '0');
  const month = (receiptDateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = receiptDateObj.getFullYear();

  const formatDocDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto"
      >
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Xem Chi Tiết Phiếu Nhập Kho (Mẫu số 01 - VT)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Paper Styled Form */}
        <div className="p-6 sm:p-8 overflow-y-auto font-sans text-slate-900 text-sm leading-relaxed bg-white select-text">
          {/* Top Form Header */}
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="space-y-1">
              <p className="font-semibold text-slate-800 font-sans text-xs">
                Đơn vị: <span className="font-normal">Bệnh viện / Cơ sở Y tế</span>
              </p>
              <p className="font-semibold text-slate-800 font-sans text-xs">
                Bộ phận:{' '}
                <span className="font-normal text-slate-700">
                  {receipt.department_name || '...................................................'}
                </span>
              </p>
            </div>

            <div className="text-center font-sans text-xs">
              <p className="font-bold text-slate-900">Mẫu số 01 - VT</p>
              <p className="italic text-slate-600 text-[11px]">
                (Ban hành theo Thông tư số 200/2014/TT-BTC
              </p>
              <p className="italic text-slate-600 text-[11px]">
                ngày 22/12/2014 của Bộ Tài chính)
              </p>
            </div>
          </div>

          {/* Title & Voucher Info */}
          <div className="text-center my-4 relative">
            <h2 className="text-xl sm:text-2xl font-bold tracking-wide font-sans text-slate-950">
              PHIẾU NHẬP KHO
            </h2>
            <p className="italic text-slate-700 text-xs mt-1">
              Ngày {day} tháng {month} năm {year}
            </p>
            <p className="text-xs text-slate-800 font-medium font-sans mt-0.5">
              Số: <span className="font-bold">{receipt.voucher_code}</span>
            </p>

            {/* Debit / Credit Accounts */}
            <div className="sm:absolute right-0 top-0 text-right text-xs font-sans mt-2 sm:mt-0">
              <p className="text-slate-800">
                Nợ: <span className="font-semibold">{receipt.debit_account || '................'}</span>
              </p>
              <p className="text-slate-800">
                Có: <span className="font-semibold">{receipt.credit_account || '................'}</span>
              </p>
            </div>
          </div>

          {/* Narrative / Context details */}
          <div className="space-y-2 text-xs sm:text-sm my-5 text-slate-800">
            <div className="flex flex-wrap gap-x-2">
              <span>- Họ và tên người giao hàng:</span>
              <span className="font-semibold text-slate-950">
                {receipt.deliverer_name || '................................................................................................................................'}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-2">
              <span>- Theo</span>
              <span className="font-medium">
                {receipt.ref_document_type || 'chứng từ'}
              </span>
              <span>số:</span>
              <span className="font-semibold text-slate-950">
                {receipt.ref_document_no || '........................'}
              </span>
              <span>ngày</span>
              <span className="font-semibold text-slate-950">
                {formatDocDate(receipt.ref_document_date) || '... / ... / ......'}
              </span>
              <span>của</span>
              <span className="font-semibold text-slate-950">
                {receipt.supplier_name || '........................................................................................................................'}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-4">
              <div className="flex gap-x-1">
                <span>Nhập tại kho:</span>
                <span className="font-semibold text-slate-950">
                  {receipt.warehouse_name || '....................................................'}
                </span>
              </div>
              <div className="flex gap-x-1">
                <span>địa điểm:</span>
                <span className="font-semibold text-slate-950">
                  {receipt.warehouse_location || '........................................................................'}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table (Mẫu 01 - VT 2-tiered Table) */}
          <div className="overflow-x-auto my-5">
            <table className="w-full text-left border-collapse border border-slate-900 text-xs sm:text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-900 text-center font-bold font-sans">
                  <th rowSpan={2} className="border border-slate-900 p-2 w-10">
                    STT
                  </th>
                  <th rowSpan={2} className="border border-slate-900 p-2 min-w-[200px]">
                    Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ sản phẩm, hàng hóa
                  </th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-20">
                    Mã số
                  </th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-14">
                    ĐVT
                  </th>
                  <th colSpan={2} className="border border-slate-900 p-1.5">
                    Số lượng
                  </th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-24 text-right">
                    Đơn giá
                  </th>
                  <th rowSpan={2} className="border border-slate-900 p-2 w-28 text-right">
                    Thành tiền
                  </th>
                </tr>
                <tr className="bg-slate-50 text-slate-900 text-center font-semibold font-sans">
                  <th className="border border-slate-900 p-1.5 w-18">Theo CT</th>
                  <th className="border border-slate-900 p-1.5 w-18">Thực nhập</th>
                </tr>
                {/* Column identifiers row (A, B, C, D, 1, 2, 3, 4) */}
                <tr className="bg-slate-100 text-slate-700 text-center italic text-[11px] font-sans">
                  <td className="border border-slate-900 py-0.5">A</td>
                  <td className="border border-slate-900 py-0.5">B</td>
                  <td className="border border-slate-900 py-0.5">C</td>
                  <td className="border border-slate-900 py-0.5">D</td>
                  <td className="border border-slate-900 py-0.5">1</td>
                  <td className="border border-slate-900 py-0.5">2</td>
                  <td className="border border-slate-900 py-0.5">3</td>
                  <td className="border border-slate-900 py-0.5">4</td>
                </tr>
              </thead>
              <tbody>
                {receipt.items && receipt.items.length > 0 ? (
                  receipt.items.map((item, idx) => {
                    const fullDesc = [
                      item.product_name,
                      item.brand ? `[${item.brand}]` : '',
                      item.specifications ? `(${item.specifications})` : '',
                      item.quality ? `[${item.quality}]` : ''
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="border border-slate-900 p-2 text-center font-sans">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-900 p-2 font-medium text-slate-950">
                          {fullDesc || '-'}
                        </td>
                        <td className="border border-slate-900 p-2 text-center font-mono font-medium text-slate-800">
                          {item.product_code || '-'}
                        </td>
                        <td className="border border-slate-900 p-2 text-center">
                          {item.unit || '-'}
                        </td>
                        <td className="border border-slate-900 p-2 text-right font-sans">
                          {item.doc_quantity}
                        </td>
                        <td className="border border-slate-900 p-2 text-right font-bold font-sans text-slate-950">
                          {item.actual_quantity}
                        </td>
                        <td className="border border-slate-900 p-2 text-right font-sans">
                          {formatCurrency(Number(item.price))}
                        </td>
                        <td className="border border-slate-900 p-2 text-right font-bold font-sans text-slate-950">
                          {formatCurrency(Number(item.total_amount))}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="border border-slate-900 p-4 text-center text-slate-400 italic">
                      Không có mặt hàng nào
                    </td>
                  </tr>
                )}

                {/* Tổng cộng Row */}
                <tr className="font-bold bg-slate-50 font-sans">
                  <td className="border border-slate-900 p-2 text-center"></td>
                  <td className="border border-slate-900 p-2 text-left uppercase">
                    Cộng
                  </td>
                  <td className="border border-slate-900 p-2 text-center">x</td>
                  <td className="border border-slate-900 p-2 text-center">x</td>
                  <td className="border border-slate-900 p-2 text-center">x</td>
                  <td className="border border-slate-900 p-2 text-center">x</td>
                  <td className="border border-slate-900 p-2 text-center">x</td>
                  <td className="border border-slate-900 p-2 text-right text-slate-950">
                    {formatCurrency(Number(receipt.total_amount || 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="space-y-2 text-xs sm:text-sm my-4 text-slate-900">
            <p>
              - Tổng số tiền (viết bằng chữ):{' '}
              <span className="font-semibold italic text-slate-950">
                {numberToWords(Number(receipt.total_amount || 0))}
              </span>
            </p>
            <p>
              - Số chứng từ gốc kèm theo:{' '}
              <span className="font-medium text-slate-800">
                {receipt.attached_docs || '..................................................................................................................'}
              </span>
            </p>
          </div>

          {/* Date & 4 Signatures Blocks */}
          <div className="mt-6 font-sans">
            <div className="text-right italic text-xs text-slate-700 mb-2">
              Ngày {day} tháng {month} năm {year}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-950">Người lập phiếu</p>
                <p className="italic text-slate-500 text-[11px]">(Ký, họ tên)</p>
                <div className="h-16"></div>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-950">Người giao hàng</p>
                <p className="italic text-slate-500 text-[11px]">(Ký, họ tên)</p>
                <div className="h-16 flex items-end justify-center">
                  {receipt.deliverer_name && (
                    <span className="font-semibold text-slate-900">{receipt.deliverer_name}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-950">Thủ kho</p>
                <p className="italic text-slate-500 text-[11px]">(Ký, họ tên)</p>
                <div className="h-16"></div>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-950">Kế toán trưởng</p>
                <p className="italic text-slate-500 text-[11px]">
                  (Hoặc bộ phận có nhu cầu nhập)
                </p>
                <p className="italic text-slate-500 text-[11px]">(Ký, họ tên)</p>
                <div className="h-12"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions - ONLY Đóng Button */}
        <div className="p-2 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end rounded-b-2xl">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
