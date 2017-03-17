/* globals telephoneCountryList: false */
/**
 * Form validator
 * @constructor
 */
var Validator = function () {
    'use strict';

    /**
     * Reference back to "this"
     * @type {Validator}
     */
    var self = this;

    /**
     * Delay after user stopped typing to invoke async validation
     * @type {number}
     */
    var asyncNoTypeDelay = 1000;

    /**
     * Fields requiring backend validationGruntfile.js
     * @type {Object}
     */
    var asyncValidation = {};

    //noinspection JSMismatchedCollectionQueryUpdate
    /**
     * Fields to perform a Luhn check on
     * @type {Array}
     */
    var luhnValidation = [];

    /**
     * Initial form values to allow checking of form value changes
     * @type {Object}
     */
    var initialValues = {};

    /**
     * Custom validation routine
     * @type {Object}
     */
    var customValidation = {};

    /**
     * Custom blur events
     * @type {Object}
     */
    var customBlur = {};

    /**
     * Custom focus events
     * @type {Object}
     */
    var customFocus = {};

    /**
     * Flag to display errors
     * @type {boolean}
     */
    var displayErrors = true;

    /**
     * Backed up error messages
     * @type {Object}
     */
    var errorMessages = {};

    /**
     * Flag to indicate if form must change to enable submit button
     * @type {boolean}
     */
    var formChangeRequired = true;

    /**
     * Async timers
     * @type {Object}
     */
    var asyncTimers = {};

    /**
     * Mark empty fields
     */
    var markEmptyFields = function () {
        var cssSelector = [
            'input[value=""]:not(.jqfv-skip)',
            'input:not([value]):not(.jqfv-skip)',
            'textarea[value=""]:not(.jqfv-skip)',
            'textarea:not(.jqfv-skip):not([value])',
            'select[value=""]:not(.jqfv-skip)',
            'select:not(.jqfv-skip):not([value])'
        ];
        $(cssSelector.join(', ')).addClass('jqfv-empty');
    };

    /**
     * Adds an attribute to an element (if it does not exist already)
     * @param element Element
     * @param attribute Attribute
     * @param attributeValue Value
     */
    var addAttribute = function (element, attribute, attributeValue) {
        var currentAttributeValue = element.attr(attribute);
        currentAttributeValue = ('undefined' === typeof (currentAttributeValue)) ? false : currentAttributeValue;
        if (!currentAttributeValue) {
            element.attr(attribute, attributeValue);
        }
    };

    /**
     * Initialise validation for number fields
     */
    var initNumberFields = function () {
        $('input[type="number"]').each(function () {
            var element = $(this);

            var incStep = element.attr('step');
            incStep = 'undefined' === typeof(incStep) ? '1' : incStep;
            var asInt = parseInt(incStep, 10).toString();
            var floatValue = (asInt !== incStep);

            var pattern = floatValue ? '^[0-9]*(.[0-9]{1,2}){0,1}$' : '^[0-9]*$';
            var validChars = floatValue ? '0-9.' : '0-9';

            addAttribute(element, 'pattern', pattern);
            addAttribute(element, 'data-valid-chars', validChars);
        });
    };

    /**
     * Initialise validation for email fields
     */
    var initEmailFields = function () {
        $('input[type="email"]').each(function () {
            var element = $(this);
            addAttribute(element, 'pattern', '^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$');
            addAttribute(element, 'data-valid-chars', 'a-zA-Z0-9._%+-@');
        });
    };

    /**
     * Test telephone field
     * @param element Element to test
     * @param {string} value Element value
     * @returns {string}
     */
    var testTelField = function (element, value) {
        var formattedValue = value;
        var country = element.attr('data-country');
        country = 'undefined' === typeof(country) ? 'ZA' : country;

        // make sure number starts with the correct digit
        if (telephoneCountryList[country].hasOwnProperty('startsWith')) {
            var startsWith = telephoneCountryList[country].startsWith;
            if (0 !== startsWith.length && startsWith !== formattedValue.substr(0, 1) && 1 < formattedValue.length) {
                formattedValue = startsWith + formattedValue;
            }
        }

        var seperatorPositions = telephoneCountryList[country].sep;

        // check that a seperator is in the expected position
        if (0 !== seperatorPositions.length) {
            var lastHyphenIndex = seperatorPositions[seperatorPositions.length - 1];

            if (formattedValue.length < lastHyphenIndex && -1 !== seperatorPositions.indexOf(formattedValue.length)) {
                var checkDigit = formattedValue.length - 1;
                var lastDigit = formattedValue.substr(checkDigit, checkDigit);
                if ('-' !== lastDigit) {
                    formattedValue = formattedValue.substr(0, checkDigit) + '-' + lastDigit;
                    element.val(formattedValue);
                }
            }
        }

        // Add seperator if needed
        for (var i = 0; i < seperatorPositions.length; i++) {
            if (
                seperatorPositions[i] < formattedValue.length &&
                '-' !== formattedValue.substr(seperatorPositions[i] - 1, 1)
            ) {
                var beforeHyphen = formattedValue.substr(0, seperatorPositions[i] - 1);
                var afterHyphen = formattedValue.substr(seperatorPositions[i] - 1, formattedValue.length);

                formattedValue = beforeHyphen + '-' + afterHyphen;
                element.val(formattedValue);
            }
        }

        // Limit characters
        var maxValueLength = telephoneCountryList[country].length;
        if (formattedValue.length > maxValueLength) {
            formattedValue = formattedValue.substr(0, maxValueLength);
            element.val(formattedValue);
        }

        return formattedValue;
    };

    /**
     * Initialise validation for tel fields
     */
    var initTelFields = function () {
        $('input[type="tel"]').each(function () {
            var element = $(this);
            addAttribute(element, 'data-valid-chars', '0-9-');

            if ('undefined' === typeof(element.attr('data-nomask'))) {
                if ('undefined' === typeof(element.attr('data-country-picker'))) {
                    addAttribute(element, 'pattern', '^0[0-9]{2}-[0-9]{3}-[0-9]{4}$');
                    addAttribute(element, 'minlength', 12);
                    addAttribute(element, 'maxlength', 12);

                } else {
                    var currentCountry = element.attr('data-country');
                    if ('undefined' === typeof(currentCountry) || 0 === currentCountry.length) {
                        element.attr('data-country', 'ZA');

                        //noinspection ReuseOfLocalVariableJS
                        currentCountry = 'ZA';
                    } else {
                        currentCountry = currentCountry.toString();
                    }

                    var pattern = telephoneCountryList.hasOwnProperty(currentCountry) ?
                        telephoneCountryList[currentCountry].pattern : '^0[0-9]{2}-[0-9]{3}-[0-9]{4}$';
                    addAttribute(element, 'pattern', pattern);

                    var length = telephoneCountryList.hasOwnProperty(currentCountry) ?
                        telephoneCountryList[currentCountry].length : 12;
                    addAttribute(element, 'minlength', length);
                    addAttribute(element, 'maxlength', length);

                    element.addClass('phone-number');

                    var elementId = element.attr('id');

                    //noinspection JSJQueryEfficiency
                    var ctryPicker = $('#' + elementId + '-country');
                    if (0 === ctryPicker.length) {
                        var select = '<select name="' + elementId + '-country" id="' + elementId + '-country" ';
                        select += 'data-for="' + elementId + '" ';
                        select += 'class="phone-country-picker" required>';
                        select += '<\/select>';
                        element.before(select);

                        var flag = '<div id="' + elementId + '-flag" class="phone-flag flag flag-' + currentCountry + '"><\/div>';
                        flag += '<span class="clearfix"><\/span>';
                        element.after(flag);

                        //noinspection JSJQueryEfficiency
                        var countryPicker = $('#' + elementId + '-country');
                        for (var iso in telephoneCountryList) {
                            if (telephoneCountryList.hasOwnProperty(iso)) {
                                var option = '<option value="' + iso + '"' + (currentCountry === iso ? ' selected' : '') + '>';
                                option += telephoneCountryList[iso].prefix;
                                option += '<\/option>';
                                countryPicker.append(option);
                            }
                        }
                    } else {
                        var flagElement = $('#' + elementId + '-flag');
                        for (var country in telephoneCountryList) {
                            if (telephoneCountryList.hasOwnProperty(country)) {
                                if (country === currentCountry) {
                                    flagElement.addClass('flag-' + country);
                                } else {
                                    flagElement.removeClass('flag-' + country);
                                }
                            }
                        }

                        $('#' + elementId + '-country').val(currentCountry);
                    }

                    customValidation[elementId + '-country'] = function (picker) {
                        var countryCode = picker.val();
                        var telFieldId = picker.attr('data-for');

                        var telField = $('#' + telFieldId);
                        if (telephoneCountryList.hasOwnProperty(countryCode)) {
                            telField.attr('pattern', telephoneCountryList[countryCode].pattern);
                            telField.attr('data-country', countryCode);
                            telField.attr('minlength', telephoneCountryList[countryCode].length);
                            telField.attr('maxlength', telephoneCountryList[countryCode].length);

                            var telFieldVal = telField.val();
                            telFieldVal = telFieldVal.replace(/-/g, '');
                            testTelField(telField, telFieldVal);
                        }

                        var flagIndicator = $('#' + telFieldId + '-flag');
                        for (var thisCountry in telephoneCountryList) {
                            if (telephoneCountryList.hasOwnProperty(thisCountry)) {
                                if (thisCountry === countryCode) {
                                    flagIndicator.addClass('flag-' + thisCountry);
                                } else {
                                    flagIndicator.removeClass('flag-' + thisCountry);
                                }
                            }
                        }
                    };
                }
            }
        });
    };

    /**
     * Validate element value length
     * @param element Element
     */
    var checkValueLength = function (element) {
        // minimum length
        var minLength = element.attr('minlength');
        minLength = ('undefined' === typeof(minLength)) ? 0 : minLength;

        // maximum length
        var maxLength = element.attr('maxlength');
        maxLength = ('undefined' === typeof(maxLength)) ? 0 : maxLength;

        // required field
        var required = element.attr('required');
        required = ('undefined' !== typeof(required));

        // value
        var value = element.val();
        value = ('undefined' === typeof (value)) ? '' : $.trim(value);
        var valLength = value.length;

        // allow 0 length if field is not required
        if (0 === valLength && !required) {
            minLength = 0;
        }

        // test minimum length - if set
        if (0 !== minLength) {
            if (valLength < minLength) {
                element.get(0).setCustomValidity("Minimum length");
            }
        }

        // limit to maximum length - if set
        if (0 !== maxLength) {
            if (maxLength < valLength) {
                element.val(value.slice(0, maxLength));
            }
        }
    };

    /**
     * Toggle form submit button
     * @param parentForm Form which contains the submit button
     * @param enabled Button enabled (true) or disabled (true)
     */
    var toggleSubmitButton = function (parentForm, enabled) {
        var submitButton = parentForm.find('button');

        if (enabled) {
            submitButton.removeAttr('disabled');
        } else {
            submitButton.attr('disabled', 'disabled');
        }
    };

    /**
     * Sets error message to display
     * @param elementId Field ID
     * @param message Message to display
     */
    this.setErrorMessage = function (elementId, message) {
        // reference to error display
        $('.jqfv-error[data-for="' + elementId + '"]').html(message);
    };

    /**
     * Creates a copy of the original error message for restoration later on
     * @param elementId
     */
    var backupErrorMessage = function (elementId) {
        if (!errorMessages.hasOwnProperty(elementId)) {
            errorMessages[elementId] = $('.jqfv-error[data-for="' + elementId + '"]').text();
        }
    };

    /**
     * Restores the original error message
     * @param elementId
     */
    var restoreErrorMessage = function (elementId) {
        if (errorMessages.hasOwnProperty(elementId)) {
            self.setErrorMessage(elementId, errorMessages[elementId]);
        }
    };

    /**
     * Toggle field error display
     * @param {string} elementId Field ID
     * @param {boolean} visible Visible (true) or hidden (false)
     * @param {string=} message Message to display
     */
    this.toggleErrorDisplay = function (elementId, visible, message) {
        if (displayErrors) {
            var element = $('#' + elementId);

            // reference to error display
            //noinspection JSJQueryEfficiency
            var errorElement = $('.jqfv-error[data-for="' + elementId + '"]');

            if (0 === errorElement.length) {
                element.after('<span class="jqfv-error" data-for="' + elementId + '"></span>');
                errorElement = $('.jqfv-error[data-for="' + elementId + '"]');
            }

            if (0 !== errorElement.length) {
                if ('undefined' !== typeof(message)) {
                    errorElement.html(message);

                } else if (0 === errorElement.html().trim().length) {
                    var elementHint = element.attr('data-hint');
                    if ('undefined' !== typeof(elementHint)) {
                        errorElement.html(elementHint.toString());
                    }
                }

                if (visible && !errorElement.is(':visible')) {
                    errorElement.fadeIn(600);
                } else if (!visible && errorElement.is(':visible')) {
                    errorElement.fadeOut(600);
                }
            }
        }
    };

    /**
     * Performs a Luhn check on the value of an element
     * @param element Element
     */
    var doLuhnCheck = function (element) {
        var value = element.val().trim();

        var checkDigit = value.length - 1;
        var controlDigit = value.substr(checkDigit, checkDigit);

        var controlNumber = 0;
        var evenCheck = '';
        for (var i = 0; checkDigit > i; i += 2) {
            controlNumber += parseInt(value.substring(i, i + 1), 10);
            evenCheck += value.substring(i + 1, i + 2);
        }
        evenCheck = (parseInt(evenCheck, 10) * 2).toString();
        var evenCheckLength = evenCheck.length;
        for (var j = 0; j < evenCheckLength; j++) {
            controlNumber += parseInt(evenCheck.substring(j, j + 1), 10);
        }
        controlNumber = controlNumber.toString();

        controlNumber = 10 - parseInt(controlNumber.substring(controlNumber.length - 1, controlNumber.length), 10);
        controlNumber = controlNumber.toString();
        if ('10' === controlNumber) {
            controlNumber = '0';
        }

        var luhnCheckPassed = (controlNumber === controlDigit);

        if (!luhnCheckPassed) {
            element.get(0).setCustomValidity('Luhn check failed');
        }
    };

    /**
     * Add validation when entering a field
     * @param inputFields Input fields where validation should be added to
     */
    var initFocusValidation = function (inputFields) {
        inputFields.on('focus', function () {
            var element = $(this);
            var elementId = element.attr('id').toString();

            var mustShowError = element.attr('data-error-on-focus');
            if ('undefined' !== typeof(mustShowError)) {
                self.toggleErrorDisplay(elementId, true);
            }

            if (customFocus.hasOwnProperty(elementId)) {
                customFocus[elementId](element);
            }
        });
    };

    /**
     * Toggle form button status
     * @param form Form to toggle buttons on
     */
    var toggleFormButtons = function (form) {
        var formHasNoErrors = (0 === form.find('input:invalid, textarea:invalid, select:invalid').length);
        var formHasChangedFields = (0 !== form.find('.jqfv-changed').length);
        var formNotWaitingForAsync = (0 === form.find('.jqfv-async').length);

        if (formHasChangedFields && formNotWaitingForAsync && formHasNoErrors) {
            // no fields in invalid state
            toggleSubmitButton(form, true);
        } else {
            // 1 or more fields in invalid state
            toggleSubmitButton(form, false);
        }
    };

    /**
     * Perform async check
     * @param {string} elementId
     * @param {boolean} noErrorOnEmpty Do not display error on empty
     * @param {jQuery=} inputObject
     * @param {string=} inputValue
     */
    var doAsyncCheck = function (elementId, noErrorOnEmpty, inputObject, inputValue) {
        // backend check required

        var element = 'undefined' === typeof (inputObject) ? $('#' + elementId) : inputObject;
        var value = 'undefined' === typeof(inputValue) ? element.val().toString() : inputValue;

        if (0 === $.trim(value).length) {
            return;
        }

        // restore original error message
        restoreErrorMessage(elementId);

        // perform backend validation
        var backendUrl = asyncValidation[elementId].url;

        /*jshint -W069 */
        var params = asyncValidation[elementId].hasOwnProperty('params') ?
            asyncValidation[elementId]['params'] : '';
        /*jshint +W069 */

        params = params.replace('{VAL}', value);
        backendUrl = backendUrl.replace('{VAL}', value);

        var hasEmpty = false;

        var supField = element.attr('data-sup');
        if ('undefined' !== typeof(supField)) {
            var supFields = supField.split(';');
            for (var i = 0; i < supFields.length; i++) {
                var field = supFields[i];
                var supValue = $('#' + field).val().trim();

                if (0 === supValue.length) {
                    hasEmpty = true;
                }

                backendUrl = backendUrl.replace('{' + field + '}', supValue);
                params = params.replace('{' + field + '}', supValue);
            }
        }

        /*jshint -W069 */
        if (!(
                asyncValidation[elementId].hasOwnProperty('empty') && !asyncValidation[elementId]['empty'] &&
                hasEmpty
            )) {
            /*jshint +W069 */

            $.ajax({
                'url'     : backendUrl,
                'data'    : {
                    'params': params
                },
                'success' : function (data) {
                    element.removeClass('jqfv-async');

                    if (data.ok) {
                        element.get(0).setCustomValidity('');

                        // hide error
                        self.toggleErrorDisplay(elementId, false);

                        var supplementalField = element.attr('data-sup');
                        if ('undefined' !== typeof(supField)) {
                            var supplementalFields = supplementalField.split(';');

                            for (var j = 0; j < supplementalFields.length; j++) {
                                var supFieldId = supFields[j];
                                var supElement = $('#' + supFieldId);

                                supElement.removeClass('jqfv-async');
                                supElement.get(0).setCustomValidity('');
                            }
                        }

                    } else {
                        var displayError = (!(noErrorOnEmpty && element.hasClass('jqfv-empty')));

                        if (displayError) {
                            element.get(0).setCustomValidity(data.message);

                            backupErrorMessage(elementId);
                            self.setErrorMessage(elementId, data.message);

                            // show error
                            self.toggleErrorDisplay(elementId, true);
                        }
                    }

                    toggleFormButtons(element.closest('form'));
                }
            });
        }
    };

    /**
     * Perform validation when field looses focus
     * @param {jQuery} element Element to check
     * @param {boolean} mustToggleFormButtons Whether form buttons should be disabled/enabled
     * @param {boolean} noErrorOnEmpty Do not display error on empty
     */
    var blurValidation = function (element, mustToggleFormButtons, noErrorOnEmpty) {
        // get value
        var value = element.val().toString();

        // element id
        var elementId = element.attr('id').toString();

        // check if element is enabled
        var elementEnabled = ("undefined" === typeof(element.attr('disabled')));

        if (customValidation.hasOwnProperty(elementId)) {
            customValidation[elementId](element);
        }

        // element must have a value and must be enabled to perform background check
        if (
            elementEnabled &&
            element.get(0).validity.valid &&
            null !== value &&
            0 !== value.length
        ) {
            if (asyncValidation.hasOwnProperty(elementId)) {
                doAsyncCheck(elementId, noErrorOnEmpty, element, value);
            }
        }

        if (customBlur.hasOwnProperty(elementId)) {
            customBlur[elementId](element);
        }

        if (mustToggleFormButtons) {
            toggleFormButtons(element.closest('form'));
        }
    };

    /**
     * Add validation when leaving a field
     * @param inputFields Input fields where validation should be added to
     */
    var initBlurValidation = function (inputFields) {
        inputFields.on('blur', function () {
            blurValidation($(this), true, false);
        });
    };

    /**
     * Enable/Disable linked fields with cascading
     * @param element Element to enable/disable
     * @param enabled Enable(true) / Disable(false) field
     */
    var toggleLinkedField = function (element, enabled) {
        // get linked field id
        var linkedFieldId = element.attr('data-enable');
        if ('undefined' !== typeof (linkedFieldId)) {
            // get element
            var linkedField = $('#' + linkedFieldId);

            var cascade = true;
            if (enabled) {
                // enable element
                linkedField.removeAttr('disabled');

                // only cascade if linked field is valid
                cascade = (linkedField.get(0).validity.valid);
            } else {
                // disable element
                linkedField.attr('disabled', 'disabled');
            }

            // cascade to linked fields
            if (cascade) {
                toggleLinkedField(linkedField, enabled);
            }
        }
    };

    /**
     * Check if element value changes
     * @param element Element to check
     * @param {string} elementId Element ID
     * @param {string} value Value to check
     */
    var checkValueChanged = function (element, elementId, value) {
        if (initialValues.hasOwnProperty(elementId)) {
            var valueHasChanged = (value !== initialValues[elementId]);
            if (valueHasChanged) {
                if (!element.hasClass('jqfv-changed')) {
                    element.addClass('jqfv-changed');
                }
            } else {
                if (element.hasClass('jqfv-changed')) {
                    element.removeClass('jqfv-changed');
                }
            }
        } else if (!element.hasClass('jqfv-changed')) {
            element.addClass('jqfv-changed');
        }
    };

    /**
     * Filter field value
     * @param element Element to check
     * @param {string} value Value to filter
     */
    var filterFieldValue = function (element, value) {
        var filteredValue = value;

        var validCharacters = element.attr('data-valid-chars');
        if ('undefined' !== typeof (validCharacters)) {
            var regularExpression = new RegExp('[' + validCharacters + ']*', 'g');
            var cleanValue = filteredValue.match(regularExpression);
            cleanValue = (null === cleanValue) ? '' : cleanValue.join('');

            // only replace filtered value if characters were removed
            if (filteredValue !== cleanValue) {
                filteredValue = cleanValue;
                element.val(filteredValue);
            }

            // replace empty values on numeric fields to remove the "e"
            if ('number' === element.attr('type') && 0 === filteredValue.length) {
                element.val('');
            }
        }

        return filteredValue;
    };

    /**
     * Test if element value is empty
     * @param element Element to check
     * @param value Element value
     */
    var testIfEmpty = function (element, value) {
        var trimmedValue = $.trim(value);
        if (0 !== trimmedValue.length) {
            element.removeClass("jqfv-empty");
        }

        return trimmedValue;
    };

    /**
     * Finalise field validation
     * @param {jQuery} element  Element to validate
     * @param {string} elementId Element ID
     * @param {string} value Element value
     * @param {boolean} noErrorOnEmpty Do not display error on empty
     */
    var finaliseValidation = function (element, elementId, value, noErrorOnEmpty) {
        // clear existing custom errors
        element.get(0).setCustomValidity('');

        // only check if value contains something
        if (0 !== value.length) {
            // check field length
            checkValueLength(element);

            if (-1 !== luhnValidation.indexOf(elementId)) {
                doLuhnCheck(element);
            }
        }

        if ('tel' === element.attr('type') && 'undefined' === typeof(element.attr('data-nomask'))) {
            var testVal = value.replace(/[0-]/g, '');

            if (0 === testVal.length || '00' === value.substr(0, 2)) {
                element.get(0).setCustomValidity('Phone number cannot be 000-000-0000');
            }
        }

        if (customValidation.hasOwnProperty(elementId)) {
            customValidation[elementId](element);
        }

        // check if field is valid
        if (element.get(0).validity.valid) {
            // hide error
            self.toggleErrorDisplay(elementId, false);

            toggleLinkedField(element, true);

            if (
                'tel' === element.attr('type') &&
                'undefined' === typeof(element.attr('data-nomask')) &&
                'undefined' !== typeof(element.attr('data-country-picker'))
            ) {
                $('#' + elementId + '-country').removeClass('jqfv-tel-incorrect');
            }

        } else {
            var displayError = (!(noErrorOnEmpty && element.hasClass('jqfv-empty')));

            // show error
            if (displayError) {
                self.toggleErrorDisplay(elementId, true);

                toggleLinkedField(element, false);
            }

            if (
                'tel' === element.attr('type') &&
                'undefined' === typeof(element.attr('data-nomask')) &&
                'undefined' !== typeof(element.attr('data-country-picker'))
            ) {
                $('#' + elementId + '-country').addClass('jqfv-tel-incorrect');
            }
        }
    };

    /**
     * Perform async validation
     *
     * @param {string} elementId
     */
    var doAsync = function (elementId) {
        window.clearTimeout(asyncTimers[elementId]);

        doAsyncCheck(elementId, false);
    };

    /**
     * Schedule Async Check
     * @param {string} elementId
     */
    var scheduleAsync = function (elementId) {
        if (asyncTimers.hasOwnProperty(elementId)) {
            window.clearTimeout(asyncTimers[elementId]);
        }

        asyncTimers[elementId] = window.setTimeout(function () {
            doAsync(elementId);
        }, asyncNoTypeDelay);
    };

    /**
     * Validate an element
     * @param {jQuery} element Element to validate
     * @param {boolean} mustToggleFormButtons Whether to toggle the form buttons
     * @param {boolean} noErrorOnEmpty Do not display error on empty
     */
    var validateElement = function (element, mustToggleFormButtons, noErrorOnEmpty) {
        // element id
        var elementId = element.attr('id').toString();

        // get value
        var value = element.val().toString();

        var toUpper = element.attr('data-upper');
        toUpper = 'undefined' === typeof (toUpper) ? false : 'Y' === toUpper;

        if (toUpper) {
            value = value.toUpperCase();
            element.val(value);
        }

        // overwrite value if checkbox and not checked
        if ('checkbox' === element.attr('type') && !element.prop('checked')) {
            value = '';
        }

        // check if value changed
        checkValueChanged(element, elementId, value);

        // remove characters which are not allowed (according to provided characters)
        filterFieldValue(element, value);

        // test if field is empty
        value = testIfEmpty(element, value);

        // check formatting on telephone fields
        if ('tel' === element.attr('type') && 'undefined' === typeof(element.attr('data-nomask'))) {
            value = testTelField(element, value);
        }

        // field can be validated
        if (element.get(0).willValidate) {
            finaliseValidation(element, elementId, value, noErrorOnEmpty);
        }

        // check if element is enabled
        var elementEnabled = ('undefined' === typeof(element.attr('disabled')));

        // check if backend validation is required - only if element is enabled
        if (elementEnabled && asyncValidation[elementId]) {
            scheduleAsync(elementId);

            // prevent validation until backend check comes back
            element.get(0).setCustomValidity('Backend validation busy');
            if (!element.hasClass('jqfv-async')) {
                element.addClass('jqfv-async');
            }
        }

        // enable button on form
        if (mustToggleFormButtons) {
            toggleFormButtons(element.closest('form'));
        }
    };

    var initSelectValidation = function (inputFields) {
        inputFields.on('click change', function () {
            // reference to element
            var element = $(this);

            validateElement(element, true, false);
        });
    };

    /**
     * Initialise input field validation
     * @param inputFields Fields where validation should be added on
     */
    var initInputValidation = function (inputFields) {
        inputFields.on('keyup input paste click', function () {
            // reference to element
            var element = $(this);

            validateElement(element, true, false);
        });
    };

    /**
     * Remember initial values to allow for checking if values changed
     * @param inputFields
     */
    var rememberInitialValues = function (inputFields) {
        initialValues = {};
        inputFields.each(function () {
            if (formChangeRequired) {
                var element = $(this);
                var parentForm = element.closest('form');
                if (0 !== parentForm.length) {
                    var requireValidation = true;
                    var requireValidationAttribute = parentForm.attr('data-must-change');
                    if ('undefined' !== typeof(requireValidationAttribute) && 'no' === requireValidationAttribute) {
                        requireValidation = false;
                    }

                    if (requireValidation) {
                        var elementId = element.attr('id');
                        var elementValue = element.val();
                        if ('checkbox' === element.attr('type') && !element.prop('checked')) {
                            elementValue = '';
                        }
                        initialValues[elementId] = elementValue;
                    }
                }
            }
        });
    };

    /**
     * Initialise field level validation
     */
    var initFieldValidation = function () {
        // do something when data is entered to field
        var inputFields = $('input:not(.jqfv-skip), textarea:not(.jqfv-skip), select:not(.jqfv-skip)');
        inputFields.off('keyup input paste blur focus click change');

        // validation on blur (for backend validation)
        initBlurValidation(inputFields);

        // validation on focus
        initFocusValidation(inputFields);

        // remember field values for checking if values changes
        rememberInitialValues(inputFields);

        // validation on field input/change
        initInputValidation(inputFields);

        // validation on select change
        initSelectValidation($('select:not(.jqfv-skip)'));
    };

    var initKeyRestrict = function () {
        var inputFields = $('input, textarea');
        inputFields.each(function () {
            var element = $(this);

            var validChars = element.attr('data-valid-chars');
            if ('undefined' === typeof (validChars)) {
                var pattern = element.attr('pattern');

                if ('undefined' !== typeof(pattern)) {
                    var start = pattern.indexOf('[');
                    if (-1 !== start) {
                        pattern = pattern.substr(start, pattern.length);

                        var end = pattern.indexOf(']');
                        pattern = pattern.substr(0, end + 1);
                    }

                    addAttribute(element, 'data-valid-chars', pattern);
                }
            }
        });
    };

    /**
     * Initialise validator
     */
    this.initialise = function () {
        // initialise validation
        markEmptyFields();
        initNumberFields();
        initEmailFields();
        initTelFields();
        initKeyRestrict();
        initFieldValidation();
    };

    /**
     * Validate a form
     *
     * @param {string} formId ID of form to validate
     * @param {boolean=} dontDisplayErrorOnEmpty Do not display error on empty field
     */
    this.checkForm = function (formId, dontDisplayErrorOnEmpty) {
        var noErrorOnEmpty = ('boolean' === typeof(dontDisplayErrorOnEmpty)) ? dontDisplayErrorOnEmpty : false;

        var form = $('#' + formId);

        if (0 !== form.length) {
            var formElements = form.get(0);
            var formElementsLength = formElements.length;
            for (var i = 0; i < formElementsLength; i++) {
                validateElement($(formElements[i]), false, noErrorOnEmpty);
                blurValidation($(formElements[i]), false, noErrorOnEmpty);
            }

            toggleFormButtons(form);
        }
    };

    /**
     * Reset options to defaults
     */
    this.resetOptions = function () {
        // initialise settings
        formChangeRequired = true;
        asyncValidation = {};
        luhnValidation = [];
        //noinspection ReuseOfLocalVariableJS
        initialValues = {};
        customValidation = {};
        //noinspection ReuseOfLocalVariableJS
        errorMessages = {};
    };

    /**
     * Set validator options
     * @param {ValidatorOptions|Object} options
     */
    this.setOptions = function (options) {
        self.resetOptions();

        // set options
        if (options) {
            if (options.hasOwnProperty('async') && null !== options.async) {
                //noinspection ReuseOfLocalVariableJS
                asyncValidation = options.async;
            }
            if (options.hasOwnProperty('luhn') && null !== options.luhn) {
                //noinspection ReuseOfLocalVariableJS
                luhnValidation = options.luhn;
            }
            if (options.hasOwnProperty('custom') && null !== options.custom) {
                //noinspection ReuseOfLocalVariableJS
                customValidation = options.custom;
            }
            if (options.hasOwnProperty('blur') && null !== options.blur) {
                //noinspection ReuseOfLocalVariableJS
                customBlur = options.blur;
            }
            if (options.hasOwnProperty('focus') && null !== options.focus) {
                //noinspection ReuseOfLocalVariableJS
                customFocus = options.focus;
            }
            if (options.hasOwnProperty('displayErrors') && null !== options.displayErrors) {
                //noinspection ReuseOfLocalVariableJS
                displayErrors = options.displayErrors;
            }
            if (options.hasOwnProperty('requireChange') && null !== options.requireChange) {
                //noinspection ReuseOfLocalVariableJS
                formChangeRequired = (true === options.requireChange);
            }
        }
    };

    /*jshint -W069 */
    // references for external modules
    this['initialise'] = self.initialise;
    this['setOptions'] = self.setOptions;
    this['resetOptions'] = self.resetOptions;
    this['checkForm'] = self.checkForm;
    this['setErrorMessage'] = self.setErrorMessage;
    this['toggleErrorDisplay'] = self.toggleErrorDisplay;
    /*jshint +W069 */
};

/*jshint -W069 */
window['jqfv'] = new Validator();
/*jshint +W069 */
