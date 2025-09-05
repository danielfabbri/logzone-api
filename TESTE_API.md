# Teste da API Logzone

## Configuração

1. Certifique-se de que o MongoDB está rodando localmente na porta 27017
2. O banco de dados usado é `test` e a collection `users`

## Rotas Disponíveis

### GET /users
Busca todos os usuários da collection `users`

**Exemplo de resposta:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f1234567890abcdef12345",
      "name": "João Silva",
      "email": "joao@email.com",
      "age": 30,
      "createdAt": "2023-09-01T10:00:00.000Z"
    },
    {
      "_id": "64f1234567890abcdef12346",
      "name": "Maria Santos",
      "email": "maria@email.com",
      "age": 25,
      "createdAt": "2023-09-01T11:00:00.000Z"
    }
  ]
}
```

## Como testar

1. Inicie o servidor:
   ```bash
   npm start
   ```

2. Teste a rota com curl ou Postman:
   ```bash
   curl http://localhost:3000/users
   ```

3. Ou acesse diretamente no navegador:
   ```
   http://localhost:3000/users
   ```

## Estrutura do Modelo User

- `name`: String obrigatória
- `email`: String obrigatória e única
- `age`: Number opcional
- `createdAt`: Data de criação automática
