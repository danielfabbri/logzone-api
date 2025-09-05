import express from 'express';
import Log from '../models/Log.js';
import mongoose from 'mongoose';

const logsRouter = express.Router();

/* GET logs listing. */
logsRouter.get('/', async (req, res) => {
  try {
    const logs = await Log.find();
    res.json({
      success: true,
      count: logs.length,
      data: logs,
      database: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar logs',
      error: error.message  
    });
  }
});

/* POST logs listing. */
logsRouter.post('/', async (req, res) => {
  try {
    const log = await Log.create(req.body);
    res.status(201).json({
      success: true,
      data: log,
      database: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar log',
      error: error.message
    });
  }
});

/* GET log by id listing. */
logsRouter.get('/:id', async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar log',
      error: error.message
    });
  }
});

/* PUT log by id listing. */
logsRouter.put('/:id', async (req, res) => {
  try {
    const log = await Log.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar log',
      error: error.message
    });
  }
});

/* DELETE log by id listing. */
    logsRouter.delete('/:id', async (req, res) => {
  try {
    const log = await Log.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar log',
      error: error.message
    });
  }
});

export default logsRouter;
