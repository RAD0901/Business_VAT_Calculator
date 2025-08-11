// Performance Optimization System
class PerformanceManager {
    constructor() {
        this.webWorker = null;
        this.performanceMetrics = {};
        this.chunkSize = 1000; // Process 1000 rows at a time
        this.initializePerformanceMonitoring();
    }

    initializePerformanceMonitoring() {
        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            this.observeWebVitals();
        }

        // Monitor memory usage
        this.monitorMemoryUsage();

        // Monitor loading performance
        this.monitorLoadingPerformance();
    }

    // Web Workers for Large File Processing
    initializeWebWorker() {
        if (!window.Worker) {
            console.warn('Web Workers not supported. Falling back to main thread processing.');
            return null;
        }

        const workerScript = `
            // Web Worker for VAT calculations
            self.onmessage = function(e) {
                const { data, chunkIndex, totalChunks } = e.data;
                
                try {
                    const results = processVATChunk(data);
                    self.postMessage({
                        success: true,
                        results,
                        chunkIndex,
                        totalChunks,
                        progress: ((chunkIndex + 1) / totalChunks) * 100
                    });
                } catch (error) {
                    self.postMessage({
                        success: false,
                        error: error.message,
                        chunkIndex
                    });
                }
            };

            function processVATChunk(data) {
                const VAT_INPUT_CODES = ['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC'];
                const VAT_OUTPUT_CODES = ['IS', 'INV', 'RTS'];
                
                const results = {
                    inputVAT: 0,
                    outputVAT: 0,
                    transactions: data.length,
                    breakdown: {}
                };

                data.forEach(row => {
                    const taxCode = String(row.TaxCode);
                    const taxAmount = Number(row.TaxAmount) || 0;
                    
                    if (!results.breakdown[taxCode]) {
                        results.breakdown[taxCode] = {
                            count: 0,
                            total: 0,
                            type: VAT_INPUT_CODES.includes(taxCode) ? 'input' : 
                                  VAT_OUTPUT_CODES.includes(taxCode) ? 'output' : 'unknown'
                        };
                    }
                    
                    results.breakdown[taxCode].count++;
                    results.breakdown[taxCode].total += taxAmount;
                    
                    if (VAT_INPUT_CODES.includes(taxCode)) {
                        results.inputVAT += taxAmount;
                    } else if (VAT_OUTPUT_CODES.includes(taxCode)) {
                        results.outputVAT += taxAmount;
                    }
                });

                return results;
            }
        `;

        const blob = new Blob([workerScript], { type: 'application/javascript' });
        this.webWorker = new Worker(URL.createObjectURL(blob));

        return this.webWorker;
    }

    // Chunk-based Processing with Progress Updates
    async processLargeDataset(data, progressCallback) {
        const startTime = performance.now();
        
        // Check if we should use web worker
        if (data.length > 5000 && window.Worker) {
            return this.processWithWebWorker(data, progressCallback);
        }

        // Process in chunks on main thread
        return this.processWithChunks(data, progressCallback);
    }

    async processWithWebWorker(data, progressCallback) {
        return new Promise((resolve, reject) => {
            const worker = this.initializeWebWorker();
            if (!worker) {
                // Fallback to chunk processing
                return this.processWithChunks(data, progressCallback);
            }

            const chunks = this.chunkArray(data, this.chunkSize);
            const results = [];
            let completedChunks = 0;

            worker.onmessage = (e) => {
                const { success, results: chunkResults, error, progress } = e.data;
                
                if (success) {
                    results.push(chunkResults);
                    completedChunks++;
                    
                    if (progressCallback) {
                        progressCallback(progress, `Processing chunk ${completedChunks}/${chunks.length}`);
                    }
                    
                    if (completedChunks === chunks.length) {
                        const finalResults = this.combineChunkResults(results);
                        worker.terminate();
                        resolve(finalResults);
                    }
                } else {
                    worker.terminate();
                    reject(new Error(error));
                }
            };

            worker.onerror = (error) => {
                worker.terminate();
                reject(error);
            };

            // Send chunks to worker
            chunks.forEach((chunk, index) => {
                worker.postMessage({
                    data: chunk,
                    chunkIndex: index,
                    totalChunks: chunks.length
                });
            });
        });
    }

    async processWithChunks(data, progressCallback) {
        const chunks = this.chunkArray(data, this.chunkSize);
        const results = [];
        
        for (let i = 0; i < chunks.length; i++) {
            // Yield control to prevent UI blocking
            await this.yieldToUI();
            
            const chunkResult = this.processVATChunk(chunks[i]);
            results.push(chunkResult);
            
            const progress = ((i + 1) / chunks.length) * 100;
            if (progressCallback) {
                progressCallback(progress, `Processing ${i + 1}/${chunks.length} chunks`);
            }
        }
        
        return this.combineChunkResults(results);
    }

    processVATChunk(data) {
        const VAT_INPUT_CODES = ['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC'];
        const VAT_OUTPUT_CODES = ['IS', 'INV', 'RTS'];
        
        const results = {
            inputVAT: 0,
            outputVAT: 0,
            transactions: data.length,
            breakdown: {}
        };

        data.forEach(row => {
            const taxCode = String(row.TaxCode);
            const taxAmount = Number(row.TaxAmount) || 0;
            
            if (!results.breakdown[taxCode]) {
                results.breakdown[taxCode] = {
                    count: 0,
                    total: 0,
                    type: VAT_INPUT_CODES.includes(taxCode) ? 'input' : 
                          VAT_OUTPUT_CODES.includes(taxCode) ? 'output' : 'unknown'
                };
            }
            
            results.breakdown[taxCode].count++;
            results.breakdown[taxCode].total += taxAmount;
            
            if (VAT_INPUT_CODES.includes(taxCode)) {
                results.inputVAT += taxAmount;
            } else if (VAT_OUTPUT_CODES.includes(taxCode)) {
                results.outputVAT += taxAmount;
            }
        });

        return results;
    }

    // Virtual Scrolling for Large Transaction Lists
    createVirtualScrollList(container, items, renderItem, itemHeight = 50) {
        const virtualList = {
            container,
            items,
            renderItem,
            itemHeight,
            visibleStart: 0,
            visibleEnd: 0,
            scrollTop: 0,
            
            render() {
                const containerHeight = container.clientHeight;
                const totalHeight = items.length * itemHeight;
                const visibleCount = Math.ceil(containerHeight / itemHeight);
                const start = Math.floor(this.scrollTop / itemHeight);
                const end = Math.min(start + visibleCount + 5, items.length); // Buffer of 5 items
                
                this.visibleStart = start;
                this.visibleEnd = end;
                
                // Create virtual container
                const virtualContainer = document.createElement('div');
                virtualContainer.style.height = totalHeight + 'px';
                virtualContainer.style.position = 'relative';
                
                // Render visible items
                for (let i = start; i < end; i++) {
                    const item = document.createElement('div');
                    item.style.position = 'absolute';
                    item.style.top = (i * itemHeight) + 'px';
                    item.style.height = itemHeight + 'px';
                    item.innerHTML = renderItem(items[i], i);
                    virtualContainer.appendChild(item);
                }
                
                container.innerHTML = '';
                container.appendChild(virtualContainer);
            },
            
            onScroll(scrollTop) {
                this.scrollTop = scrollTop;
                this.render();
            }
        };
        
        // Set up scroll listener
        container.addEventListener('scroll', () => {
            virtualList.onScroll(container.scrollTop);
        });
        
        // Initial render
        virtualList.render();
        
        return virtualList;
    }

    // Debounced Operations
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    // Lazy Loading Implementation
    createLazyLoader() {
        if ('IntersectionObserver' in window) {
            const lazyImageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const lazyImage = entry.target;
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.classList.remove('lazy');
                        lazyImageObserver.unobserve(lazyImage);
                    }
                });
            });

            return lazyImageObserver;
        }
        return null;
    }

    // Memory Management
    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usage = {
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
                };

                this.performanceMetrics.memory = usage;

                // Warn if memory usage is high
                if (usage.percentage > 80) {
                    console.warn('High memory usage detected:', usage);
                    this.suggestMemoryOptimization();
                }
            }, 10000); // Check every 10 seconds
        }
    }

    suggestMemoryOptimization() {
        const notification = document.createElement('div');
        notification.className = 'memory-warning';
        notification.innerHTML = `
            <div class="notification warning">
                <h4>High Memory Usage Detected</h4>
                <p>The application is using a lot of memory. Consider:</p>
                <ul>
                    <li>Processing smaller files</li>
                    <li>Closing other browser tabs</li>
                    <li>Refreshing the page if performance is slow</li>
                </ul>
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    // Core Web Vitals Monitoring
    observeWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.performanceMetrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const firstInput = entryList.getEntries()[0];
            this.performanceMetrics.fid = firstInput.processingStart - firstInput.startTime;
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.performanceMetrics.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
    }

    // Loading Performance
    monitorLoadingPerformance() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.performanceMetrics.loadTime = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                totalTime: navigation.loadEventEnd - navigation.fetchStart
            };
        });
    }

    // Asset Optimization
    preloadCriticalAssets() {
        const criticalAssets = [
            'assets/css/main.css',
            'assets/css/components.css',
            'assets/js/app.js',
            'assets/js/vat-engine.js'
        ];

        criticalAssets.forEach(asset => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = asset;
            link.as = asset.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }

    // Font Loading Optimization
    optimizeFontLoading() {
        if ('fonts' in document) {
            // Load fonts asynchronously
            const fontPromises = [
                document.fonts.load('1em Segoe UI'),
                document.fonts.load('bold 1em Segoe UI')
            ];

            Promise.all(fontPromises).then(() => {
                document.body.classList.add('fonts-loaded');
            });
        }
    }

    // CDN Fallbacks
    loadCDNWithFallback(cdnUrl, fallbackUrl, elementType = 'script') {
        return new Promise((resolve, reject) => {
            const element = document.createElement(elementType);
            
            element.onload = () => resolve(element);
            element.onerror = () => {
                console.warn(`CDN failed for ${cdnUrl}, loading fallback`);
                
                // Remove failed element
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
                
                // Try fallback
                const fallbackElement = document.createElement(elementType);
                fallbackElement.onload = () => resolve(fallbackElement);
                fallbackElement.onerror = () => reject(new Error(`Both CDN and fallback failed for ${cdnUrl}`));
                
                if (elementType === 'script') {
                    fallbackElement.src = fallbackUrl;
                } else {
                    fallbackElement.href = fallbackUrl;
                }
                
                document.head.appendChild(fallbackElement);
            };
            
            if (elementType === 'script') {
                element.src = cdnUrl;
            } else {
                element.href = cdnUrl;
            }
            
            document.head.appendChild(element);
        });
    }

    // Utility Methods
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    combineChunkResults(results) {
        const combined = {
            inputVAT: 0,
            outputVAT: 0,
            transactions: 0,
            breakdown: {}
        };

        results.forEach(result => {
            combined.inputVAT += result.inputVAT;
            combined.outputVAT += result.outputVAT;
            combined.transactions += result.transactions;

            Object.keys(result.breakdown).forEach(taxCode => {
                if (!combined.breakdown[taxCode]) {
                    combined.breakdown[taxCode] = {
                        count: 0,
                        total: 0,
                        type: result.breakdown[taxCode].type
                    };
                }
                combined.breakdown[taxCode].count += result.breakdown[taxCode].count;
                combined.breakdown[taxCode].total += result.breakdown[taxCode].total;
            });
        });

        return combined;
    }

    yieldToUI() {
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }

    // Performance Reporting
    getPerformanceReport() {
        return {
            metrics: this.performanceMetrics,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };
    }
}

// Initialize performance manager
const performanceManager = new PerformanceManager();
