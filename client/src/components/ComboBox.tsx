'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface ComboBoxOption {
  value: string | number;
  label: string;
  subLabel?: string;
  badge?: string;
}

export interface ComboBoxProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: ComboBoxOption[];
  value?: string | number | null;
  onChange: (value: any) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  label,
  placeholder = '-- Chọn một mục --',
  searchPlaceholder = 'Tìm kiếm...',
  options = [],
  value,
  onChange,
  error,
  helperText,
  required,
  disabled = false,
  allowClear = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const filteredOptions = options.filter((opt) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      opt.label.toLowerCase().includes(term) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(term)) ||
      (opt.badge && opt.badge.toLowerCase().includes(term))
    );
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
      )}

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-sm bg-white rounded-lg border transition-all duration-150 py-2 px-3 cursor-pointer select-none ${
          disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : ''
        } ${
          error
            ? 'border-rose-400 focus-within:border-rose-500 ring-rose-500/20'
            : isOpen
            ? 'border-cyan-600 ring-2 ring-cyan-600/20'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium text-slate-800 truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 shrink-0">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-2">
          {allowClear && selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-600' : ''}`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder:text-slate-400"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto p-1 text-sm space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-50 text-cyan-900 font-medium'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 truncate pr-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.subLabel && (
                        <span className="text-[11px] text-slate-400 truncate">{opt.subLabel}</span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Không tìm thấy kết quả phù hợp
              </div>
            )}
          </div>
        </div>
      )}

      {error ? (
        <span className="text-xs text-rose-500 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-500">{helperText}</span>
      ) : null}
    </div>
  );
};
