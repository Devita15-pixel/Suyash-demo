const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const os = require('os');

// Function to get local IP address
const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

// Swagger configuration - MINIMAL
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Management & Quotation System API',
      version: '1.0.0',
      description: 'API documentation'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: 'http://localhost:5009',
        description: 'Local server'
      },
      {
        url: 'http://{ip}:5009',
        description: 'Network access',
        variables: {
          ip: {
            default: getLocalIp(),
            description: 'Your IP address'
          }
        }
      }
    ]
  },
  apis: ['./routes/*.js']
};

// Generate Swagger specification
const specs = swaggerJsdoc(options);

// Swagger UI configuration
const swaggerUiOptions = {
  customSiteTitle: "Employee & Quotation System API Docs",
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    validatorUrl: null,
    persistAuthorization: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true
  }
};

// Setup Swagger middleware
const setupSwagger = (app) => {
  app.get('/api-docs/swagger.json', (req, res) => {
    const dynamicSpecs = {
      ...specs,
      servers: [
        {
          url: `${req.protocol}://${req.get('host')}`,
          description: 'Current server'
        }
      ]
    };
    res.setHeader('Content-Type', 'application/json');
    res.send(dynamicSpecs);
  });

  app.use('/api-docs',
    swaggerUi.serve,
    (req, res, next) => {
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'");
      next();
    },
    swaggerUi.setup(null, {
      ...swaggerUiOptions,
      explorer: true,
      swaggerUrl: '/api-docs/swagger.json'
    })
  );
};

module.exports = {
  setupSwagger,
  getLocalIp
};