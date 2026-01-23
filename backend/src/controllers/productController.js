const Product = require('../models/Product');
const ApiResponse = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const { limit: queryLimit, offset } = getPagination(page, limit);

    const query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query)
      .limit(queryLimit)
      .skip(offset)
      .sort({ createdAt: -1 });

    const count = await Product.countDocuments(query);

    return ApiResponse.success(res, {
      products,
      pagination: {
        page: parseInt(page),
        limit: queryLimit,
        total: count,
        pages: Math.ceil(count / queryLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return ApiResponse.notFound(res, 'Product not found');
    }

    return ApiResponse.success(res, product);
  } catch (error) {
    next(error);
  }
};

// Create product
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    return ApiResponse.success(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return ApiResponse.notFound(res, 'Product not found');
    }

    return ApiResponse.success(res, product, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return ApiResponse.notFound(res, 'Product not found');
    }

    return ApiResponse.success(res, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};
