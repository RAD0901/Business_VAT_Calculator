#!/usr/bin/env node

/**
 * Generate sitemap.xml for VAT Calculator Pro
 */

const fs = require('fs');
const path = require('path');

const baseUrl = 'https://vat-calculator-pro.netlify.app';
const currentDate = new Date().toISOString();

const pages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/index.html', priority: '1.0', changefreq: 'weekly' },
  { url: '/dashboard.html', priority: '0.8', changefreq: 'daily' },
  { url: '/about/', priority: '0.7', changefreq: 'monthly' },
  { url: '/help/', priority: '0.8', changefreq: 'weekly' },
  { url: '/demo/', priority: '0.9', changefreq: 'weekly' },
  { url: '/upload/', priority: '0.9', changefreq: 'weekly' },
  { url: '/processing/', priority: '0.6', changefreq: 'weekly' },
  { url: '/results/', priority: '0.6', changefreq: 'weekly' },
  { url: '/settings/', priority: '0.5', changefreq: 'monthly' },
  { url: '/history/', priority: '0.6', changefreq: 'weekly' }
];

function generateSitemap() {
  console.log('🗂️ Generating sitemap.xml...');
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  pages.forEach(page => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });
  
  sitemap += '</urlset>\n';
  
  const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  
  console.log(`✅ Sitemap generated: ${sitemapPath}`);
  console.log(`📊 Total pages: ${pages.length}`);
}

function generateRobotsTxt() {
  console.log('🤖 Generating robots.txt...');
  
  const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow sensitive directories
Disallow: /assets/js/min/
Disallow: /test-results/
Disallow: /playwright-report/
Disallow: /.git/
Disallow: /node_modules/
Disallow: /scripts/

# Allow important resources
Allow: /assets/css/
Allow: /assets/js/
Allow: /assets/images/

# Crawl delay
Crawl-delay: 1
`;
  
  const robotsPath = path.join(process.cwd(), 'robots.txt');
  fs.writeFileSync(robotsPath, robots, 'utf8');
  
  console.log(`✅ Robots.txt generated: ${robotsPath}`);
}

if (require.main === module) {
  try {
    generateSitemap();
    generateRobotsTxt();
    console.log('🎉 SEO files generated successfully!');
  } catch (error) {
    console.error('❌ Error generating SEO files:', error);
    process.exit(1);
  }
}

module.exports = { generateSitemap, generateRobotsTxt };
