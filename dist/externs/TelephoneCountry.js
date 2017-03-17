/**
 * Telephone Country
 * @constructor
 */
var TelephoneCountry = function () {
    'use strict';

};

/**
 * Hyphen indices
 * @type {Array<number>}
 */
TelephoneCountry.prototype.sep = [];

/**
 * Country description
 * @type {string}
 */
TelephoneCountry.prototype.description = '';

/**
 * Country prefix
 * @type {string}
 */
TelephoneCountry.prototype.prefix = '';

/**
 * Validation pattern
 * @type {string}
 */
TelephoneCountry.prototype.pattern = '';

/**
 * Value length
 * @type {number}
 */
TelephoneCountry.prototype.length = 0;

/**
 * Phone number starts with
 * @type {Array<string>}
 */
TelephoneCountry.prototype.startsWith = [];
