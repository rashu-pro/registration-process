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


/**
 * -------------------------------------
 * 2. ON DOCUMENT READY
 * -------------------------------------
 */
fixHeight();
countRow();

/**
 * -------------------------------------
 * 4. EVENT LISTENER: CLICK
 * -------------------------------------
 */

$(document).on('click', '.btn-navigation-js', function (e){
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
    nameStringSelector = '.step-box.active .name-string-js',
    dataSidebarSelector = '.step-box.active .form-control.data-sidebar';

  //=== payment form show/hide
  let amount = parseFloat($('.membership-amount-js').val()).toFixed(2);
  $(paymentInfoSelector).removeClass('d-none');
  $(paymentInfoSelector).find('.is-require').addClass('required-group');
  $(isPaymentConfirmSelector).removeClass('d-none');
  if(amount==='NaN' || amount<1){
    $(paymentInfoSelector).addClass('d-none');
    $(paymentInfoSelector).find('.is-require').removeClass('required-group');
    $(paymentInfoSelector).find('.is-require').removeClass('field-validated');
    $(paymentInfoSelector).find('.is-require .error-message').removeClass('required-group');
    $(paymentInfoSelector).find('.is-require input').removeClass('field-invalid invalid');
    $(paymentInfoSelector).find('.is-require select').removeClass('field-invalid invalid');
    $(paymentInfoSelector).find('.is-require input').removeClass('valid');
    $(paymentInfoSelector).find('.is-require select').removeClass('valid');

    $(isPaymentConfirmSelector).addClass('d-none');
  }

  $('.step-details .btn-prev').css('display','inline-block');
  //=== previous button click action
  if(self.attr('data-action')==='decrease'){
    loaderEnable(loaderDivClass);
    setTimeout(()=>{
      stepMovePrev(stepCurrent);
      if(stepPrev<2){
        $('.step-details .btn-prev').css('display','none');
      }
      if(parseInt($('.step-box.active').attr('data-step'))!==stepBoxCount) $('.btn-navigation-js[data-action=increase] span').html($('.btn-navigation-js[data-action=increase]').attr('data-text'));
      loaderDisable(loaderDivClass);
    },600);
    return;
  }

  requiredFieldGroup.each(function (i, element) {
    singleValidation($(element).find('.form-control'), $(element), 'field-invalid', 'field-validated', 'error-message', errorMessage);
  });

  if(rootParent.find('.form-group .form-control.invalid').length>0){
    rootParent.find('.form-group .form-control.invalid').first().focus();
    return;
  }

  if($(dataSidebarSelector).length>0){
    $(nameStringSelector).each(function (i, element){
      $(element).val($(element).closest('.row-field')
        .find('.fname-js').val()+' '+
        $(element).closest('.row-field')
        .find('.lname-js').val());
    })
    // $(nameStringSelector).val($('.step-box.active .fname-js').val()+' '+$('.step-box.active .lname-js').val());
    let summaryString = '';
    $('.step-box.active .form-control.data-sidebar').each(function (i, element){
      if(!$(element).val()) return;
      let valueField = $(element).val();
      if(valueField==='lineBreak'){
        summaryString += "<hr class='m-0 my-1' />";
      }else{
        summaryString += "<p class='m-0'>"+$(element).val()+"</p>";
      }
      // $('.step-list[data-step='+stepCurrent+'] .step-summary').html("<p class='m-0'>"+$(element).val()+"</p>");
    })
    $('.step-list[data-step='+stepCurrent+'] .step-summary').html(summaryString);
  }

  loaderEnable(loaderDivClass);
  if(self.attr('data-action')==='increase' && stepCurrent === stepBoxCount){
    loaderDisable(loaderDivClass);
    $('#modal-confirm').modal('show');
    return;
  }

  setTimeout(()=>{
    stepMoveNext(stepCurrent);
    if(parseInt($('.step-box.active').attr('data-step'))>1) $('.step-details').removeClass('step-initial');
    if(parseInt($('.step-box.active').attr('data-step'))===stepBoxCount) self.find('span').html(self.attr('data-submit-text'));
    loaderDisable(loaderDivClass);
  },600);
});

$(document).on('click', '.btn-edit-step-js', function (){
  loaderEnable(loaderDivClass);
  setTimeout(()=>{
    stepMoveExact(parseInt($(this).attr('data-step')));
    if(parseInt($('.step-box.active').attr('data-step'))!==$('.step-details .step-box').length) $('.btn-navigation-js[data-action=increase] span').html($('.btn-navigation-js[data-action=increase]').attr('data-text'));
    loaderDisable(loaderDivClass);
  },600);
});

$(document).on('click', '.btn-confirm-js', function (){
  $('#modal-confirm').modal('hide');
  loaderEnable(loaderDivClass);
  submitTheForm();
});

//=== remove block
$(document).on('click', '.btn-remove-js', function (e){
  e.preventDefault();
  $(this).closest($(this).attr('data-remove')).remove();
  countRow();
})

//=== edit info block
$(document).on('click', '.btn-edit-js', function (e){
  e.preventDefault();
  $(this).closest('.info-card-js').removeClass('added');
})

//=== add another block
$(document).on('click', '.btn-add-another-js', function (e){
  e.preventDefault();
  let self = $(this);
  $('.info-card-js').addClass('added');
  let infoCard = $('.info-card-js').first().clone();
  infoCard.removeClass('added');
  infoCard.find('.form-control').val('');
  $('.info-card-list').append(infoCard);
  countRow();
})

function summaryAddition(blockSelector){
  blockSelector.find('')
}



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
function loaderEnable(loaderDivSelector){
  document.querySelector(loaderDivSelector).classList.add('active');
}


/**
 * Disables loader
 *
 * @param loaderDivSelector
 */
function loaderDisable(loaderDivSelector){
  document.querySelector(loaderDivSelector).classList.remove('active');
}

/**
 * Moves step to the previous step
 *
 * @param stepCurrent
 */
function stepMovePrev(stepCurrent){
  $('.step-details .step-box').removeClass('active');
  $('.step-box[data-step='+(stepCurrent-1)+']').addClass('active');
  $('.step-list-sidebar .step-list').removeClass('active');
  $('.step-list-sidebar .step-list[data-step='+(stepCurrent-1)+']').addClass('active');
  if((stepCurrent-1)<3){
    // $('.step-details .btn-prev').css('display','none');
  }
}

/**
 * Moves step to the next step
 *
 * @param stepCurrent
 */
function stepMoveNext(stepCurrent){
  if(stepCurrent>1){
    // $('.step-details .btn-prev').css('display','inline-block');
  }
  $('.step-details .step-box').removeClass('active');
  $('.step-list-sidebar .step-list').removeClass('active');
  $('.step-box[data-step='+(stepCurrent+1)+']').addClass('active');
  $('.step-list-sidebar .step-list[data-step='+stepCurrent+']').addClass('completed');
  $('.step-list-sidebar .step-list[data-step='+(stepCurrent+1)+']').addClass('active');
}

/**
 * Moves step to the given step
 *
 * @param stepNumber
 */
function stepMoveExact(stepNumber){
  $('.step-details .step-box').removeClass('active');
  $('.step-box[data-step='+stepNumber+']').addClass('active');
  $('.step-list-sidebar .step-list').removeClass('active');
  $('.step-list-sidebar .step-list[data-step='+stepNumber+']').addClass('active');
  if((stepNumber)<3){
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
  if(formGroup.css('display')==='none') return;

  //=== INPUT FIELD VALIDATION: EMPTY FIELD
  if(formControl.val()===''){
    validationFailed(paramObj);
    return;
  }

  //=== INPUT FIELD VALIDATION: TEXT FIELD
  if(formControl.hasClass('validation-text')){
    paramObj.errorMessage="invalid input!";
    if(formControl.attr('data-min-length') && formControl.attr('data-max-length')){
      formControl.val().length>=formControl.attr('data-min-length') && formControl.val().length<=formControl.attr('data-max-length')?validationSuccess(paramObj):validationFailed(paramObj);
      return;
    }

    if(formControl.attr('data-min-length')){
      formControl.val().length>=formControl.attr('data-min-length')?validationSuccess(paramObj):validationFailed(paramObj);
      return;
    }

    if(formControl.attr('data-max-length')){
      formControl.val().length<=formControl.attr('data-max-length')?validationSuccess(paramObj):validationFailed(paramObj);
      return;
    }
    formControl.val()!==''?validationSuccess(paramObj):validationFailed(paramObj);
  }

  //=== ONLY NUMBER VALIDATION
  if(formControl.hasClass('validation-number')){
    paramObj.errorMessage="invalid input!";
    if(formControl.attr('data-min-length') && formControl.attr('data-max-length')){
      isNumber(formControl.val()) && formControl.val().length>=formControl.attr('data-min-length') && formControl.val().length<=formControl.attr('data-max-length')?validationSuccess(paramObj):validationFailed(paramObj);
      return;
    }

    if(formControl.attr('data-min-length')){
      isNumber(formControl.val())&&formControl.val().length>=formControl.attr('data-min-length')?validationSuccess(paramObj):validationFailed(paramObj);
      return;
    }

    if(formControl.attr('data-max-length')){
      isNumber(formControl.val())&&formControl.val().length<=formControl.attr('data-max-length')?validationSuccess(paramObj):validationFailed(paramObj);
      return;
    }
    isNumber(formControl.val())?validationSuccess(paramObj):validationFailed(paramObj);
  }

  //=== SELECT DROPDOWN VALIDATION
  if(formControl.prop('tagName')==='SELECT'){
    formControl.val()!==''?validationSuccess(paramObj):validationFailed(paramObj);
  }

  //=== INPUT FIELD VALIDATION: EMAIL FIELD
  if(formControl.hasClass('validation-email')){
    paramObj.errorMessage = "Invalid Email Address!";
    isEmailValid(formControl.val())?validationSuccess(paramObj):validationFailed(paramObj);
  }

  //=== INPUT FIELD VALIDATION: RADIO BOX
  if(formControl.hasClass('validation-radio')){
    formControl.val()!==''?validationSuccess(paramObj):validationFailed(paramObj);
  }

  //=== INPUT FIELD VALIDATION: CREDIT CARD NUMBER FIELD
  if(formControl.hasClass('validation-cc-number')){
    paramObj.errorMessage = "Invalid card number!";
    cardValidation()?validationSuccess(paramObj):validationFailed(paramObj);
  }
}

/**
 * count row and give row number
 */
function countRow(){
  let totalRow = 0;
  $('.row-count-js').each(function (i, element){
    $(element).html(i+1);
    totalRow += (i+1);
  })

  $('.info-card-js').removeClass('only-one-row');
  if(totalRow<2){
    $('.info-card-js').addClass('only-one-row');
  }
}
