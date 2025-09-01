/**
 * Scroll Controller for Pakistan Internet Timeline
 * Handles smooth scrolling, progress tracking, and scroll-based interactions
 */

class ScrollController {
    constructor() {
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.sections = [];
        this.currentSection = 'hero';
        this.scrollProgress = 0;
        this.lastScrollTop = 0;
        this.headerVisible = true;
        
        // Configuration
        this.config = {
            scrollOffset: 100, // Offset for section detection
            headerHideDelay: 200, // Delay before hiding header on scroll
            smoothScrollDuration: 800, // Duration for smooth scroll
            progressUpdateThrottle: 16, // ~60fps
            sectionChangeDebounce: 150
        };
        
        this.initialize();
    }

    /**
     * Initialize the scroll controller
     */
    initialize() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.setup();
                });
            } else {
                this.setup();
            }
        } catch (error) {
            console.error('❌ Failed to initialize scroll controller:', error);
        }
    }

    /**
     * Setup scroll controller after DOM is ready
     */
    setup() {
        try {
            // Cache DOM elements
            this.cacheElements();
            
            // Get all sections
            this.getSections();
            
            // Bind event listeners
            this.bindEvents();
            
            // Initial state
            this.updateInitialState();
            
            // Create back to top button
            this.createBackToTopButton();
            
            console.log('✅ Scroll controller initialized');
        } catch (error) {
            console.error('❌ Failed to setup scroll controller:', error);
        }
    }

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        this.elements = {
            header: document.querySelector('.fixed-header'),
            progressBar: document.getElementById('progressBar'),
            progressText: document.getElementById('progressText'),
            navLinks: document.querySelectorAll('.nav-link'),
            mainContent: document.querySelector('.main-content')
        };
    }

    /**
     * Get all sections and their positions
     */
    getSections() {
        const sectionElements = document.querySelectorAll('.section[data-section]');
        
        this.sections = Array.from(sectionElements).map(section => ({
            id: section.getAttribute('data-section'),
            element: section,
            offsetTop: section.offsetTop,
            height: section.offsetHeight,
            name: this.getSectionName(section.getAttribute('data-section'))
        }));
        
        console.log('📍 Found sections:', this.sections.map(s => s.id));
    }

    /**
     * Get human-readable section name
     * @param {string} sectionId - Section ID
     * @returns {string} - Human-readable name
     */
    getSectionName(sectionId) {
        const names = {
            hero: 'Hero Section',
            foundation: 'Foundation Era (2006-2014)',
            mobile: 'Mobile Revolution (2014-2021)',
            fintech: 'Fintech Era (2021-2025)'
        };
        return names[sectionId] || sectionId;
    }

    /**
     * Bind scroll and resize event listeners
     */
    bindEvents() {
        // Throttled scroll handler
        let scrollTicking = false;
        const handleScroll = () => {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 150);
        });

        // Navigation click handlers
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('data-section');
                this.smoothScrollToSection(targetSection);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollTop = window.pageYOffset;
        const direction = scrollTop > this.lastScrollTop ? 'down' : 'up';
        
        // Update progress
        this.updateScrollProgress();
        
        // Update current section
        this.updateCurrentSection();
        
        // Handle header visibility
        this.handleHeaderVisibility(direction, scrollTop);
        
        // Update navigation
        this.updateActiveNavigation();
        
        // Update back to top button
        this.updateBackToTopButton(scrollTop);
        
        this.lastScrollTop = scrollTop;
    }

    /**
     * Update scroll progress
     */
    updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.min(Math.max(scrollTop / docHeight * 100, 0), 100);
        
        this.scrollProgress = scrollPercent;
        
        // Update progress bar
        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = `${scrollPercent}%`;
        }
        
        // Update progress text
        if (this.elements.progressText) {
            const currentSectionName = this.getSectionName(this.currentSection);
            this.elements.progressText.textContent = 
                `📍 Currently viewing: ${currentSectionName} (${Math.round(scrollPercent)}% through timeline)`;
        }
    }

    /**
     * Update current section based on scroll position
     */
    updateCurrentSection() {
        const scrollTop = window.pageYOffset;
        const headerHeight = this.elements.header ? this.elements.header.offsetHeight : 120;
        const currentPosition = scrollTop + headerHeight + this.config.scrollOffset;
        
        let newCurrentSection = this.currentSection;
        
        // Find the current section
        for (let i = this.sections.length - 1; i >= 0; i--) {
            const section = this.sections[i];
            if (currentPosition >= section.offsetTop) {
                newCurrentSection = section.id;
                break;
            }
        }
        
        // If section changed, trigger section change event
        if (newCurrentSection !== this.currentSection) {
            this.onSectionChange(this.currentSection, newCurrentSection);
            this.currentSection = newCurrentSection;
        }
    }

    /**
     * Handle section change event
     * @param {string} fromSection - Previous section
     * @param {string} toSection - New section
     */
    onSectionChange(fromSection, toSection) {
        console.log(`🔄 Section changed: ${fromSection} → ${toSection}`);
        
        // Add fade-in animation to new section content
        const newSectionElement = document.getElementById(toSection);
        if (newSectionElement && !newSectionElement.classList.contains('fade-in')) {
            newSectionElement.classList.add('fade-in');
            setTimeout(() => {
                newSectionElement.classList.remove('fade-in');
            }, 600);
        }
        
        // Trigger custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('sectionChange', {
            detail: { fromSection, toSection }
        }));
    }

    /**
     * Handle header visibility based on scroll direction
     * @param {string} direction - Scroll direction ('up' or 'down')
     * @param {number} scrollTop - Current scroll position
     */
    handleHeaderVisibility(direction, scrollTop) {
        if (!this.elements.header) return;
        
        const shouldHide = direction === 'down' && scrollTop > 200;
        const shouldShow = direction === 'up' || scrollTop <= 100;
        
        if (shouldHide && this.headerVisible) {
            this.hideHeader();
        } else if (shouldShow && !this.headerVisible) {
            this.showHeader();
        }
    }

    /**
     * Hide header with animation
     */
    hideHeader() {
        if (this.elements.header) {
            this.elements.header.style.transform = 'translateY(-100%)';
            this.headerVisible = false;
        }
    }

    /**
     * Show header with animation
     */
    showHeader() {
        if (this.elements.header) {
            this.elements.header.style.transform = 'translateY(0)';
            this.headerVisible = true;
        }
    }

    /**
     * Update active navigation link
     */
    updateActiveNavigation() {
        this.elements.navLinks.forEach(link => {
            const linkSection = link.getAttribute('data-section');
            
            if (linkSection === this.currentSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Recalculate section positions
        this.getSections();
        
        // Update current section
        this.updateCurrentSection();
        
        // Update progress
        this.updateScrollProgress();
    }

    /**
     * Smooth scroll to section
     * @param {string} sectionId - Target section ID
     */
    smoothScrollToSection(sectionId) {
        const targetSection = this.sections.find(section => section.id === sectionId);
        
        if (!targetSection) {
            console.warn(`⚠️ Section not found: ${sectionId}`);
            return;
        }
        
        const headerHeight = this.elements.header ? this.elements.header.offsetHeight : 120;
        const targetPosition = targetSection.offsetTop - headerHeight - 20;
        
        // Use native smooth scroll if supported, otherwise fallback to custom animation
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            this.animatedScrollTo(targetPosition);
        }
        
        // Update URL hash without triggering scroll
        if (history.replaceState) {
            history.replaceState(null, null, `#${sectionId}`);
        }
    }

    /**
     * Custom smooth scroll animation (fallback for older browsers)
     * @param {number} targetPosition - Target scroll position
     */
    animatedScrollTo(targetPosition) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = this.config.smoothScrollDuration;
        let startTime = null;
        
        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };
        
        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            const easedProgress = easeInOutCubic(progress);
            const currentPosition = startPosition + (distance * easedProgress);
            
            window.scrollTo(0, currentPosition);
            
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        };
        
        requestAnimationFrame(animation);
    }

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyNavigation(e) {
        // Don't interfere if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const currentIndex = this.sections.findIndex(section => section.id === this.currentSection);
        
        switch (e.key) {
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    this.smoothScrollToSection(this.sections[currentIndex - 1].id);
                }
                break;
                
            case 'ArrowDown':
            case 'PageDown':
                e.preventDefault();
                if (currentIndex < this.sections.length - 1) {
                    this.smoothScrollToSection(this.sections[currentIndex + 1].id);
                }
                break;
                
            case 'Home':
                e.preventDefault();
                this.smoothScrollToSection('hero');
                break;
                
            case 'End':
                e.preventDefault();
                this.smoothScrollToSection(this.sections[this.sections.length - 1].id);
                break;
        }
    }

    /**
     * Create and manage back to top button
     */
    createBackToTopButton() {
        // Check if button already exists
        if (document.querySelector('.back-to-top')) return;
        
        const backToTopButton = document.createElement('button');
        backToTopButton.className = 'back-to-top';
        backToTopButton.innerHTML = '↑';
        backToTopButton.title = 'Back to top';
        backToTopButton.setAttribute('aria-label', 'Back to top');
        
        backToTopButton.addEventListener('click', () => {
            this.smoothScrollToSection('hero');
        });
        
        document.body.appendChild(backToTopButton);
        this.backToTopButton = backToTopButton;
    }

    /**
     * Update back to top button visibility
     * @param {number} scrollTop - Current scroll position
     */
    updateBackToTopButton(scrollTop) {
        if (!this.backToTopButton) return;
        
        if (scrollTop > 500) {
            this.backToTopButton.classList.add('visible');
        } else {
            this.backToTopButton.classList.remove('visible');
        }
    }

    /**
     * Set initial state
     */
    updateInitialState() {
        // Check if there's a hash in the URL
        const hash = window.location.hash.substring(1);
        if (hash && this.sections.find(section => section.id === hash)) {
            // Scroll to the section after a brief delay to ensure content is loaded
            setTimeout(() => {
                this.smoothScrollToSection(hash);
            }, 500);
        } else {
            // Initialize with current scroll position
            this.updateScrollProgress();
            this.updateCurrentSection();
            this.updateActiveNavigation();
        }
    }

    /**
     * Get current scroll information
     * @returns {Object} - Scroll information object
     */
    getScrollInfo() {
        return {
            currentSection: this.currentSection,
            scrollProgress: this.scrollProgress,
            scrollTop: window.pageYOffset,
            sections: this.sections.map(section => ({
                id: section.id,
                name: section.name,
                active: section.id === this.currentSection
            }))
        };
    }

    /**
     * Scroll to a specific percentage of the page
     * @param {number} percentage - Percentage to scroll to (0-100)
     */
    scrollToPercentage(percentage) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const targetPosition = (percentage / 100) * docHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Enable/disable smooth scrolling
     * @param {boolean} enabled - Whether to enable smooth scrolling
     */
    setSmoothScrolling(enabled) {
        document.documentElement.style.scrollBehavior = enabled ? 'smooth' : 'auto';
    }

    /**
     * Destroy the scroll controller and clean up
     */
    destroy() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyNavigation);
        
        if (this.backToTopButton) {
            this.backToTopButton.remove();
        }
        
        console.log('🧹 Scroll controller destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollController;
} else {
    window.ScrollController = ScrollController;
}