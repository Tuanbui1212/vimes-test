export interface Product {
  id: number;
  code: string;
  name: string;
  brand?: string;
  specifications?: string;
  quality?: string;
  category_type?: string;
  unit: string;
}
