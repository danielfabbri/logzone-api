import request from 'supertest';
import app from '../../app.test.js';
import User from '../../models/User.js';

describe('Users API Integration Tests', () => {
  describe('GET /api/v1/users', () => {
    it('should return empty array when no users exist', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        count: 0,
        data: []
      });
      expect(response.body.database).toBeDefined();
      expect(response.body.host).toBeDefined();
    });

    it('should return all users when they exist', async () => {
      // Criar usuários de teste
      const testUsers = [
        {
          name: 'João Silva',
          email: 'joao@test.com',
          password: '123456',
          role: 'admin'
        },
        {
          name: 'Maria Santos',
          email: 'maria@test.com',
          password: '123456',
          role: 'user'
        }
      ];

      await User.insertMany(testUsers);

      const response = await request(app)
        .get('/api/v1/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        name: 'João Silva',
        email: 'joao@test.com',
        role: 'admin'
      });
      expect(response.body.data[1]).toMatchObject({
        name: 'Maria Santos',
        email: 'maria@test.com',
        role: 'user'
      });
    });
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Pedro Costa',
        email: 'pedro@test.com',
        password: '123456',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/v1/users')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'Pedro Costa',
        email: 'pedro@test.com',
        role: 'user'
      });
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should return error when required fields are missing', async () => {
      const incompleteUser = {
        name: 'Test User'
        // email e password faltando
      };

      const response = await request(app)
        .post('/api/v1/users')
        .send(incompleteUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Erro ao criar usuário');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return user by id', async () => {
      const user = await User.create({
        name: 'Ana Lima',
        email: 'ana@test.com',
        password: '123456',
        role: 'user'
      });

      const response = await request(app)
        .get(`/api/v1/users/${user._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'Ana Lima',
        email: 'ana@test.com',
        role: 'user'
      });
    });

    it('should return 404 when user not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/v1/users/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Usuário não encontrado');
    });
  });
});