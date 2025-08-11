// Mobile & Accessibility Manager
class AccessibilityManager {
    constructor() {
        this.isHighContrast = false;
        this.isReducedMotion = false;
        this.currentFocusIndex = 0;
        this.focusableElements = [];
        
        this.initializeAccessibility();
        this.initializeMobileOptimizations();
        this.setupKeyboardNavigation();
        this.setupARIA();
    }

    // Initialize Accessibility Features
    initializeAccessibility() {
        // Check user preferences
        this.checkUserPreferences();
        
        // Setup focus management
        this.setupFocusManagement();
        
        // Setup screen reader support
        this.setupScreenReaderSupport();
        
        // Setup high contrast mode
        this.setupHighContrastMode();
        
        // Setup reduced motion
        this.setupReducedMotion();

        // Load saved preferences
        this.loadAccessibilityPreferences();
    }

    // Check System Preferences
    checkUserPreferences() {
        // Check for reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.isReducedMotion = true;
            document.body.classList.add('reduce-motion');
        }

        // Check for high contrast preference
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            this.isHighContrast = true;
            document.body.classList.add('high-contrast');
        }

        // Check for color scheme preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-theme');
        }
    }

    // Keyboard Navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'Tab':
                    this.handleTabNavigation(event);
                    break;
                case 'Enter':
                case ' ':
                    this.handleActivation(event);
                    break;
                case 'Escape':
                    this.handleEscape(event);
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.handleArrowKeys(event);
                    break;
                default:
                    this.handleShortcuts(event);
            }
        });

        // Update focusable elements when DOM changes
        this.updateFocusableElements();
        
        // Update on page navigation
        window.addEventListener('hashchange', () => {
            setTimeout(() => this.updateFocusableElements(), 100);
        });
    }

    // Handle Tab Navigation
    handleTabNavigation(event) {
        this.updateFocusableElements();
        
        // Custom tab handling for complex components
        const activeElement = document.activeElement;
        
        // Special handling for upload zone
        if (activeElement && activeElement.closest('.upload-zone')) {
            if (!event.shiftKey) {
                event.preventDefault();
                const fileInput = document.getElementById('file-input');
                if (fileInput) fileInput.focus();
            }
        }

        // Special handling for modal dialogs
        const modal = document.querySelector('.modal:not([hidden])');
        if (modal) {
            this.trapFocusInModal(event, modal);
        }
    }

    // Handle Enter/Space Activation
    handleActivation(event) {
        const target = event.target;
        
        // Make upload zone keyboard accessible
        if (target.classList.contains('upload-zone')) {
            event.preventDefault();
            const fileInput = document.getElementById('file-input');
            if (fileInput) fileInput.click();
        }

        // Make cards clickable
        if (target.classList.contains('card') && target.hasAttribute('data-clickable')) {
            event.preventDefault();
            target.click();
        }

        // Handle custom button elements
        if (target.hasAttribute('role') && target.getAttribute('role') === 'button') {
            event.preventDefault();
            target.click();
        }
    }

    // Handle Escape Key
    handleEscape(event) {
        // Close modals
        const openModal = document.querySelector('.modal:not([hidden])');
        if (openModal) {
            this.closeModal(openModal);
            return;
        }

        // Close dropdowns
        const openDropdown = document.querySelector('.dropdown.open');
        if (openDropdown) {
            openDropdown.classList.remove('open');
            return;
        }

        // Navigate back to previous page
        if (window.location.hash && window.location.hash !== '#upload') {
            navigateToPage('upload');
        }
    }

    // Handle Arrow Keys
    handleArrowKeys(event) {
        const target = event.target;
        
        // Handle grid navigation in results
        if (target.closest('.results-grid')) {
            this.handleGridNavigation(event);
        }

        // Handle list navigation
        if (target.closest('.nav-links')) {
            this.handleListNavigation(event);
        }
    }

    // Keyboard Shortcuts
    handleShortcuts(event) {
        // Only handle shortcuts when not in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'u':
                    event.preventDefault();
                    navigateToPage('upload');
                    this.announceToScreenReader('Navigated to upload page');
                    break;
                case 'd':
                    event.preventDefault();
                    if (typeof exportToPDF === 'function') {
                        exportToPDF();
                        this.announceToScreenReader('PDF export started');
                    }
                    break;
                case 's':
                    event.preventDefault();
                    if (typeof saveToHistory === 'function') {
                        saveToHistory();
                        this.announceToScreenReader('Saved to history');
                    }
                    break;
                case 'h':
                    event.preventDefault();
                    navigateToPage('help');
                    this.announceToScreenReader('Navigated to help page');
                    break;
            }
        }

        // Alt key shortcuts
        if (event.altKey) {
            switch (event.key) {
                case '1':
                    event.preventDefault();
                    navigateToPage('upload');
                    break;
                case '2':
                    event.preventDefault();
                    navigateToPage('demo');
                    break;
                case '3':
                    event.preventDefault();
                    navigateToPage('history');
                    break;
                case '4':
                    event.preventDefault();
                    navigateToPage('settings');
                    break;
                case '5':
                    event.preventDefault();
                    navigateToPage('help');
                    break;
            }
        }
    }

    // Focus Management
    setupFocusManagement() {
        // Skip links for screen readers
        this.createSkipLinks();
        
        // Focus indicators
        this.enhanceFocusIndicators();
        
        // Focus restoration
        this.setupFocusRestoration();
    }

    createSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
        `;
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    enhanceFocusIndicators() {
        // Add visible focus indicators
        const style = document.createElement('style');
        style.textContent = `
            .enhanced-focus *:focus {
                outline: 3px solid #4A90E2 !important;
                outline-offset: 2px !important;
            }
            
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                border-radius: 3px;
                z-index: 1000;
            }
            
            .skip-link:focus {
                top: 6px;
            }
        `;
        document.head.appendChild(style);
        
        // Add enhanced focus mode toggle
        document.body.classList.add('enhanced-focus');
    }

    // Screen Reader Support
    setupScreenReaderSupport() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'sr-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);

        // Add screen reader only styles
        const srStyles = document.createElement('style');
        srStyles.textContent = `
            .sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }
        `;
        document.head.appendChild(srStyles);
    }

    announceToScreenReader(message, priority = 'polite') {
        const liveRegion = document.getElementById('sr-live-region');
        if (liveRegion) {
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // ARIA Support
    setupARIA() {
        // Add ARIA labels to navigation
        this.enhanceNavigation();
        
        // Add ARIA labels to form elements
        this.enhanceFormElements();
        
        // Add ARIA labels to interactive elements
        this.enhanceInteractiveElements();
        
        // Add landmark roles
        this.addLandmarkRoles();
    }

    enhanceNavigation() {
        const nav = document.querySelector('.nav');
        if (nav) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Main navigation');
            
            const navLinks = nav.querySelectorAll('a');
            navLinks.forEach((link, index) => {
                if (!link.getAttribute('aria-label')) {
                    link.setAttribute('aria-label', link.textContent.trim());
                }
            });
        }
    }

    enhanceFormElements() {
        // File input
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.setAttribute('aria-describedby', 'file-requirements');
            
            // Add requirements description
            if (!document.getElementById('file-requirements')) {
                const description = document.createElement('div');
                description.id = 'file-requirements';
                description.className = 'sr-only';
                description.textContent = 'Upload Excel files (.xlsx or .xls) up to 50MB with VAT transaction data';
                fileInput.parentNode.appendChild(description);
            }
        }

        // Upload zone
        const uploadZone = document.querySelector('.upload-zone');
        if (uploadZone) {
            uploadZone.setAttribute('role', 'button');
            uploadZone.setAttribute('tabindex', '0');
            uploadZone.setAttribute('aria-label', 'Click or press Enter to select Excel file for upload');
            uploadZone.setAttribute('aria-describedby', 'upload-instructions');
            
            // Add instructions
            if (!document.getElementById('upload-instructions')) {
                const instructions = document.createElement('div');
                instructions.id = 'upload-instructions';
                instructions.className = 'sr-only';
                instructions.textContent = 'Drag and drop your Excel file here or click to browse. Supported formats: .xlsx, .xls. Maximum size: 50MB.';
                uploadZone.appendChild(instructions);
            }
        }
    }

    enhanceInteractiveElements() {
        // Progress steps
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach((step, index) => {
            step.setAttribute('role', 'progressbar');
            step.setAttribute('aria-valuemin', '0');
            step.setAttribute('aria-valuemax', '100');
            step.setAttribute('aria-label', `Processing step ${index + 1} of ${progressSteps.length}`);
        });

        // Export buttons
        const exportButtons = document.querySelectorAll('.export-btn');
        exportButtons.forEach(button => {
            const text = button.textContent.trim();
            button.setAttribute('aria-label', `Export results as ${text}`);
        });

        // Cards with click actions
        const clickableCards = document.querySelectorAll('.card[data-clickable]');
        clickableCards.forEach(card => {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
        });
    }

    addLandmarkRoles() {
        // Main content
        let main = document.querySelector('main');
        if (!main) {
            main = document.createElement('main');
            main.setAttribute('role', 'main');
            main.id = 'main-content';
        }
        main.setAttribute('aria-label', 'Main application content');

        // Header
        const header = document.querySelector('header');
        if (header) {
            header.setAttribute('role', 'banner');
        }

        // Navigation
        const nav = document.querySelector('nav');
        if (nav && !nav.getAttribute('role')) {
            nav.setAttribute('role', 'navigation');
        }
    }

    // Mobile Optimizations
    initializeMobileOptimizations() {
        this.setupTouchGestures();
        this.optimizeForMobile();
        this.setupMobileFileUpload();
        this.setupResponsiveImages();
    }

    setupTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchStartX - touchEndX;
            const deltaY = touchStartY - touchEndY;
            
            // Horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 50) {
                    // Swipe left - next page
                    this.handleSwipeNavigation('left');
                } else if (deltaX < -50) {
                    // Swipe right - previous page
                    this.handleSwipeNavigation('right');
                }
            }
            
            touchStartX = 0;
            touchStartY = 0;
        }, { passive: true });
    }

    handleSwipeNavigation(direction) {
        const pages = ['upload', 'demo', 'history', 'settings', 'help', 'about'];
        const currentPage = window.location.hash.slice(1) || 'upload';
        const currentIndex = pages.indexOf(currentPage);
        
        if (currentIndex === -1) return;
        
        let newIndex;
        if (direction === 'left' && currentIndex < pages.length - 1) {
            newIndex = currentIndex + 1;
        } else if (direction === 'right' && currentIndex > 0) {
            newIndex = currentIndex - 1;
        }
        
        if (newIndex !== undefined) {
            navigateToPage(pages[newIndex]);
            this.announceToScreenReader(`Navigated to ${pages[newIndex]} page`);
        }
    }

    optimizeForMobile() {
        // Optimize touch targets
        const touchTargets = document.querySelectorAll('button, a, [onclick]');
        touchTargets.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const minSize = 44; // iOS recommendation
            
            if (parseInt(computedStyle.height) < minSize || parseInt(computedStyle.width) < minSize) {
                element.style.minHeight = minSize + 'px';
                element.style.minWidth = minSize + 'px';
            }
        });

        // Add mobile-specific styles
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile-device');
            
            // Optimize viewport
            let viewport = document.querySelector('meta[name="viewport"]');
            if (!viewport) {
                viewport = document.createElement('meta');
                viewport.name = 'viewport';
                document.head.appendChild(viewport);
            }
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0';
        }
    }

    setupMobileFileUpload() {
        const fileInput = document.getElementById('file-input');
        if (fileInput && 'ontouchstart' in window) {
            // Add mobile-specific accept attribute
            fileInput.setAttribute('accept', '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel');
            
            // Mobile file selection feedback
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length > 0) {
                    // Provide haptic feedback if available
                    if ('vibrate' in navigator) {
                        navigator.vibrate(100);
                    }
                    
                    this.announceToScreenReader(`Selected file: ${fileInput.files[0].name}`);
                }
            });
        }
    }

    // High Contrast Mode
    setupHighContrastMode() {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'accessibility-toggle high-contrast-toggle';
        toggleButton.innerHTML = '🎨';
        toggleButton.setAttribute('aria-label', 'Toggle high contrast mode');
        toggleButton.onclick = () => this.toggleHighContrast();
        
        // Add to page
        document.body.appendChild(toggleButton);
    }

    toggleHighContrast() {
        this.isHighContrast = !this.isHighContrast;
        document.body.classList.toggle('high-contrast', this.isHighContrast);
        
        const message = this.isHighContrast ? 'High contrast mode enabled' : 'High contrast mode disabled';
        this.announceToScreenReader(message);
        
        // Save preference
        localStorage.setItem('vat_calculator_high_contrast', this.isHighContrast);
    }

    // Reduced Motion
    setupReducedMotion() {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'accessibility-toggle reduced-motion-toggle';
        toggleButton.innerHTML = '⏸️';
        toggleButton.setAttribute('aria-label', 'Toggle reduced motion');
        toggleButton.onclick = () => this.toggleReducedMotion();
        
        document.body.appendChild(toggleButton);
    }

    toggleReducedMotion() {
        this.isReducedMotion = !this.isReducedMotion;
        document.body.classList.toggle('reduce-motion', this.isReducedMotion);
        
        const message = this.isReducedMotion ? 'Reduced motion enabled' : 'Animations restored';
        this.announceToScreenReader(message);
        
        localStorage.setItem('vat_calculator_reduced_motion', this.isReducedMotion);
    }

    // Utility Methods
    updateFocusableElements() {
        this.focusableElements = Array.from(document.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )).filter(element => {
            return element.offsetParent !== null && !element.disabled;
        });
    }

    trapFocusInModal(event, modal) {
        const focusableElements = modal.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }

    closeModal(modal) {
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        
        // Restore focus to trigger element
        const trigger = modal.getAttribute('data-trigger');
        if (trigger) {
            const triggerElement = document.querySelector(trigger);
            if (triggerElement) {
                triggerElement.focus();
            }
        }
        
        this.announceToScreenReader('Dialog closed');
    }

    // Load/Save Preferences
    loadAccessibilityPreferences() {
        // High contrast
        const highContrast = localStorage.getItem('vat_calculator_high_contrast');
        if (highContrast === 'true') {
            this.isHighContrast = true;
            document.body.classList.add('high-contrast');
        }

        // Reduced motion
        const reducedMotion = localStorage.getItem('vat_calculator_reduced_motion');
        if (reducedMotion === 'true') {
            this.isReducedMotion = true;
            document.body.classList.add('reduce-motion');
        }
    }

    // Accessibility Audit
    runAccessibilityAudit() {
        const issues = [];
        
        // Check for missing alt text
        const images = document.querySelectorAll('img:not([alt])');
        if (images.length > 0) {
            issues.push({
                type: 'missing_alt_text',
                count: images.length,
                message: 'Images without alt text found'
            });
        }

        // Check for low contrast
        // This would typically use a color contrast library
        
        // Check for missing labels
        const unlabeledInputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        if (unlabeledInputs.length > 0) {
            issues.push({
                type: 'unlabeled_inputs',
                count: unlabeledInputs.length,
                message: 'Form inputs without labels found'
            });
        }

        return issues;
    }
}

// Initialize accessibility manager
const accessibilityManager = new AccessibilityManager();
