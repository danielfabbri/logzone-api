import request from 'supertest';
import app from '../../app.test.js';
import Project from '../../models/Project.js';

describe('Projects API Integration Tests', () => {
  describe('GET /api/v1/projects', () => {
    it('should return empty array when no projects exist', async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        count: 0,
        data: []
      });
      expect(response.body.database).toBeDefined();
      expect(response.body.host).toBeDefined();
    });

    it('should return all projects when they exist', async () => {
      // Criar projetos de teste
      const testProjects = [
        {
          name: 'Projeto Alpha',
          description: 'Primeiro projeto de teste',
          status: 'active',
          logs: []
        },
        {
          name: 'Projeto Beta',
          description: 'Segundo projeto de teste',
          status: 'inactive',
          logs: []
        }
      ];

      await Project.insertMany(testProjects);

      const response = await request(app)
        .get('/api/v1/projects')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        name: 'Projeto Alpha',
        description: 'Primeiro projeto de teste',
        status: 'active'
      });
      expect(response.body.data[1]).toMatchObject({
        name: 'Projeto Beta',
        description: 'Segundo projeto de teste',
        status: 'inactive'
      });
    });
  });

  describe('POST /api/v1/projects', () => {
    it('should create a new project', async () => {
      const newProject = {
        name: 'Projeto Gamma',
        description: 'Novo projeto criado via teste',
        status: 'active',
        logs: []
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .send(newProject)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'Projeto Gamma',
        description: 'Novo projeto criado via teste',
        status: 'active'
      });
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should return error when project creation fails', async () => {
      const invalidProject = {
        // Campos obrigatórios faltando
        description: 'Projeto sem nome'
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .send(invalidProject)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Erro ao criar projeto');
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('should return project by id', async () => {
      const project = await Project.create({
        name: 'Projeto Delta',
        description: 'Projeto para teste de busca por ID',
        status: 'active',
        logs: []
      });

      const response = await request(app)
        .get(`/api/v1/projects/${project._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'Projeto Delta',
        description: 'Projeto para teste de busca por ID',
        status: 'active'
      });
    });

    it('should return 404 when project not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/v1/projects/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Projeto não encontrado');
    });
  });

  describe('PUT /api/v1/projects/:id', () => {
    it('should update project by id', async () => {
      const project = await Project.create({
        name: 'Projeto Epsilon',
        description: 'Projeto original',
        status: 'active',
        logs: []
      });

      const updateData = {
        name: 'Projeto Epsilon Atualizado',
        description: 'Projeto atualizado via teste',
        status: 'inactive'
      };

      const response = await request(app)
        .put(`/api/v1/projects/${project._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'Projeto Epsilon Atualizado',
        description: 'Projeto atualizado via teste',
        status: 'inactive'
      });
    });
  });

  describe('DELETE /api/v1/projects/:id', () => {
    it('should delete project by id', async () => {
      const project = await Project.create({
        name: 'Projeto Zeta',
        description: 'Projeto para deletar',
        status: 'active',
        logs: []
      });

      const response = await request(app)
        .delete(`/api/v1/projects/${project._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'Projeto Zeta',
        description: 'Projeto para deletar',
        status: 'active'
      });

      // Verificar se foi realmente deletado
      const deletedProject = await Project.findById(project._id);
      expect(deletedProject).toBeNull();
    });
  });
});