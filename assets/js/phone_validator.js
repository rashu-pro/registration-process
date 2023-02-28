/**
 * Created by rashu on 9/26/2022.
 */

const phoneNumberSelectors = document.querySelectorAll('.phone-number-validator');
const phoneNumberWrapperSelectorName = '.phone-number-validator-wrapper';
const alertMessageSelectorName = ".error-message";
const userIpCookieName = "userCountry";

//=== intl-tel-input plugin must be included before calling 'phoneNumberValidatior' function
if(phoneNumberSelectors.length>0){
    phoneNumberValidator(phoneNumberSelectors, phoneNumberWrapperSelectorName, alertMessageSelectorName);
    //=== loading utils.js script and then giving country list div a custom width
    window.intlTelInputGlobals.loadUtils("node_modules/intl-tel-input/build/js/utils.js").then(function () {
        console.log('utils.js loaded!');
    });
}

/**
 *
 * @param phoneNumberSelectors
 * @param phoneNumberWrapperSelectorName
 * @param alertMessageSelectorName
 *
 * @effects validate internation phone number
 */
function phoneNumberValidator(phoneNumberSelectors, phoneNumberWrapperSelectorName, alertMessageSelectorName){

    phoneNumberSelectors.forEach(phoneNumber=>{
         if(phoneNumber.closest('.iti')) return;

        const hiddenField = phoneNumber.closest(phoneNumberWrapperSelectorName).querySelector('input[type=hidden]');
        let iti = window.intlTelInput(phoneNumber, {
            allowDropdown: true,
            initialCountry: "auto",
          customPlaceholder: function (selectedCountryPlaceholder, selectedCountryData) {
            return phoneNumber.getAttribute('placeholder')?phoneNumber.getAttribute('placeholder'):'';
          },
            geoIpLookup: function(success, failure) {
                let countryCode = 'US';
                if(getCookie(userIpCookieName)){
                    success(getCookie(userIpCookieName));
                }else{
                    $.get("https://ipinfo.io?token=bca72e9d426331", function() {}, "jsonp").always(function(resp) {
                        countryCode = (resp && resp.country) ? resp.country : "us";
                        success(countryCode);
                        setCookie(userIpCookieName, countryCode, 10);
                    });
                }
            },
            //utilsScript: "assets/plugins/intl-tel-input/js/utils.js",
            //onlyCountries: ["us", "cs", "pk", "bd", "in", "uk"]
            preferredCountries: ["us", "cs", "pk", "bd", "in", "uk"],
            separateDialCode: true,
        });



        if(phoneNumber.classList.contains('phone-number-edit')){
            setNumber(iti, phoneNumber.getAttribute('data-number'));
        }

        phoneNumber.addEventListener('keyup',()=>{
            errorHandling(iti, phoneNumber, phoneNumberWrapperSelectorName, alertMessageSelectorName, hiddenField);
        });

        phoneNumber.addEventListener('blur',()=>{
            errorHandling(iti, phoneNumber, phoneNumberWrapperSelectorName, alertMessageSelectorName, hiddenField);
        });
    });

    let itiSelectedFlag = document.querySelectorAll('.iti__selected-flag');
    itiSelectedFlag.forEach(selectedFlag=>{
        selectedFlag.addEventListener('click', function () {
            this.closest('.iti').querySelector('.iti__country-list').style.maxWidth = this.closest('.iti').clientWidth+"px";
        });
    });
}

/**
 *
 * @param iti (instance of intl-tel-input)
 * @param number
 *
 * @effects pre-set the number for input field
 */
function setNumber(iti, number) {
    iti.setNumber(number);
}

/**
 *
 * @param iti
 * @param phoneNumber
 * @param phoneNumberWrapperSelectorName
 * @param alertMessageSelectorName
 * @param hiddenField
 *
 * @effects show/hide error message
 */
function errorHandling(iti, phoneNumber, phoneNumberWrapperSelectorName, alertMessageSelectorName, hiddenField) {
    let alertClass = '',
        isvalidClass = '',
        isFormGroupValid = '',
        statusMessage = '',
        showErrorMessage = 0;

    let number = iti.getNumber(),
        isValid = iti.isValidNumber(),
        error = iti.getValidationError();

    if(!isValid && error === intlTelInputUtils.validationError.TOO_SHORT){
        showErrorMessage = 1;
        statusMessage = "Number is too short!";
        alertClass = 'text-danger';
        if(phoneNumber.closest('.form-group.required-group')) isvalidClass = 'invalid';
    }

    if(!isValid && error === intlTelInputUtils.validationError.TOO_LONG){
        showErrorMessage = 1;
        statusMessage = "Number is too long!";
        alertClass = 'text-danger';
        if(phoneNumber.closest('.form-group.required-group')) isvalidClass = 'invalid';
    }

    if(!isValid && error === intlTelInputUtils.validationError.IS_POSSIBLE){
        showErrorMessage = 1;
        statusMessage = "Invalid number!";
        alertClass = 'text-danger';
        if(phoneNumber.closest('.form-group.required-group')) isvalidClass = 'invalid';
    }

    if(isValid && error === intlTelInputUtils.validationError.IS_POSSIBLE){
        showErrorMessage = 1;
        // statusMessage = "Number is valid!";
        alertClass = 'text-success';
        isvalidClass = 'valid';
        if(phoneNumber.closest('.form-group.required-group')) isFormGroupValid = 'field-validated';
    }

    if(phoneNumber.closest(phoneNumberWrapperSelectorName).querySelector(alertMessageSelectorName)){
        phoneNumber.closest(phoneNumberWrapperSelectorName).querySelector(alertMessageSelectorName).remove();
    }

    if(showErrorMessage){
        let alertTag = document.createElement('p');
        let classToadd = [alertClass, 'error-message'];
        let classToRemove = ['valid', 'invalid', 'empty-field'];
        alertTag.classList.add(...classToadd);
        phoneNumber.classList.remove(...classToRemove);
        alertTag.append(statusMessage);
        if(isFormGroupValid!==''){
          phoneNumber.classList.add(isvalidClass);
        }

        if(isFormGroupValid!=='') phoneNumber.parentElement.parentElement.classList.add(isFormGroupValid);
        phoneNumber.closest(phoneNumberWrapperSelectorName).append(alertTag);
    }

    hiddenField.value = number;
}

/**
 *
 * @param cname
 * @param cvalue
 * @param exdays
 *
 * @effect does set a cookie in the browser
 */
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 *
 * @param cname
 * @return {cookieValue}
 *
 * Get a specific cookie
 */
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
