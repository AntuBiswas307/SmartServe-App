const { createProduct, getProducts, deleteProduct } = require('../controllers/productController');
const Product = require('../models/Product');
const fs = require('fs');

jest.mock('../models/Product');
jest.mock('fs');

describe('Product & Menu Catalog Module (TDD Unit Tests)', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('POST /api/products (createProduct)', () => {
    test('[BVA - Missing File] Should return 400 if product image file is not attached', async () => {
      req.body = { name: 'Burger', price: '9.99', details: 'Delicious' };
      req.file = undefined;

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Image is required' });
    });

    test('[Happy Path / Boundary Conversion] Should save product with numeric price and return 201', async () => {
      req.body = { name: 'Gourmet Pizza', price: '14.50', details: 'Thin crust with mozzarella' };
      req.file = { filename: 'sample-pizza.jpg' };

      const mockSavedProduct = {
        _id: 'prod_1',
        name: 'Gourmet Pizza',
        price: 14.5,
        details: 'Thin crust with mozzarella',
        imageUrl: '/uploads/sample-pizza.jpg',
      };

      // Mock Product constructor
      Product.mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(mockSavedProduct),
      }));

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSavedProduct);
    });

    test('[Robustness] Should return 500 if database save operation fails', async () => {
      req.body = { name: 'Pasta', price: '12.00', details: 'Creamy Alfredo' };
      req.file = { filename: 'pasta.jpg' };

      Product.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('MongoDB Disk Full')),
      }));

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'MongoDB Disk Full' }));
    });
  });

  describe('GET /api/products (getProducts)', () => {
    test('[Happy Path] Should return array of all menu products', async () => {
      const mockProducts = [
        { _id: '1', name: 'Burger', price: 9.99 },
        { _id: '2', name: 'Pizza', price: 14.5 },
      ];
      Product.find.mockResolvedValue(mockProducts);

      await getProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    test('[Robustness] Should return 500 on database read error', async () => {
      Product.find.mockRejectedValue(new Error('Network Read Error'));

      await getProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching products' });
    });
  });

  describe('DELETE /api/products/:id (deleteProduct)', () => {
    test('[Equivalence Partitioning] Should return 404 when product ID does not exist', async () => {
      req.params.id = 'nonexistent_id';
      Product.findById.mockResolvedValue(null);

      await deleteProduct(req, res);

      expect(Product.findById).toHaveBeenCalledWith('nonexistent_id');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });

    test('[Happy Path & Clean Up] Should unlink image file and remove product from database', async () => {
      req.params.id = 'prod_to_delete';
      const mockProduct = {
        _id: 'prod_to_delete',
        name: 'Obsolete Item',
        imageUrl: '/uploads/old-image.jpg',
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      Product.findById.mockResolvedValue(mockProduct);
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(true);

      await deleteProduct(req, res);

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockProduct.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Product removed' });
    });

    test('[Branch Coverage - Image Not On Disk] Should delete product when imageUrl exists but file is not on disk', async () => {
      req.params.id = 'prod_no_file';
      const mockProduct = {
        _id: 'prod_no_file',
        imageUrl: '/uploads/missing.jpg',
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      Product.findById.mockResolvedValue(mockProduct);
      fs.existsSync.mockReturnValue(false); // File missing from disk

      await deleteProduct(req, res);

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(mockProduct.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Product removed' });
    });

    test('[Branch Coverage - No Image Url] Should delete product without error when product has no imageUrl', async () => {
      req.params.id = 'prod_no_img';
      const mockProduct = {
        _id: 'prod_no_img',
        imageUrl: null,
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      Product.findById.mockResolvedValue(mockProduct);

      await deleteProduct(req, res);

      expect(fs.existsSync).not.toHaveBeenCalled();
      expect(mockProduct.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Product removed' });
    });

    test('[Robustness] Should return 500 when deletion encounters an unexpected error', async () => {
      req.params.id = 'prod_err';
      Product.findById.mockRejectedValue(new Error('Permission Denied'));

      await deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Permission Denied' });
    });
  });
});
