-- Migration 04: Add ref_document_type column to receipt_vouchers
ALTER TABLE receipt_vouchers 
ADD COLUMN IF NOT EXISTS ref_document_type VARCHAR(100);
