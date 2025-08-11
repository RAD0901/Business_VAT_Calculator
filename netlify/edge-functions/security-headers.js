// Security Headers Edge Function for VAT Calculator Pro
// Adds dynamic security headers based on request context

export default async (request, context) => {
  // Get the response from the origin
  const response = await context.next();
  
  // Clone response to modify headers
  const newResponse = new Response(response.body, response);
  
  // Get request information
  const userAgent = request.headers.get('user-agent') || '';
  const country = context.geo?.country?.code || 'unknown';
  const isBot = /bot|crawler|spider|scraper/i.test(userAgent);
  
  // Enhanced security headers
  const securityHeaders = {
    // Core security
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Dynamic CSP based on environment
    'Content-Security-Policy': generateCSP(request, context),
    
    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), gyroscope=(), accelerometer=(), magnetometer=(), usb=(), payment=(), autoplay=(), fullscreen=(self), picture-in-picture=()',
    
    // Cross-origin policies
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Resource-Policy': 'same-origin',
    
    // Custom headers for debugging
    'X-Served-By': 'VAT-Calculator-Pro-Edge',
    'X-Request-ID': crypto.randomUUID(),
    'X-Country': country,
    'X-Bot-Detected': isBot.toString()
  };
  
  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  
  // Add performance hints for non-bot traffic
  if (!isBot) {
    // Preload critical resources
    newResponse.headers.append('Link', '</assets/css/main.css>; rel=preload; as=style');
    newResponse.headers.append('Link', '</assets/js/app.js>; rel=preload; as=script');
    
    // DNS prefetch for external resources
    newResponse.headers.append('Link', '<https://cdnjs.cloudflare.com>; rel=dns-prefetch');
    newResponse.headers.append('Link', '<https://fonts.googleapis.com>; rel=dns-prefetch');
  }
  
  // Regional optimizations for South African users
  if (country === 'ZA') {
    newResponse.headers.set('X-Optimized-For', 'South-Africa');
    // Could add region-specific features here
  }
  
  return newResponse;
};

function generateCSP(request, context) {
  const isDevelopment = context.site?.url?.includes('localhost') || 
                       context.site?.url?.includes('127.0.0.1') ||
                       context.site?.url?.includes('.netlify.app');
  
  const baseCSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
    "img-src 'self' data: blob: https: https://www.google-analytics.com https://www.googletagmanager.com",
    "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net",
    "worker-src 'self' blob:",
    "child-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://formspree.io",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ];
  
  // Add development-specific CSP rules
  if (isDevelopment) {
    baseCSP.push("script-src 'self' 'unsafe-inline' 'unsafe-eval' *");
    baseCSP.push("connect-src 'self' ws: wss: *");
  }
  
  return baseCSP.join('; ');
}
