// Contact Form Handler for VAT Calculator Pro
// Processes contact form submissions with spam protection

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
        error: 'Method not allowed',
        message: 'Only POST requests are accepted'
      })
    };
  }

  try {
    // Parse form data
    const data = JSON.parse(event.body);
    
    // Basic validation
    const { name, email, subject, message, honeypot } = data;
    
    // Honeypot spam protection
    if (honeypot) {
      return {
        statusCode: 200, // Return success to fool bots
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true })
      };
    }

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['name', 'email', 'subject', 'message']
        })
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Invalid email format'
        })
      };
    }

    // Rate limiting (simple implementation)
    const userAgent = event.headers['user-agent'] || '';
    const ip = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
    
    // In production, implement proper rate limiting with external storage
    // For now, just log the submission
    console.log('Contact form submission:', {
      timestamp: new Date().toISOString(),
      ip,
      userAgent: userAgent.substring(0, 100),
      name: name.substring(0, 50),
      email,
      subject: subject.substring(0, 100)
    });

    // Here you would typically send an email or save to a database
    // For this example, we'll just return success
    
    // Format response
    const response = {
      success: true,
      message: 'Thank you for your message. We will respond within 24 hours.',
      timestamp: new Date().toISOString(),
      reference: `VAT-${Date.now().toString(36).toUpperCase()}`
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
    console.error('Contact form error:', error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Unable to process your request. Please try again later.',
        timestamp: new Date().toISOString()
      })
    };
  }
}
