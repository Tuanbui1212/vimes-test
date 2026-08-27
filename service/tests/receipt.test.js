import request from 'supertest';
import app from '../src/index';
import { pool } from '../src/config/db';
import { ReceiptService } from '../src/services/receiptService';
// Mock DB pool
jest.mock('../src/config/db', () => {
    const mClient = {
        query: jest.fn(),
        release: jest.fn(),
    };
    return {
        pool: {
            connect: jest.fn(() => mClient),
        },
    };
});
describe('Receipt API', () => {
    let mClient;
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        // Get mock client
        mClient = pool.connect();
    });
    it('should create a receipt successfully', async () => {
        // Mock for BEGIN
        mClient.query.mockResolvedValueOnce({});
        // Mock for voucher insert
        mClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        // Mock for details insert
        mClient.query.mockResolvedValueOnce({});
        // Mock for COMMIT
        mClient.query.mockResolvedValueOnce({});
        const res = await request(app)
            .post('/api/receipts')
            .send({
            voucher_code: 'PN-001',
            supplier_name: 'Nhà cung cấp A',
            items: [
                { product_id: 1, quantity: 10, price: 50000 }
            ]
        });
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Tạo phiếu nhập thành công');
        expect(res.body.data.voucherId).toBe(1);
        expect(mClient.query).toHaveBeenCalledWith('BEGIN');
        expect(mClient.query).toHaveBeenCalledWith('COMMIT');
        expect(mClient.release).toHaveBeenCalled();
    });
    it('should return 400 if voucher_code or items are missing', async () => {
        const res = await request(app)
            .post('/api/receipts')
            .send({
            supplier_name: 'Nhà cung cấp B'
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Thiếu thông tin bắt buộc');
    });
    it('should rollback if an error occurs during insert', async () => {
        // Mock BEGIN
        mClient.query.mockResolvedValueOnce({});
        // Mock Error on voucher insert
        mClient.query.mockRejectedValueOnce(new Error('DB Error'));
        // Mock ROLLBACK
        mClient.query.mockResolvedValueOnce({});
        const res = await request(app)
            .post('/api/receipts')
            .send({
            voucher_code: 'PN-002',
            items: [{ product_id: 2, quantity: 5, price: 100 }]
        });
        expect(res.status).toBe(500);
        expect(mClient.query).toHaveBeenCalledWith('ROLLBACK');
        expect(mClient.release).toHaveBeenCalled();
    });
});
//# sourceMappingURL=receipt.test.js.map