import fetch from 'node-fetch';

class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.endpoint = "https://openrouter.ai/api/v1/chat/completions";
    this.defaultModel = "openai/gpt-4o-mini";
  }

  /**
   * Envia mensagem para IA e recebe resposta
   * @param {string} userMessage - Mensagem do usuário
   * @param {Array} conversationHistory - Histórico da conversa formatado para IA
   * @param {string} systemContext - Contexto do sistema/agente
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Resposta da IA
   */
  async sendMessage(userMessage, conversationHistory = [], systemContext = "", options = {}) {
    try {
      const {
        model = this.defaultModel,
        temperature = 0.7,
        maxTokens = 1000,
        project = null
      } = options;

      // Construir array de mensagens
      const messages = [];

      // Adicionar contexto do sistema se fornecido
      if (systemContext) {
        messages.push({
          role: "system",
          content: systemContext
        });
      }

      // Adicionar histórico da conversa
      if (conversationHistory && conversationHistory.length > 0) {
        messages.push(...conversationHistory);
      }

      // Adicionar mensagem atual do usuário
      messages.push({
        role: "user",
        content: userMessage
      });

      // Payload para OpenRouter
      const payload = {
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens
      };

      // Fazer requisição para OpenRouter
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL,
          'X-Title': process.env.APP_NAME
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();

      // Extrair resposta da IA
      const aiResponse = responseData.choices?.[0]?.message?.content || '';
      const usage = responseData.usage || {};

      return {
        success: true,
        data: {
          message: aiResponse,
          usage: usage,
          model: model,
          conversationLength: messages.length
        }
      };

    } catch (error) {
      console.error('AIService Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gera resposta para mensagem de WhatsApp/SMS
   * @param {string} userMessage - Mensagem do usuário
   * @param {string} userPhone - Telefone do usuário
   * @param {Array} conversationHistory - Histórico da conversa
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Resposta formatada
   */
  async generateResponse(userMessage, userPhone, conversationHistory = [], options = {}) {
    try {
      const {
        project = null,
        agentContext = "Você é um assistente virtual amigável e prestativo. Responda de forma clara e concisa.",
        model = this.defaultModel
      } = options;

      // Contexto específico do projeto se fornecido
      let systemContext = agentContext;
      if (project) {
        systemContext += `\n\nContexto do projeto: ${project.name || 'Projeto não especificado'}`;
        if (project.description) {
          systemContext += `\nDescrição: ${project.description}`;
        }
      }

      // Enviar para IA
      const aiResult = await this.sendMessage(userMessage, conversationHistory, systemContext, {
        model,
        project
      });

      if (!aiResult.success) {
        return {
          success: false,
          error: aiResult.error
        };
      }

      // Preparar resposta formatada
      const response = {
        success: true,
        data: {
          userPhone: userPhone,
          aiMessage: aiResult.data.message,
          model: aiResult.data.model,
          usage: aiResult.data.usage,
          conversationLength: aiResult.data.conversationLength,
          timestamp: new Date().toISOString()
        }
      };

      return response;

    } catch (error) {
      console.error('AIService generateResponse Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Valida se a API key está configurada
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey && this.apiKey !== "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";
  }

  /**
   * Testa conexão com OpenRouter
   * @returns {Promise<Object>} Resultado do teste
   */
  async testConnection() {
    try {
      const testResult = await this.sendMessage("Olá, você está funcionando?", [], "Responda apenas 'Sim, estou funcionando!'");
      
      return {
        success: testResult.success,
        message: testResult.success ? "Conexão com OpenRouter OK" : "Erro na conexão",
        error: testResult.error
      };
    } catch (error) {
      return {
        success: false,
        message: "Erro ao testar conexão",
        error: error.message
      };
    }
  }
}

export default AIService;
