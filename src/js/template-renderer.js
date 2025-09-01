/**
 * Template Renderer for Pakistan Internet Timeline
 * Handles Handlebars template compilation and rendering with JSON data
 */

class TemplateRenderer {
    constructor() {
        this.compiledTemplates = {};
        this.templateElements = {};
        this.initializeTemplates();
    }

    /**
     * Initialize and compile all Handlebars templates
     */
    initializeTemplates() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.compileAllTemplates();
            });
        } else {
            this.compileAllTemplates();
        }
    }

    /**
     * Compile all embedded Handlebars templates
     */
    compileAllTemplates() {
        try {
            // Define template mappings
            const templateMappings = {
                heroStats: 'hero-stats-template',
                historicalEvents: 'historical-events-template', 
                statistics: 'statistics-template',
                companies: 'company-template',
                socialMedia: 'social-media-template',
                policies: 'policy-template',
                infrastructure: 'infrastructure-template'
            };

            // Compile each template
            Object.entries(templateMappings).forEach(([key, templateId]) => {
                this.compileTemplate(key, templateId);
            });

            console.log('✅ All Handlebars templates compiled successfully');
        } catch (error) {
            console.error('❌ Error compiling templates:', error);
            throw error;
        }
    }

    /**
     * Compile individual Handlebars template
     * @param {string} templateName - Name to store compiled template
     * @param {string} templateId - DOM element ID of the template
     */
    compileTemplate(templateName, templateId) {
        const templateElement = document.getElementById(templateId);
        
        if (!templateElement) {
            console.warn(`⚠️ Template element not found: ${templateId}`);
            return;
        }

        const templateSource = templateElement.innerHTML;
        
        if (!templateSource.trim()) {
            console.warn(`⚠️ Template source is empty: ${templateId}`);
            return;
        }

        try {
            this.compiledTemplates[templateName] = Handlebars.compile(templateSource);
            this.templateElements[templateName] = templateElement;
            console.log(`✅ Compiled template: ${templateName}`);
        } catch (error) {
            console.error(`❌ Error compiling template ${templateName}:`, error);
            throw error;
        }
    }

    /**
     * Render template with data and insert into target element
     * @param {string} templateName - Name of compiled template
     * @param {Object} data - Data to render with template
     * @param {string|Element} targetSelector - Target element selector or element
     * @returns {boolean} - Success status
     */
    renderTemplate(templateName, data, targetSelector) {
        try {
            // Validate inputs
            if (!this.compiledTemplates[templateName]) {
                console.error(`❌ Template not found: ${templateName}`);
                return false;
            }

            if (!data) {
                console.error(`❌ No data provided for template: ${templateName}`);
                return false;
            }

            // Get target element
            const targetElement = typeof targetSelector === 'string' 
                ? document.querySelector(targetSelector)
                : targetSelector;

            if (!targetElement) {
                console.error(`❌ Target element not found: ${targetSelector}`);
                return false;
            }

            // Render template with data
            const renderedHTML = this.compiledTemplates[templateName](data);
            
            // Insert rendered HTML
            targetElement.innerHTML = renderedHTML;
            
            console.log(`✅ Rendered template: ${templateName} into ${targetSelector}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Error rendering template ${templateName}:`, error);
            this.handleRenderError(templateName, targetSelector, error);
            return false;
        }
    }

    /**
     * Render hero statistics
     * @param {Array} heroStatsData - Hero statistics data
     */
    renderHeroStats(heroStatsData) {
        return this.renderTemplate('heroStats', { heroStats: heroStatsData }, '#heroStats');
    }

    /**
     * Render foundation era content
     * @param {Object} foundationData - Foundation era data
     */
    renderFoundationEra(foundationData) {
        const success = [];
        
        // Render PTCL privatization (using historical events template)
        if (foundationData.events && foundationData.events.length > 0) {
            const ptclEvent = foundationData.events.find(event => 
                event.title.toLowerCase().includes('ptcl privatization')
            );
            if (ptclEvent) {
                success.push(this.renderTemplate('historicalEvents', 
                    { events: [ptclEvent] }, '#ptclPrivatization'));
            }
        }

        // Render foundation milestones
        success.push(this.renderTemplate('historicalEvents', 
            { events: foundationData.events }, '#foundationMilestones'));

        // Render foundation statistics
        success.push(this.renderTemplate('statistics', 
            { yearlyStats: foundationData.yearlyStats }, '#foundationStats'));

        // Render foundation timeline
        success.push(this.renderTemplate('historicalEvents', 
            { events: foundationData.events }, '#foundationTimeline'));

        return success.every(result => result === true);
    }

    /**
     * Render mobile era content
     * @param {Object} mobileData - Mobile era data
     */
    renderMobileEra(mobileData) {
        const success = [];

        // Render 3G/4G content
        const launch3G4G = mobileData.events.find(event => 
            event.title.toLowerCase().includes('3g/4g') || event.title.toLowerCase().includes('spectrum auction')
        );
        if (launch3G4G) {
            success.push(this.renderTemplate('historicalEvents', 
                { events: [launch3G4G] }, '#mobile3G4G'));
        }

        // Render social media growth
        success.push(this.renderTemplate('socialMedia', 
            { platforms: mobileData.socialMediaGrowth.map(platform => ({
                icon: this.getSocialMediaIcon(platform.platform),
                name: platform.platform,
                users: platform.users || platform.peakUsers,
                penetration: platform.penetration || `${platform.ranking}`,
                note: platform.note || platform.status
            }))}, '#socialMediaGrowth'));

        // Render Digital Pakistan Policy
        const policyEvent = mobileData.events.find(event => 
            event.title.toLowerCase().includes('digital pakistan policy')
        );
        if (policyEvent) {
            success.push(this.renderTemplate('historicalEvents', 
                { events: [policyEvent] }, '#digitalPakistanPolicy'));
        }

        return success.every(result => result === true);
    }

    /**
     * Render fintech era content
     * @param {Object} fintechData - Fintech era data
     */
    renderFintechEra(fintechData) {
        const success = [];

        // Render RAAST revolution
        const raastEvent = fintechData.events.find(event => 
            event.title.toLowerCase().includes('raast')
        );
        if (raastEvent) {
            success.push(this.renderTemplate('historicalEvents', 
                { events: [raastEvent] }, '#raastRevolution'));
        }

        // Render mobile banking
        success.push(this.renderTemplate('companies', 
            { companies: fintechData.mobileBanking.map(service => ({
                name: service.service,
                marketShare: '', // Not applicable for services
                subscribers: service.users || 'Market leader',
                founded: service.parent,
                keyMilestone: service.description
            }))}, '#mobileBanking'));

        // Render investment boom
        success.push(this.renderTemplate('companies', 
            { companies: fintechData.investmentBoom.map(company => ({
                name: company.company,
                marketShare: '',
                subscribers: company.funding,
                founded: company.type,
                keyMilestone: company.note || 'Fintech startup'
            }))}, '#investmentBoom'));

        return success.every(result => result === true);
    }

    /**
     * Render sidebar content for different sections
     * @param {Object} allData - Complete JSON data
     */
    renderSidebarContent(allData) {
        // Render COVID impact (Mobile era sidebar)
        if (allData.mobileEra) {
            const covidEvent = allData.mobileEra.events.find(event => 
                event.title.toLowerCase().includes('covid')
            );
            if (covidEvent) {
                this.renderTemplate('historicalEvents', 
                    { events: [covidEvent] }, '#covidImpact');
            }
        }

        // Render 5G future (Fintech era sidebar)
        if (allData.fiveGFuture) {
            const fiveGData = {
                name: '5G Commercial Launch',
                icon: '🚀',
                specifications: [
                    { label: 'Launch Timeline', value: allData.fiveGFuture.launchTimeline },
                    { label: 'Test Speeds', value: allData.fiveGFuture.testSpeeds },
                    { label: 'Regional First', value: allData.fiveGFuture.regionalFirst }
                ]
            };
            this.renderTemplate('infrastructure', 
                { infrastructure: [fiveGData] }, '#fiveGFuture');
        }

        // Render digital divide
        if (allData.digitalDivides) {
            const divideData = {
                name: 'Digital Divide Challenges',
                icon: '⚖️',
                specifications: [
                    { label: 'Gender Gap', value: `${allData.digitalDivides.genderGap.percentage} (World\'s highest)` },
                    { label: 'Men vs Women', value: `${allData.digitalDivides.genderGap.menAccess} vs ${allData.digitalDivides.genderGap.womenAccess}` },
                    { label: 'Urban vs Rural', value: `${allData.digitalDivides.geographicGap.urbanAccess} vs ${allData.digitalDivides.geographicGap.ruralAccess}` }
                ]
            };
            this.renderTemplate('infrastructure', 
                { infrastructure: [divideData] }, '#digitalDivide');
        }
    }

    /**
     * Handle rendering errors gracefully
     * @param {string} templateName - Template name
     * @param {string} targetSelector - Target selector
     * @param {Error} error - Error object
     */
    handleRenderError(templateName, targetSelector, error) {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            targetElement.innerHTML = `
                <div class="render-error">
                    <h4>⚠️ Content Loading Error</h4>
                    <p>Unable to load ${templateName} content.</p>
                    <small>Error: ${error.message}</small>
                </div>
            `;
        }
    }

    /**
     * Get appropriate icon for social media platform
     * @param {string} platform - Platform name
     * @returns {string} - Platform icon
     */
    getSocialMediaIcon(platform) {
        const icons = {
            'Facebook': '📘',
            'YouTube': '📹', 
            'WhatsApp': '💬',
            'TikTok': '🎵',
            'Twitter': '🐦',
            'Instagram': '📷'
        };
        return icons[platform] || '📱';
    }

    /**
     * Clear all rendered content (useful for re-rendering)
     */
    clearAllContent() {
        const contentSelectors = [
            '#heroStats', '#ptclPrivatization', '#foundationMilestones', 
            '#foundationStats', '#foundationTimeline', '#mobile3G4G',
            '#socialMediaGrowth', '#digitalPakistanPolicy', '#raastRevolution',
            '#mobileBanking', '#investmentBoom', '#covidImpact', 
            '#fiveGFuture', '#digitalDivide'
        ];

        contentSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = '<div class="loading-placeholder">Loading...</div>';
            }
        });
    }

    /**
     * Check if all templates are compiled and ready
     * @returns {boolean} - True if all templates are ready
     */
    isReady() {
        const requiredTemplates = ['heroStats', 'historicalEvents', 'statistics', 'companies', 'socialMedia'];
        return requiredTemplates.every(template => 
            this.compiledTemplates[template] !== undefined
        );
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateRenderer;
} else {
    window.TemplateRenderer = TemplateRenderer;
}