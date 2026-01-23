const Order = require('../models/Order');
const ApiResponse = require('../utils/apiResponse');
const { getPagination } = require('../utils/helpers');

// Get all orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { limit: queryLimit, offset } = getPagination(page, limit);

    const query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .limit(queryLimit)
      .skip(offset)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments(query);

    return ApiResponse.success(res, {
      orders,
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

// Get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name price');
    
    if (!order) {
      return ApiResponse.notFound(res, 'Order not found');
    }

    return ApiResponse.success(res, order);
  } catch (error) {
    next(error);
  }
};

// Create order
exports.createOrder = async (req, res, next) => {
  try {
    const order = await Order.create(req.body);
    return ApiResponse.success(res, order, 'Order created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return ApiResponse.notFound(res, 'Order not found');
    }

    return ApiResponse.success(res, order, 'Order status updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete order
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return ApiResponse.notFound(res, 'Order not found');
    }

    return ApiResponse.success(res, null, 'Order deleted successfully');
  } catch (error) {
    next(error);
  }
};
