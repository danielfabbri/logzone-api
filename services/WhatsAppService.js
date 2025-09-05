import fetch from 'node-fetch';

class WhatsAppService {
  constructor() {
    this.baseUrl = "https://gateway.apibrasil.io/api/v2";
    this.email = process.env.WHATSAPP_EMAIL;
    this.password = process.env.WHATSAPP_PASSWORD;
    this.deviceToken = process.env.WHATSAPP_DEVICE_TOKEN;
    this.bearerToken = process.env.WHATSAPP_BEARER_TOKEN; // Sempre começar sem token
    this.tokenExpiry = null;
  }

  /**
   * Faz login na API Brasil e obtém o token de autenticação
   * @returns {Promise<Object>} Resultado do login
   */
  async login() {
    try {
      // Verificar se as credenciais estão configuradas
      if (!this.email || !this.password) {
        throw new Error('WhatsApp credentials not configured. Please set WHATSAPP_EMAIL and WHATSAPP_PASSWORD environment variables.');
      }

      const loginData = {
        email: this.email,
        password: this.password
      };

      console.log('WhatsAppService: Attempting login...', { email: this.email });

      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const responseText = await response.text();
      console.log('WhatsAppService: Login response status:', response.status);
      console.log('WhatsAppService: Login response body:', responseText);

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} - ${responseText}`);
      }

      const responseData = JSON.parse(responseText);
      
      // Extrair token de diferentes possíveis campos da resposta
      // this.bearerToken = responseData.token || 
      //                   responseData.access_token || 
      //                   responseData.accessToken ||
      //                   responseData.data?.token ||
      //                   responseData.data?.access_token;

      if (!this.bearerToken) {
        console.error('WhatsAppService: Token not found in response:', responseData);
        throw new Error('Token not found in login response');
      }

      // Calcular expiração (assumindo 1 hora de validade)
      this.tokenExpiry = new Date(Date.now() + (60 * 60 * 1000));

      console.log('WhatsAppService: Login successful, token obtained');

      return {
        success: true,
        data: {
          token: this.bearerToken,
          expiresAt: this.tokenExpiry
        }
      };

    } catch (error) {
      console.error('WhatsAppService Login Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica se o token está válido e faz login se necessário
   * @returns {Promise<boolean>} True se token está válido
   */
  async ensureValidToken() {
    // Sempre forçar login se não temos token ou se está próximo do vencimento
    if (!this.bearerToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      console.log('WhatsAppService: Token invalid or expired, attempting login...');
      const loginResult = await this.login();
      if (!loginResult.success) {
        console.error('WhatsAppService: Failed to obtain valid token:', loginResult.error);
        return false;
      }
      console.log('WhatsAppService: Token refreshed successfully');
      return true;
    }
    return true;
  }

  /**
   * Envia mensagem de texto via WhatsApp
   * @param {string} phoneNumber - Número do telefone (formato: 5521999999999)
   * @param {string} message - Texto da mensagem
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendTextMessage(phoneNumber, message, options = {}) {
    try {
      // Verificar se o device token está configurado
      if (!this.deviceToken) {
        throw new Error('Device token not configured. Please set WHATSAPP_DEVICE_TOKEN environment variable.');
      }

      // Garantir que temos um token válido
      const tokenValid = await this.ensureValidToken();
      if (!tokenValid) {
        throw new Error('Failed to obtain valid authentication token');
      }

      const {
        timeTyping = 1000,
        delay = 0
      } = options;

      const payload = {
        number: phoneNumber,
        text: message,
        time_typing: timeTyping
      };

      console.log('WhatsAppService: Sending message...', {
        phoneNumber,
        message: message.substring(0, 50) + '...',
        deviceToken: this.deviceToken,
        hasBearerToken: !!this.bearerToken
      });

      // Aplicar delay se especificado
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await fetch(`${this.baseUrl}/whatsapp/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DeviceToken': this.deviceToken,
          'Authorization': `Bearer ${this.bearerToken}`
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log('WhatsAppService: Send response status:', response.status);
      console.log('WhatsAppService: Send response body:', responseText);

      if (!response.ok) {
        throw new Error(`Send message failed: ${response.status} - ${responseText}`);
      }

      const responseData = JSON.parse(responseText);

      console.log('WhatsAppService: Message sent successfully');

      return {
        success: true,
        data: {
          messageId: responseData.id || responseData.messageId,
          status: responseData.status || 'sent',
          phoneNumber: phoneNumber,
          message: message,
          response: responseData
        }
      };

    } catch (error) {
      console.error('WhatsAppService SendText Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envia mensagem de mídia via WhatsApp
   * @param {string} phoneNumber - Número do telefone
   * @param {string} mediaUrl - URL da mídia
   * @param {string} caption - Legenda da mídia
   * @param {string} mediaType - Tipo da mídia (image, video, document, audio)
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendMediaMessage(phoneNumber, mediaUrl, caption = '', mediaType = 'image') {
    try {
      const tokenValid = await this.ensureValidToken();
      if (!tokenValid) {
        throw new Error('Failed to obtain valid authentication token');
      }

      const payload = {
        number: phoneNumber,
        media: mediaUrl,
        caption: caption,
        type: mediaType
      };

      const response = await fetch(`${this.baseUrl}/whatsapp/sendMedia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DeviceToken': this.deviceToken,
          'Authorization': `Bearer ${this.bearerToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Send media failed: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();

      return {
        success: true,
        data: {
          messageId: responseData.id || responseData.messageId,
          status: responseData.status || 'sent',
          phoneNumber: phoneNumber,
          mediaUrl: mediaUrl,
          mediaType: mediaType,
          response: responseData
        }
      };

    } catch (error) {
      console.error('WhatsAppService SendMedia Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envia mensagem de localização via WhatsApp
   * @param {string} phoneNumber - Número do telefone
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {string} name - Nome do local
   * @param {string} address - Endereço do local
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendLocationMessage(phoneNumber, latitude, longitude, name = '', address = '') {
    try {
      const tokenValid = await this.ensureValidToken();
      if (!tokenValid) {
        throw new Error('Failed to obtain valid authentication token');
      }

      const payload = {
        number: phoneNumber,
        latitude: latitude,
        longitude: longitude,
        name: name,
        address: address
      };

      const response = await fetch(`${this.baseUrl}/whatsapp/sendLocation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DeviceToken': this.deviceToken,
          'Authorization': `Bearer ${this.bearerToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Send location failed: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();

      return {
        success: true,
        data: {
          messageId: responseData.id || responseData.messageId,
          status: responseData.status || 'sent',
          phoneNumber: phoneNumber,
          location: { latitude, longitude, name, address },
          response: responseData
        }
      };

    } catch (error) {
      console.error('WhatsAppService SendLocation Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica o status de uma mensagem
   * @param {string} messageId - ID da mensagem
   * @returns {Promise<Object>} Status da mensagem
   */
  async getMessageStatus(messageId) {
    try {
      const tokenValid = await this.ensureValidToken();
      if (!tokenValid) {
        throw new Error('Failed to obtain valid authentication token');
      }

      const response = await fetch(`${this.baseUrl}/whatsapp/message/${messageId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'DeviceToken': this.deviceToken,
          'Authorization': `Bearer ${this.bearerToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Get status failed: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();

      return {
        success: true,
        data: {
          messageId: messageId,
          status: responseData.status,
          response: responseData
        }
      };

    } catch (error) {
      console.error('WhatsAppService GetStatus Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Testa a conexão com a API
   * @returns {Promise<Object>} Resultado do teste
   */
  async testConnection() {
    try {
      const loginResult = await this.login();
      
      if (!loginResult.success) {
        return {
          success: false,
          message: "Falha no login",
          error: loginResult.error
        };
      }

      return {
        success: true,
        message: "Conexão com WhatsApp API OK",
        data: {
          token: loginResult.data.token,
          expiresAt: loginResult.data.expiresAt
        }
      };

    } catch (error) {
      return {
        success: false,
        message: "Erro ao testar conexão",
        error: error.message
      };
    }
  }

  /**
   * Formata número de telefone para o padrão da API
   * @param {string} phoneNumber - Número de telefone
   * @returns {string} Número formatado
   */
  formatPhoneNumber(phoneNumber) {
    // Remove caracteres não numéricos
    let formatted = phoneNumber.replace(/\D/g, '');
    
    // Adiciona código do país se não tiver
    if (!formatted.startsWith('55')) {
      formatted = '55' + formatted;
    }
    
    return formatted;
  }
}

export default WhatsAppService;
