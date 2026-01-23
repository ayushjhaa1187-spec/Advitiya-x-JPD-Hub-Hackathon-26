const UserService = require('../services/userService');

class UserController {
  static async register(req, res, next) {
    try {
      const user = await UserService.register(req.body);
      res.status(201).json({ statusCode: 201, message: 'User registered successfully', user, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      res.status(200).json({ statusCode: 200, message: 'Login successful', ...result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await UserService.getProfile(req.user.id);
      res.status(200).json({ statusCode: 200, user, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const user = await UserService.updateProfile(req.user.id, req.body);
      res.status(200).json({ statusCode: 200, message: 'Profile updated', user, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const users = await UserService.getAllUsers(Number(limit), Number(offset));
      res.status(200).json({ statusCode: 200, users, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
