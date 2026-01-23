const Order = require('../models/Order');

class OrderService {
  async getAllOrders(query, page, limit) {
    const { status, userId } = query;
    const filter = {};

    if (status) filter.status = status;
    if (userId) filter.user = userId;

    const offset = (page - 1) * limit;
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments(filter);

    return { orders, count };
  }

  async getOrderById(id) {
    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items.product', 'name price');
    return order;
  }

  async createOrder(orderData) {
    const order = await Order.create(orderData);
    return order;
  }

  async updateOrderStatus(id, status) {
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    return order;
  }

  async deleteOrder(id) {
    const order = await Order.findByIdAndDelete(id);
    return order;
  }

  async getOrdersByUser(userId) {
    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    return orders;
  }

  async calculateOrderTotal(items) {
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }
    return total;
  }
}

module.exports = new OrderService();
