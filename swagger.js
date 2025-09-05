// swagger.js (ESM)
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const setupSwagger = (app) => {
  const port = process.env.PORT || 3000;
  const serverUrl = process.env.SWAGGER_SERVER_URL || `http://localhost:${port}`;

  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Logzone API",
        version: "1.0.0",
        description: "Documentação da API com Swagger",
      },
      servers: [
        {
          url: serverUrl,
        },
      ],
    },
    // Busca anotações JSDoc nas rotas
    apis: ["./routes/*.js"],
  };

  const swaggerSpec = swaggerJSDoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;
