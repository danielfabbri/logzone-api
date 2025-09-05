# Testes de Integração - Logzone API

## 🚀 Como executar os testes

### Pré-requisitos
- MongoDB rodando localmente na porta 27017
- Node.js instalado
- Dependências instaladas (`npm install`)

### Comandos disponíveis

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (re-executa quando arquivos mudam)
npm run test:watch

# Executar testes com relatório de cobertura
npm run test:coverage
```

## 📁 Estrutura dos testes

```
tests/
├── setup.js                    # Configuração global dos testes
├── integrations/
│   ├── users-api.test.js       # Testes da API de usuários
│   └── projects-api.test.js    # Testes da API de projetos
```

## 🧪 O que é testado

### Users API (`/api/v1/users`)
- ✅ GET - Listar todos os usuários
- ✅ POST - Criar novo usuário
- ✅ GET /:id - Buscar usuário por ID
- ✅ Validação de campos obrigatórios
- ✅ Tratamento de erros

### Projects API (`/api/v1/projects`)
- ✅ GET - Listar todos os projetos
- ✅ POST - Criar novo projeto
- ✅ GET /:id - Buscar projeto por ID
- ✅ PUT /:id - Atualizar projeto
- ✅ DELETE /:id - Deletar projeto
- ✅ Validação de dados
- ✅ Tratamento de erros

## 🔧 Configuração

### Banco de dados de teste
- **Banco**: `logzone_test` (separado do banco de produção)
- **URI**: `mongodb://localhost:27017/logzone_test`
- **Limpeza**: Dados são limpos automaticamente entre testes

### Variáveis de ambiente
Crie um arquivo `.env` com:
```env
# Para testes
TEST_MONGO_URI=mongodb://localhost:27017/logzone_test

# Para desenvolvimento
MONGO_URI=mongodb://localhost:27017/test
PORT=3000
```

## 📊 Exemplo de saída

```bash
> npm test

 PASS  tests/integrations/users-api.test.js
 PASS  tests/integrations/projects-api.test.js

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
Time:        2.345s
```

## 🐛 Troubleshooting

### Erro de conexão com MongoDB
- Verifique se o MongoDB está rodando: `mongod --version`
- Verifique se a porta 27017 está livre

### Erro de módulos ES
- Certifique-se de que o `package.json` tem `"type": "module"`
- Verifique se o `jest.config.js` está configurado corretamente

### Testes falhando
- Verifique se as rotas estão funcionando manualmente no Postman
- Verifique se os modelos estão importados corretamente
