import express from 'express';
import User from '../models/User.js';
import mongoose from 'mongoose';

const usersRouter = express.Router();

/* GET users listing. */
usersRouter.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      success: true,
      count: users.length,
      data: users,
      database: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários',
      error: error.message
    });
  }
});

export default usersRouter;
