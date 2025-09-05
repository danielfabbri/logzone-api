import Message from '../models/Message.js';

class MessageService {
  /**
   * Busca mensagens por número de telefone
   * @param {string} phoneNumber - Número de telefone para buscar
   * @param {Object} options - Opções de busca
   * @param {number} options.limit - Limite de resultados (default: 50)
   * @param {number} options.skip - Pular resultados (default: 0)
   * @param {string} options.project - Filtrar por projeto
   * @param {string} options.startDate - Data inicial
   * @param {string} options.endDate - Data final
   * @param {string} options.status - Filtrar por status
   * @param {string} options.type - Filtrar por tipo
   * @param {boolean} options.formatForAI - Formatar para contexto de IA (default: false)
   * @returns {Promise<Object>} Resultado da busca
   */
  static async getMessagesByPhoneNumber(phoneNumber, options = {}) {
    try {
      const {
        limit = 50,
        skip = 0,
        project,
        startDate,
        endDate,
        status,
        type,
        formatForAI = false
      } = options;

      // Construir filtros
      const filters = {
        $or: [
          { fromPhone: phoneNumber },
          { toPhone: phoneNumber }
        ]
      };

      // Adicionar filtros opcionais
      if (project) filters.project = project;
      if (status) filters.status = status;
      if (type) filters.type = type;

      // Filtro por data
      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.$gte = new Date(startDate);
        if (endDate) filters.createdAt.$lte = new Date(endDate);
      }

      // Se formatar para IA, buscar em ordem cronológica crescente
      const sortOrder = formatForAI ? { createdAt: 1 } : { createdAt: -1 };

      const messages = await Message.find(filters)
        .sort(sortOrder)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('project', 'name');

      const total = await Message.countDocuments(filters);

      let formattedMessages = messages;

      // Se formatar para IA, converter para formato de contexto
      if (formatForAI) {
        formattedMessages = messages.map(msg => {
          // Se fromPhone é igual ao phoneNumber, é uma mensagem do usuário
          const isFromUser = msg.fromPhone === phoneNumber;
          
          return {
            role: isFromUser ? 'user' : 'assistant',
            content: msg.content
          };
        });
      }

      return {
        success: true,
        data: {
          phoneNumber,
          messages: formattedMessages,
          pagination: {
            count: messages.length,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Busca histórico de conversa entre cliente e sistema
   * @param {string} clientPhone - Telefone do cliente
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} Histórico da conversa
   */
  static async getConversationHistory(clientPhone, options = {}) {
    try {
      const {
        project,
        limit = 100,
        skip = 0,
        startDate,
        endDate,
        includeSystemMessages = true
      } = options;

      // Construir filtros base
      const filters = {
        $or: [
          { fromPhone: clientPhone },
          { toPhone: clientPhone }
        ]
      };

      // Adicionar filtros opcionais
      if (project) filters.project = project;

      // Filtro por data
      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.$gte = new Date(startDate);
        if (endDate) filters.createdAt.$lte = new Date(endDate);
      }

      // Se não incluir mensagens do sistema, filtrar apenas mensagens do cliente
      if (includeSystemMessages === false) {
        filters.fromPhone = clientPhone;
      }

      const messages = await Message.find(filters)
        .sort({ createdAt: 1 }) // Ordem cronológica crescente
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('project', 'name')
        .lean();

      // Adicionar informação sobre direção da mensagem
      const messagesWithDirection = messages.map(msg => ({
        ...msg,
        direction: msg.fromPhone === clientPhone ? 'outgoing' : 'incoming',
        isFromClient: msg.fromPhone === clientPhone,
        isToClient: msg.toPhone === clientPhone
      }));

      const total = await Message.countDocuments(filters);

      // Estatísticas da conversa
      const conversationStats = await Message.aggregate([
        { $match: filters },
        {
          $group: {
            _id: null,
            totalMessages: { $sum: 1 },
            clientMessages: {
              $sum: {
                $cond: [{ $eq: ['$fromPhone', clientPhone] }, 1, 0]
              }
            },
            systemMessages: {
              $sum: {
                $cond: [{ $ne: ['$fromPhone', clientPhone] }, 1, 0]
              }
            },
            firstMessageAt: { $min: '$createdAt' },
            lastMessageAt: { $max: '$createdAt' },
            totalCost: { $sum: '$cost' }
          }
        }
      ]);

      const stats = conversationStats[0] || {
        totalMessages: 0,
        clientMessages: 0,
        systemMessages: 0,
        firstMessageAt: null,
        lastMessageAt: null,
        totalCost: 0
      };

      return {
        success: true,
        data: {
          clientPhone,
          messages: messagesWithDirection,
          pagination: {
            count: messagesWithDirection.length,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
          },
          stats: {
            ...stats,
            conversationDuration: stats.lastMessageAt && stats.firstMessageAt
              ? Math.floor((new Date(stats.lastMessageAt) - new Date(stats.firstMessageAt)) / (1000 * 60 * 60 * 24))
              : 0
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cria uma nova mensagem
   * @param {Object} messageData - Dados da mensagem
   * @returns {Promise<Object>} Resultado da criação
   */
  static async createMessage(messageData) {
    try {
      const message = await Message.create(messageData);
      return {
        success: true,
        data: message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Busca mensagem por ID
   * @param {string} messageId - ID da mensagem
   * @returns {Promise<Object>} Resultado da busca
   */
  static async getMessageById(messageId) {
    try {
      const message = await Message.findById(messageId).populate('project', 'name');
      
      if (!message) {
        return {
          success: false,
          error: 'Mensagem não encontrada'
        };
      }

      return {
        success: true,
        data: message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Atualiza uma mensagem
   * @param {string} messageId - ID da mensagem
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Resultado da atualização
   */
  static async updateMessage(messageId, updateData) {
    try {
      const message = await Message.findByIdAndUpdate(messageId, updateData, { new: true });
      
      if (!message) {
        return {
          success: false,
          error: 'Mensagem não encontrada'
        };
      }

      return {
        success: true,
        data: message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Deleta uma mensagem
   * @param {string} messageId - ID da mensagem
   * @returns {Promise<Object>} Resultado da exclusão
   */
  static async deleteMessage(messageId) {
    try {
      const message = await Message.findByIdAndDelete(messageId);
      
      if (!message) {
        return {
          success: false,
          error: 'Mensagem não encontrada'
        };
      }

      return {
        success: true,
        data: message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Busca mensagens com filtros
   * @param {Object} filters - Filtros de busca
   * @param {Object} options - Opções de paginação
   * @returns {Promise<Object>} Resultado da busca
   */
  static async getMessages(filters = {}, options = {}) {
    try {
      const {
        limit = 50,
        skip = 0,
        sort = { createdAt: -1 }
      } = options;

      const messages = await Message.find(filters)
        .sort(sort)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('project', 'name');

      const total = await Message.countDocuments(filters);

      return {
        success: true,
        data: {
          messages,
          pagination: {
            count: messages.length,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Busca estatísticas das mensagens
   * @param {Object} filters - Filtros para as estatísticas
   * @returns {Promise<Object>} Estatísticas
   */
  static async getMessageStats(filters = {}) {
    try {
      const stats = await Message.aggregate([
        { $match: filters },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            totalCost: { $sum: '$cost' }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        pending: 0,
        totalCost: 0
      };

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default MessageService;
