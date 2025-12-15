/**
 * Production Deployment Configuration for Physical AI & Humanoid Robotics Textbook
 *
 * This configuration file defines the settings needed for deploying the application
 * to production environments, including both frontend (GitHub Pages) and backend services.
 */

const config = {
  // Application metadata
  app: {
    name: 'Physical AI & Humanoid Robotics Textbook',
    version: '1.0.0',
    description: 'Interactive textbook with AI-powered assistance for Physical AI & Humanoid Robotics',
    repository: 'https://github.com/your-username/physical-ai-textbook',
    license: 'MIT',
  },

  // Frontend deployment configuration (GitHub Pages)
  frontend: {
    deployment: {
      provider: 'github-pages',
      branch: 'gh-pages',
      cname: process.env.PRODUCTION_DOMAIN || 'textbook.physicalai.org',
      buildCommand: 'npm run build',
      outputDirectory: 'build',
      publicPath: process.env.PUBLIC_PATH || '/',
    },
    environment: {
      // API endpoint for production
      apiUrl: process.env.REACT_APP_API_URL || 'https://api.physicalai.org',

      // Analytics and monitoring
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
      sentryDsn: process.env.SENTRY_DSN,

      // Feature flags for production
      enableAiFeatures: true,
      enableProgressTracking: true,
      enableChatbot: true,
      enableContentSearch: true,
    },
    optimization: {
      // Performance optimizations
      minify: true,
      gzipCompression: true,
      imageOptimization: true,

      // Caching settings
      cacheHeaders: {
        'text/html': 'public, max-age=0',
        'text/css': 'public, max-age=31536000, immutable',
        'application/javascript': 'public, max-age=31536000, immutable',
        'image/*': 'public, max-age=31536000, immutable',
        'font/*': 'public, max-age=31536000, immutable',
      },
    },
  },

  // Backend deployment configuration
  backend: {
    deployment: {
      provider: process.env.BACKEND_PROVIDER || 'heroku', // Options: heroku, railway, aws, gcp
      region: process.env.DEPLOY_REGION || 'us-east-1',
      instanceType: process.env.INSTANCE_TYPE || 'standard-1x',
      autoScaling: {
        minInstances: 1,
        maxInstances: 5,
        cpuThreshold: 70, // Percentage
        memoryThreshold: 80, // Percentage
      },
    },
    environment: {
      // Database configuration
      databaseUrl: process.env.DATABASE_URL,

      // AI/ML services
      openaiApiKey: process.env.OPENAI_API_KEY,
      qdrantUrl: process.env.QDRANT_URL,
      qdrantApiKey: process.env.QDRANT_API_KEY,

      // Security
      jwtSecret: process.env.JWT_SECRET,
      corsOrigin: process.env.CORS_ORIGIN || 'https://your-username.github.io',

      // Application settings
      appEnvironment: 'production',
      appLogLevel: 'info',
      maxRequestBodySize: '10mb',
      rateLimitWindowMs: 900000, // 15 minutes
      rateLimitMaxRequests: 100, // Limit each IP to 100 requests per windowMs
    },
    security: {
      // Security headers and measures
      helmetEnabled: true,
      corsEnabled: true,
      rateLimiting: true,
      inputValidation: true,
      authenticationRequired: true,
      sslRequired: true,
    },
    monitoring: {
      // Application performance monitoring
      enableLogging: true,
      logLevel: 'info',
      logFormat: 'combined',
      errorReporting: true,
      healthCheckEndpoint: '/health',
      metricsEndpoint: '/metrics',
    },
  },

  // Content management
  content: {
    storage: {
      provider: 'github', // Using GitHub for content management
      repository: 'your-username/physical-ai-textbook-content',
      branch: 'main',
      path: 'content/',
    },
    synchronization: {
      webhookEndpoint: '/api/webhooks/content-sync',
      updateFrequency: 'manual', // Manual triggers or automated
      previewEnabled: true,
    },
  },

  // CDN and asset delivery
  cdn: {
    provider: process.env.CDN_PROVIDER || 'cloudflare',
    cacheTtl: 31536000, // 1 year for static assets
    compression: true,
    ssl: true,
    security: {
      ddosProtection: true,
      webApplicationFirewall: true,
    },
  },

  // Monitoring and observability
  monitoring: {
    uptimeMonitoring: {
      endpoint: process.env.UPTIME_MONITOR_ENDPOINT || 'https://api.physicalai.org/health',
      interval: 60, // Check every minute
      alertRecipients: process.env.ALERT_RECIPIENTS?.split(',') || [],
    },
    performanceMonitoring: {
      frontend: true,
      backend: true,
      thresholds: {
        pageLoadTime: 3000, // 3 seconds
        apiResponseTime: 1000, // 1 second
        chatbotResponseTime: 5000, // 5 seconds
      },
    },
    errorTracking: {
      enabled: true,
      retentionDays: 90,
      alertThreshold: 5, // Alert if 5+ errors in 1 hour
    },
  },

  // Backup and disaster recovery
  backup: {
    frequency: 'daily',
    retention: '30d',
    locations: ['primary', 'secondary'],
    verification: true,
    encryption: true,
  },

  // Deployment scripts and automation
  deployment: {
    scripts: {
      preDeploy: './scripts/pre-deploy.sh',
      postDeploy: './scripts/post-deploy.sh',
      healthCheck: './scripts/health-check.sh',
      rollback: './scripts/rollback.sh',
    },
    ciCd: {
      providers: ['github-actions'],
      workflows: {
        frontend: '.github/workflows/deploy-frontend.yml',
        backend: '.github/workflows/deploy-backend.yml',
        preview: '.github/workflows/deploy-preview.yml',
      },
    },
    environmentVariables: [
      'DATABASE_URL',
      'OPENAI_API_KEY',
      'QDRANT_URL',
      'QDRANT_API_KEY',
      'JWT_SECRET',
      'CORS_ORIGIN',
      'GOOGLE_ANALYTICS_ID',
      'SENTRY_DSN',
    ],
  },

  // Feature flags for production
  features: {
    // Enable/disable features in production
    aiAssistant: {
      enabled: true,
      maxTokens: 2048,
      temperature: 0.7,
      responseTimeout: 10000, // 10 seconds
    },
    userAuthentication: {
      enabled: false, // Initially disabled for open access
      providers: ['google', 'github'], // Available auth providers
    },
    progressTracking: {
      enabled: true,
      persistence: 'localStorage', // Or 'database' for logged-in users
    },
    contentSearch: {
      enabled: true,
      provider: 'algolia', // Or 'internal' for basic search
    },
    offlineMode: {
      enabled: false, // PWA features
      cacheStrategy: 'network-first',
    },
  },

  // Legal and compliance
  legal: {
    privacyPolicyUrl: '/privacy-policy',
    termsOfServiceUrl: '/terms-of-service',
    cookiePolicyUrl: '/cookie-policy',
    gdprCompliant: true,
    dataRetentionPeriod: 365, // Days
  },
};

// Export configuration with validation
const validateConfig = (config) => {
  const errors = [];

  // Validate required fields
  if (!config.backend.environment.databaseUrl) {
    errors.push('DATABASE_URL is required for production');
  }

  if (!config.backend.environment.openaiApiKey) {
    errors.push('OPENAI_API_KEY is required for production');
  }

  if (!config.backend.environment.qdrantUrl) {
    errors.push('QDRANT_URL is required for production');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  return true;
};

try {
  validateConfig(config);
  console.log('✅ Production configuration is valid');
} catch (error) {
  console.error('❌ Configuration validation error:', error.message);
  process.exit(1);
}

module.exports = config;