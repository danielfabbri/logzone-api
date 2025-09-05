import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // String de conexão - ajuste conforme sua configuração
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB conectado: ${conn.connection.host}`);
    console.log(`Banco de dados: ${conn.connection.name}`);
  } catch (error) {
    console.error('Erro ao conectar com MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
