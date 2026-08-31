CREATE TABLE IF NOT EXISTS receipt_voucher_counters (
    year INTEGER PRIMARY KEY,
    last_number INTEGER NOT NULL DEFAULT 0
);

INSERT INTO receipt_voucher_counters (year, last_number)
SELECT 
    CAST(SUBSTRING(voucher_code FROM '^PNK-([0-9]{4})-[0-9]+$') AS INTEGER) AS year,
    MAX(CAST(SUBSTRING(voucher_code FROM '^PNK-[0-9]{4}-([0-9]+)$') AS INTEGER)) AS last_number
FROM receipt_vouchers
WHERE voucher_code ~ '^PNK-[0-9]{4}-[0-9]+$'
GROUP BY SUBSTRING(voucher_code FROM '^PNK-([0-9]{4})-[0-9]+$')
ON CONFLICT (year) 
DO UPDATE SET last_number = GREATEST(receipt_voucher_counters.last_number, EXCLUDED.last_number);
