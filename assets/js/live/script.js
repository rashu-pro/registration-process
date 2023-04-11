/**
 * 1. VARIABLES
 * 2. ON DOCUMENT READY
 * 3. EVENT LISTENER: FOCUS
 * 4. EVENT LISTENER: CLICK
 * 5. EVENT LISTENER: KEYUP / BLUR
 * 6. EVENT LISTENER: CHANGE
 * 7. FUNCTION DEFINITION
 */

/**
 * -------------------------------------
 * 1. VARIABLES
 * -------------------------------------
 */

let mainWrapperSelector = '.main-wrapper-js';
let headerSelector = '.header-js';
let footerSelector = '.footer-js';
let loaderDivClass = '.loader-div',
    errorMessage = "The field is required";
let stepBoxActiveSelector = '.step-box.active';
let nameStringSelector = '.name-string-js';
let datePickerSelector = '.date-picker-js';
let radioGroupSelector = '.radio-group';
let paymentPlanSelector = '#payment-plan';
let totalStudentSelector = '#total-student';
let companyKey = '#company-key';
let isAdmin = '#is-admin';

let checkoutSummarySelector = '.checkout-summary-js';
let paymentInfoSelector = '.payment-info';
$(paymentInfoSelector).find('.form-group').addClass('d-none');

let J = Payment.J,
    creditCardField = $('.cc-number'),
    creditCardHolder = $('.cc-number-holder'),
    creditCardImageHolder = $('.cc-card-identity');

//=== coupon codes
const couponCodes = [
    { name: 'coupon', discount: '20', calculateMethod: 'percentage' },
    { name: 'discount', discount: '30', calculateMethod: 'percentage' },
    { name: 'voucher', discount: '40', calculateMethod: 'solid' },
    { name: 'invalid', discount: '300', calculateMethod: 'solid' }
];


/**
 * -------------------------------------
 * 2. ON DOCUMENT READY
 * -------------------------------------
 */
fixHeight();
countRow();

//=== hide prev button on first step
if (parseInt($(stepBoxActiveSelector).attr('data-step')) === 1) {
    $('.btn-prev-js').hide();
}

//=== datepicker initialization
if ($(datePickerSelector).length > 0) {
    $(datePickerSelector).datepicker({
        autoclose: true,
    });
    $(datePickerSelector).datepicker().on('changeDate', function (e) {
        $(this).trigger('blur');
    });

    $(datePickerSelector).datepicker().on('show', function (e) {
        $(this).closest('.form-group').find('.error-message').hide();
    });
}

if($(".date-picker-dob-js")){
  $(".date-picker-dob-js").datepicker({
    endDate: '04/30/2007',
    autoclose: true
  });
}


//=== select 2 initialization
if ($('.select-2').length > 0) {
    $('.select-2').select2();
}


if($('#no-payment-js').is(':checked')){
  disablePaymentForm();
}else{
  enablePaymentForm();
}


/**
 * country/state/city api
 * https://countrystatecity.in/
 */
let headers = new Headers();
headers.append("X-CSCAPI-KEY", "dERvN2VIc3c3QTNXNDZRaXlHRUpOcVEyWHVyYzNOZk1KSG9TN2xmcw==");

let requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
};

let countryHolderSelector = '.country-selector-holder-js';
let stateHolderSelector = '.state-selector-holder-js';
let cityHolderSelector = '.city-selector-holder-js';

let countrySelector = '.selector-country-js';
let countryInput = '.input-country-js';
let stateSelector = '.selector-state-js';
let stateInput = '.input-state-js';
let citySelector = '.selector-city-js';
let cityInput = '.input-city-js';
let checkToShowDivSelector = '.check-to-show-div-js';

//=== fetch countries
fetch("https://api.countrystatecity.in/v1/countries", requestOptions)
    .then(response => response.text())
    .then(result => {
        let objCountries = JSON.parse(result);
        if (objCountries.length < 1) return;

        $(countryHolderSelector).each(function (i, element) {
            generateSelectDropdown($(element), $(element).find(countryInput), 'selector-country-js', 'Select country');

            Object.keys(objCountries).forEach(function (key, index) {
                let countryNameShort = objCountries[key]['iso2'];
                let countryName = objCountries[key]['name'];
                if (countryNameShort === 'CA' || countryNameShort === 'US') {
                    $(element).find(countrySelector).prepend('<option data-shortname="' + countryNameShort + '" value="' + countryName + '">' + countryName + '</option>');
                } else {
                    $(element).find(countrySelector).append('<option data-shortname="' + countryNameShort + '" value="' + countryName + '">' + countryName + '</option>');
                }
            });

            $(element).closest('.select-box').find('.ajax-loader').hide();
            loaderDisable(loaderDivClass);
        })
    })
    .catch(error => {
        console.log('error', error);
    });

/**
 * -------------------------------------
 * 4. EVENT LISTENER: CLICK
 * -------------------------------------
 */

$(document).on('click', '.btn-navigation-js', function (e) {
    e.preventDefault();
    let self = $(this),
        rootParent = $('.step-box.active'),
        stepCurrent = parseInt(rootParent.attr('data-step')),
        // stepNext = stepCurrent + 1,
        stepPrev = stepCurrent - 1,
        stepBoxCount = $('.step-details .step-box').length,
        requiredFieldGroup = rootParent.find('.form-group.required-group'),
        paymentInfoSelector = '.payment-info-js',
        isPaymentConfirmSelector = '.is-payment-confirm',
        dataSidebarSelector = '.step-box.active .form-control.data-sidebar';

    //=== SHOW THE PREVIOUS BUTTON AFTER STEP 1
    if (parseInt($(stepBoxActiveSelector).attr('data-step')) !== 1) {
        $('.step-details .btn-prev').css('display', 'inline-block');
    }

    //=== PREVIOUS BUTTON CLICK ACTION
    if (self.attr('data-action') === 'decrease') {
        loaderEnable(loaderDivClass);
        setTimeout(() => {
            stepMovePrev(stepCurrent);
            if (stepPrev < 2) {
                $('.step-details .btn-prev').css('display', 'none');
            }
            if (parseInt($('.step-box.active').attr('data-step')) !== stepBoxCount) $('.btn-navigation-js[data-action=increase] span').html($('.btn-navigation-js[data-action=increase]').attr('data-text'));
            loaderDisable(loaderDivClass);
        }, 600);
        return;
    }

    //=== FIELD VALIDATION
    requiredFieldGroup.each(function (i, element) {
        singleValidation($(element).find('.form-control'), $(element), 'field-invalid', 'field-validated', 'error-message', errorMessage);
    });

    //=== CHECK WHETHER PARENT/SPOUSE INFORMATION ARE SAME
    if(rootParent.find('.spouse-information-js').length>0){
      let parentName = $('.step-box[data-step=1] .name-string-js').val().trim();
      let spouseName = rootParent.find('.fname-js').val().trim() +' '+rootParent.find('.lname-js').val().trim();
      if(rootParent.find('.fname-js').val()!==''){
        rootParent.find('.fname-js').removeClass('field-invalid invalid');
        rootParent.find('.fname-js').closest('.form-group').find('.error-message').remove();
      }
      if(spouseName === parentName){
        console.log('in name condition!');
        errorMessage = 'Spouse name shouldn\'nt be same as parent\'s name';
        let paramObj = {
          "formControl": rootParent.find('.fname-js'),
          "formGroup": rootParent.find('.fname-js').closest('.form-group'),
          "invalidClassName": 'field-invalid',
          "validClassName": 'field-validated',
          "errorMessageClassName": 'error-message',
          "errorMessage": errorMessage
        };
        validationFailed(paramObj);
      }

      if($('#email-spouse').val().trim() === $('.parent-email-js').val().trim()){
        errorMessage = 'Spouse email shouldn\'nt be same as parent email';
        let paramObj = {
          "formControl": $('#email-spouse'),
          "formGroup": $('#email-spouse').closest('.form-group'),
          "invalidClassName": 'field-invalid',
          "validClassName": 'field-validated',
          "errorMessageClassName": 'error-message',
          "errorMessage": errorMessage
        };
        validationFailed(paramObj);
      }
    }

    //=== GIVE FOCUS TO THE FIRST INVALID INPUT FIELD
    if (rootParent.find('.form-group .form-control.invalid').length > 0) {
        rootParent.find('.form-group .form-control.invalid').first().focus();
        if(rootParent.find('.form-group .form-control.invalid').first().closest('.form-check')){
          rootParent.find('.form-group .form-control.invalid').first().closest('.form-check').find('input[type=checkbox').focus();
        }
        return;
    }

    //=== SHOW THE STEP FORM SUMMARY IN THE SIDEBAR
    if ($(dataSidebarSelector).length > 0) {
        if (rootParent.find(nameStringSelector).length > 0) {
            rootParent.find(nameStringSelector).each(function (i, element) {
                nameStringBuilder($(element));
            })
        }

        // $(nameStringSelector).val($('.step-box.active .fname-js').val()+' '+$('.step-box.active .lname-js').val());
        let summaryString = '';
        $('.step-box.active .form-control.data-sidebar').each(function (i, element) {
            if (!$(element).val()) return;
            let valueField = $(element).val();
            if ($(element).prop('tagName') === 'SELECT') {
                valueField = $(element).find('option:selected').text();
            }
            if (valueField === 'lineBreak') {
                summaryString += "<hr class='m-0 my-1' />";
            } else {
                summaryString += "<p class='m-0'>" + valueField + "</p>";
            }
            // $('.step-list[data-step='+stepCurrent+'] .step-summary').html("<p class='m-0'>"+$(element).val()+"</p>");
        })
        $('.step-list[data-step=' + stepCurrent + '] .step-summary').html(summaryString);
    }

    loaderEnable(loaderDivClass);

    //=== SHOW THE CONFIRM MODAL IF EVERY STEPS HAVE BEEN COMPLETED SUCCESSFULLY
    if (self.attr('data-action') === 'increase' && stepCurrent === stepBoxCount) {
        loaderDisable(loaderDivClass);
        $('#modal-confirm').modal('show');
        return;
    }

    //=== MOVE TO THE NEXT STEP
    setTimeout(() => {
        stepMoveNext(stepCurrent);
        if (parseInt($('.step-box.active').attr('data-step')) > 1) {
            $('.step-details').removeClass('step-initial');
            $('.step-details .btn-prev').css('display', 'inline-block');
        }
        if (parseInt($('.step-box.active').attr('data-step')) === stepBoxCount)
            self.find('span').html(self.attr('data-submit-text'));

        if ($(rootParent).attr('data-function') === 'get_plan_list') {
            get_plan_list($(companyKey).val(), parseInt($(totalStudentSelector).val()), $(isAdmin).val());
        }

        loaderDisable(loaderDivClass);
    }, 600);
});


//=== skip step
$(document).on('click', '.skip-step-js', function (e) {
    e.preventDefault();
    loaderEnable(loaderDivClass);
    stepMoveNext(parseInt($(this).closest('.step-box').attr('data-step')));
    loaderDisable(loaderDivClass);
})

$(document).on('click', '.btn-edit-step-js', function () {
    loaderEnable(loaderDivClass);
    setTimeout(() => {
        stepMoveExact(parseInt($(this).attr('data-step')));
        if (parseInt($('.step-box.active').attr('data-step')) !== $('.step-details .step-box').length) $('.btn-navigation-js[data-action=increase] span').html($('.btn-navigation-js[data-action=increase]').attr('data-text'));
        loaderDisable(loaderDivClass);
    }, 600);
});


//=== remove block
$(document).on('click', '.btn-remove-js', function (e) {
    e.preventDefault();
    $(this).closest($(this).attr('data-remove')).remove();
    countRow();
})

//=== edit info block
$(document).on('click', '.btn-edit-js', function (e) {
    e.preventDefault();
    $(this).closest('.info-card-js').removeClass('added');
})

//=== add another block
$(document).on('click', '.btn-add-another-js', function (e) {
    e.preventDefault();
    let self = $(this);
    let dataSummarySelector = '.data-summary';

    isFieldValidated(self.closest('.step-box-body').find('.info-card-js').last());

    if (self.closest('.step-box-body').find('.info-card-js').last()
        .find('.form-group .form-control.invalid').length > 0) {
        self.closest('.step-box-body').find('.info-card-js').last()
            .find('.form-group .form-control.invalid').first().focus();
        return;
    }

    //=== build name string
    self.closest('.step-box-body').find(nameStringSelector).each(function (i, element) {
        nameStringBuilder($(element));
    })
    //=== add summary
    $(dataSummarySelector).each(function (i, element) {
        let textValue = $(element).val();
        if ($(element).prop('tagName') === 'SELECT') {
            textValue = $(element).find('option:selected').text();
        }
        $(element).closest('.info-card')
            .find($(element).attr('data-output'))
            .html(textValue);
    })

    $('.info-card-js').addClass('added');


    let infoCard = $('.info-card-js').first().clone();

    infoCard.find('.form-control').each(function (i, element) {
        if (!$(element).attr('id')) return;
        $(element).attr('id', $(element).attr('id') + ($('.info-card-js').length + 1));
    })

    infoCard.find('label').each(function (i, element) {
        if (!$(element).attr('for')) return;
        $(element).attr('for', $(element).attr('for') + ($('.info-card-js').length + 1));
    })

    infoCard.removeClass('added');
    infoCard.find('.form-control').val('');
    infoCard.find('.existing-grade').remove();
    $('.info-card-list').append(infoCard);
    if(self.closest('.step-box').find('.date-picker-js')){
      $('.date-picker-js').datepicker({
        autoclose: true,
      });
    }


  if(self.closest('.step-box').find(".date-picker-dob-js")){
    $(".date-picker-dob-js").datepicker({
      endDate: '04/30/2007',
      autoclose: true
    });
  }
    countRow();


})

//=== save info
$(document).on('click', '.btn-save-js', function (e) {
    e.preventDefault();
    let self = $(this);
    let dataSummarySelector = '.data-summary';

    isFieldValidated(self.closest('.info-card-js'));

    if (self.closest('.info-card-js')
        .find('.form-group .form-control.invalid').length > 0) {
        self.closest('.info-card-js')
            .find('.form-group .form-control.invalid').first().focus();
        return;
    }

    //=== build name string
    self.closest('.info-card-js').find(nameStringSelector).each(function (i, element) {
        nameStringBuilder($(element));
    })
    //=== add summary
    $(dataSummarySelector).each(function (i, element) {
        let textValue = $(element).val();
        if ($(element).prop('tagName') === 'SELECT') {
            textValue = $(element).find('option:selected').text();
        }
        $(element).closest('.info-card')
            .find($(element).attr('data-output'))
            .html(textValue);
    })

    self.closest('.info-card-js').addClass('added');

})

$(document).on('click', '.toggle-selector', function (e) {
    e.preventDefault();
    $($(this).attr('data-toggle')).toggle();
    $(this).toggleClass('toggle-active');
    $($(this).attr('data-toggle')).toggleClass('toggle-active');
})

//=== apply voucher
$(document).on('click', '.btn-apply-voucher-js', function (e) {
    e.preventDefault();
    let self = $(this),
        voucherField = self.closest('.voucher-block').find('.voucher-field-js'),
        subtotal = parseFloat($('.subtotal-js .amount-js').text()),
        discountAmount = 0,
        discountSign = '';

    self.closest('.voucher-block').find('.warning-message').remove();
    $('.coupon-row-js').remove();
    if (!voucherField || voucherField === '' || voucherField.val() <= 0) {
        errorLoad(self, 'Invalid Coupon Code!');
        voucherField.focus();
        return;
    }

    let object = couponCodes.find(obj => obj.name === voucherField.val());
    if (!object) {
        errorLoad(self, 'Wrong coupon code!');
        return;
    }

    discountAmount = object.discount;
    if (object.calculateMethod === 'percentage') {
        discountSign = '%';
        discountAmount = (parseFloat(object.discount) * subtotal) / 100;
    }

    if (discountAmount <= 0 || discountAmount > subtotal) {
        errorLoad(self, 'Not Applicable!');
        return;
    }

    let couponString = `<tr class="foot-row coupon-row-js" data-calculation="subtract">
                                      <td>
                                        <p class="m-0 mt-1 lh-1">Coupon Applied</p>
                                        <p class="m-0 mt-2 lh-1 text-danger fs-small">${voucherField.val()}</p>
                                      </td>
                                      <td class="text-end">$<span class="amount-js">${discountAmount}</span> </td>
                                    </tr>`;
    $('.grand-total-js').before(couponString);
    calculateTotal('.checkout-summary-table-js', '.grand-total-js');

})
/**
 * pull the plan list
 * @param companyKey
 * @param unitCount
 * @param isAdmin
 * */
function get_plan_list(companyKey, unitCount, isAdmin) {
    let headers_ = new Headers();
    let requestOptions = {
        method: 'GET',
        headers: headers_,
        redirect: 'follow'
    };

    let plan_list;
    let url = '/api/v1/pricing-tier/' + companyKey + '/' + unitCount + '/' + isAdmin;

    fetch(url, requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result);
            if (result.length > 0) {
                let optionString = `<option value="">Choose Plan</option>`;
                result.forEach((item) => {
                    optionString += `<option value="${item.value}" data-cart-text="${item.cartText}" data-initial-amount="${item.initialAmount}" data-total-amount="${item.totalAmount}" data-number-of-payment="${item.numberOfPayment}" data-installment-amount="${item.installmentAmount}" data-first-installment-date="${item.installmentDate}">${item.name} Student(s)</option>`;
                });
                $(paymentPlanSelector).empty();
                $(paymentPlanSelector).append(optionString);
            }
        })
        .catch(error => {
            console.log('error', error);
        });
}


function isFieldValidated(inputFieldsHolder) {
    inputFieldsHolder.find('.form-group.required-group').each(function (i, element) {
        singleValidation($(element).find('.form-control'), $(element), 'field-invalid', 'field-validated', 'error-message', errorMessage);
    });
}


/**
 * -------------------------------------
 * 5. EVENT LISTENER: KEYUP / BLUR / FOCUS / KEYPRESS
 * -------------------------------------
 */

$(document).on('keyup change', '.form-group.required-group .form-control', function (e) {
    let self = $(this);

    if (self.val().length > 0) {
        self.removeClass('invalid');
        self.removeClass('field-invalid');
        self.closest('.form-group').find('.error-message').remove();
    }
});

$(document).on('keyup', '.cc-number', function (e) {
    let self = $(this);
    let errorMessage = "The field is required";

    //=== FIELD VALIDATION
    singleValidation(self, self.closest('.form-group'), 'field-invalid', 'field-validated', 'error-message', errorMessage);
});

/**
 * -------------------------------------
 * 6. EVENT LISTENER: CHANGE
 * -------------------------------------
 */

$(document).on('change', '#payment-plan', function () {
    let self = $(this);
    let price = parseInt(self.find('option:selected').attr('data-initial-amount'));
    checkoutSummary(self);
    calculateSubTotal('.checkout-summary-table-js', '.subtotal-js');
    $('.no-payment-check-js').hide();
    $(checkoutSummarySelector).addClass('d-none');
    disablePaymentForm();
    if (price > 0) {
      $('.no-payment-check-js').show();
      $(checkoutSummarySelector).removeClass('d-none');
        enablePaymentForm();
    }
})

$(document).on('change', '#no-payment-js', function(){
  let self = $(this);
  if(self.is(':checked')){
    disablePaymentForm();
  }else{
    enablePaymentForm();
  }
})

function disablePaymentForm(){
  $(paymentInfoSelector).addClass('d-none');
  $(paymentInfoSelector).find('.form-group').addClass('d-none');
  $(paymentInfoSelector).find('.form-control').removeClass('invalid');
  $(paymentInfoSelector).find('.error-message').remove();
}

function enablePaymentForm(){
  if($('#no-payment-js').length>0){
    $('#no-payment-js').prop('checked', false);
  }
  $(paymentInfoSelector).removeClass('d-none');
  $(paymentInfoSelector).find('.form-group').removeClass('d-none');
}

function checkoutSummary(planSelector) {
    let selectedOption = planSelector.find('option:selected');
    let checkoutSummaryTableSelector = '.checkout-summary-table-js';
    let planName = planSelector.find('option:selected').text();
    let cartText = selectedOption.attr('data-cart-text');
    let planPrice = parseInt(planSelector.find('option:selected').attr('data-initial-amount'));
    let installmentString = '';
    if (parseInt(selectedOption.attr('data-number-of-payment')) > 1) {
        installmentString += `<p class="text-danger m-0">${selectedOption.attr('data-number-of-payment')} installment<span class="ps-2 me-2">/</span> Total amount: ${selectedOption.attr('data-total-amount')}</p>`;
    }

    let installmentInfoString = '';
    if (parseInt(selectedOption.attr('data-installment-amount')) > 0) {
        installmentInfoString += `
    <p class="mb-2">Initial Payment: $${selectedOption.attr('data-initial-amount')}</p>
    <p class="fw-semibold m-0">${selectedOption.attr('data-number-of-payment')} installments to pay, each of $${selectedOption.attr('data-installment-amount')}, for a total of $${parseInt(selectedOption.attr('data-installment-amount') * parseInt(selectedOption.attr('data-number-of-payment')))}.</p>
    <p class="text-danger fw-semibold m-0">Installment start date: ${selectedOption.attr('data-first-installment-date')}</p>
    `;
    }

    let infoString = `
  <div class="alert alert-primary">
                                  <h5 class="alert-heading fw-bold d-flex align-items-center">
                                    <img src="/Content/school-registration-assets/img/info.png" alt="info">
                                    Plan Information
                                  </h5>
                                  <hr class="mt-2 mb-2" />
                                  <p class="m-0">${planName}</p>
                                  <p class="m-0">Total Amount: $${selectedOption.attr('data-total-amount')}</p>
                                  ${installmentInfoString}

                                </div>
  `
    let checkoutSummaryString = `<tr class="body-row">
                                      <td>${cartText}</td>
                                      <td class="text-end">$<span class="amount-js">${planPrice}</span></td>
                                    </tr>`;
    $('#plan-info').html(infoString);
    $(checkoutSummaryTableSelector).find('tbody').html(checkoutSummaryString);
}

function calculateSubTotal(checkoutSummaryTableSelector, subtotalSelector) {
    let subtotal = 0;
    $(checkoutSummaryTableSelector).find('.body-row').each(function (i, element) {
        subtotal += parseInt($(element).find('.amount-js').text());
    })
    $(subtotalSelector).find('.amount-js').text(subtotal);
    calculateTotal('.checkout-summary-table-js', '.grand-total-js');
}

function calculateTotal(checkoutSummaryTableSelector, totalSelector) {
    let total = 0;
    $(checkoutSummaryTableSelector).find('.foot-row').each(function (i, element) {
        if ($(element).attr('data-calculation') === 'add') {
            total += parseInt($(element).find('.amount-js').text());
        }

        if ($(element).attr('data-calculation') === 'subtract') {
            total -= parseInt($(element).find('.amount-js').text());
        }
    })
    $(totalSelector).find('.amount-js').text(total);
}

//=== billing details same/differnt
$(document).on('change', '#billing-details-same', function () {
    let self = $(this);
    // billingInfoShowHide(self);
  let parentEmail = '',
    parentPhone = '',
    parentAddress = '',
    parentState = '',
    parentCity = '',
    parentZipcode = '';
  if (self.is(':checked')) {
    parentEmail = $('.parent-email-js').val();
    parentPhone = $('.parent-phone-js').val();
    parentAddress = $('.parent-address-js').val();
    parentState = $('#parent-state-js').val();
    parentCity = $('#parent-city-js').val();
    parentZipcode = $('.parent-zipcode-js').val();
  }
  populateBillingInfo(parentEmail, parentPhone, parentAddress, parentState, parentCity, parentZipcode);

  $('.billing-info-inner .form-group.required-group').each(function (i, element) {
    $(element).find('.form-control').removeClass('field-invalid invalid');
    $(element).find('.error-message').remove();
  });
})

// billingInfoShowHide($('#billing-details-same'));

function billingInfoShowHide(checkSelector) {
    $('.billing-info-inner').addClass('d-none');
    $('.billing-info-inner .form-group').addClass('d-none');
    $('.billing-info-inner .form-group .form-control').removeClass('invalid');
    $('.billing-info-inner .form-group .error-message').remove();
    if (!checkSelector.is(':checked')) {
        $('.billing-info-inner').removeClass('d-none');
        $('.billing-info-inner .form-group').removeClass('d-none');
    }
}

function populateBillingInfo(parentEmail, parentPhone, parentAddress, parentState, parentCity, parentZipcode){
  $('#billing-email').focus().val(parentEmail);
  $('#billing-phone').focus().val(parentPhone);
  $('#billing-address').focus().val(parentAddress);
  $('#billing-state').focus().val(parentState);
  $('#billing-city').focus().val(parentCity);
  $('#billing-zipcode').focus().val(parentZipcode).blur();
}


// === on country selection
$(document).on('change', countrySelector, function () {
    let self = $(this);
    // let selectedCountry = self.val();
    let selectedCountry = self.children('option:selected').attr('data-shortname');
    self.closest('.address-block-js').find(stateHolderSelector).closest('.select-box').find('.ajax-loader').show();
    self.closest('.address-block-js').find(stateSelector).empty();
    self.closest('.address-block-js').find(citySelector).empty();
    let url = `https://api.countrystatecity.in/v1/countries/${selectedCountry}/states`;
    //=== fetch states
    fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => {
            let objStates = JSON.parse(result);
            if (objStates.length < 1) {
                replaceSelectWithInput(self.closest('.address-block-js').find(stateSelector), 'input-state-js');
                self.closest('.address-block-js').find(stateHolderSelector).closest('.select-box').find('.ajax-loader').hide();
                return;
            }

            //=== sorting states alphabatically
            objStates.sort(dynamicSort("name"));
            generateSelectDropdown(self, self.closest('.address-block-js').find(stateInput), 'selector-state-js', 'Select State')
            Object.keys(objStates).forEach(function (key, index) {
                let stateNameShort = objStates[key]['iso2'];
                let stateName = objStates[key]['name'];
                self.closest('.address-block-js').find(stateSelector).append('<option data-shortname="' + stateNameShort + '" value="' + stateName + '">' + stateName + '</option>');
            });

            self.closest('.address-block-js').find(stateHolderSelector).closest('.select-box').find('.ajax-loader').hide();
        })
        .catch(error => {
            console.log('error', error);
        });
})

//=== on state selection
$(document).on('change', stateSelector, function () {
    let self = $(this);
    let currentBody = self.closest('.address-block-js');
    // let selectedState = self.val();
    let selectedState = self.children('option:selected').attr('data-shortname');
    let selectedCountry = self.closest('.address-block-js').find('.selector-country-js').children('option:selected').attr('data-shortname');
    currentBody.find(citySelector).empty();
    currentBody.find(cityHolderSelector).closest('.select-box').find('.ajax-loader').show();
    let url = `https://api.countrystatecity.in/v1/countries/${selectedCountry}/states/${selectedState}/cities`;
    //=== fetch cities
    fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => {
            let objCities = JSON.parse(result);
            if (objCities.length < 1) {
                replaceSelectWithInput(currentBody.find(citySelector), 'input-city-js');
                currentBody.find(cityHolderSelector).closest('.select-box').find('.ajax-loader').hide();
                return;
            }

            generateSelectDropdown(self, currentBody.find(cityInput), 'selector-city-js', 'Select city');
            Object.keys(objCities).forEach(function (key, index) {
                let cityName = objCities[key]['name'];
                currentBody.find(citySelector).append('<option value="' + cityName + '">' + cityName + '</option>');
            });
            //changed by Emdad at 03-04-2023
            if (selectedState == 'OH') {
                currentBody.find(citySelector).append('<option value="West Chester">West Chester</option>');
            }
            currentBody.find(cityHolderSelector).closest('.select-box').find('.ajax-loader').hide();
        })
        .catch(error => {
            console.log('error', error);
        });

})

$(document).on('select2:open', () => {
    document.querySelector('.select2-search__field').focus();
})


//=== radio field validation
$(document).on('change', '.radio-group input[type=radio]', function () {
    let self = $(this);
    radioInputCustom(self);
})

if ($('.radio-group input[type=radio]').length > 0) {
    $('.radio-group input[type=radio]').each(function (i, selector) {
        if (!$(selector).attr('checked') || $(selector).attr('checked') === "undefined") return;
        radioInputCustom($(selector));
    })
}

$(document).on('change', '.check-group input[type=checkbox]', function (e) {
    let self = $(this);
    checkboxFunction(self);

    if (self.closest('.form-group').hasClass('required-group')) {
        singleValidation(self.closest('.form-group').find('.form-control'), self.closest('.form-group'), 'field-invalid', 'field-validated', 'error-message', errorMessage)
    }
});



/**
 * -------------------------------------
 * 7. FUNCTION DEFINITION
 * -------------------------------------
 */

/**
 *
 * @effects gives body a min height so that the footer always stay in the bottom of the page
 * -------- event if the page doesn't have enough contents
 */
function fixHeight() {
    if (!document.querySelector(mainWrapperSelector)) return;
    let headerHeight = document.querySelector(headerSelector).clientHeight,
        footerHeight = document.querySelector(footerSelector).clientHeight,
        mainWrapperMarginTop = parseInt(window.getComputedStyle(document.querySelector(mainWrapperSelector)).marginTop),
        mainWrapperMarginBottom = parseInt(window.getComputedStyle(document.querySelector(mainWrapperSelector)).marginBottom);
    document.querySelector(mainWrapperSelector).style.minHeight = "calc(100vh - " + (headerHeight + footerHeight + mainWrapperMarginTop + mainWrapperMarginBottom) + "px)";
}

/**
 * Enables Loader
 *
 * @param loaderDivSelector
 */
function loaderEnable(loaderDivSelector) {
    document.querySelector(loaderDivSelector).classList.add('active');
}


/**
 * Disables loader
 *
 * @param loaderDivSelector
 */
function loaderDisable(loaderDivSelector) {
    document.querySelector(loaderDivSelector).classList.remove('active');
}

/**
 * Moves step to the previous step
 *
 * @param stepCurrent
 */
function stepMovePrev(stepCurrent) {
    $('.step-details .step-box').removeClass('active');
    $('.step-box[data-step=' + (stepCurrent - 1) + ']').addClass('active');
    $('.step-list-sidebar .step-list').removeClass('active');
    $('.step-list-sidebar .step-list[data-step=' + (stepCurrent - 1) + ']').addClass('active');
    if ((stepCurrent - 1) < 3) {
        // $('.step-details .btn-prev').css('display','none');
    }
}

/**
 * Moves step to the next step
 *
 * @param stepCurrent
 */
function stepMoveNext(stepCurrent) {
    if (stepCurrent > 1) {
        // $('.step-details .btn-prev').css('display','inline-block');
    }
    $('.step-details .step-box').removeClass('active');
    $('.step-list-sidebar .step-list').removeClass('active');
    $('.step-box[data-step=' + (stepCurrent + 1) + ']').addClass('active');
    $('.step-list-sidebar .step-list[data-step=' + stepCurrent + ']').addClass('completed');
    $('.step-list-sidebar .step-list[data-step=' + (stepCurrent + 1) + ']').addClass('active');
}

/**
 * Moves step to the given step
 *
 * @param stepNumber
 */
function stepMoveExact(stepNumber) {
    $('.step-details .step-box').removeClass('active');
    $('.step-box[data-step=' + stepNumber + ']').addClass('active');
    $('.step-list-sidebar .step-list').removeClass('active');
    $('.step-list-sidebar .step-list[data-step=' + stepNumber + ']').addClass('active');
    if ((stepNumber) < 3) {
        // $('.step-details .btn-prev').css('display','none');
    }
}


/**
 *
 * @param formControl
 * @param formGroup
 * @param invalidClassName
 * @param validClassName
 * @param errorMessageClassName
 * @param errorMessage
 *
 * @effects: check whether the input fields are validate
 * - or not and show warning message as needed
 */
function singleValidation(formControl, formGroup, invalidClassName, validClassName, errorMessageClassName, errorMessage) {
    //let consoleString = `self: ${formControl} | value: ${formControl.val()}`;
    errorMessage = "The field is required";
    let paramObj = {
        "formControl": formControl,
        "formGroup": formGroup,
        "invalidClassName": invalidClassName,
        "validClassName": validClassName,
        "errorMessageClassName": errorMessageClassName,
        "errorMessage": errorMessage
    };

    //=== IF FORM GROUP HAS DISPLAY NONE PROPERTIES
    if (formGroup.css('display') === 'none') return;

    //=== INPUT FIELD VALIDATION: EMPTY FIELD
    if (formControl.val() === '') {
        validationFailed(paramObj);
        return;
    }

    //=== INPUT FIELD VALIDATION: TEXT FIELD
    if (formControl.hasClass('validation-text')) {
        paramObj.errorMessage = "invalid input!";
        if (formControl.attr('data-min-length') && formControl.attr('data-max-length')) {
            formControl.val().length >= formControl.attr('data-min-length') && formControl.val().length <= formControl.attr('data-max-length') ? validationSuccess(paramObj) : validationFailed(paramObj);
            return;
        }

        if (formControl.attr('data-min-length')) {
            formControl.val().length >= formControl.attr('data-min-length') ? validationSuccess(paramObj) : validationFailed(paramObj);
            return;
        }

        if (formControl.attr('data-max-length')) {
            formControl.val().length <= formControl.attr('data-max-length') ? validationSuccess(paramObj) : validationFailed(paramObj);
            return;
        }
        formControl.val() !== '' ? validationSuccess(paramObj) : validationFailed(paramObj);
    }

    //=== ONLY NUMBER VALIDATION
    if (formControl.hasClass('validation-number')) {
        paramObj.errorMessage = "invalid input!";
        if (formControl.attr('data-min-length') && formControl.attr('data-max-length')) {
            isNumber(formControl.val()) && formControl.val().length >= formControl.attr('data-min-length') && formControl.val().length <= formControl.attr('data-max-length') ? validationSuccess(paramObj) : validationFailed(paramObj);
            return;
        }

        if (formControl.attr('data-min-length')) {
            isNumber(formControl.val()) && formControl.val().length >= formControl.attr('data-min-length') ? validationSuccess(paramObj) : validationFailed(paramObj);
            return;
        }

        if (formControl.attr('data-max-length')) {
            isNumber(formControl.val()) && formControl.val().length <= formControl.attr('data-max-length') ? validationSuccess(paramObj) : validationFailed(paramObj);
            return;
        }
        isNumber(formControl.val()) ? validationSuccess(paramObj) : validationFailed(paramObj);
    }

    //=== SELECT DROPDOWN VALIDATION
    if (formControl.prop('tagName') === 'SELECT') {
        formControl.val() !== '' ? validationSuccess(paramObj) : validationFailed(paramObj);
    }

    //=== INPUT FIELD VALIDATION: EMAIL FIELD
    if (formControl.hasClass('validation-email')) {
        paramObj.errorMessage = "Invalid Email Address!";
        isEmailValid(formControl.val()) ? validationSuccess(paramObj) : validationFailed(paramObj);
    }

    //=== INPUT FIELD VALIDATION: RADIO BOX
    if (formControl.hasClass('validation-radio')) {
        formControl.val() !== '' ? validationSuccess(paramObj) : validationFailed(paramObj);
    }

    //=== INPUT FIELD VALIDATION: CREDIT CARD NUMBER FIELD
    if (formControl.hasClass('validation-cc-number')) {
        paramObj.errorMessage = "Invalid card number!";
        cardValidation() ? validationSuccess(paramObj) : validationFailed(paramObj);
    }
}

/**
 *
 * @param paramObj
 */
function validationFailed(paramObj) {
    paramObj.formGroup.removeClass(paramObj.validClassName);
    paramObj.formControl.addClass(paramObj.invalidClassName);
    paramObj.formControl.removeClass('valid');
    paramObj.formControl.addClass('invalid');

    notifyError(paramObj);
}

/**
 *
 * @param paramObj
 */
function validationSuccess(paramObj) {
    paramObj.formControl.removeClass(paramObj.invalidClassName);
    paramObj.formControl.removeClass('invalid');
    paramObj.formControl.addClass('valid');
    paramObj.formGroup.addClass(paramObj.validClassName);
    paramObj.formGroup.find('.' + paramObj.errorMessageClassName).remove();
}

/**
 *
 * This function checks whether a given
 * - string is number or not
 *
 * @param string
 * @return {boolean}
 */
function isNumber(string) {
    return /^\d+$/.test(string);
}

/**
 *
 * This function checks whether the given value is valid email or not
 * @param email
 * @return {boolean}
 */
function isEmailValid(email) {
    return /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i.test(email);
}

//=== allow only number
$(document).on('keypress', '.input-phone-number', function (e) {
    if (e.which === 45) return;
    if (e.which < 48 || e.which > 58) e.preventDefault();
});

/**
 *
 * @param paramObj [an oject containg all the parametes]
 * @effects shows error message for invalid field
 */
function notifyError(paramObj) {
    paramObj.formGroup.find('.' + paramObj.errorMessageClassName).remove();
    paramObj.formGroup.append('<p class="' + paramObj.errorMessageClassName + ' text-danger">' + paramObj.errorMessage + '</p>');
    paramObj.formControl.closest('.form-group').find('.check-group').addClass('focused');
    setTimeout(() => {
        paramObj.formControl.closest('.form-group').find('.check-group').removeClass('focused');
    }, 300);
}

/**
 * count row and give row number
 */
function countRow() {
    let totalRow = 0;
    $('.row-count-js').each(function (i, element) {
        $(element).html(i + 1);
        totalRow += (i + 1);
    })

    $('.student-serial').each(function (i, element) {
        $(element).val('<strong>Student ' + (i + 1) + '</strong>');
    })

    $('.info-card-js').removeClass('only-one-row');
    if (totalRow < 2) {
        $('.info-card-js').addClass('only-one-row');
    }
    $(totalStudentSelector).val($('.row-count-js').last().text());
}

/**
 * build a name with first name and last name
 * @param fullNameSelector
 */
function nameStringBuilder(fullNameSelector) {
    $(fullNameSelector).val($(fullNameSelector).closest('.row-field')
        .find('.fname-js').val() + ' ' + $(fullNameSelector).closest('.row-field')
            .find('.lname-js').val());
}


/**
 * Generates select dropdown
 * @param selfSelector
 * @param inputSelector
 * @param selectorClass
 * @param selectPlaceholder
 */
function generateSelectDropdown(selfSelector, inputSelector, selectorClass, selectPlaceholder,) {
    if (inputSelector.length < 1) {
        selfSelector.closest('.address-block-js').find(selectorClass).empty();
        selfSelector.closest('.address-block-js').find(selectorClass).append('<option></option>');
        return;
    }
    let id = inputSelector.attr('id');
    let inputName = inputSelector.attr('name');
    let selector = `<select id="${id}" class="form-control form-select field-normal selector-country ${selectorClass}" name="${inputName}">
                                        <option></option>
                                     </select>`;
    inputSelector.parent().html(selector);
    $(document).on('DOMNodeInserted', '.' + selectorClass, function () {
        $(this).select2({
            placeholder: selectPlaceholder,
        });
    });
}

/**
 * Function to sort alphabetically an array of objects by some specific key.
 *
 * @param {String} property Key of the object to sort.
 */
function dynamicSort(property) {
    var sortOrder = 1;

    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a, b) {
        if (sortOrder == -1) {
            return b[property].localeCompare(a[property]);
        } else {
            return a[property].localeCompare(b[property]);
        }
    }
}

/**
 * replaces select dropdown with input when ther is no item to add in the dropdown
 * @param selectSelector
 * @param inputClass
 */
function replaceSelectWithInput(selectSelector, inputClass) {
    let id = $(selectSelector).attr('id');
    let name = $(selectSelector).attr('name');
    let inputField = `<input type="text" id="${id}" name="${name}" class="form-control field-normal ${inputClass}">`;
    $(selectSelector).parent().html(inputField);

}


/**
 * checks whether the given card number
 * - is valid or not
 *
 * @return {boolean}
 */
//The block is updated for server use
function cardValidation() {
    let ccNumberSelector = document.querySelector('.cc-number'),
        cardType = Payment.fns.cardType(J.val(ccNumberSelector));
    //=== INVALID CARD TYPE
    if (!cardType) {
        creditCardImageHolder.html("<img src='/Content/school-registration-assets/img/unknown.png'>");
        return;
    }
    creditCardField.addClass(cardType);
    creditCardImageHolder.html("<img src='/Content/school-registration-assets/img/" + cardType + ".png'>");
    return Payment.fns.validateCardNumber(J.val(ccNumberSelector));
}


/**
 * populates value in the hidden field for the checkbox
 * @param self
 */
function checkboxFunction(self) {
    if (self.prop('checked')) {
        self.closest('.form-group').find('.form-control').val(self.attr('data-value'));
    } else {
        self.closest('.form-group').find('.form-control').val('');
    }
}


/**
 * inputs value in the hidden field when radio field is checked
 * @param self
 */
function radioInputCustom(self) {
    self.closest(radioGroupSelector).find('.form-control').val(self.attr('data-value'));
    if (self.closest('.form-group').hasClass('required-group')) {
        singleValidation(self.closest('.form-group').find('.form-control'), self.closest('.form-group'), 'field-invalid', 'field-validated', 'error-message', errorMessage)
    }
}


/**
 * Load error to the field
 * @param self
 * @param message
 */
function errorLoad(self, message) {
    self.closest('.voucher-block').find('.warning-message').remove();
    self.closest('.voucher-block').find('.voucher-field-wrapper').after('<p class="text-danger warning-message m-0">' + message + '</p>');
}



