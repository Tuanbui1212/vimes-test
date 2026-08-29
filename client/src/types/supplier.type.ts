import type { Department } from './department.type';

export interface Supplier {
  id: number;
  name: string;
  status?: string;
}

export interface SupplierWithDepartments extends Supplier {
  departments: Department[];
}
