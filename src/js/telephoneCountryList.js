/* exported telephoneCountryList */
/**
 * Telephone Country List
 * @type {TelephoneCountryList|Object}
 */
var telephoneCountryList = {
    "ZA" : {
        "description": "South Africa",
        "sep"        : [
            4,
            8
        ],
        "pattern"    : "^0[0-9]{2}-[0-9]{3}-[0-9]{4}$",
        "prefix"     : "+27",
        "length"     : 12,
        "startsWith" : "0"
    },
    "SWZ": {
        "description": "Swaziland",
        "sep"        : [
            5
        ],
        "pattern"    : "^[27][0-9]{3}-[0-9]{4}$",
        "prefix"     : "+268",
        "length"     : 9
    },
    "LSO": {
        "description": "Lesotho",
        "sep"        : [
            5
        ],
        "pattern"    : "^[0-9]{4}-[0-9]{4}$",
        "prefix"     : "+266",
        "length"     : 9
    },
    "BWA": {
        "description": "Botswana",
        "sep"        : [
            3
        ],
        "pattern"    : "^[0-9]{2,3}-[0-9]{5}$",
        "prefix"     : "+267",
        "length"     : 9
    },
    "ZMB": {
        "description": "Zambia",
        "sep"        : [
            4
        ],
        "pattern"    : "^[0-9]{3}-[0-9]{6}",
        "prefix"     : "+260",
        "length"     : 10
    },
    "NAM": {
        "description": "Namibia",
        "sep"        : [
            4,
            8
        ],
        "pattern"    : "^[0-9]{3}-[0-9]{3}-[0-9]{3}$",
        "prefix"     : "+264",
        "length"     : 11
    }
};