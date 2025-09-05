import express from 'express';
import project from '../models/Project.js';
import mongoose from 'mongoose';

const projectsRouter = express.Router();

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

/* POST projects listing. */
projectsRouter.post('/', async (req, res) => {
  try {
    const projects = await project.create(req.body);
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

/* GET project by id listing. */
projectsRouter.get('/:id', async (req, res) => {
  try {
    const foundProject = await project.findById(req.params.id);
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
