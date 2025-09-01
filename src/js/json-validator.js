/**
 * JSON Data Validator for Pakistan Internet Timeline
 * Validates JSON structure and data integrity before template rendering
 */

class JSONValidator {
    constructor() {
        this.validationErrors = [];
        this.requiredFields = this.getRequiredFields();
    }

    /**
     * Define required field structures for each JSON data type
     */
    getRequiredFields() {
        return {
            heroStats: {
                required: ['icon', 'title', 'value', 'description'],
                types: {
                    icon: 'string',
                    title: 'string', 
                    value: 'string',
                    description: 'string'
                }
            },
            historicalEvents: {
                required: ['date', 'title', 'description'],
                optional: ['impact'],
                types: {
                    date: 'string',
                    title: 'string',
                    description: 'string',
                    impact: 'string'
                }
            },
            yearlyStats: {
                required: ['year', 'users', 'penetration'],
                types: {
                    year: 'string',
                    users: 'string',
                    penetration: 'string'
                }
            },
            socialMediaPlatforms: {
                required: ['platform', 'users'],
                optional: ['penetration', 'ranking', 'note', 'status'],
                types: {
                    platform: 'string',
                    users: 'string',
                    penetration: 'string',
                    ranking: 'string',
                    note: 'string',
                    status: 'string'
                }
            },
            companies: {
                required: ['name', 'marketShare', 'subscribers'],
                optional: ['founded', 'keyMilestone'],
                types: {
                    name: 'string',
                    marketShare: ['string', 'number'],
                    subscribers: 'string',
                    founded: 'string',
                    keyMilestone: 'string'
                }
            },
            policies: {
                required: ['title', 'year', 'target', 'achievement'],
                optional: ['description', 'achievementStatus'],
                types: {
                    title: 'string',
                    year: ['string', 'number'],
                    target: 'string',
                    achievement: 'string',
                    description: 'string',
                    achievementStatus: 'string'
                }
            },
            infrastructure: {
                required: ['name', 'icon', 'specifications'],
                types: {
                    name: 'string',
                    icon: 'string',
                    specifications: 'array'
                }
            }
        };
    }

    /**
     * Main validation function - validates complete JSON structure
     * @param {Object} jsonData - The JSON data to validate
     * @param {string} dataType - Type of data (e.g., 'historical_events', 'statistics')
     * @returns {Object} - Validation result with success flag and errors
     */
    validateJSONData(jsonData, dataType) {
        this.validationErrors = [];
        
        if (!jsonData) {
            return this.validationFailed('JSON data is null or undefined');
        }

        if (typeof jsonData !== 'object') {
            return this.validationFailed('JSON data must be an object');
        }

        try {
            switch(dataType) {
                case 'historical_events':
                    return this.validateHistoricalEvents(jsonData);
                case 'statistics':
                    return this.validateStatistics(jsonData);
                case 'companies':
                    return this.validateCompanies(jsonData);
                case 'social_media':
                    return this.validateSocialMedia(jsonData);
                case 'policies':
                    return this.validatePolicies(jsonData);
                case 'infrastructure':
                    return this.validateInfrastructure(jsonData);
                default:
                    return this.validationFailed(`Unknown data type: ${dataType}`);
            }
        } catch (error) {
            return this.validationFailed(`Validation error: ${error.message}`);
        }
    }

    /**
     * Validate historical events JSON structure
     */
    validateHistoricalEvents(data) {
        // Check for required top-level properties
        if (!data.heroStats || !Array.isArray(data.heroStats)) {
            this.addError('heroStats must be an array');
        } else {
            this.validateArrayItems(data.heroStats, 'heroStats');
        }

        if (!data.foundationEra || typeof data.foundationEra !== 'object') {
            this.addError('foundationEra must be an object');
        } else {
            this.validateFoundationEra(data.foundationEra);
        }

        if (!data.mobileEra || typeof data.mobileEra !== 'object') {
            this.addError('mobileEra must be an object');
        } else {
            this.validateMobileEra(data.mobileEra);
        }

        if (!data.fintechEra || typeof data.fintechEra !== 'object') {
            this.addError('fintechEra must be an object');
        } else {
            this.validateFintechEra(data.fintechEra);
        }

        return this.getValidationResult();
    }

    /**
     * Validate foundation era data structure
     */
    validateFoundationEra(foundationEra) {
        if (!foundationEra.events || !Array.isArray(foundationEra.events)) {
            this.addError('foundationEra.events must be an array');
        } else {
            this.validateArrayItems(foundationEra.events, 'historicalEvents');
        }

        if (!foundationEra.yearlyStats || !Array.isArray(foundationEra.yearlyStats)) {
            this.addError('foundationEra.yearlyStats must be an array');
        } else {
            this.validateArrayItems(foundationEra.yearlyStats, 'yearlyStats');
        }
    }

    /**
     * Validate mobile era data structure
     */
    validateMobileEra(mobileEra) {
        if (!mobileEra.events || !Array.isArray(mobileEra.events)) {
            this.addError('mobileEra.events must be an array');
        } else {
            this.validateArrayItems(mobileEra.events, 'historicalEvents');
        }

        if (!mobileEra.socialMediaGrowth || !Array.isArray(mobileEra.socialMediaGrowth)) {
            this.addError('mobileEra.socialMediaGrowth must be an array');
        } else {
            this.validateArrayItems(mobileEra.socialMediaGrowth, 'socialMediaPlatforms');
        }
    }

    /**
     * Validate fintech era data structure  
     */
    validateFintechEra(fintechEra) {
        if (!fintechEra.events || !Array.isArray(fintechEra.events)) {
            this.addError('fintechEra.events must be an array');
        } else {
            this.validateArrayItems(fintechEra.events, 'historicalEvents');
        }

        if (!fintechEra.mobileBanking || !Array.isArray(fintechEra.mobileBanking)) {
            this.addError('fintechEra.mobileBanking must be an array');
        }

        if (!fintechEra.investmentBoom || !Array.isArray(fintechEra.investmentBoom)) {
            this.addError('fintechEra.investmentBoom must be an array');
        }
    }

    /**
     * Validate array of items against field requirements
     * @param {Array} items - Array of objects to validate
     * @param {string} itemType - Type of items in the array
     */
    validateArrayItems(items, itemType) {
        if (!Array.isArray(items)) {
            this.addError(`${itemType} must be an array`);
            return;
        }

        items.forEach((item, index) => {
            this.validateItemStructure(item, itemType, `${itemType}[${index}]`);
        });
    }

    /**
     * Validate individual item structure against requirements
     * @param {Object} item - Item to validate
     * @param {string} itemType - Type of the item
     * @param {string} itemPath - Path for error reporting
     */
    validateItemStructure(item, itemType, itemPath) {
        if (typeof item !== 'object') {
            this.addError(`${itemPath} must be an object`);
            return;
        }

        const requirements = this.requiredFields[itemType];
        if (!requirements) {
            this.addError(`Unknown item type: ${itemType}`);
            return;
        }

        // Check required fields
        requirements.required.forEach(field => {
            if (!(field in item)) {
                this.addError(`${itemPath} missing required field: ${field}`);
            } else {
                this.validateFieldType(item[field], requirements.types[field], `${itemPath}.${field}`);
            }
        });

        // Check field types for all present fields
        Object.keys(item).forEach(field => {
            if (requirements.types[field]) {
                this.validateFieldType(item[field], requirements.types[field], `${itemPath}.${field}`);
            }
        });
    }

    /**
     * Validate field type matches requirements
     * @param {*} value - Value to validate
     * @param {string|Array} expectedType - Expected type(s)
     * @param {string} fieldPath - Field path for error reporting
     */
    validateFieldType(value, expectedType, fieldPath) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        
        if (Array.isArray(expectedType)) {
            // Multiple allowed types
            if (!expectedType.includes(actualType)) {
                this.addError(`${fieldPath} must be one of: ${expectedType.join(', ')}, got: ${actualType}`);
            }
        } else {
            // Single expected type
            if (actualType !== expectedType) {
                this.addError(`${fieldPath} must be ${expectedType}, got: ${actualType}`);
            }
        }

        // Additional validation for arrays
        if (expectedType === 'array' && Array.isArray(value)) {
            if (value.length === 0) {
                console.warn(`Warning: ${fieldPath} is an empty array`);
            }
        }
    }

    /**
     * Validate statistics data (standalone function for statistics.json)
     */
    validateStatistics(data) {
        // Implementation for statistics validation
        return this.getValidationResult();
    }

    /**
     * Validate companies data (standalone function for companies.json)
     */
    validateCompanies(data) {
        if (!data.companies || !Array.isArray(data.companies)) {
            this.addError('companies must be an array');
        } else {
            this.validateArrayItems(data.companies, 'companies');
        }
        return this.getValidationResult();
    }

    /**
     * Validate social media data (standalone function for social_media.json)
     */
    validateSocialMedia(data) {
        if (!data.platforms || !Array.isArray(data.platforms)) {
            this.addError('platforms must be an array');
        } else {
            this.validateArrayItems(data.platforms, 'socialMediaPlatforms');
        }
        return this.getValidationResult();
    }

    /**
     * Validate policies data (standalone function for policies.json)
     */
    validatePolicies(data) {
        if (!data.policies || !Array.isArray(data.policies)) {
            this.addError('policies must be an array');
        } else {
            this.validateArrayItems(data.policies, 'policies');
        }
        return this.getValidationResult();
    }

    /**
     * Validate infrastructure data (standalone function for infrastructure.json)
     */
    validateInfrastructure(data) {
        if (!data.infrastructure || !Array.isArray(data.infrastructure)) {
            this.addError('infrastructure must be an array');
        } else {
            this.validateArrayItems(data.infrastructure, 'infrastructure');
        }
        return this.getValidationResult();
    }

    /**
     * Add validation error to the errors array
     * @param {string} error - Error message
     */
    addError(error) {
        this.validationErrors.push(error);
    }

    /**
     * Return validation failure result
     * @param {string} message - Error message
     * @returns {Object} - Validation result
     */
    validationFailed(message) {
        return {
            success: false,
            errors: [message],
            data: null
        };
    }

    /**
     * Get final validation result
     * @returns {Object} - Validation result with success flag and errors
     */
    getValidationResult() {
        return {
            success: this.validationErrors.length === 0,
            errors: this.validationErrors,
            data: this.validationErrors.length === 0 ? 'Valid' : null
        };
    }

    /**
     * Utility function to validate JSON string before parsing
     * @param {string} jsonString - JSON string to validate
     * @returns {Object} - Parse result with success flag and data/error
     */
    static validateJSONString(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') {
            return {
                success: false,
                error: 'JSON string is empty or not a string',
                data: null
            };
        }

        try {
            const parsedData = JSON.parse(jsonString);
            return {
                success: true,
                error: null,
                data: parsedData
            };
        } catch (error) {
            return {
                success: false,
                error: `JSON parse error: ${error.message}`,
                data: null
            };
        }
    }

    /**
     * Quick validation for any JSON data before rendering
     * @param {Object} data - Data to validate
     * @param {string} source - Source identifier for error reporting
     * @returns {boolean} - True if data is valid for rendering
     */
    static quickValidate(data, source = 'unknown') {
        if (!data) {
            console.error(`Quick validation failed: ${source} - No data provided`);
            return false;
        }

        if (typeof data !== 'object') {
            console.error(`Quick validation failed: ${source} - Data is not an object`);
            return false;
        }

        return true;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JSONValidator;
} else {
    window.JSONValidator = JSONValidator;
}