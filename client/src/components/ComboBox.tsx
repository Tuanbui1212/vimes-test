'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Search, X, Plus, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks';

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
  options?: ComboBoxOption[];
  value?: string | number | null;
  onChange: (value: any, option?: ComboBoxOption) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;

  // Async search & pagination props
  fetchOptions?: (
    search: string,
    page: number
  ) => Promise<{ options: ComboBoxOption[]; total: number; hasMore: boolean }>;
  initialOption?: ComboBoxOption | null;

  // Quick Create props
  onCreateNew?: (searchTerm: string) => void;
  createButtonLabel?: string;
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
  className = '',
  fetchOptions,
  initialOption,
  onCreateNew,
  createButtonLabel = 'Thêm mới'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [asyncOptions, setAsyncOptions] = useState<ComboBoxOption[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<ComboBoxOption | null>(initialOption || null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const isAsync = !!fetchOptions;

  // Keep selected option synchronized
  useEffect(() => {
    if (initialOption && (!selectedOpt || selectedOpt.value !== initialOption.value)) {
      setSelectedOpt(initialOption);
    }
  }, [initialOption]);

  // If static options, find selected option
  useEffect(() => {
    if (!isAsync) {
      const found = options.find((opt) => String(opt.value) === String(value));
      if (found) {
        setSelectedOpt(found);
      } else if (!value) {
        setSelectedOpt(null);
      }
    }
  }, [options, value, isAsync]);

  // Load first page of options when opened or when debouncedSearch changes
  const loadInitialAsyncOptions = useCallback(async (query: string) => {
    if (!fetchOptions) return;
    setIsLoading(true);
    try {
      const res = await fetchOptions(query, 1);
      setAsyncOptions(res.options);
      setTotal(res.total);
      setHasMore(res.hasMore);
      setPage(1);
    } catch (err) {
      console.error('Error fetching async combobox options:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchOptions]);

  // Trigger initial fetch when dropdown is opened or search changes
  useEffect(() => {
    if (isOpen && isAsync) {
      loadInitialAsyncOptions(debouncedSearch);
    }
  }, [isOpen, debouncedSearch, isAsync, loadInitialAsyncOptions]);

  // Load next page on scroll
  const loadMoreAsyncOptions = async () => {
    if (!fetchOptions || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetchOptions(debouncedSearch, nextPage);
      setAsyncOptions((prev) => {
        // Prevent duplicate keys
        const existingValues = new Set(prev.map((item) => String(item.value)));
        const newUnique = res.options.filter((item) => !existingValues.has(String(item.value)));
        return [...prev, ...newUnique];
      });
      setTotal(res.total);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more options on scroll:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Scroll event listener for infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isAsync) return;
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 30) {
      loadMoreAsyncOptions();
    }
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (option: ComboBoxOption) => {
    setSelectedOpt(option);
    onChange(option.value, option);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOpt(null);
    onChange(null);
  };

  // Static options filtering
  const filteredStaticOptions = !isAsync
    ? options.filter((opt) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          opt.label.toLowerCase().includes(term) ||
          (opt.subLabel && opt.subLabel.toLowerCase().includes(term)) ||
          (opt.badge && opt.badge.toLowerCase().includes(term))
        );
      })
    : [];

  const displayOptions = isAsync ? asyncOptions : filteredStaticOptions;

  return (
    <div
      className={`w-full flex flex-col gap-1.5 relative ${isOpen ? 'z-50' : 'z-10'} ${className}`}
      ref={containerRef}
    >
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
          {selectedOpt ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium text-slate-800 truncate">{selectedOpt.label}</span>
              {selectedOpt.badge && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 shrink-0">
                  {selectedOpt.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-2">
          {allowClear && selectedOpt && !disabled && (
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
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 text-cyan-600 animate-spin shrink-0 ml-1" />
            ) : (
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            )}
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

          <div
            ref={listContainerRef}
            onScroll={handleScroll}
            className="max-h-60 overflow-y-auto p-1 text-sm space-y-0.5"
          >
            {isLoading && displayOptions.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : displayOptions.length > 0 ? (
              <>
                {displayOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <div
                      key={opt.value}
                      onClick={() => handleSelect(opt)}
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

                      {isSelected && <Check className="w-4 h-4 text-cyan-600 shrink-0" />}
                    </div>
                  );
                })}

                {isLoadingMore && (
                  <div className="py-2 flex items-center justify-center gap-1.5 text-xs text-slate-400 bg-slate-50 rounded-lg">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-600" />
                    <span>Đang tải thêm dữ liệu...</span>
                  </div>
                )}

                {isAsync && total > 0 && (
                  <div className="pt-1 pb-0.5 px-2 text-[10px] text-center text-slate-400 border-t border-slate-100">
                    Hiển thị {displayOptions.length} / {total} mục (kéo xuống để xem thêm)
                  </div>
                )}
              </>
            ) : (
              <div className="py-5 text-center text-xs text-slate-400 space-y-1">
                <p>Không tìm thấy kết quả phù hợp</p>
                {searchTerm && onCreateNew && (
                  <p className="text-[11px] text-slate-500">
                    Bạn có muốn tạo mới mục <span className="font-semibold text-slate-700">&ldquo;{searchTerm}&rdquo;</span>?
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Create Action at bottom of dropdown */}
          {onCreateNew && (
            <div className="p-1.5 border-t border-slate-100 bg-slate-50/80">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onCreateNew(searchTerm);
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:text-cyan-800 bg-cyan-50/80 hover:bg-cyan-100/80 rounded-lg border border-cyan-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {searchTerm ? `Thêm nhanh "${searchTerm}"` : createButtonLabel}
                </span>
              </button>
            </div>
          )}
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
