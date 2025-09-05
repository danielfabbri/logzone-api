import mongoose from 'mongoose';
import { getBaseFields, addTimestamps } from './BaseModel.js';

const messageSchema = new mongoose.Schema({
  ...getBaseFields(),

  // Referência ao projeto dono da mensagem
  project: {
    type: mongoose.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },

  // Conteúdo da mensagem
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Telefone de quem enviou a mensagem
  fromPhone: {
    type: String,
    required: true,
    index: true
  },

  // Telefone de quem recebeu a mensagem
  toPhone: {
    type: String,
    required: true,
    index: true
  },

  // Tipo da mensagem (SMS, WhatsApp, etc.)
  type: {
    type: String,
    enum: ['sms', 'whatsapp', 'email', 'push', 'other'],
    default: 'sms',
    index: true
  },

  // Status da mensagem
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },

  // ID da mensagem no provedor externo (ex: Twilio, WhatsApp API)
  externalId: {
    type: String,
    index: true
  },

  // Provedor usado para enviar a mensagem
  provider: {
    type: String,
    enum: ['twilio', 'whatsapp_business', 'sendgrid', 'other'],
    default: 'other'
  },

  // Custo da mensagem (se aplicável)
  cost: {
    type: Number,
    default: 0
  },

  // Moeda do custo
  currency: {
    type: String,
    default: 'BRL'
  },

  // Tentativas de envio
  attempts: {
    type: Number,
    default: 0
  },

  // Última tentativa de envio
  lastAttemptAt: {
    type: Date
  },

  // Data/hora agendada para envio
  scheduledAt: {
    type: Date,
    index: true
  },

  // Data/hora de entrega confirmada
  deliveredAt: {
    type: Date
  },

  // Data/hora de leitura confirmada
  readAt: {
    type: Date
  },

  // Metadados adicionais
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Tags para categorização
  tags: {
    type: [String],
    default: [],
    index: true
  },

  // Prioridade da mensagem
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },

  // Template usado (se aplicável)
  template: {
    type: String
  },

  // Variáveis do template
  templateVariables: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Índices para consultas eficientes
messageSchema.index({ project: 1, status: 1, createdAt: -1 });
messageSchema.index({ fromPhone: 1, toPhone: 1, createdAt: -1 });
messageSchema.index({ scheduledAt: 1, status: 1 });
messageSchema.index({ externalId: 1, provider: 1 });
messageSchema.index({ tags: 1, createdAt: -1 });

// Aplicar middleware de timestamps automaticamente
addTimestamps(messageSchema);

const Message = mongoose.model('Message', messageSchema);

export default Message;
