# jQFV
Another **jQ**uery **F**orm **V**alidation plugin

## Usage

Include jQuery and the jQFV package 
```html
<script
        src="https://code.jquery.com/jquery-3.2.0.slim.min.js"
        integrity="sha256-qLAv0kBAihcHZLI3fv3WITKeRsUX27hd6upBBa0MSow="
        crossorigin="anonymous"></script>
<script src="../dist/jqfv.min.js"></script>
```

Reference CSS for formatting of your form elements. A sample CSS file is provided:
```html
    <link type="text/css" rel="stylesheet" href="../dist/jqfv.min.css">
```

Create your HTML form as normal. The only requirement is the element must be wrapped in a DIV:
```html
<form>
    <div class="form-field">
        <label for="myField">My Field</label>
        <input type="text" id="myField">
    </div>
</form>
```

Initialise the validator:
```javascript
    jqfv.initialise();
```

### Markup
You can specify some attributes on the form fields to instruct the validator:

#### Required

Add the _required_  attribute to any &lt;input&gt;, &lt;textarea&gt;, &lt;select&gt; to indicate it is a mandatory field.

Example:
```html
<input type="text" required> 
```

#### Input type
 
The validator will add default patterns/allowed characters for _tel_ and _number_ &lt;input&gt; elements restricting input to numbers.

On _email_ &lt;input&gt; elements, a valid email pattern will be added.

The standard _type_ attribute is used. 

Example:
```html
<input type="email"> 
```

#### Enforcing length

Specify the minimum number of characters required in the _minlength_ attribute for &lt;input&gt; and &lt;textarea&gt; elements.
Specify the maximum number of characters allowed in the _maxlength_ attribute for &lt;input&gt; and &lt;textarea&gt; elements.

Example:
```html
<input type="text" minlength="5" maxlength="10">
<textarea maxlength="150"></textarea>
```

#### Change all input to upper case

Specify the _data-upper="Y"_ attribute on &lt;input&gt; and &lt;textarea&gt; elements to force all input to uppercase. This uses the _toUpperCase()_ method.

Example:
```html
<input type="text" data-upper="Y"> 
```

#### Require specific input

Specify a regular expression in the _pattern_ attribute on &lt;input&gt; and &lt;textarea&gt; elements. The field will only be valid if the input matches the pattern.
Specify a character set in the _data-valid-chars_ attribute on &lt;input&gt; and &lt;textarea&gt; elements. The field will only allow input of those characters.

_tel_, _number_ and _email_ &lt;input&gt; elements will have default values set for _pattern_ and _data-valid-chars_, only if not specified, i.e. the validator will not overwrite the values you specify but will add them in if you do not specify these attributes.  

Example:
```html
<input type="text" pattern="^[A-Z]{3}[0-9]{0,2}$" data-allowed-chars="[A-Z0-9]"> 
```

#### Custom error/hint message

Specify a custom message to display on validation failure in the _data-hint_ attribute on &lt;input&gt; and &lt;textarea&gt; elements.

Example:
```html
<input type="text" data-upper="Y" pattern="^[A-Z]{3}[0-9]{0,2}$" data-allowed-chars="[A-Z0-9]" data-hint="Please enter three characters, optionally followed by two digits"> 
```

#### Restricting numeric range 

Specify a minimum value for a number field by specifying the _min_ attribute on &lt;input type="number"&gt; elements.
Specify a maximum value for a number field by specifying the _max_ attribute on &lt;input type="number"&gt; elements.
Specify the increment value for a number field by specifying the _step_ attribute on &lt;input type="number"&gt; elements. The field will only allow input of decimal values if the value for _step_ is a decimal.

Example:
```html
<input type="number" min="0" max="10" step="0.5">
<input type="number" min="0" max="10" step="1">
```

#### Country picker on telephone fields

A country picker can be added on &lt;nput type="tel"&gt; elements by specifying the _data-country-picker="1"_ attribute.
 
This option will create a new &lt;select&gt; element before the &lt;input&gt;, and a <div> after the &lt;input&gt; element. The &lt;select&gt; contains the countries to select from and will have an ID/name of _elementId-country_, where _elementId_ is the original ID of the element. The <div> displays the flag of the selected country based on a CSS class (_flag-ZA_ for South Africa).   
 
By default this will add options for the following countries:

* South Africa
* Swaziland
* Lesotho
* Botswana
* Zambia
* Namibia

To overwrite the options, change the options in _src/js/telephoneCountryList.js_ and rebuild.

Example:
```html
<input type="tel" data-country-picker="1"> 
```

#### Prevent masking on a telephone field

To prevent masking on a &lt;nput type="tel"&gt; element, specify the _data-nomask="1"_ attribute.

Example:
```html
<input type="tel" data-nomask="1">
```

#### Exempt a field from validation

By default all &lt;input&gt;, &lt;select&gt; and &lt;textarea&gt; elements are validated, whether contained in a form or not. To exempt a field from validation, specify the _jqfv-skip_ class on the element.

Example:
```html
<input type="tel" class="jqfv-skip"> 
```

### Advanced validation

Advanced validation can be set prior to initialising the validator:
```javascript
    jqfv.setOptions({
        'luhn': [
            'id'
        ]
    });
    jqfv.initialise();
```

To reset the options to defaults:
```javascript
    jqfv.resetOptions();
    jqfv.initialise();
```

#### Element value change required

By default the validator requires that the value of at least one field in the form is changed. To allow form submission without requiring a change in the form, set the _requireChange_ property.
 
```javascript
    jqfv.setOptions({
        'requireChange': false
    });
    jqfv.initialise();
```
 
#### Prevent display of error messages

By default the validator will add a &lt;span&gt; with class _jqfv-error_ to all elements with a _data-hint_ attribute. Visibility of this element is toggled based on the validity of the field.

To prevent the display of error messages, specify the _displayErrors_ property:

```javascript
    jqfv.setOptions({
        'displayErrors': false
    });
    jqfv.initialise();
``` 

#### Luhn validation

Perform a [Luhn](https://en.wikipedia.org/wiki/Luhn_algorithm) validation on a field, by specifying the field id in a string array.

Example:
```javascript
    jqfv.setOptions({
        'luhn': [
            'id'
        ]
    });
    jqfv.initialise();
```

#### Link fields together

Automatically enable an element, if the validation is succesful:

Example:
```html
<input type="text" id="field1" data-enable="field2">
<input type="text" id="field2" disabled> 
```

#### Custom validation

Custom validation can be added the following events:
- Value change
- Element focus
- Element blur

The options expects an object, with the id of the element as key and a function to execute.

Example:
```javascript
    function customValidation(element) {
    
    }

    jqfv.setOptions({
        'custom': {
            'id1': customValidation,
            'id2': function(element) {}
        },
        'blur': {
            'id3': customValidation
        },
        'focus': {
            'id4': function(element) {}
        }
    });
    jqfv.initialise();
```

The function receives a jQuery object for the element as parameter.

To mark the element as failing validation, mark the field as invalid in the DOM:
```javascript
    element.get(0).setCustomValidity('Field not valid');
```

#### Asynchronous validation

The validator can perform asynchronous validation server side using AJAX. 
 
This call will be made on the following conditions:

* Element blur
* No input for one second

Whilst the validator is waiting for a server response, the _jqfv-async_ class is added to the element.

Use the {VAL} placeholder in the URL to populate the value of the element in the service URL.

```javascript
    jqfv.setOptions({
        'async': {
            'field_id': {
                'url': 'https://my.server/validate/service/{VAL}'
            }
        }        
    });
    jqfv.initialise();
```

Values from other elements can also be included, by specifying the _params_ property. The IDs of other fields are specified in curly braces. After replacing placeholders, the value of the _params_ property is set to the _params_ parameter when submitting the AJAX request.
  
The additional fields should be specified in a semicolon delimited list in the _data-sup_ attribute of the input field.

```html
<input type="text" id="field_id" data-sup="another_field_id">
<input type="text" id="another_field_id"> 
```

```javascript
    jqfv.setOptions({
        'async': {
            'field_id': {
                'url': 'https://my.server/validate/service',
                'params': '{"another_value":"{another_field_id}","this_field":"{VAL}"}'
            }
        }        
    });
    jqfv.initialise();
```

The service should accept the parameters passed:
* Extract from the URL
* Extract from the _params_ parameter

The service should return a JSON response with a single _ok_ property with a boolean to indicate if the value is valid or not.
```json
{
   "ok": true
}
```

### API

The validator exposes some methods:

| Method | Description |
|--------|-------------|
| initialise() | Initialise the validator. |
| setOptions(ValidatorOptions options) | Set advanced validation options. Call before initialising the validator. |
| resetOptions() | Reset advanced validation options to default. Call before initialising the validator. |
| checkForm(String formId) | Validate all elements contained in the specified form. Form could be any HTML element, DIV, FORM, etc. |
| setErrorMessage(String elementId, String message) | Set the error message/hint for element. |
| toggleErrorDisplay(String elementId, boolean visible, [String message\]) | Set the visibility of the error for the specified element. If no message is supplied, the value of the _data-hint_ attribute is used. |  
