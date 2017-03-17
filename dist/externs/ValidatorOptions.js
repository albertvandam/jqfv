/**
 * Validator options
 * @constructor
 */
var ValidatorOptions = function () {
};

/**
 * Fields requiring backend validation
 * @type {Object}
 */
ValidatorOptions.prototype.async = null;

/**
 * Fields to perform a Luhn check on
 * @type {Array}
 */
ValidatorOptions.prototype.luhn = null;

/**
 * Custom validation routine
 * @type {Object}
 */
ValidatorOptions.prototype.custom = null;

/**
 * Custom blur events
 * @type {Object}
 */
ValidatorOptions.prototype.blur = null;

/**
 * Custom focus events
 * @type {Object}
 */
ValidatorOptions.prototype.focus = null;

/**
 * Flag to display errors
 * @type {boolean}
 */
ValidatorOptions.prototype.displayErrors = true;

/**
 * Flag to indicate if form must change to enable submit button
 * @type {boolean}
 */
ValidatorOptions.prototype.requireChange = true;
