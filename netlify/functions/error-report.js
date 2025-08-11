// Error Reporting Function for VAT Calculator Pro
// Collects client-side errors for monitoring and debugging

export async function handler(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST'
      },
      body: JSON.stringify({ 
        error: 'Method not allowed' 
      })
    };
  }

  try {
    const errorData = JSON.parse(event.body);
    
    // Validate error report structure
    const {
      message,
      stack,
      userAgent,
      url,
      timestamp,
      userId,
      sessionId,
      vatCalculation,
      fileInfo
    } = errorData;

    // Basic validation
    if (!message || !timestamp) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required fields: message, timestamp'
        })
      };
    }

    // Sanitize and structure error data
    const sanitizedError = {
      // Core error information
      message: message.substring(0, 500),
      stack: stack ? stack.substring(0, 2000) : null,
      timestamp: new Date(timestamp).toISOString(),
      
      // Request information
      userAgent: userAgent ? userAgent.substring(0, 200) : null,
      url: url ? url.substring(0, 200) : null,
      ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
      
      // Session information
      userId: userId || 'anonymous',
      sessionId: sessionId || null,
      
      // VAT-specific context
      vatCalculation: vatCalculation ? {
        transactionCount: vatCalculation.transactionCount || 0,
        fileSize: vatCalculation.fileSize || 0,
        processingTime: vatCalculation.processingTime || 0,
        errorStep: vatCalculation.errorStep || 'unknown'
      } : null,
      
      // File information (sanitized)
      fileInfo: fileInfo ? {
        name: fileInfo.name ? fileInfo.name.substring(0, 100) : null,
        size: fileInfo.size || 0,
        type: fileInfo.type || 'unknown'
      } : null,
      
      // Server metadata
      serverTimestamp: new Date().toISOString(),
      environment: process.env.ENVIRONMENT || 'production',
      region: process.env.AWS_REGION || 'unknown'
    };

    // Log error for monitoring (in production, send to error tracking service)
    console.error('Client Error Report:', JSON.stringify(sanitizedError, null, 2));

    // Generate error reference ID
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // In production, you would:
    // 1. Send to error tracking service (Sentry, LogRocket, etc.)
    // 2. Store in database for analysis
    // 3. Trigger alerts for critical errors
    // 4. Send notifications to development team

    const response = {
      success: true,
      errorId,
      message: 'Error report received and logged',
      timestamp: new Date().toISOString(),
      nextSteps: [
        'Your error has been logged with reference: ' + errorId,
        'Try refreshing the page and uploading your file again',
        'If the problem persists, contact support with this reference ID'
      ]
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.SITE_URL || '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error processing error report:', error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to process error report',
        message: 'Internal server error occurred while logging your error',
        timestamp: new Date().toISOString()
      })
    };
  }
}
