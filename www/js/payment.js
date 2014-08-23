var $formID;
var marketplaceUri = ' /v1/marketplaces/TEST-MP2Q4OaIanQuIDJIixHGmhQA';
var $balancedError = $('#card_error'); 

// process Balanced bank account form for ACH payments
$(document).on('click', '#acctForm', function () {

  // set form id
  $formID = $('#bank-acct-form');
	
  // check acct # to avoid resubmitting form twice
  if ($('#acct_number').length > 0) {	  

    // initialize object
    balanced.init(marketplaceUri);

    processAcct(); // process acct
    return false 
  }
  else {
    submitData('acct');
    return true
  }
});
 
// process card
function BalancedCard() {
  uiLoading(true);
  $formID = $('#payment_form');

  // disable form
  $('#payForm').attr('disabled', 'disabled');

  var qty = $('#inv-item').data("qty");
  var prc = $('#inv-item').data("prc");
  var invID = $('#txn-prev-btn').data("inv-id");
  console.log('inv item prc = ' + prc);
  console.log('inv ID = ' + invID);

  // store form data
  var params = new Object();

  // set params
  params.id = $('#inv-item').data("pixi_id");
  params.order = { cnt: 1, item1: $('#description').val(), quantity1: qty, price1: prc, invoice_id: invID };
  params.transaction = { first_name: $('#first_name').val(), last_name: $('#last_name').val(), address: $('#address').val(), 
    city: $('#city').val(), state: $('#state').val(), zip: $('#zip').val(), home_phone: $('#home_phone').val(), email: $('#email').val(), 
    card_number: $('#card_number').val(), cvv: $('#card_code').val(), token: $('#token').val(), card_month: $('#card_month').val(),  
    card_year: $('#card_year').val(), convenience_fee: $('#convenience_fee').val(), processing_fee: $('#processing_fee').val(),
    description: $('#description').val(), promo_code: $('#promo_code').val(), amt: $('#amt').val(), transaction_type: $('#transaction_type').val() }; 

  // submit card data
  submitData('card', params);

  // prevent the form from submitting with the default action
  return false;
}

// create token if credit card info is valid
function processAcct() {
    $('#bank-acct-form').attr('disabled', true);
	
      balanced.bankAccount.create({
        name: $('#bank_account_acct_name').val(),
        account_number: $('#acct_number').val(),
        routing_number: $('#routing_number').val(),
        type: $('#bank_account_acct_type').val()
      }, callbackHandler);

    // prevent the form from submitting with the default action
    return false;
}

// process errors
function processError(response, msg) {
  var $balancedError = $('#data_error'); 
  $balancedError.show(300).text(msg);

  var fld = ($('#bank-acct-form').length > 0) ? '#bank-acct-form' : '#payForm';
  $(fld).removeAttr('disabled'); 

  // scroll to top of page
  $('html, body').animate({scrollTop:0}, 100); 
  uiLoading(false);
}

// process balanced callback
function callbackHandler(response) {
  console.log('callback status = ' + response.status);
  switch (response.status) {
    case 400:
      console.log(response.error);
      processError(response, 'Card/Account number or cvv invalid');
      break;
    case 402:
      console.log(response.error);
      processError(response, 'Card/Account is invalid and could not be authorized');
      break;
    case 404:
      console.log(response.error);
      processError(response, 'Payment token is invalid');
      break;
    case 500:
      console.log(response.error);
      processError(response, 'Network request invalid. Please try again.');
      break;
    case 201:
      $balancedError.hide(300);
       
      // insert the data into the form 
      $('#pay_token').val(response.data.uri);

      if($('#bank_account_acct_no').length > 0) {
        $('#bank_account_acct_no').val(response.data.account_number); 
	var dType = 'acct';
      }
      else {
        var dType = 'card';
      }

      // submit to the server
      submitData(dType);
      break;
    default:
      console.log(response);
      processError(response, 'Request invalid. Please try again.');
      break;
  }
  uiLoading(false);
}

// submit data to server
function submitData(dType, params) {
  uiLoading(true);
  params = params || {}; 

  if (dType == 'card') {
    var dataUrl = url + '/transactions.json' + token;
  }
  else {
    var dataUrl = url + '/bank_accounts.json' + token;
  }

  // process data
  postData(dataUrl, params, dType);
}
