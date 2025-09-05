import mongoose from 'mongoose';

// Configuração do banco de teste
const TEST_DB_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/logzone_test';

// Setup antes de todos os testes
beforeAll(async () => {
  try {
    // Verificar se já há uma conexão ativa
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(TEST_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao banco de teste');
  } catch (error) {
    console.error('❌ Erro ao conectar no banco de teste:', error);
  }
});

// Cleanup após todos os testes
afterAll(async () => {
  try {
    // Limpar todas as collections
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
    
    await mongoose.connection.close();
    console.log('✅ Conexão com banco de teste fechada');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error);
  }
});

// Limpar dados entre testes
afterEach(async () => {
  try {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
  }
});