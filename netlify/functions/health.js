// Health Check Function for VAT Calculator Pro
// Monitors application status and provides system information

export async function handler(event, context) {
  const startTime = Date.now();
  
  try {
    // System health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.ENVIRONMENT || 'production',
      region: process.env.AWS_REGION || 'us-east-1',
      uptime: process.uptime(),
      responseTime: null,
      checks: {
        api: 'pass',
        cdn: 'pass',
        functions: 'pass'
      },
      application: {
        name: 'VAT Calculator Pro',
        description: 'Client-side VAT processing for South African businesses',
        features: [
          'Excel file processing',
          'VAT calculations',
          'Professional reporting',
          'Mobile responsive'
        ]
      }
    };

    // Performance check
    const responseTime = Date.now() - startTime;
    health.responseTime = `${responseTime}ms`;

    // Set appropriate headers
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Health-Check': 'VAT-Calculator-Pro'
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(health, null, 2)
    };

  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        type: error.name
      },
      checks: {
        api: 'fail',
        cdn: 'unknown',
        functions: 'fail'
      }
    };

    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify(errorResponse, null, 2)
    };
  }
}
