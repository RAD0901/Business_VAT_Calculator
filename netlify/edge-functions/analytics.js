// Analytics Edge Function for VAT Calculator Pro
// Privacy-friendly analytics without cookies

export default async (request, context) => {
  // Get response from origin
  const response = await context.next();
  
  // Only process successful HTML responses
  if (response.status === 200 && 
      response.headers.get('content-type')?.includes('text/html')) {
    
    // Collect anonymous analytics data
    const analyticsData = {
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent')?.substring(0, 200) || 'unknown',
      referer: request.headers.get('referer')?.substring(0, 200) || 'direct',
      country: context.geo?.country?.code || 'unknown',
      region: context.geo?.region || 'unknown',
      city: context.geo?.city || 'unknown',
      timezone: context.geo?.timezone || 'unknown',
      requestId: crypto.randomUUID(),
      
      // Page-specific data
      page: extractPageType(request.url),
      
      // Performance data
      responseTime: response.headers.get('x-response-time') || 'unknown',
      
      // Security data
      isBot: /bot|crawler|spider|scraper/i.test(request.headers.get('user-agent') || ''),
      isSecure: request.url.startsWith('https://'),
      
      // VAT Calculator specific
      version: '1.0.0',
      application: 'vat-calculator-pro'
    };
    
    // Log analytics data (in production, send to analytics service)
    console.log('Analytics:', JSON.stringify(analyticsData));
    
    // Add analytics headers for client-side tracking
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-Analytics-ID', analyticsData.requestId);
    newResponse.headers.set('X-Page-Type', analyticsData.page);
    
    return newResponse;
  }
  
  return response;
};

function extractPageType(url) {
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  
  if (path === '/' || path === '/index.html') return 'home';
  if (path.startsWith('/upload')) return 'upload';
  if (path.startsWith('/processing')) return 'processing';
  if (path.startsWith('/results')) return 'results';
  if (path.startsWith('/demo')) return 'demo';
  if (path.startsWith('/help')) return 'help';
  if (path.startsWith('/about')) return 'about';
  if (path.startsWith('/settings')) return 'settings';
  if (path.startsWith('/history')) return 'history';
  
  return 'other';
}
