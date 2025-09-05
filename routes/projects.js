import express from 'express';
import project from '../models/Project.js';
import mongoose from 'mongoose';

const projectsRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Endpoints de Projetos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required: [name]
 *       properties:
 *         _id:
 *           type: string
 *           example: 68ba4bc93b8beb247851a53c
 *         name:
 *           type: string
 *           example: Projeto Alpha
 *         description:
 *           type: string
 *           example: Primeiro projeto de teste
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           example: active
 *         logs:
 *           type: array
 *           items:
 *             type: object
 *         avatar:
 *           type: string
 *           example: https://example.com/image.png
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-02-05T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-02-05T12:00:00.000Z
 */

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Lista todos os projetos
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Lista de projetos
 *         content:
 *           application/json:
 *             examples:
 *               sucesso:
 *                 value:
 *                   success: true
 *                   count: 1
 *                   data:
 *                     - _id: 68ba4bc93b8beb247851a53c
 *                       name: Projeto Alpha
 *                       description: Primeiro projeto de teste
 *                       status: active
 */
/* GET projects listing. */
projectsRouter.get('/', async (req, res) => {
  try {
    const projects = await project.find();
    res.json({
      success: true,
      count: projects.length,
      data: projects,
      database: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar projetos',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Cria um novo projeto
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *           examples:
 *             valido:
 *               value:
 *                 name: Projeto Gamma
 *                 description: Novo projeto criado via teste
 *                 status: active
 *     responses:
 *       201:
 *         description: Projeto criado
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             examples:
 *               invalido:
 *                 value:
 *                   success: false
 *                   message: Erro ao criar projeto
 *                   error: "Path `name` is required."
 */
/* POST projects listing. */
projectsRouter.post('/', async (req, res) => {
  try {
    const newProject = await project.create(req.body);
    res.status(201).json({
      success: true,
      data: newProject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao criar projeto',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   get:
 *     summary: Busca um projeto pelo ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projeto encontrado
 *       404:
 *         description: Projeto não encontrado
 */
/* GET project by id listing. */
projectsRouter.get('/:id', async (req, res) => {
  try {
    const foundProject = await project.findById(req.params.id);
    if (!foundProject) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }
    res.json({
      success: true,
      data: foundProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar projeto',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   put:
 *     summary: Atualiza um projeto
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Projeto atualizado
 */
/* PUT project by id listing. */
projectsRouter.put('/:id', async (req, res) => {
  try {
    const updatedProject = await project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar projeto',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   delete:
 *     summary: Remove um projeto
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projeto removido
 */
/* DELETE project by id listing. */
projectsRouter.delete('/:id', async (req, res) => {
  try {
    const deletedProject = await project.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      data: deletedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar projeto',
      error: error.message
    });
  }
});

export default projectsRouter;
