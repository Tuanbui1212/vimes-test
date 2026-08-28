import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rounded' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  width,
  height,
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'rounded-md h-4 w-full',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
    rectangular: 'rounded-none'
  };

  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] ${variantStyles[variant]} ${className}`}
      style={{
        width,
        height,
        ...style
      }}
      {...props}
    />
  );
};

export const SkeletonInput: React.FC<{ label?: boolean; className?: string }> = ({
  label = true,
  className = ''
}) => (
  <div className={`flex flex-col gap-1.5 w-full ${className}`}>
    {label && <Skeleton variant="text" className="w-24 h-3.5 mb-1" />}
    <Skeleton variant="rounded" className="w-full h-9.5" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 4,
  columns = 7
}) => (
  <div className="w-full space-y-3">
    {/* Header Skeleton */}
    <div className="flex gap-4 p-3 bg-slate-50 border-y border-slate-200">
      {Array.from({ length: columns }).map((_, idx) => (
        <Skeleton key={`th-${idx}`} className="h-4 flex-1" />
      ))}
    </div>

    {/* Body Rows Skeleton */}
    {Array.from({ length: rows }).map((_, rIdx) => (
      <div key={`tr-${rIdx}`} className="flex gap-4 p-3.5 border-b border-slate-100 items-center">
        {Array.from({ length: columns }).map((_, cIdx) => (
          <Skeleton
            key={`td-${rIdx}-${cIdx}`}
            className={`h-4 ${cIdx === 0 ? 'w-8' : cIdx === 1 ? 'flex-2' : 'flex-1'}`}
          />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 rounded-2xl border border-slate-200 bg-white space-y-4 ${className}`}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonInput key={i} />
      ))}
    </div>
  </div>
);
