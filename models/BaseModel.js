import mongoose from 'mongoose';

// Função que retorna os campos base para qualquer schema
export const getBaseFields = () => ({
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  updatedBy: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  }
});

// Função para aplicar middleware de timestamp em qualquer schema
export const addTimestamps = (schema) => {
  schema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });
  
  schema.pre('updateOne', function(next) {
    this.set({ updatedAt: new Date() });
    next();
  });
  
  schema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
  });
};
