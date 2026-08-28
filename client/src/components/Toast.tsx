'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      bar: 'bg-emerald-500'
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      bar: 'bg-rose-500'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      bar: 'bg-amber-500'
    },
    info: {
      bg: 'bg-cyan-50 border-cyan-200 text-cyan-900',
      icon: <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0" />,
      bar: 'bg-cyan-500'
    }
  }[type];

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-md w-full animate-in slide-in-from-top-4 duration-200 pointer-events-auto">
      <div className={`p-4 rounded-2xl border shadow-2xl flex items-start gap-3 backdrop-blur-md relative overflow-hidden ${config.bg}`}>
        {config.icon}
        <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
          {message}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        <div
          className={`absolute bottom-0 left-0 h-0.5 w-full opacity-40 animate-out ${config.bar}`}
          style={{ animation: `shrink ${duration}ms linear forwards` }}
        />
      </div>
    </div>
  );
};
