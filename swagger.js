// swagger.js (ESM)
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { SwaggerTheme } from "swagger-themes";

const theme = new SwaggerTheme();
const darkTheme = theme.getBuffer("dark");


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
  app.use(
    "/api-docs", 
    swaggerUi.serve, 
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: darkTheme,
      customSiteTitle: "📖 Logzone API Docs",
    }));
};

export default setupSwagger;
