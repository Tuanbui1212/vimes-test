'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FilePlus2,
  FileCheck,
  Package,
  Warehouse,
  Building2,
  Users,
  Hospital,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { APP_PATHS } from '@/constants';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: controlledCollapsed,
  onToggleCollapse
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const pathname = usePathname();

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const menuGroups: MenuGroup[] = [
    {
      group: 'QUẢN LÝ NHẬP XUẤT',
      items: [
        {
          path: APP_PATHS.HOME,
          label: 'Lập Phiếu Nhập Kho',
          icon: <FilePlus2 className="w-5 h-5 shrink-0" />,
        },
        {
          path: APP_PATHS.RECEIPTS.ROOT,
          label: 'Lịch Sử Phiếu Nhập',
          icon: <FileCheck className="w-5 h-5 shrink-0" />
        }
      ]
    },
    {
      group: 'DANH MỤC HỆ THỐNG',
      items: [
        {
          path: APP_PATHS.PRODUCTS.ROOT,
          label: 'Vật Tư & Hàng Hóa',
          icon: <Package className="w-5 h-5 shrink-0" />
        },
        {
          path: APP_PATHS.WAREHOUSES.ROOT,
          label: 'Kho Bãi',
          icon: <Warehouse className="w-5 h-5 shrink-0" />
        },
        {
          path: APP_PATHS.SUPPLIERS.ROOT,
          label: 'Nhà Cung Cấp',
          icon: <Building2 className="w-5 h-5 shrink-0" />
        },
        {
          path: APP_PATHS.DEPARTMENTS.ROOT,
          label: 'Đơn Vị / Phòng Ban',
          icon: <Users className="w-5 h-5 shrink-0" />
        }
      ]
    }
  ];

  return (
    <aside
      className={`bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      <div
        className={`p-4 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'
          }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
            <Hospital className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">VIMES</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  HIS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Quản Lý Kho Dược</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const isActive =
                pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3 py-2.5'
                    } rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed &&
                    (item.badge ? (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-cyan-400'
                          }`}
                      >
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                    ) : null)}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div
        className={`p-4 border-t border-slate-800 bg-slate-950/40 ${isCollapsed ? 'flex justify-center' : ''
          }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          {!isCollapsed && (
            <div className="overflow-hidden text-[11px]">
              <div className="text-slate-300 font-medium truncate">Máy chủ: Sẵn sàng</div>
              <div className="text-slate-500 text-[10px]">VIMES v2.5</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
