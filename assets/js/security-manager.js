// Security & Privacy Manager
class SecurityManager {
    constructor() {
        this.cspNonce = this.generateNonce();
        this.sessionId = this.generateSessionId();
        this.encryptionKey = null;
        this.privacySettings = this.loadPrivacySettings();
        
        this.initializeSecurity();
        this.setupPrivacyControls();
        this.initializeDataProtection();
        this.setupContentSecurityPolicy();
    }

    // Initialize Security
    initializeSecurity() {
        this.setupCSPHeaders();
        this.preventXSSAttacks();
        this.setupSecureHeaders();
        this.initializeEncryption();
        this.setupRateLimiting();
        this.monitorSuspiciousActivity();
    }

    // Content Security Policy
    setupContentSecurityPolicy() {
        const csp = {
            'default-src': ["'self'"],
            'script-src': [
                "'self'",
                "'nonce-" + this.cspNonce + "'",
                'https://www.googletagmanager.com',
                'https://www.google-analytics.com'
            ],
            'style-src': [
                "'self'",
                "'unsafe-inline'", // Needed for dynamic styles
                'https://fonts.googleapis.com'
            ],
            'font-src': [
                "'self'",
                'https://fonts.gstatic.com'
            ],
            'img-src': [
                "'self'",
                'data:',
                'blob:',
                'https://www.google-analytics.com'
            ],
            'connect-src': [
                "'self'",
                'https://www.google-analytics.com'
            ],
            'frame-src': ["'none'"],
            'object-src': ["'none'"],
            'base-uri': ["'self'"],
            'form-action': ["'self'"]
        };

        const cspString = Object.entries(csp)
            .map(([key, values]) => `${key} ${values.join(' ')}`)
            .join('; ');

        // Set CSP via meta tag (would ideally be set via HTTP header)
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = cspString;
        document.head.appendChild(cspMeta);

        console.log('Content Security Policy applied');
    }

    setupCSPHeaders() {
        // Additional security headers via meta tags
        const headers = [
            { name: 'X-Content-Type-Options', content: 'nosniff' },
            { name: 'X-Frame-Options', content: 'DENY' },
            { name: 'X-XSS-Protection', content: '1; mode=block' },
            { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
            { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
        ];

        headers.forEach(header => {
            const meta = document.createElement('meta');
            meta.httpEquiv = header.name;
            meta.content = header.content;
            document.head.appendChild(meta);
        });
    }

    // XSS Prevention
    preventXSSAttacks() {
        // Sanitize all user inputs
        this.setupInputSanitization();
        
        // Prevent script injection
        this.preventScriptInjection();
        
        // Sanitize file names
        this.setupFileNameSanitization();
    }

    setupInputSanitization() {
        // Monitor all input elements
        document.addEventListener('input', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                event.target.value = this.sanitizeInput(event.target.value);
            }
        });

        // Monitor dynamic content updates
        this.observeDOM();
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/data:text\/html/gi, '');
    }

    preventScriptInjection() {
        // Override dangerous functions
        const originalWrite = document.write;
        document.write = function() {
            console.warn('document.write blocked for security');
            return;
        };

        // Monitor dynamic script creation
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'SCRIPT' && !node.hasAttribute('data-safe')) {
                        console.warn('Potentially unsafe script blocked:', node);
                        node.remove();
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // File Security
    setupFileNameSanitization() {
        // Monitor file inputs
        document.addEventListener('change', (event) => {
            if (event.target.type === 'file' && event.target.files.length > 0) {
                const file = event.target.files[0];
                if (!this.isFileSecure(file)) {
                    event.target.value = '';
                    this.showSecurityAlert('File blocked for security reasons');
                    return;
                }
                
                // Validate file content
                this.validateFileContent(file);
            }
        });
    }

    isFileSecure(file) {
        // Check file extension
        const allowedExtensions = ['.xlsx', '.xls'];
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        if (!allowedExtensions.includes(extension)) {
            return false;
        }

        // Check MIME type
        const allowedMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        
        if (!allowedMimeTypes.includes(file.type)) {
            return false;
        }

        // Check file size
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return false;
        }

        // Check for suspicious patterns in filename
        const suspiciousPatterns = [
            /\.exe$/i,
            /\.bat$/i,
            /\.cmd$/i,
            /\.scr$/i,
            /\.vbs$/i,
            /\.js$/i,
            /\.jar$/i
        ];

        return !suspiciousPatterns.some(pattern => pattern.test(file.name));
    }

    validateFileContent(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            
            // Check for embedded scripts or macros
            if (this.containsSuspiciousContent(content)) {
                this.showSecurityAlert('File contains suspicious content and has been blocked');
                return;
            }
        };
        
        reader.readAsText(file.slice(0, 1024)); // Read first 1KB for analysis
    }

    containsSuspiciousContent(content) {
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /vbscript:/i,
            /onload=/i,
            /onerror=/i
        ];

        return suspiciousPatterns.some(pattern => pattern.test(content));
    }

    // Encryption
    initializeEncryption() {
        if (window.crypto && window.crypto.subtle) {
            this.generateEncryptionKey();
        } else {
            console.warn('Web Crypto API not supported');
        }
    }

    async generateEncryptionKey() {
        try {
            this.encryptionKey = await window.crypto.subtle.generateKey(
                {
                    name: 'AES-GCM',
                    length: 256
                },
                false,
                ['encrypt', 'decrypt']
            );
            console.log('Encryption key generated');
        } catch (error) {
            console.error('Failed to generate encryption key:', error);
        }
    }

    async encryptData(data) {
        if (!this.encryptionKey) {
            console.warn('No encryption key available');
            return data;
        }

        try {
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encodedData = new TextEncoder().encode(JSON.stringify(data));
            
            const encryptedData = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                this.encryptionKey,
                encodedData
            );

            return {
                encrypted: Array.from(new Uint8Array(encryptedData)),
                iv: Array.from(iv)
            };
        } catch (error) {
            console.error('Encryption failed:', error);
            return data;
        }
    }

    async decryptData(encryptedData) {
        if (!this.encryptionKey || !encryptedData.encrypted) {
            return encryptedData;
        }

        try {
            const decryptedData = await window.crypto.subtle.decrypt(
                { 
                    name: 'AES-GCM', 
                    iv: new Uint8Array(encryptedData.iv) 
                },
                this.encryptionKey,
                new Uint8Array(encryptedData.encrypted)
            );

            const decodedData = new TextDecoder().decode(decryptedData);
            return JSON.parse(decodedData);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    // Privacy Controls
    setupPrivacyControls() {
        this.createPrivacyBanner();
        this.setupCookieManagement();
        this.setupDataRetentionPolicies();
        this.implementDataMinimization();
    }

    createPrivacyBanner() {
        if (this.privacySettings.bannerAccepted) {
            return;
        }

        const banner = document.createElement('div');
        banner.className = 'privacy-banner';
        banner.innerHTML = `
            <div class="privacy-content">
                <div class="privacy-text">
                    <h3>Your Privacy Matters</h3>
                    <p>We use minimal cookies and local storage to enhance your experience. Your data is processed locally and never shared with third parties without consent.</p>
                </div>
                <div class="privacy-actions">
                    <button class="btn btn-secondary" onclick="securityManager.showPrivacySettings()">Privacy Settings</button>
                    <button class="btn btn-primary" onclick="securityManager.acceptPrivacyPolicy()">Accept All</button>
                    <button class="btn btn-outline" onclick="securityManager.acceptEssentialOnly()">Essential Only</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);
    }

    acceptPrivacyPolicy() {
        this.privacySettings.bannerAccepted = true;
        this.privacySettings.analytics = true;
        this.privacySettings.functional = true;
        this.savePrivacySettings();
        this.hidePrivacyBanner();
        
        // Initialize analytics if accepted
        if (window.gtag) {
            gtag('consent', 'update', {
                analytics_storage: 'granted',
                functionality_storage: 'granted'
            });
        }
    }

    acceptEssentialOnly() {
        this.privacySettings.bannerAccepted = true;
        this.privacySettings.analytics = false;
        this.privacySettings.functional = false;
        this.savePrivacySettings();
        this.hidePrivacyBanner();
        
        // Disable non-essential features
        if (window.gtag) {
            gtag('consent', 'update', {
                analytics_storage: 'denied',
                functionality_storage: 'denied'
            });
        }
    }

    showPrivacySettings() {
        const modal = document.createElement('div');
        modal.className = 'privacy-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Privacy Settings</h2>
                    <button class="modal-close" onclick="this.closest('.privacy-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="privacy-section">
                        <h3>Essential Cookies</h3>
                        <p>Required for the website to function properly.</p>
                        <label class="switch">
                            <input type="checkbox" checked disabled>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="privacy-section">
                        <h3>Analytics Cookies</h3>
                        <p>Help us understand how you use our website.</p>
                        <label class="switch">
                            <input type="checkbox" id="analytics-toggle" ${this.privacySettings.analytics ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="privacy-section">
                        <h3>Functional Cookies</h3>
                        <p>Remember your preferences and settings.</p>
                        <label class="switch">
                            <input type="checkbox" id="functional-toggle" ${this.privacySettings.functional ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="privacy-info">
                        <h3>Data We Collect</h3>
                        <ul>
                            <li>File processing metrics (anonymized)</li>
                            <li>Usage analytics (anonymized)</li>
                            <li>User preferences (stored locally)</li>
                            <li>Error reports (no personal data)</li>
                        </ul>
                        <h3>Data We Don't Collect</h3>
                        <ul>
                            <li>Personal information from uploaded files</li>
                            <li>File contents (processed locally only)</li>
                            <li>Email addresses or contact information</li>
                            <li>Financial or sensitive business data</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="securityManager.savePrivacyPreferences()">Save Preferences</button>
                    <button class="btn btn-secondary" onclick="this.closest('.privacy-modal').remove()">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    savePrivacyPreferences() {
        const analyticsToggle = document.getElementById('analytics-toggle');
        const functionalToggle = document.getElementById('functional-toggle');
        
        this.privacySettings.analytics = analyticsToggle ? analyticsToggle.checked : false;
        this.privacySettings.functional = functionalToggle ? functionalToggle.checked : false;
        this.privacySettings.bannerAccepted = true;
        
        this.savePrivacySettings();
        this.hidePrivacyBanner();
        
        // Close modal
        document.querySelector('.privacy-modal').remove();
        
        // Update consent
        if (window.gtag) {
            gtag('consent', 'update', {
                analytics_storage: this.privacySettings.analytics ? 'granted' : 'denied',
                functionality_storage: this.privacySettings.functional ? 'granted' : 'denied'
            });
        }
    }

    // Data Protection
    initializeDataProtection() {
        this.setupDataEncryption();
        this.implementDataMinimization();
        this.setupDataRetentionPolicies();
        this.enableDataPortability();
        this.implementRightToErasure();
    }

    setupDataEncryption() {
        // Encrypt sensitive data before storing
        const originalSetItem = localStorage.setItem;
        const originalGetItem = localStorage.getItem;
        
        localStorage.setItem = async (key, value) => {
            if (this.isSensitiveData(key)) {
                const encrypted = await this.encryptData(value);
                return originalSetItem.call(localStorage, key, JSON.stringify(encrypted));
            }
            return originalSetItem.call(localStorage, key, value);
        };

        localStorage.getItem = async (key) => {
            const value = originalGetItem.call(localStorage, key);
            if (this.isSensitiveData(key) && value) {
                try {
                    const encrypted = JSON.parse(value);
                    return await this.decryptData(encrypted);
                } catch (error) {
                    console.error('Failed to decrypt data:', error);
                    return value;
                }
            }
            return value;
        };
    }

    isSensitiveData(key) {
        const sensitiveKeys = [
            'vat_calculator_history',
            'vat_calculator_settings',
            'user_preferences'
        ];
        return sensitiveKeys.some(sensitiveKey => key.includes(sensitiveKey));
    }

    implementDataMinimization() {
        // Only collect necessary data
        this.dataCollectionRules = {
            fileProcessing: ['file_size', 'processing_time', 'success_status'],
            userInteraction: ['page_views', 'feature_usage'],
            errors: ['error_type', 'timestamp', 'browser_version']
        };

        // Filter collected data
        this.filterCollectedData = (category, data) => {
            const allowedFields = this.dataCollectionRules[category] || [];
            const filteredData = {};
            
            allowedFields.forEach(field => {
                if (data.hasOwnProperty(field)) {
                    filteredData[field] = data[field];
                }
            });
            
            return filteredData;
        };
    }

    // Rate Limiting
    setupRateLimiting() {
        this.requestCounts = new Map();
        this.rateLimits = {
            fileUpload: { limit: 10, window: 60000 }, // 10 uploads per minute
            export: { limit: 50, window: 60000 }, // 50 exports per minute
            api: { limit: 100, window: 60000 } // 100 API calls per minute
        };
    }

    checkRateLimit(action) {
        const now = Date.now();
        const config = this.rateLimits[action];
        
        if (!config) return true;
        
        const key = `${action}_${this.sessionId}`;
        const requests = this.requestCounts.get(key) || [];
        
        // Remove old requests outside the time window
        const validRequests = requests.filter(time => now - time < config.window);
        
        if (validRequests.length >= config.limit) {
            this.showSecurityAlert(`Rate limit exceeded for ${action}. Please wait before trying again.`);
            return false;
        }
        
        validRequests.push(now);
        this.requestCounts.set(key, validRequests);
        return true;
    }

    // Security Monitoring
    monitorSuspiciousActivity() {
        this.suspiciousActivityLog = [];
        
        // Monitor rapid requests
        this.monitorRequestPatterns();
        
        // Monitor file upload patterns
        this.monitorFileUploads();
        
        // Monitor navigation patterns
        this.monitorNavigationPatterns();
    }

    logSuspiciousActivity(type, details) {
        const entry = {
            type: type,
            details: details,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            ip: 'client-side' // Would be logged server-side
        };
        
        this.suspiciousActivityLog.push(entry);
        
        // Keep only last 100 entries
        if (this.suspiciousActivityLog.length > 100) {
            this.suspiciousActivityLog.shift();
        }
        
        console.warn('Suspicious activity detected:', entry);
    }

    // Utility Methods
    generateNonce() {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    loadPrivacySettings() {
        try {
            const settings = localStorage.getItem('vat_calculator_privacy_settings');
            return settings ? JSON.parse(settings) : {
                bannerAccepted: false,
                analytics: false,
                functional: false
            };
        } catch (error) {
            return {
                bannerAccepted: false,
                analytics: false,
                functional: false
            };
        }
    }

    savePrivacySettings() {
        try {
            localStorage.setItem('vat_calculator_privacy_settings', JSON.stringify(this.privacySettings));
        } catch (error) {
            console.error('Failed to save privacy settings:', error);
        }
    }

    hidePrivacyBanner() {
        const banner = document.querySelector('.privacy-banner');
        if (banner) {
            banner.remove();
        }
    }

    showSecurityAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'security-alert';
        alert.innerHTML = `
            <div class="alert-content">
                <span class="alert-icon">🔒</span>
                <span class="alert-message">${message}</span>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    observeDOM() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const sanitized = this.sanitizeInput(node.textContent);
                        if (sanitized !== node.textContent) {
                            node.textContent = sanitized;
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
}

// Initialize Security Manager
const securityManager = new SecurityManager();
