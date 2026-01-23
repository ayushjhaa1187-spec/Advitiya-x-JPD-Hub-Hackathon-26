const User = require('../models/User');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

class UserService {
  static async register(userData) {
    const { name, email, password } = userData;
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw { statusCode: 409, message: 'Email already registered' };
    }
    const user = await User.create({ name, email, password });
    return user;
  }

  static async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }
    const isPasswordValid = await User.verifyPassword(user.password, password);
    if (!isPasswordValid) {
feat: Add user service    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    return user;
  }

  static async updateProfile(userId, userData) {
    const user = await User.update(userId, userData);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    return user;
  }

  static async getAllUsers(limit, offset) {
    return await User.findAll(limit, offset);
  }
}

module.exports = UserService;
