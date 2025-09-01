/**
 * Pakistan Internet Timeline - Main Application Controller
 * Orchestrates data loading, validation, template rendering, and user interactions
 */

class PakistanTimelineApp {
    constructor() {
        this.validator = null;
        this.renderer = null;
        this.scrollController = null;
        this.data = {};
        this.isLoading = false;
        this.hasErrors = false;
        
        // Configuration
        this.config = {
            dataFiles: [
                'data/historical_events.json',
                'data/statistics.json', 
                'data/companies.json',
                'data/social_media.json',
                'data/policies.json',
                'data/infrastructure.json'
            ],
            retryAttempts: 3,
            retryDelay: 1000
        };
        
        this.initialize();
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Pakistan Internet Timeline...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.startApp();
                });
            } else {
                this.startApp();
            }
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.handleAppError(error);
        }
    }

    /**
     * Start the main application
     */
    async startApp() {
        try {
            // Initialize components
            this.validator = new JSONValidator();
            this.renderer = new TemplateRenderer();
            
            // Initialize scroll controller if available
            if (typeof ScrollController !== 'undefined') {
                this.scrollController = new ScrollController();
            }
            
            // Show loading overlay
            this.showLoadingOverlay();
            
            // Load and validate all data
            await this.loadAllData();
            
            // Render all content
            await this.renderAllContent();
            
            // Initialize user interactions
            this.initializeInteractions();
            
            // Hide loading overlay
            this.hideLoadingOverlay();
            
            console.log('✅ Pakistan Internet Timeline loaded successfully!');
            
        } catch (error) {
            console.error('❌ Failed to start app:', error);
            this.handleAppError(error);
        }
    }

    /**
     * Load all JSON data files
     */
    async loadAllData() {
        try {
            console.log('📊 Loading timeline data...');
            
            // Load primary historical events data (this contains most of our content)
            const primaryData = await this.loadJSONFile('data/historical_events.json');
            
            if (primaryData) {
                // Validate the primary data
                const validationResult = this.validator.validateJSONData(primaryData, 'historical_events');
                
                if (validationResult.success) {
                    this.data.historical_events = primaryData;
                    console.log('✅ Historical events data loaded and validated');
                } else {
                    console.warn('⚠️ Historical events data validation warnings:', validationResult.errors);
                    this.data.historical_events = primaryData; // Use despite warnings
                }
            }
            
            // Load additional data files (with graceful fallback if they don't exist yet)
            await this.loadOptionalDataFiles();
            
        } catch (error) {
            console.error('❌ Failed to load data:', error);
            throw error;
        }
    }

    /**
     * Load optional data files that may not exist yet
     */
    async loadOptionalDataFiles() {
        const optionalFiles = [
            'data/statistics.json',
            'data/companies.json', 
            'data/social_media.json',
            'data/policies.json',
            'data/infrastructure.json'
        ];

        for (const file of optionalFiles) {
            try {
                const data = await this.loadJSONFile(file);
                if (data) {
                    const fileName = file.split('/')[1].replace('.json', '');
                    this.data[fileName] = data;
                    console.log(`✅ Loaded ${fileName} data`);
                }
            } catch (error) {
                console.warn(`⚠️ Optional file ${file} not found - using primary data`);
            }
        }
    }

    /**
     * Load individual JSON file with error handling and retries
     * @param {string} filePath - Path to JSON file
     * @returns {Object|null} - Parsed JSON data or null
     */
    async loadJSONFile(filePath) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                console.log(`📁 Loading ${filePath} (attempt ${attempt})`);
                
                const response = await fetch(filePath);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const jsonText = await response.text();
                
                // Validate JSON string before parsing
                const parseResult = JSONValidator.validateJSONString(jsonText);
                
                if (!parseResult.success) {
                    throw new Error(parseResult.error);
                }
                
                return parseResult.data;
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Attempt ${attempt} failed for ${filePath}:`, error.message);
                
                if (attempt < this.config.retryAttempts) {
                    await this.delay(this.config.retryDelay * attempt);
                }
            }
        }
        
        // If all attempts failed, handle gracefully
        if (filePath.includes('historical_events.json')) {
            // This is critical - throw error
            throw new Error(`Failed to load critical data file: ${filePath}. Last error: ${lastError.message}`);
        } else {
            // Optional file - log warning and continue
            console.warn(`Optional file ${filePath} could not be loaded:`, lastError.message);
            return null;
        }
    }

    /**
     * Render all content using templates and data
     */
    async renderAllContent() {
        try {
            console.log('🎨 Rendering timeline content...');
            
            // Wait for templates to be ready
            await this.waitForTemplatesReady();
            
            const historicalData = this.data.historical_events;
            
            if (!historicalData) {
                throw new Error('No historical data available for rendering');
            }

            // Render hero section
            if (historicalData.heroStats) {
                this.renderer.renderHeroStats(historicalData.heroStats);
            }

            // Render foundation era (2006-2014)
            if (historicalData.foundationEra) {
                this.renderer.renderFoundationEra(historicalData.foundationEra);
            }

            // Render mobile era (2014-2021)
            if (historicalData.mobileEra) {
                this.renderer.renderMobileEra(historicalData.mobileEra);
            }

            // Render fintech era (2021-2025)
            if (historicalData.fintechEra) {
                this.renderer.renderFintechEra(historicalData.fintechEra);
            }

            // Render sidebar content
            this.renderer.renderSidebarContent(historicalData);
            
            console.log('✅ All content rendered successfully');
            
        } catch (error) {
            console.error('❌ Failed to render content:', error);
            throw error;
        }
    }

    /**
     * Wait for Handlebars templates to be compiled and ready
     */
    async waitForTemplatesReady() {
        const maxWait = 10000; // 10 seconds
        const checkInterval = 100; // 100ms
        let waited = 0;
        
        while (!this.renderer.isReady() && waited < maxWait) {
            await this.delay(checkInterval);
            waited += checkInterval;
        }
        
        if (!this.renderer.isReady()) {
            throw new Error('Templates failed to compile within timeout period');
        }
    }

    /**
     * Initialize user interactions and event listeners
     */
    initializeInteractions() {
        try {
            console.log('🎯 Initializing user interactions...');
            
            // Navigation click handlers
            this.initializeNavigation();
            
            // Scroll progress tracking
            this.initializeScrollTracking();
            
            // Button click handlers
            this.initializeButtons();
            
            // Mobile menu toggle
            this.initializeMobileMenu();
            
            console.log('✅ User interactions initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize interactions:', error);
        }
    }

    /**
     * Initialize navigation menu interactions
     */
    initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetSection = link.getAttribute('data-section');
                this.scrollToSection(targetSection);
                
                // Update active nav link
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    /**
     * Initialize scroll progress tracking
     */
    initializeScrollTracking() {
        let ticking = false;
        
        const updateProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.min(scrollTop / docHeight * 100, 100);
            
            // Update progress bar
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.width = `${scrollPercent}%`;
            }
            
            // Update progress text
            const progressText = document.getElementById('progressText');
            if (progressText) {
                const currentSection = this.getCurrentSection();
                progressText.textContent = `📍 Currently viewing: ${currentSection} (${Math.round(scrollPercent)}% through timeline)`;
            }
            
            // Update navigation active state
            this.updateActiveNavigation();
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        });
    }

    /**
     * Initialize button click handlers
     */
    initializeButtons() {
        // Make button functions globally available
        window.scrollToSection = (sectionId) => this.scrollToSection(sectionId);
        window.showAllStats = () => this.showAllStats();
        window.restartJourney = () => this.restartJourney();
        window.retryDataLoad = () => this.retryDataLoad();
        window.closeErrorModal = () => this.closeErrorModal();
    }

    /**
     * Initialize mobile menu toggle
     */
    initializeMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (menuToggle && mainNav) {
            menuToggle.addEventListener('click', () => {
                mainNav.classList.toggle('mobile-active');
                menuToggle.classList.toggle('active');
            });
        }
    }

    /**
     * Scroll to specific section smoothly
     * @param {string} sectionId - Section ID to scroll to
     */
    scrollToSection(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            const headerHeight = document.querySelector('.fixed-header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Get current section based on scroll position
     * @returns {string} - Current section name
     */
    getCurrentSection() {
        const sections = ['hero', 'foundation', 'mobile', 'fintech'];
        const headerHeight = document.querySelector('.fixed-header').offsetHeight;
        const scrollPosition = window.pageYOffset + headerHeight + 100;
        
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (section && section.offsetTop <= scrollPosition) {
                const sectionNames = {
                    hero: 'Hero Section',
                    foundation: 'Foundation Era',
                    mobile: 'Mobile Revolution',
                    fintech: 'Fintech Era'
                };
                return sectionNames[sections[i]];
            }
        }
        
        return 'Hero Section';
    }

    /**
     * Update active navigation based on current section
     */
    updateActiveNavigation() {
        const sections = ['hero', 'foundation', 'mobile', 'fintech'];
        const headerHeight = document.querySelector('.fixed-header').offsetHeight;
        const scrollPosition = window.pageYOffset + headerHeight + 100;
        
        let activeSection = 'hero';
        
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (section && section.offsetTop <= scrollPosition) {
                activeSection = sections[i];
                break;
            }
        }
        
        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === activeSection) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Show all statistics (future implementation)
     */
    showAllStats() {
        console.log('📊 Showing all statistics...');
        // Future implementation: Could open a modal with comprehensive statistics
        alert('Statistics dashboard coming soon! 📊');
    }

    /**
     * Restart the journey (scroll to top)
     */
    restartJourney() {
        this.scrollToSection('hero');
    }

    /**
     * Retry loading data
     */
    async retryDataLoad() {
        this.closeErrorModal();
        this.showLoadingOverlay();
        
        try {
            await this.loadAllData();
            await this.renderAllContent();
            this.hideLoadingOverlay();
        } catch (error) {
            this.handleAppError(error);
        }
    }

    /**
     * Show loading overlay
     */
    showLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            this.isLoading = true;
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
            this.isLoading = false;
        }
    }

    /**
     * Show error modal
     * @param {string} message - Error message to display
     */
    showErrorModal(message) {
        const modal = document.getElementById('errorModal');
        const messageElement = document.getElementById('errorMessage');
        
        if (modal && messageElement) {
            messageElement.textContent = message;
            modal.style.display = 'flex';
            this.hasErrors = true;
        }
    }

    /**
     * Close error modal
     */
    closeErrorModal() {
        const modal = document.getElementById('errorModal');
        if (modal) {
            modal.style.display = 'none';
            this.hasErrors = false;
        }
    }

    /**
     * Handle application errors gracefully
     * @param {Error} error - Error object
     */
    handleAppError(error) {
        console.error('💥 Application Error:', error);
        
        this.hideLoadingOverlay();
        
        let userMessage = 'An error occurred while loading the Pakistan Internet Timeline. ';
        
        if (error.message.includes('Failed to load critical data')) {
            userMessage += 'Unable to load timeline data. Please check your internet connection and ensure the data files are available.';
        } else if (error.message.includes('Templates failed to compile')) {
            userMessage += 'There was a problem with the page templates. Please refresh the page to try again.';
        } else {
            userMessage += 'Please try refreshing the page or contact support if the problem persists.';
        }
        
        this.showErrorModal(userMessage);
    }

    /**
     * Utility function to create delays
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} - Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get application status
     * @returns {Object} - Current app status
     */
    getStatus() {
        return {
            isLoading: this.isLoading,
            hasErrors: this.hasErrors,
            dataLoaded: Object.keys(this.data).length > 0,
            templatesReady: this.renderer ? this.renderer.isReady() : false
        };
    }
}

// Initialize the application when this script loads
document.addEventListener('DOMContentLoaded', () => {
    // Make app globally available for debugging
    window.PakistanTimelineApp = new PakistanTimelineApp();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PakistanTimelineApp;
}