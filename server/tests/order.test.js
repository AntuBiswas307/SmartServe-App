const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const Order = require('../models/Order');

jest.mock('../models/Order');

describe('Table Orders & Kitchen Management Module (TDD Unit Tests)', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: { _id: 'cust_user_id' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('POST /api/orders (createOrder)', () => {
    test('[BVA/EP - Invalid] Should return 400 if product ID is missing', async () => {
      req.body = { tableNumber: '12' }; // missing product

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product and table number are required' });
    });

    test('[BVA/EP - Invalid] Should return 400 if tableNumber is empty or missing', async () => {
      req.body = { product: 'prod_123' }; // missing tableNumber

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product and table number are required' });
    });

    test('[Happy Path - BVA] Should successfully place order with tableNumber and return 201', async () => {
      req.body = { product: 'prod_123', tableNumber: '5' };
      const mockCreatedOrder = {
        _id: 'order_999',
        user: 'cust_user_id',
        product: 'prod_123',
        tableNumber: '5',
        status: 'Pending',
      };

      Order.mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(mockCreatedOrder),
      }));

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedOrder);
    });

    test('[Robustness] Should return 500 when database insertion fails', async () => {
      req.body = { product: 'prod_123', tableNumber: '5' };
      Order.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Database write collision')),
      }));

      await createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while placing order' });
    });
  });

  describe('GET /api/orders (getOrders)', () => {
    test('[Happy Path] Should return populated list of orders sorted newest first', async () => {
      const mockOrders = [
        { _id: 'o1', tableNumber: '3', status: 'Pending' },
        { _id: 'o2', tableNumber: '7', status: 'Delivered' },
      ];

      const mockQueryChain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockOrders),
      };

      Order.find.mockReturnValue(mockQueryChain);

      await getOrders(req, res);

      expect(Order.find).toHaveBeenCalledWith({});
      expect(mockQueryChain.populate).toHaveBeenCalledWith('user', 'name email');
      expect(mockQueryChain.populate).toHaveBeenCalledWith('product', 'name price imageUrl');
      expect(mockQueryChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    test('[Robustness] Should return 500 on fetch failure', async () => {
      Order.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Query timeout')),
      });

      await getOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching orders' });
    });
  });

  describe('PUT /api/orders/:id/status (updateOrderStatus - White-Box Basis Path Testing V(G)=4)', () => {
    test('Basis Path 1 [Invalid Status]: Should return 400 when status is not Pending or Delivered', async () => {
      req.params.id = 'order_1';
      req.body = { status: 'CANCELLED_INVALID' }; // Branch: !['Pending', 'Delivered'].includes(status) -> TRUE

      await updateOrderStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid status' });
      expect(Order.findById).not.toHaveBeenCalled();
    });

    test('Basis Path 2 [Non-Existent Order]: Should return 404 when valid status but order not found', async () => {
      req.params.id = 'missing_order_id';
      req.body = { status: 'Delivered' }; // Valid status
      Order.findById.mockResolvedValue(null); // Branch: !order -> TRUE

      await updateOrderStatus(req, res);

      expect(Order.findById).toHaveBeenCalledWith('missing_order_id');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });

    test('Basis Path 3 [Happy Path]: Should successfully update status to Delivered and save (200)', async () => {
      req.params.id = 'valid_order_id';
      req.body = { status: 'Delivered' };
      const mockOrder = {
        _id: 'valid_order_id',
        status: 'Pending',
        save: jest.fn().mockResolvedValue({
          _id: 'valid_order_id',
          status: 'Delivered',
        }),
      };
      Order.findById.mockResolvedValue(mockOrder);

      await updateOrderStatus(req, res);

      expect(mockOrder.status).toBe('Delivered');
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        _id: 'valid_order_id',
        status: 'Delivered',
      });
    });

    test('Basis Path 4 [Exception Path]: Should catch database errors during update and return 500', async () => {
      req.params.id = 'err_order_id';
      req.body = { status: 'Delivered' };
      Order.findById.mockRejectedValue(new Error('Database lock error'));

      await updateOrderStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while updating order' });
    });
  });
});
