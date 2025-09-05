import mongoose from 'mongoose';
import { getBaseFields, addTimestamps } from './BaseModel.js';

const projectSchema = new mongoose.Schema({
  ...getBaseFields(),
  name:{
      type: String,
  },
  description: {
      type: String
  },
  status: {
      type: String
  },
  logs: {
    type: Array
  },
  avatar: String,
});

// Aplicar middleware de timestamps automaticamente
addTimestamps(projectSchema);

const Project = mongoose.model('Project', projectSchema);

export default Project;
