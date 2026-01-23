const Product = require('../models/Product');

class ProductService {
  async getAllProducts(query, page, limit) {
    const { category, search, minPrice, maxPrice } = query;
    const filter = {};

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    const offset = (page - 1) * limit;
    const products = await Product.find(filter)
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 });

    const count = await Product.countDocuments(filter);

    return { products, count };
  }

  async getProductById(id) {
    const product = await Product.findById(id);
    return product;
  }

  async createProduct(productData) {
    const product = await Product.create(productData);
    return product;
  }

  async updateProduct(id, productData) {
    const product = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true
    });
    return product;
  }

  async deleteProduct(id) {
    const product = await Product.findByIdAndDelete(id);
    return product;
  }

  async getProductsByCategory(category) {
    const products = await Product.find({ category });
    return products;
  }

  async updateStock(id, quantity) {
    const product = await Product.findById(id);
    if (!product) return null;
    
    product.stock += quantity;
    await product.save();
    return product;
  }
}

module.exports = new ProductService();
