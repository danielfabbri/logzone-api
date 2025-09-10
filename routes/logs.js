import express from 'express';
import Log from '../models/Log.js';
import mongoose from 'mongoose';
import Project from "../models/Project.js";


const logsRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Endpoints de Logs do sistema
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Log:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 68ba4bc002f25365840a6713
 *         message:
 *           type: string
 *           example: Usuário realizou login
 *         level:
 *           type: string
 *           enum: [info, warn, error]
 *           example: info
 *         context:
 *           type: object
 *           example:
 *             userId: 68ba36c7dbf921eeafcd1350
 *             ip: 127.0.0.1
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: 2025-02-05T12:00:00.000Z
 */

/**
 * @swagger
 * /api/v1/logs:
 *   get:
 *     summary: Lista todos os logs
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Lista de logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: number }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Log' }
 */
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

/**
 * @swagger
 * /api/v1/logs:
 *   post:
 *     summary: Cria um novo log
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Log'
 *           examples:
 *             exemplo:
 *               value:
 *                 message: Usuário realizou login
 *                 level: info
 *                 context:
 *                   userId: 68ba36c7dbf921eeafcd1350
 *     responses:
 *       201:
 *         description: Log criado
 *       500:
 *         description: Erro ao criar log
 */
/* POST logs listing. */
logsRouter.post('/', async (req, res) => {
  try {
    const { project, apiKey, source, environment, level, message, context } = req.body;

    // Verifica se o project e apiKey batem
    const projectFound = await Project.findOne({ _id: project, apiKey });
    if (!projectFound) {
      return res.status(403).json({
        success: false,
        message: "API Key inválida ou não corresponde ao projeto informado"
      });
    }

    // Cria o log
    const log = await Log.create({
      project: projectFound._id,
      source,
      environment,
      level,
      message,
      context,
      timestamp: new Date()
    });

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


/**
 * @swagger
 * /api/v1/logs/{id}:
 *   get:
 *     summary: Busca um log pelo ID
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Log encontrado
 *       404:
 *         description: Log não encontrado
 */
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

/**
 * @swagger
 * /api/v1/logs/{id}:
 *   put:
 *     summary: Atualiza um log
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Log'
 *     responses:
 *       200:
 *         description: Log atualizado
 */
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

/**
 * @swagger
 * /api/v1/logs/{id}:
 *   delete:
 *     summary: Remove um log pelo ID
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Log removido
 */
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
