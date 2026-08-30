'use client';

import React from 'react';
import { Loader2, Sparkles, FileCheck } from 'lucide-react';

export interface LoadingOverlayProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isOpen,
  title = 'Đang xử lý dữ liệu...',
  message = 'Hệ thống đang đồng bộ và hạch toán dữ liệu y tế, vui lòng chờ trong giây lát.'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-100 shadow-2xl flex flex-col items-center text-center space-y-4 relative overflow-hidden">
        {/* Animated Top Gradient Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 animate-pulse" />

        {/* Floating Glowing Icon */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
          </span>
        </div>

        {/* Title & Message */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
        </div>

        {/* Connection Status Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold border border-cyan-200/80">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-600 shrink-0" />
          <span>Đang kết nối máy chủ SQL</span>
        </div>
      </div>
    </div>
  );
};
