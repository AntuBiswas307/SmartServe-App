const { protect, isAdmin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

jest.mock('jsonwebtoken');
jest.mock('../models/User');

describe('Security & Role-Based Access Control (RBAC) Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    process.env.JWT_SECRET = 'secret123';
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('protect Middleware (Authentication Guard)', () => {
    test('[Happy Path] Should authenticate request with valid Bearer token and attach user', async () => {
      req.headers.authorization = 'Bearer valid_mocked_token';
      const mockDecoded = { id: 'user_123', role: 'customer' };
      jwt.verify.mockReturnValue(mockDecoded);

      const mockQuery = {
        select: jest.fn().mockResolvedValue({ _id: 'user_123', name: 'Antu', role: 'customer' }),
      };
      User.findById.mockReturnValue(mockQuery);

      await protect(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid_mocked_token', 'secret123');
      expect(User.findById).toHaveBeenCalledWith('user_123');
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(req.user).toEqual({ _id: 'user_123', name: 'Antu', role: 'customer' });
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('[Security] Should return 401 when token verification fails or token is expired', async () => {
      req.headers.authorization = 'Bearer expired_or_tampered_token';
      jwt.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
      expect(next).not.toHaveBeenCalled();
    });

    test('[Boundary/Empty] Should return 401 when authorization header is completely missing', async () => {
      req.headers = {}; // No authorization header

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
      expect(next).not.toHaveBeenCalled();
    });

    test('[Boundary/Malformed] Should return 401 when authorization header does not use Bearer scheme', async () => {
      req.headers.authorization = 'Basic dXNlcjpwYXNz'; // Invalid scheme

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isAdmin Middleware (Authorization Role Guard)', () => {
    test('[Happy Path - RBAC] Should allow access if user has admin role', () => {
      req.user = { _id: 'admin_1', name: 'Admin User', role: 'admin' };

      isAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('[Privilege Escalation Prevention] Should return 403 Forbidden if user has customer role', () => {
      req.user = { _id: 'cust_1', name: 'Customer User', role: 'customer' };

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized as an admin' });
      expect(next).not.toHaveBeenCalled();
    });

    test('[Security] Should return 403 Forbidden if req.user is undefined', () => {
      req.user = undefined;

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized as an admin' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
