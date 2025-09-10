import mongoose from 'mongoose';
import { getBaseFields, addTimestamps } from './BaseModel.js';

const userSchema = new mongoose.Schema({
  ...getBaseFields(),
  email: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  name:{
      type: String,
  },
  phoneNumber: {
      type: String
  },
  cpf: {
      type: String
  },
  cnpj: {
      type: String
  },
  password: {
      type: String,
      required: true,
  },
  role: {
      type: String
  },
  birthDay: {
      type: Date
  },
  avatar: String,
  company: String
});

// Aplicar middleware de timestamps automaticamente
addTimestamps(userSchema);

const User = mongoose.model('User', userSchema);

export default User;
