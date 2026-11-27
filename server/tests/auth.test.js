const { registerUser, loginUser } = require('../controllers/authController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

jest.mock('../models/User');
jest.mock('jsonwebtoken');

describe('Authentication & User Management Module (TDD Unit Tests)', () => {
  let req, res;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test_secret_key_123';
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register (registerUser)', () => {
    test('[BVA/EP - Invalid] Should return 400 if name is missing', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Please add all fields' });
    });

    test('[BVA/EP - Invalid] Should return 400 if email is missing', async () => {
      req.body = { name: 'John Doe', password: 'password123' };
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Please add all fields' });
    });

    test('[BVA/EP - Invalid] Should return 400 if password is missing', async () => {
      req.body = { name: 'John Doe', email: 'test@example.com' };
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Please add all fields' });
    });

    test('[Equivalence Partitioning] Should return 400 if user email already exists in DB', async () => {
      req.body = { name: 'John Doe', email: 'existing@example.com', password: 'password123' };
      User.findOne.mockResolvedValue({ _id: '123', email: 'existing@example.com' });

      await registerUser(req, res);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    test('[Happy Path] Should successfully register a new user as customer with hashed token', async () => {
      req.body = { name: 'New User', email: 'new@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      const mockCreatedUser = {
        id: 'new_id_123',
        _id: 'new_id_123',
        name: 'New User',
        email: 'new@example.com',
        role: 'customer',
      };
      User.create.mockResolvedValue(mockCreatedUser);
      jwt.sign.mockReturnValue('mocked_jwt_token');

      await registerUser(req, res);

      expect(User.create).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'customer',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'new_id_123',
        name: 'New User',
        email: 'new@example.com',
        role: 'customer',
        token: 'mocked_jwt_token',
      });
    });

    test('[Boundary - Invalid User Creation] Should return 400 if user creation returns null', async () => {
      req.body = { name: 'Bad User', email: 'bad@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(null); // Triggers line 39 else branch

      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user data' });
    });

    test('[Robustness] Should handle unexpected server or database errors gracefully (500)', async () => {
      req.body = { name: 'Fail User', email: 'fail@example.com', password: 'password123' };
      User.findOne.mockRejectedValue(new Error('Database Connection Lost'));

      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database Connection Lost' });
    });
  });

  describe('POST /api/auth/login (loginUser)', () => {
    test('[Happy Path] Should log in user with valid credentials and return signed token', async () => {
      req.body = { email: 'valid@example.com', password: 'correct_password' };
      const mockUser = {
        id: 'user_1',
        _id: 'user_1',
        name: 'Valid User',
        email: 'valid@example.com',
        role: 'customer',
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mocked_valid_jwt');

      await loginUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'valid@example.com' });
      expect(mockUser.matchPassword).toHaveBeenCalledWith('correct_password');
      expect(res.json).toHaveBeenCalledWith({
        _id: 'user_1',
        name: 'Valid User',
        email: 'valid@example.com',
        role: 'customer',
        token: 'mocked_valid_jwt',
      });
    });

    test('[Security] Should reject login when user does not exist (401)', async () => {
      req.body = { email: 'nonexistent@example.com', password: 'any_password' };
      User.findOne.mockResolvedValue(null);

      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    test('[Security] Should reject login when password does not match (401)', async () => {
      req.body = { email: 'valid@example.com', password: 'wrong_password' };
      const mockUser = {
        email: 'valid@example.com',
        matchPassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockResolvedValue(mockUser);

      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    test('[Robustness] Should handle internal server exceptions during login (500)', async () => {
      req.body = { email: 'valid@example.com', password: 'pass' };
      User.findOne.mockRejectedValue(new Error('Internal query timeout'));

      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal query timeout' });
    });
  });
});
