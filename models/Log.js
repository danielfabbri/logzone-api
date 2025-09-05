import mongoose from 'mongoose';
import { getBaseFields, addTimestamps } from './BaseModel.js';

const logSchema = new mongoose.Schema({
  ...getBaseFields(),

  // Referência ao projeto dono do log
  project: {
    type: mongoose.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },

  // Origem do log (nome do serviço/app/módulo)
  source: {
    type: String,
    index: true
  },

  // Ambiente (prod, staging, dev, etc)
  environment: {
    type: String,
    default: 'prod',
    index: true
  },

  // Nível do log
  level: {
    type: String,
    enum: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
    default: 'info',
    index: true
  },

  // Mensagem principal do log
  message: {
    type: String,
    required: true
  },

  // Contexto adicional em texto livre (stack, local, etc.)
  context: {
    type: String
  },

  // Metadados estruturados arbitrários enviados pelo cliente
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Informações de request (quando aplicável)
  request: {
    method: String,
    url: String,
    headers: mongoose.Schema.Types.Mixed,
    body: mongoose.Schema.Types.Mixed,
    userAgent: String,
    ip: String
  },

  // Tags livres para facilitar filtros e busca
  tags: {
    type: [String],
    default: [],
    index: true
  },

  // Momento em que o evento ocorreu na origem
  occurredAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Índices para consultas eficientes
logSchema.index({ project: 1, level: 1, occurredAt: -1 });
logSchema.index({ project: 1, tags: 1, occurredAt: -1 });
logSchema.index({ occurredAt: -1 });
logSchema.index({ message: 'text', context: 'text', source: 'text' });

// Aplicar middleware de timestamps automaticamente
addTimestamps(logSchema);

const Log = mongoose.model('Log', logSchema);

export default Log;


