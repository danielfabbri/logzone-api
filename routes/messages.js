import express from 'express';
import Message from '../models/Message.js';
import MessageService from '../services/MessageService.js';
import AIService from '../services/AIService.js';
import WhatsAppService from '../services/WhatsAppService.js';
import mongoose from 'mongoose';

const messagesRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Endpoints de Mensagens
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 68ba4bc002f25365840a6713
 *         project:
 *           type: string
 *           description: ID do projeto
 *           example: 68ba4bc93b8beb247851a53c
 *         status:
 *           type: string
 *           enum: [sent, delivered, read, failed, pending]
 *           example: sent
 *         type:
 *           type: string
 *           enum: [inbound, outbound]
 *           example: outbound
 *         fromPhone:
 *           type: string
 *           example: 5521987654321
 *         toPhone:
 *           type: string
 *           example: 5521999999999
 *         priority:
 *           type: string
 *           enum: [low, normal, high]
 *           example: normal
 *         content:
 *           type: string
 *           example: Olá! Sua ordem foi processada.
 *         cost:
 *           type: number
 *           example: 0.03
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-02-05T12:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-02-05T12:05:00.000Z
 */

/**
 * @swagger
 * /api/v1/messages:
 *   get:
 *     summary: Lista mensagens com filtros e paginação
 *     tags: [Messages]
 *     parameters:
 *       - in: query
 *         name: project
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [sent, delivered, read, failed, pending] }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [inbound, outbound] }
 *       - in: query
 *         name: fromPhone
 *         schema: { type: string }
 *       - in: query
 *         name: toPhone
 *         schema: { type: string }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, normal, high] }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: skip
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Lista de mensagens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: number }
 *                 total: { type: number }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Message' }
 *             examples:
 *               exemplo:
 *                 value:
 *                   success: true
 *                   count: 2
 *                   total: 42
 *                   data:
 *                     - _id: 68ba4bc002f25365840a6713
 *                       project: 68ba4bc93b8beb247851a53c
 *                       status: delivered
 *                       type: outbound
 *                       fromPhone: 5521987654321
 *                       toPhone: 5521999999999
 *                       content: Pedido entregue.
 *                       createdAt: 2025-02-05T12:00:00.000Z
 *                     - _id: 68ba4bc102f25365840a6714
 *                       project: 68ba4bc93b8beb247851a53c
 *                       status: read
 *                       type: inbound
 *                       fromPhone: 5521999999999
 *                       toPhone: 5521987654321
 *                       content: Obrigado!
 *                       createdAt: 2025-02-05T12:01:00.000Z
 */
/* GET messages listing. */
messagesRouter.get('/', async (req, res) => {
  try {
    const { 
      project, 
      status, 
      type, 
      fromPhone, 
      toPhone, 
      priority,
      limit = 50, 
      skip = 0,
      startDate,
      endDate
    } = req.query;
    
    // Construir filtros
    const filters = {};
    if (project) filters.project = project;
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (fromPhone) filters.fromPhone = fromPhone;
    if (toPhone) filters.toPhone = toPhone;
    if (priority) filters.priority = priority;
    
    // Filtro por data
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }
    
    const messages = await Message.find(filters)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('project', 'name');
      
    const total = await Message.countDocuments(filters);
    
    res.json({
      success: true,
      count: messages.length,
      total,
      data: messages,
      database: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar mensagens',
      error: error.message  
    });
  }
});

/**
 * @swagger
 * /api/v1/messages:
 *   post:
 *     summary: Cria uma nova mensagem
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *           examples:
 *             valido:
 *               value:
 *                 project: 68ba4bc93b8beb247851a53c
 *                 status: sent
 *                 type: outbound
 *                 fromPhone: 5521987654321
 *                 toPhone: 5521999999999
 *                 content: Seu pedido foi recebido.
 *     responses:
 *       201:
 *         description: Mensagem criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Message' }
 *       500:
 *         description: Erro ao criar mensagem
 */
/* POST messages listing. */
messagesRouter.post('/', async (req, res) => {
  try {
    // Pegar os parâmetros da requisição
    const phoneNumber = req.body.fromPhone;

    // Aqui você pode adicionar lógica para criar uma query de busca com AI, se necessário.

    // Recuperar histórico da conversa
         const options = {
       limit: req.query.limit,
       skip: req.query.skip,
       project: req.query.project,
       startDate: req.query.startDate,
       endDate: req.query.endDate,
       status: req.query.status,
       type: req.query.type,
       formatForAI: true // Formatar para contexto de IA
     };

     const history = await MessageService.getMessagesByPhoneNumber(phoneNumber, options);

    // Criar resposta com AI
    const aiService = new AIService();
    const userMessage = req.body.content;
    const conversationHistory = history.success ? history.data.messages : [];
    
    // Gerar resposta da IA
    const aiResponse = await aiService.generateResponse(
      userMessage,
      phoneNumber,
      conversationHistory,
      {
        project: req.body.project,
        agentContext: "Você é um assistente virtual amigável e prestativo. Responda de forma clara e concisa em português brasileiro."
      }
    );

    // Salvar mensagem do usuário no banco
    const userMessageRecord = await Message.create(req.body);
    
    let aiMessageRecord = null;
    if (aiResponse.success) {
      // Criar mensagem de resposta da IA
      const aiMessageData = {
        project: req.body.project,
        content: aiResponse.data.aiMessage,
        fromPhone: req.body.toPhone, // IA responde do número do sistema
        toPhone: phoneNumber, // Para o usuário
        type: req.body.type || 'whatsapp',
        status: 'pending',
        priority: 'normal',
        metadata: {
          aiGenerated: true,
          model: aiResponse.data.model,
          usage: aiResponse.data.usage,
          conversationLength: aiResponse.data.conversationLength
        }
      };
      // Salvar mensagem do AI no banco
      aiMessageRecord = await Message.create(aiMessageData);
    }

         // Responder para o Whatsapp do cliente
     let whatsappResult = null;
     if (aiResponse.success && aiMessageRecord) {
       const whatsappService = new WhatsAppService();
       const formattedPhone = whatsappService.formatPhoneNumber(phoneNumber);
       
       whatsappResult = await whatsappService.sendTextMessage(
         formattedPhone,
         aiResponse.data.aiMessage,
         {
           timeTyping: 1000,
           delay: 500 // Pequeno delay para simular digitação
         }
       );

       // Atualizar status da mensagem da IA se envio foi bem-sucedido
       if (whatsappResult.success) {
         await Message.findByIdAndUpdate(aiMessageRecord._id, {
           status: 'sent',
           externalId: whatsappResult.data.messageId,
           provider: 'apibrasil',
           metadata: {
             ...aiMessageRecord.metadata,
             whatsappMessageId: whatsappResult.data.messageId,
             whatsappStatus: whatsappResult.data.status
           }
         });
       } else {
         // Marcar como falha se não conseguiu enviar
         await Message.findByIdAndUpdate(aiMessageRecord._id, {
           status: 'failed',
           metadata: {
             ...aiMessageRecord.metadata,
             whatsappError: whatsappResult.error
           }
         });
       }
     }

     res.status(201).json({
       success: true,
       data: {
         userMessage: userMessageRecord,
         aiMessage: aiMessageRecord,
         aiResponse: aiResponse,
         whatsappResult: whatsappResult
       },
       database: mongoose.connection.name,
       host: mongoose.connection.host,
       history: history
     });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar mensagem',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/messages/{id}:
 *   get:
 *     summary: Busca mensagem por ID
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Mensagem encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Message' }
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Mensagem não encontrada
 */
/* GET message by id listing. */
messagesRouter.get('/:id', async (req, res) => {
  try {
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
        data: null
      });
    }
    
    const message = await Message.findById(req.params.id).populate('project', 'name');
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensagem não encontrada',
        data: null
      });
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar mensagem',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/messages/{id}:
 *   put:
 *     summary: Atualiza mensagem por ID
 *     tags: [Messages]
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
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       200:
 *         description: Mensagem atualizada
 *       404:
 *         description: Mensagem não encontrada
 */
/* PUT message by id listing. */
messagesRouter.put('/:id', async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Mensagem não encontrada',
        data: null
      });
    }
    
    res.json({
      success: true,
      data: updatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar mensagem',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/messages/{id}:
 *   delete:
 *     summary: Remove mensagem por ID
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Mensagem removida
 *       404:
 *         description: Mensagem não encontrada
 */
/* DELETE message by id listing. */
messagesRouter.delete('/:id', async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    
    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Mensagem não encontrada',
        data: null
      });
    }
    
    res.json({
      success: true,
      data: deletedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar mensagem',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/messages/phone/{phoneNumber}:
 *   get:
 *     summary: Lista mensagens por número de telefone
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: project
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: skip
 *         schema: { type: integer }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [sent, delivered, read, failed, pending] }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [inbound, outbound] }
 *       - in: query
 *         name: formatForAI
 *         schema: { type: boolean, default: false }
 *     responses:
 *       200:
 *         description: Mensagens encontradas
 */
/* GET messages by phone number */
messagesRouter.get('/phone/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const options = {
      limit: req.query.limit,
      skip: req.query.skip,
      project: req.query.project,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status,
      type: req.query.type,
      formatForAI: req.query.formatForAI === 'true'
    };

    const result = await MessageService.getMessagesByPhoneNumber(phoneNumber, options);
    
    if (result.success) {
      res.json({
        success: true,
        count: result.data.messages.length,
        total: result.data.pagination.total,
        data: result.data.messages,
        pagination: result.data.pagination
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar mensagens por telefone',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar mensagens por telefone',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/messages/whatsapp/test:
 *   post:
 *     summary: Testa conexão com WhatsApp API
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "5521999999999"
 *               message:
 *                 type: string
 *                 example: "Teste de conexão"
 *     responses:
 *       200:
 *         description: Teste realizado
 */
/* POST test WhatsApp connection */
messagesRouter.post('/whatsapp/test', async (req, res) => {
  try {
    const { phoneNumber, message = "Teste de conexão com WhatsApp API" } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Número de telefone é obrigatório'
      });
    }

    const whatsappService = new WhatsAppService();
    
    // Verificar configurações
    const config = {
      hasEmail: !!process.env.WHATSAPP_EMAIL,
      hasPassword: !!process.env.WHATSAPP_PASSWORD,
      hasDeviceToken: !!process.env.WHATSAPP_DEVICE_TOKEN,
      email: process.env.WHATSAPP_EMAIL ? process.env.WHATSAPP_EMAIL.substring(0, 5) + '***' : 'NOT_SET',
      deviceToken: process.env.WHATSAPP_DEVICE_TOKEN ? process.env.WHATSAPP_DEVICE_TOKEN.substring(0, 8) + '***' : 'NOT_SET'
    };

    console.log('WhatsApp Test - Configurações:', config);
    
    // Testar conexão primeiro
    const connectionTest = await whatsappService.testConnection();
    
    if (!connectionTest.success) {
      return res.status(500).json({
        success: false,
        message: 'Falha na conexão com WhatsApp API',
        error: connectionTest.error,
        config: config
      });
    }

    // Enviar mensagem de teste
    const formattedPhone = whatsappService.formatPhoneNumber(phoneNumber);
    const sendResult = await whatsappService.sendTextMessage(formattedPhone, message);

    res.json({
      success: true,
      data: {
        config: config,
        connectionTest: connectionTest,
        sendResult: sendResult,
        phoneNumber: formattedPhone,
        message: message
      }
    });

  } catch (error) {
    console.error('WhatsApp Test Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao testar WhatsApp',
      error: error.message
    });
  }
});

export default messagesRouter;
