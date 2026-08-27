export const APP_PATHS = {
  HOME: '/',
  RECEIPTS: {
    ROOT: '/receipts',
    CREATE: '/receipts/create',
    LIST: '/receipts/list',
    DETAIL: (id: string | number) => `/receipts/${id}`,
  },
  PRODUCTS: {
    ROOT: '/products',
    LIST: '/products/list',
    DETAIL: (id: string | number) => `/products/${id}`,
  },
  WAREHOUSES: {
    ROOT: '/warehouses',
    LIST: '/warehouses/list',
  },
  SUPPLIERS: {
    ROOT: '/suppliers',
    LIST: '/suppliers/list',
  },
  DEPARTMENTS: {
    ROOT: '/departments',
    LIST: '/departments/list',
  },
} as const;
