$(document).ready(function () {
    'use strict';
    var dateFormat = "yy-mm-dd";

    /* Start - Function to save the form */
    document.submit = function () {
        save("complete");
    };

    document.saveDraft = function () {
        save("incomplete");
        return false;
    };

    var save = function (status) {
        var jsonData = JSON.stringify($('form').serializeForm());
        htmlDataStore.saveHTML(jsonData, status);
    };
    /* End - Function to save the form */

    /*Start- BarCode Functionality*/

    /* Called by the Activity WebViewActivity*/
    document.populateBarCode = function (jsonString) {
        $.each(jsonString, function (key, value) {
            var $inputField = $("input[name='" + key + "']");
            $inputField.val(value);
            $inputField.trigger('change');  //Need this to trigger the event so AMRS id gets populated.
        })
    };

    $('.barcode_btn').click(function () {
        barCodeComponent.startBarCodeIntent($(this).parent().find("input[type='text']").attr('name'));
    });

    /*End- BarCode Functionality*/

    /* Start - Initialize jQuery DatePicker */

    $('.datepicker').datepicker({
        dateFormat: dateFormat,
        changeMonth: true,
        changeYear: true
    });

    /* Start - Initialize jQuery DatePicker */

    /* Start - CheckDigit algorithm Source: https://wiki.openmrs.org/display/docs/Check+Digit+Algorithm */

    $.validator.addMethod("checkDigit", function (value, element) {
            var num = value.split('-');
            if (num.length != 2) {
                return false;
            }
            return $.fn.luhnCheckDigit(num[0]) == num[1];
        }, "Please enter digits that matches CheckDigit algorithm."
    );

    // attach 'checkDigit' class to perform validation.
    jQuery.validator.addClassRules({
        checkDigit: { checkDigit: true }
    });

    $.fn.luhnCheckDigit = function (number) {
        var validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVYWXZ_";
        number = number.toUpperCase().trim();
        var sum = 0;
        for (var i = 0; i < number.length; i++) {
            var ch = number.charAt(number.length - i - 1);
            if (validChars.indexOf(ch) < 0) {
                return false;
            }
            var digit = ch.charCodeAt(0) - 48;
            var weight;
            if (i % 2 == 0) {
                weight = (2 * digit) - parseInt(digit / 5) * 9;
            }
            else {
                weight = digit;
            }
            sum += weight;
        }
        sum = Math.abs(sum) + 10;
        return (10 - (sum % 10)) % 10;
    };

    /* End - CheckDigit Algorithm */

    // attach 'checkDigit' class to perform validation.
    jQuery.validator.addClassRules({
        checkDigit: { checkDigit: true }
    });

    /* Start - Checking that the current date is not in the future */

    $.validator.addMethod("nonFutureDate", function (value, element) {
            var enteredDate = new Date(value);
            var today = new Date();
            if(enteredDate > today){
                return false;
            }
            return true;
        }, "Please enter a date prior or equal to today."
    );

    // attach 'nonFutureDate' class to perform validation.
    jQuery.validator.addClassRules({
        nonFutureDate: { nonFutureDate: true }
    });

    /* End - nonFutureDate*/

    /* Start - Checking that the current date is in the future */

    $.validator.addMethod("checkFutureDate", function (value, element) {
            var enteredDate = new Date(value);
            var today = new Date();
            if(enteredDate <= today){
                return false;
            }
            return true;
        }, "Please enter a date in the future."
    );

    // attach 'checkFutureDate' class to perform validation.
    jQuery.validator.addClassRules({
        checkFutureDate: { checkFutureDate: true }
    });

    /* End - checkFutureDate*/

    /* Start - Checking that the entered value is a valid phone number */

    $.validator.addMethod("phoneNumber", function (value, element) {
            var inputLength = value.length;
            return inputLength >= 8 && inputLength <= 12;
        }, "Invalid Phone Number. Please check and re-enter."
    );

    // attach 'phoneNumber' class to perform validation.
    jQuery.validator.addClassRules({
        phoneNumber: { phoneNumber: true }
    });

    /* End - phoneNumber*/

    /* Start - Checking that if 'none' is selected for referrals, nothing else is selected */
    $('.checkNoneSelectedAlone').find('input[type="checkbox"]').change(function(){
        var valid = true;
        var $fieldset = $(this).parent();
        var totalSelected = $fieldset.find('input:checkbox:checked').length;
        $.each($fieldset.find('input:checkbox:checked'),function(i,cBoxElement){
            if($(cBoxElement).val() == 'none' && totalSelected >1){
                console.log("Error");
                valid = false;
            }
        });
        if (!valid) {
            $fieldset.find('.error').text("If 'None' is selected, no other options can be selected.");
        }
        else {
            $fieldset.find('.error').text("");
        }
    });

    /* End - checkNoneSelectedAlone*/

    $.fn.getTempBirthDate = function (years) {
        var currentYear = new Date().getFullYear();
        var estimatedDate = new Date(currentYear - parseInt(years), 0, 1);
        return $.datepicker.formatDate(dateFormat, estimatedDate);
    };

    /* Start - Used for Sub-Forms */

    $('.repeat')
        .append("<input class='btn btn-primary add_section pull-left' type='button' value='+'/>")
        .append("<input class='btn btn-primary remove_section pull-right' type='button' value='-'/><span class='clear'></span>");

    $(document.body).on('click', '.add_section', function () {
        $(this).parent().clone().insertAfter($(this).parent());
    });

    $(document.body).on('click', '.remove_section', function () {
        $(this).parent().remove();
    });

    /* End - Used for Sub-Forms */

    /* Start - Checks that a field is a decimal */

    $.validator.addClassRules({
        isDecimal: {
            number: true
        }
    });

    /* End - Checks that a field is a decimal */

    /* Start - JS to Prepopulate Data in the Form */

    var populateDataConcepts = function ($div, value) {
        $.each(value, function (k, v) {
            $div.find('[data-concept="' + k + '"]').val(v);
        });
    };

    var prePopulateData = $.trim($('#pre_populate_data').html());

    if (prePopulateData != '') {
        var prePopulateJSON = JSON.parse(prePopulateData);
        $.each(prePopulateJSON, function (key, value) {
            var $elementWithNameAttr = $('[name="' + key + '"]');
            if (value instanceof Object) {
                var $div = $('div[data-concept="' + key + '"]');
                if (value instanceof Array) {
                    $.each(value, function (i, elem) {
                        var $newDiv = $div.clone();
                        populateDataConcepts($newDiv, elem);
                        console.log($newDiv.html());
                        $div.after($newDiv);
                    });
                    $div.remove();
                } else {
                    populateDataConcepts($div, value);
                }
            }
            else if ($elementWithNameAttr.length > 0) {
                $elementWithNameAttr.val(value);
            } else {
                $('[data-concept="' + key + '"]').val(value);
            }
        });
    }

    /* End - JS to Prepopulate Data in the Form */

    /* Start - Code to Serialize form along with Data-Concepts */
    $.fn.serializeForm = function () {
        return $.extend({}, serializeNonConceptElements(this), serializeConcepts(this), (serializeNestedConcepts(this)));
    };

    var serializeNonConceptElements = function ($form) {
        var o = {};
        var $input_elements = $form.find('[name]:visible').not('[data-concept]');
        $.each($input_elements, function (i, element) {
            o = pushIntoArray(o, $(element).attr('name'), $(element).val());
        });
        return o;
    };

    var serializeNestedConcepts = function ($form) {
        var result = {};
        var parent_divs = $form.find('div[data-concept]');
        $.each(parent_divs, function (i, element) {
            var $visibleConcepts = $(element).find('*[data-concept]:visible');
            result = pushIntoArray(result, $(element).attr('data-concept'), jsonifyConcepts($visibleConcepts));
        });
        return result;
    };

    var serializeConcepts = function ($form) {
        var o = {};
        var allConcepts = $form.find('*[data-concept]');
        $.each(allConcepts, function (i, element) {
            if ($(element).closest('.section').attr('data-concept') == undefined) {
                $.extend(o, jsonifyConcepts($(element)));
            }
        });
        return o;
    };

    var jsonifyConcepts = function ($visibleConcepts) {
        var o = {};
        $.each($visibleConcepts, function (i, element) {
            o = pushIntoArray(o, $(element).attr('data-concept'), $(element).val());
        });
        return o;
    };

    var pushIntoArray = function (obj, key, value) {
        if (obj[key] !== undefined) {
            if (!obj[key].push) {
                obj[key] = [obj[key]];
            }
            obj[key].push(value || '');
        } else {
            obj[key] = value || '';
        }
        return obj;
    };

    /* End - Code to Serialize form along with Data-Concepts */


});