const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, price, details } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const product = new Product({
            name,
            price: Number(price),
            details,
            imageUrl: `/uploads/${req.file.filename}` // Local URL
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('Detailed Error:', error);
        res.status(500).json({ message: error.message || JSON.stringify(error) || 'Server error while creating product' });
    }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching products' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete image file from local storage
        if (product.imageUrl) {
            const filename = product.imageUrl.split('/').pop();
            const imagePath = path.join(__dirname, '..', 'uploads', filename);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } catch (error) {
        console.error('Detailed Error:', error);
        res.status(500).json({ message: error.message || 'Server error while deleting product' });
    }
};

module.exports = {
    createProduct,
    getProducts,
    deleteProduct
};
