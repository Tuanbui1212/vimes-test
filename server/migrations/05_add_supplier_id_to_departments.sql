ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_departments_supplier_id ON departments(supplier_id);

UPDATE departments 
SET supplier_id = (SELECT id FROM suppliers ORDER BY id ASC LIMIT 1 OFFSET 0) 
WHERE id % 5 = 1 AND supplier_id IS NULL;

UPDATE departments 
SET supplier_id = (SELECT id FROM suppliers ORDER BY id ASC LIMIT 1 OFFSET 1) 
WHERE id % 5 = 2 AND supplier_id IS NULL;

UPDATE departments 
SET supplier_id = (SELECT id FROM suppliers ORDER BY id ASC LIMIT 1 OFFSET 2) 
WHERE id % 5 = 3 AND supplier_id IS NULL;

UPDATE departments 
SET supplier_id = (SELECT id FROM suppliers ORDER BY id ASC LIMIT 1 OFFSET 3) 
WHERE id % 5 = 4 AND supplier_id IS NULL;

UPDATE departments 
SET supplier_id = (SELECT id FROM suppliers ORDER BY id ASC LIMIT 1 OFFSET 4) 
WHERE id % 5 = 0 AND supplier_id IS NULL;
