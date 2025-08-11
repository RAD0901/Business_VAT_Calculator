// SEO & Marketing Manager
class SEOManager {
    constructor() {
        this.siteName = 'VAT Calculator Pro';
        this.baseUrl = 'https://vat-calculator-pro.com';
        this.defaultImage = '/assets/images/og-image.jpg';
        this.currentPage = '';
        
        this.initializeSEO();
        this.setupSocialSharing();
        this.initializeAnalytics();
        this.setupStructuredData();
    }

    // Initialize SEO
    initializeSEO() {
        this.updateMetaTags();
        this.setupDynamicSEO();
        this.generateSitemap();
        this.setupRobotsTxt();
        
        // Update on page changes
        window.addEventListener('hashchange', () => {
            setTimeout(() => this.updateMetaTags(), 100);
        });
    }

    // Update Meta Tags
    updateMetaTags() {
        const currentPage = window.location.hash.slice(1) || 'upload';
        this.currentPage = currentPage;
        
        const pageConfig = this.getPageConfig(currentPage);
        
        // Title
        this.setTitle(pageConfig.title);
        
        // Description
        this.setMetaContent('description', pageConfig.description);
        
        // Keywords
        this.setMetaContent('keywords', pageConfig.keywords);
        
        // Open Graph
        this.updateOpenGraph(pageConfig);
        
        // Twitter Cards
        this.updateTwitterCards(pageConfig);
        
        // Canonical URL
        this.setCanonicalUrl(pageConfig.path);
        
        // Structured Data
        this.updateStructuredData(pageConfig);
        
        console.log(`SEO updated for page: ${currentPage}`);
    }

    getPageConfig(page) {
        const configs = {
            upload: {
                title: 'Upload Excel File - VAT Calculator Pro | Free Online VAT Processing Tool',
                description: 'Upload your Excel file to calculate VAT automatically. Free online VAT calculator with instant results, multiple export formats, and professional reporting.',
                keywords: 'vat calculator, excel vat processing, online vat tool, upload excel file, vat automation, tax calculation',
                path: '/',
                image: '/assets/images/upload-og.jpg',
                type: 'website'
            },
            demo: {
                title: 'Demo - See VAT Calculator in Action | VAT Calculator Pro',
                description: 'Try our VAT calculator demo with sample data. See how easy it is to process Excel files and generate professional VAT reports instantly.',
                keywords: 'vat calculator demo, sample data, try vat tool, excel processing demo, vat calculation example',
                path: '/demo',
                image: '/assets/images/demo-og.jpg',
                type: 'article'
            },
            processing: {
                title: 'Processing Your File - VAT Calculator Pro',
                description: 'Your Excel file is being processed. Advanced VAT calculations in progress with real-time progress tracking.',
                keywords: 'vat processing, excel analysis, file processing, vat calculation progress',
                path: '/processing',
                image: '/assets/images/processing-og.jpg',
                type: 'article'
            },
            results: {
                title: 'VAT Calculation Results - Professional Report | VAT Calculator Pro',
                description: 'View your VAT calculation results with detailed analysis, charts, and professional reports. Export to PDF, Excel, or CSV format.',
                keywords: 'vat results, tax calculation report, vat analysis, export vat data, professional tax report',
                path: '/results',
                image: '/assets/images/results-og.jpg',
                type: 'article'
            },
            history: {
                title: 'Calculation History - Track Your VAT Calculations | VAT Calculator Pro',
                description: 'Access your previous VAT calculations and reports. Download past results and track your tax calculation history.',
                keywords: 'vat history, calculation tracking, previous calculations, tax records, download history',
                path: '/history',
                image: '/assets/images/history-og.jpg',
                type: 'article'
            },
            settings: {
                title: 'Settings - Customize Your VAT Calculator | VAT Calculator Pro',
                description: 'Customize your VAT calculator settings. Configure tax rates, regions, currencies, and export preferences.',
                keywords: 'vat settings, tax configuration, customize calculator, vat rates, currency settings',
                path: '/settings',
                image: '/assets/images/settings-og.jpg',
                type: 'article'
            },
            help: {
                title: 'Help & Support - VAT Calculator Guide | VAT Calculator Pro',
                description: 'Complete guide to using the VAT Calculator. Tutorials, FAQs, troubleshooting, and step-by-step instructions.',
                keywords: 'vat calculator help, how to calculate vat, excel vat guide, troubleshooting, user manual',
                path: '/help',
                image: '/assets/images/help-og.jpg',
                type: 'article'
            },
            about: {
                title: 'About VAT Calculator Pro - Professional Tax Calculation Tool',
                description: 'Learn about VAT Calculator Pro, the leading online tool for Excel-based VAT calculations. Professional, accurate, and free to use.',
                keywords: 'about vat calculator, professional tax tool, excel vat processing, company info',
                path: '/about',
                image: '/assets/images/about-og.jpg',
                type: 'website'
            }
        };

        return configs[page] || configs.upload;
    }

    setTitle(title) {
        document.title = title;
        
        // Also update og:title
        this.setMetaProperty('og:title', title);
        this.setMetaProperty('twitter:title', title);
    }

    setMetaContent(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    setMetaProperty(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    // Open Graph
    updateOpenGraph(config) {
        this.setMetaProperty('og:site_name', this.siteName);
        this.setMetaProperty('og:type', config.type);
        this.setMetaProperty('og:title', config.title);
        this.setMetaProperty('og:description', config.description);
        this.setMetaProperty('og:image', this.baseUrl + config.image);
        this.setMetaProperty('og:url', this.baseUrl + config.path);
        this.setMetaProperty('og:locale', 'en_US');
        
        // Additional Open Graph tags
        this.setMetaProperty('og:image:width', '1200');
        this.setMetaProperty('og:image:height', '630');
        this.setMetaProperty('og:image:alt', config.title);
    }

    // Twitter Cards
    updateTwitterCards(config) {
        this.setMetaProperty('twitter:card', 'summary_large_image');
        this.setMetaProperty('twitter:site', '@VATCalculatorPro');
        this.setMetaProperty('twitter:creator', '@VATCalculatorPro');
        this.setMetaProperty('twitter:title', config.title);
        this.setMetaProperty('twitter:description', config.description);
        this.setMetaProperty('twitter:image', this.baseUrl + config.image);
        this.setMetaProperty('twitter:image:alt', config.title);
    }

    // Canonical URL
    setCanonicalUrl(path) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = this.baseUrl + path;
    }

    // Structured Data
    setupStructuredData() {
        // Application structured data
        const applicationData = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "VAT Calculator Pro",
            "description": "Professional online VAT calculator for Excel files with instant processing and multiple export formats",
            "url": this.baseUrl,
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250"
            },
            "author": {
                "@type": "Organization",
                "name": "VAT Calculator Pro Team"
            }
        };

        // Organization structured data
        const organizationData = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "VAT Calculator Pro",
            "url": this.baseUrl,
            "logo": this.baseUrl + "/assets/images/logo-structured.png",
            "description": "Leading provider of professional VAT calculation tools for businesses worldwide"
        };

        this.insertStructuredData('application-ld', applicationData);
        this.insertStructuredData('organization-ld', organizationData);
    }

    updateStructuredData(config) {
        if (config.type === 'article') {
            const articleData = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": config.title,
                "description": config.description,
                "image": this.baseUrl + config.image,
                "url": this.baseUrl + config.path,
                "datePublished": new Date().toISOString(),
                "dateModified": new Date().toISOString(),
                "author": {
                    "@type": "Organization",
                    "name": "VAT Calculator Pro Team"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "VAT Calculator Pro",
                    "logo": {
                        "@type": "ImageObject",
                        "url": this.baseUrl + "/assets/images/logo-structured.png"
                    }
                }
            };

            this.insertStructuredData('article-ld', articleData);
        }
    }

    insertStructuredData(id, data) {
        let script = document.getElementById(id);
        if (!script) {
            script = document.createElement('script');
            script.id = id;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(data, null, 2);
    }

    // Social Sharing
    setupSocialSharing() {
        this.createSocialShareButtons();
        this.setupSocialMetrics();
    }

    createSocialShareButtons() {
        // Create share button container
        const shareContainer = document.createElement('div');
        shareContainer.className = 'social-share-container';
        shareContainer.innerHTML = `
            <div class="share-buttons">
                <button class="share-btn facebook-share" aria-label="Share on Facebook">
                    📘 Facebook
                </button>
                <button class="share-btn twitter-share" aria-label="Share on Twitter">
                    🐦 Twitter
                </button>
                <button class="share-btn linkedin-share" aria-label="Share on LinkedIn">
                    💼 LinkedIn
                </button>
                <button class="share-btn copy-link" aria-label="Copy link">
                    🔗 Copy Link
                </button>
            </div>
        `;

        // Add event listeners
        shareContainer.querySelector('.facebook-share').onclick = () => this.shareOnFacebook();
        shareContainer.querySelector('.twitter-share').onclick = () => this.shareOnTwitter();
        shareContainer.querySelector('.linkedin-share').onclick = () => this.shareOnLinkedIn();
        shareContainer.querySelector('.copy-link').onclick = () => this.copyCurrentLink();

        // Add to body (will be positioned via CSS)
        document.body.appendChild(shareContainer);
    }

    shareOnFacebook() {
        const url = encodeURIComponent(window.location.href);
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        this.openShareWindow(shareUrl, 'Facebook');
    }

    shareOnTwitter() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(document.title);
        const shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}&hashtags=VAT,Calculator,Excel,Tax`;
        this.openShareWindow(shareUrl, 'Twitter');
    }

    shareOnLinkedIn() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const summary = encodeURIComponent(document.querySelector('meta[name="description"]')?.content || '');
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
        this.openShareWindow(shareUrl, 'LinkedIn');
    }

    copyCurrentLink() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('Link copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy link:', err);
                this.fallbackCopyLink();
            });
        } else {
            this.fallbackCopyLink();
        }
    }

    fallbackCopyLink() {
        const textarea = document.createElement('textarea');
        textarea.value = window.location.href;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showNotification('Link copied to clipboard!');
    }

    openShareWindow(url, platform) {
        const width = 600;
        const height = 400;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        window.open(
            url,
            `share-${platform}`,
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );

        // Track sharing
        if (window.gtag) {
            gtag('event', 'share', {
                method: platform.toLowerCase(),
                content_type: 'page',
                item_id: this.currentPage
            });
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'share-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    // Generate Sitemap
    generateSitemap() {
        const pages = [
            { path: '/', priority: '1.0', changefreq: 'daily' },
            { path: '/demo', priority: '0.8', changefreq: 'weekly' },
            { path: '/help', priority: '0.7', changefreq: 'weekly' },
            { path: '/about', priority: '0.6', changefreq: 'monthly' },
            { path: '/settings', priority: '0.5', changefreq: 'monthly' }
        ];

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${this.baseUrl}${page.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        // This would typically be saved to the server
        console.log('Generated sitemap:', sitemap);
        return sitemap;
    }

    // Robots.txt
    setupRobotsTxt() {
        const robotsTxt = `User-agent: *
Allow: /
Allow: /demo
Allow: /help
Allow: /about
Disallow: /processing
Disallow: /results
Disallow: /history
Disallow: /settings

Sitemap: ${this.baseUrl}/sitemap.xml`;

        console.log('Generated robots.txt:', robotsTxt);
        return robotsTxt;
    }

    // Analytics Integration
    initializeAnalytics() {
        this.setupGoogleAnalytics();
        this.setupSearchConsole();
        this.trackPageViews();
        this.trackUserEngagement();
    }

    setupGoogleAnalytics() {
        // This would typically include the actual GA tracking ID
        const trackingId = 'G-XXXXXXXXXX'; // Replace with actual tracking ID

        // Enhanced E-commerce tracking
        if (window.gtag) {
            gtag('config', trackingId, {
                page_title: document.title,
                page_location: window.location.href,
                content_group1: this.currentPage,
                custom_map: {
                    'dimension1': 'user_type',
                    'dimension2': 'file_type',
                    'dimension3': 'processing_time'
                }
            });
        }
    }

    setupSearchConsole() {
        // Add Search Console verification meta tag
        this.setMetaContent('google-site-verification', 'your-verification-code');
    }

    trackPageViews() {
        // Enhanced page view tracking
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.slice(1) || 'upload';
            
            if (window.gtag) {
                gtag('config', 'G-XXXXXXXXXX', {
                    page_title: document.title,
                    page_location: window.location.href,
                    content_group1: page
                });
            }
        });
    }

    trackUserEngagement() {
        // Track scroll depth
        let scrollDepths = [25, 50, 75, 90];
        let triggeredDepths = new Set();

        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            
            scrollDepths.forEach(depth => {
                if (scrollPercent >= depth && !triggeredDepths.has(depth)) {
                    triggeredDepths.add(depth);
                    
                    if (window.gtag) {
                        gtag('event', 'scroll', {
                            event_category: 'engagement',
                            event_label: `${depth}%`,
                            value: depth
                        });
                    }
                }
            });
        });

        // Track time on page
        let pageStartTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
            
            if (window.gtag && timeOnPage > 10) { // Only track if more than 10 seconds
                gtag('event', 'timing_complete', {
                    name: 'page_view_duration',
                    value: timeOnPage,
                    event_category: 'engagement'
                });
            }
        });
    }

    // Performance Metrics
    trackWebVitals() {
        // Track Core Web Vitals if available
        if ('web-vital' in window) {
            import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                getCLS((metric) => this.sendMetricToAnalytics(metric));
                getFID((metric) => this.sendMetricToAnalytics(metric));
                getFCP((metric) => this.sendMetricToAnalytics(metric));
                getLCP((metric) => this.sendMetricToAnalytics(metric));
                getTTFB((metric) => this.sendMetricToAnalytics(metric));
            });
        }
    }

    sendMetricToAnalytics(metric) {
        if (window.gtag) {
            gtag('event', metric.name, {
                event_category: 'Web Vitals',
                value: Math.round(metric.value),
                event_label: metric.rating,
                non_interaction: true
            });
        }
    }

    // Dynamic SEO for SPA
    setupDynamicSEO() {
        // Preload critical pages for better SEO
        const criticalPages = ['demo', 'help'];
        criticalPages.forEach(page => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = `#${page}`;
            document.head.appendChild(link);
        });

        // Update page state for history API
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.slice(1) || 'upload';
            const config = this.getPageConfig(page);
            
            // Update history state
            if (history.replaceState) {
                history.replaceState(
                    { page: page },
                    config.title,
                    window.location.href
                );
            }
        });
    }
}

// Initialize SEO Manager
const seoManager = new SEOManager();
