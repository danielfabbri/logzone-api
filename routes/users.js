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

/* POST users listing. */
usersRouter.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }
});

/* GET user by id listing. */
usersRouter.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: error.message
    });
  }
});

/* PUT user by id listing. */
usersRouter.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message
    });
  }
});

/* DELETE user by id listing. */
usersRouter.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar usuário',
      error: error.message
    });
  }
});

export default usersRouter;
