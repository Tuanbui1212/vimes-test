export interface Department {
  id: number;
  name: string;
  supplier_id?: number | null;
  supplier_name?: string;
  status?: string;
}
