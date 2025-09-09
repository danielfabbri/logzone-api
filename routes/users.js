import express from 'express';
import User from '../models/User.js';
import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

const usersRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints de Usuários
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         _id:
 *           type: string
 *           example: 68ba4bc002f25365840a6713
 *         name:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           format: email
 *           example: joao@email.com
 *         phoneNumber:
 *           type: string
 *           example: 5521999999999
 *         cpf:
 *           type: string
 *           example: 12345678909
 *         cnpj:
 *           type: string
 *           example: 12345678000100
 *         role:
 *           type: string
 *           enum: [ADMIN, USER]
 *           example: USER
 *         birthDay:
 *           type: string
 *           format: date-time
 *           example: 1990-05-20T00:00:00.000Z
 *         avatar:
 *           type: string
 *           example: https://example.com/avatar.png
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
 * /api/v1/users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *             examples:
 *               sucesso:
 *                 summary: Exemplo de resposta com usuários
 *                 value:
 *                   success: true
 *                   count: 2
 *                   data:
 *                     - _id: 68ba36c7dbf921eeafcd1350
 *                       name: José
 *                       email: jose@gmail.com
 *                       phoneNumber: 5521980474532
 *                       role: USER
 *                       createdAt: 2025-09-05T01:03:03.344Z
 *                       updatedAt: 2025-09-05T01:03:03.348Z
 *                     - _id: 67a124eb5a21d04a478f3c52
 *                       name: Daniel Fabbri
 *                       email: contato.fabbri@gmail.com
 *                       role: ADMIN
 *                       createdAt: 2025-02-03T20:19:55.997Z
 *                       updatedAt: 2025-02-03T20:19:55.997Z
 */
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

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *           examples:
 *             valido:
 *               summary: Exemplo de criação de usuário
 *               value:
 *                 name: Pedro Costa
 *                 email: pedro@test.com
 *                 password: 123456
 *                 role: USER
 *     responses:
 *       201:
 *         description: Usuário criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             examples:
 *               faltandoCampos:
 *                 summary: Campos obrigatórios ausentes
 *                 value:
 *                   success: false
 *                   message: Erro ao criar usuário
 *                   error: "Path `email` is required."
 */
/* POST users listing. */
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // gera hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: err.message
    });
  }
};

usersRouter.post('/', createUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   message: Usuário não encontrado
 */
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

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Users]
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
 *             $ref: '#/components/schemas/User'
 *           examples:
 *             atualizar:
 *               summary: Exemplo de atualização
 *               value:
 *                 name: João Silva Atualizado
 *                 role: ADMIN
 *     responses:
 *       200:
 *         description: Usuário atualizado
 */
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

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Remove um usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário removido
 *         content:
 *           application/json:
 *             examples:
 *               removido:
 *                 value:
 *                   success: true
 *                   data: null
 */
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
