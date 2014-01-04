// initialize var
//var url = 'http://pixiboard.com';
var url = 'http://10.0.2.2:3000';
var listPath = url + '/listings';
var pixPath = url + '/pictures.json';
var tmpPath = url + '/temp_listings';
var pxPath = listPath + '/';
var listPage = '../html/show_listing.html';
var homePage = "../html/listings.html";
var catPath = pxPath + 'category.json' ;
var locPath = pxPath + 'location.json' ;
var email, pwd, pid, token, usr, categories, deleteUrl, myPixiPage, invFormType, pxFormType,
  postType = 'recv';

// ajax setup
$(function(){
  $.ajaxSetup({
    type: 'POST',
    headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
    dataType: 'json'
  });
});

// change page
function goToUrl(pxUrl, rFlg) {
  $.mobile.changePage( pxUrl, { transition: "none", reverse: false, reloadPage: rFlg, changeHash: false });
}

// load post page
$(document).on('pageinit', '#myposts', function() {
  loadListPage('recv', 'post'); 
});

// load list page
$(document).on('pageinit', '#mypixis, #myinv', function() {
  if(myPixiPage == 'active') {
    var dType = 'view'; }
  else {
    var dType = 'inv'; }

  loadListPage(myPixiPage, dType); 
});

// load initial board
$(document).on('pageinit', '#listapp', function() {
  pxPath = listPath + '/';  // reset pxPath

  // set time ago format
  $("time.timeago").timeago();

  // set token string for authentication
  token = '?auth_token=' + window.localStorage["token"];
  var listUrl = listPath + '.json' + token;

  // load main board
  loadData(listUrl, 'board');

  // initialize infinite scroll
  // load_masonry('#px-nav', '#px-nav a.nxt-pg', '#pxboard .item', 1);
});

// load pixi form data
$(document).on('pageinit', '#profile-page', function() {
  loadListPage('user', 'user'); 
  pixPopup("#popupPix1");  // load popup page
});

// load invoice form page
$(document).on('pageinit', '#inv-form', function() {
  setInvForm();
});

// load bank account form page
$(document).on('pageinit', '#acct-form', function() {
  if (usr.bank_accounts.length < 1) {
    var data;
    loadBankAcct(data, true);
  }
  else {
    var acct_id = usr.bank_accounts[0].id;
    var invUrl = url + '/bank_accounts/' + acct_id + '.json' + token;
    loadData(invUrl, 'bank');
  }
});

// set invoice form
function setInvForm() {
  var data;

  switch(invFormType) {
    case 'edit':
      if(pid !== undefined) {
        var invUrl = url + '/invoices/' + pid + '.json' + token;
        loadData(invUrl, 'invedit');
      }
      else {
        loadInvForm(data, true);
      }
      break;
    case 'inv':
      loadInvForm(data, true);
      break;
    default:
      break;
  }
  $("#navpanel").panel("close");  // close menu panel
}

// load pixi form data
$(document).on('pageinit', '#formapp', function() {

  // if edit mode load pixi data
  if (pxFormType == 'edit') {
    var editUrl = url + '/editpixi' + '.json' + token;
    loadData(editUrl, 'edit', {id:pid});
  }
  else {
    loadYear("#yr_built", 0, 90, '0'); // load year fld
  }

  // load categories
  if (categories !== undefined) {
    loadList(categories, '#category_id', 'Category');
  }
  else {
    // get category data
    var catUrl = url + '/categories.json' + token;
    var data = loadData(catUrl, 'list');
    loadList(data, '#category_id', 'Category');
  }

  $("#category_id").trigger("change"); // update item
  pixPopup("#popupPix");  // load popup page
});

// build image string to display pix 
function getPixiPic(pic, style, fld) {
  var img_str = '<img style="' + style + '" src="' + url + pic + '"';

  fld = fld || '';  // set fld id
  if(fld.length > 0) {
    img_str += ' id="' + fld + '">'; }
  else {
    img_str += '>'; }

  return img_str
}

// put data based on given url & data type
function putData(putUrl, fdata, dType) {
  console.log('in putData: ' + putUrl);
  var dFlg;

  // turn on spinner
  uiLoading(true);

  // push data to server
  $.ajax({
    url: putUrl, 
    type: "put",
    dataType: "json",
    data: fdata,
    contentType: "application/json",
    success: function(data, status, xhr) {
      console.log('putData success: ' + data);

      // load data based on display type
      switch (dType) {
        case 'submit':
          showPixiSuccess(data);
	  break;
        case 'pixi':
          pxPath = tmpPath;
          goToUrl(listPage);
	  break;
        default:
          return data;
	  break;
      }
    },
    fail: function (a, b) {
        PGproxy.navigator.notification.alert(a + '|' + b, function() {}, 'Put Data', 'Done');
  	uiLoading(false);
        console.log(a + '|' + b);
    }
  });
}

// post data based on given url & data type
function postData(postUrl, fdata, dType) {
  console.log('in postData: ' + postUrl);
  var dFlg;

  // turn on spinner
  uiLoading(true);

  // process post
  $.post(postUrl, fdata, function(res) {
    if (res == undefined) {
      dFlg = false;  // set flag
    } 
    else {
      dFlg = true;  // set flag
    }  

    // load data based on display type
    switch (dType) {
      case 'login':
        processLogin(res, dFlg);
	break;
      case 'pixi':
        processPixiData(res);
	break;
      case 'post':
        resetPost(dFlg);
	break;
      case 'comment':
        showCommentPage(res);
	break;
      case 'reply':
        loadPosts(res, dFlg);
	break;
      default:
        return res;
	break;
    }
  },"json").fail(function (a, b, c) {
  	uiLoading(false);
        PGproxy.navigator.notification.alert(b + ' | ' + c, function() {}, 'Post Data', 'Done');
        console.log(b + ' | ' + c);
  });
}

// delete server data
function deleteData(delUrl, dType) {
  console.log('delUrl = ' + delUrl);
  $.ajax({
    url: delUrl, 
    type: "post",
    dataType: "json",
    data: {"_method":"delete"},
    success: function(data) {
        if(dType !== 'exit') {
          goToUrl(homePage);  // return home
	}
    },
    fail: function (a, b, c) {
        PGproxy.navigator.notification.alert(a + '|' + b, function() {}, 'Delete', 'Done');
  	uiLoading(false);
        console.log(a + '|' + b);
    }
  });
}

// process images
function processPix(pixArr, style) {
  var img_str;
  
  if($.isArray(pixArr)){
    var len = pixArr.length;
    console.log('Rows found: ' + len);

    for (var i = 0; i < len; i++){
      img_str = '<img style="' + style + '" src="' + url + pixArr[i].photo_url + '">';
    }
  }
  return img_str;
}

// get pixi picture
function getName(cid, token) {
  var cat_name; 

  $.getJSON(catPath + cid + '.json' + token, function(res) {
    $.each(res.results, function(index, item) {
      cat_name = res_name;
    });
  });

  return cat_name;
}

// hide form btn
function hide_btn() {
  if( $('#comment-btn').length > 0 ) {
    $("#comment-btn").parent().hide();
  }

  if( $('#contact-btn').length > 0 ) {
    $("#contact-btn").parent().hide();
  }
}

// force pages to be refresh
$(document).on('pagehide', 'div[data-role="page"]', function(event, ui) {
  $(event.currentTarget).remove();
});

// process active btn
$(document).on('click', '#bill-menu-btn', function(e) {
  if(usr !== undefined) { 
    if(usr.bank_accounts.length > 0){
      invFormType = 'inv';  // set var
    }
    else {
      invFormType = 'bank';  // set var
    }
  }
  else {
    invFormType = 'new';  // set var
  }
  console.log('invFormType = ' + invFormType);
});

// process active btn
$(document).on('click', '#edit-inv-btn', function(e) {
  pid = $(this).attr('data-inv-id');   // get inv id

  invFormType = 'edit';  // set var
  goToUrl('../html/invoice_form.html');
  return false;
});

// process pay btn
$(document).on('click', '#pay-btn', function(e) {
  goToUrl('../html/transaction.html');
  return false;
});

// process menu btn
$(document).on('click', '#inv-menu-btn', function(e) {
  myPixiPage = 'sent';  // set var
  return false;
});

// process menu btn
$(document).on('click', '#pixis-menu-btn', function(e) {
  myPixiPage = 'active';  // set var
  togglePath();
  return false;
});

// process menu btn
$(document).on('click', '#signout-menu-btn', function(e) {
  var curToken = window.localStorage["token"];
  var logoutUrl = url + '/api/v1/sessions/' + curToken + '.json';

  // check if app exit
  navigator.notification.confirm('Exit Pixiboard?', onExitConfirm, 'Exit', 'No, Yes');

  // process request
  deleteData(logoutUrl, 'exit');
  return false;
});

// reset nav-bar active class
function resetActiveClass($this) {
  
  // remove active class
  var $headers = $(document).find('div[data-role="header"]');
  $headers.find('a').removeClass("ui-btn-active");

  // set active class
  $this.addClass("ui-btn-active");
}

// process list btn click
$(document).on('click', '#profile-nav-btn, #contact-nav-btn, #prefs-nav-btn', function(e) {
  var sType = $(this).attr('data-dtype'); 
  var $this = $(this);

  // reset active class
  resetActiveClass($this);

  // clear container
  $('#usr-prof').html('');

  // load page
  loadListPage(sType, sType);
  return false;
});

// process list btn click
$(document).on('click', '#sent-post-btn, #recv-post-btn', function(e) {
  var $this = $(this);
  postType = $this.attr('data-dtype'); 

  // reset active class
  resetActiveClass($this);

  // clear container
  $('#mxboard').html('');

  // load post page
  loadListPage(postType, 'post');
  return false;
});

// process list btn click
$(document).on('click', '#active-btn, #draft-btn, #sold-btn, #sent-inv-btn, #recv-inv-btn', function(e) {
  var $this = $(this);

  // reset active class
  resetActiveClass($this);

  // set var to active item
  myPixiPage = $(this).attr('data-view'); 
  var dType = $(this).attr('data-dtype'); 
  console.log('myPixiPage = ' + myPixiPage);
  console.log('dType = ' + dType);

  // set correct path 
  togglePath();

  // clear container
  $('#pixi-list').html('').listview('refresh');

  // load list page
  loadListPage(myPixiPage, dType);
  return false;
});

// submit new pixi to board
$(document).on('click', '#submit-pixi-btn', function(e) {
  var sType = $('#px-status').attr('data-status-type');

  if(sType == 'edit') {
    var submitUrl = url + '/resubmit' + '.json' + token;
  } 
  else {
    var submitUrl = url + '/submit' + '.json' + token;
  }

  putData(submitUrl, {id:pid}, 'submit');
  return false;
});

// confirm cancellation
$(document).on('click', '#cancel-pixi-btn, #px-cancel', function(e) {
  e.preventDefault();
  console.log('in click cancel pixi btn');
  navigator.notification.confirm('Are you sure? All changes will be lost!', onConfirm, 'Cancel', 'No, Yes');
});

// confirm removal
$(document).on('click', '#remove-pixi-btn, #rm-acct-btn', function(e) {
  console.log('in click remove btn');
  e.preventDefault();
  acct_id = $(this).attr("data-acct-id");

  // set url 
  if(acct_id.length > 0) {
    deleteUrl = url + '/bank_accounts/' + acct_id + '.json' + token;
  }
  else {
    deleteUrl = url + '/temp_listings/' + pid + '.json' + token;
  }

  navigator.notification.confirm('Are you sure? Your data will be removed!', onRemoveConfirm, 'Remove', 'No, Yes');
});

// go back to login page
$(document).on('click', '#login-btn', function(e) {
  e.preventDefault();
  goToUrl('../index.html');  // go to main board
});

// process confirmation
function onExitConfirm(button) {
  if (button == 2) {
    navigator.app.exitApp();
  }
}

// process confirmation
function onConfirm(button) {
  if (button == 2) {
    goToUrl(homePage, false);  // go to main board
  }
}

// process confirmation
function onRemoveConfirm(button) {
  if (button == 2) {
    deleteData(deleteUrl, 'remove');  // delete record
  }
}

// toggle page display
$(document).on('click', '#loc-nav', function(e) {
  reset_top('#pixi-loc', '#cat-top, #px-search');
});

// toggle menu state
$(document).on('click', '#cat-nav', function(e) {
  reset_top('#cat-top', '#pixi-loc, #px-search');
});

// toggle menu state
$(document).on('click', '#search-nav', function(e) {
  reset_top('#px-search', '#pixi-loc, #cat-top');
});

// toggle menu state
$(document).on('click', '#home-link', function(e) {
  reset_top('#px-search', '#pixi-loc, #cat-top, #px-search');
});

// reset top when selection is toggled
function reset_top(tag, str) {
  $(tag).toggle();
  $(str).hide(300);

  if ($('#pixi-loc').is(':visible') || $('#cat-top').is(':visible') || $('#px-search').is(':visible')) {
    $(".nearby-top").css('margin-top', '40px'); }
  else {
    $(".nearby-top").css('margin-top', '0'); 	
  }
}

// toggle profile state
$(document).on('click', '.edit-prof-btn', function(e) {
  $('#edit-profile').toggle();
});

// toggle profile state
$(document).on('click', '#edit-txn-addr', function(e) {
  $('.user-tbl, .addr-tbl').toggle();
});

// toggle spinner
function uiLoading(bool) {
  if (bool)
    $('body').addClass('ui-loading');
  else
    $('body').removeClass('ui-loading');
}

// toggle contact buttons
$(document).on('click', "#contact-btn", function (e) {
  var txt =  $('#content').val();

  if (txt.length > 0) {
    uiLoading(true);
    $(this).attr('disabled', 'disabled');

    // store form data
    var params = new Object();

    // set params
    params.post = { content: txt,  user_id: $('#user_id').val(), pixi_id: $('#pixi_id').val(), recipient_id: $('#recipient_id').val() };

    // set path
    var pxUrl = url + '/posts.json' + token;

    // post data
    postData(pxUrl, params, 'post');
  }
});

// reset pixi page after successful post
function resetPost (resFlg) {
  $("#contact-btn").removeAttr("disabled");

  if (resFlg) {
    $("#content").html('').val('');
    PGproxy.navigator.notification.alert("Your post was sent successfully.", function() {}, 'Post', 'Done');
  }
  else {
    PGproxy.navigator.notification.alert("Your post was not delivered.", function() {}, 'Post', 'Done');
  }
  uiLoading(false);
}

// toggle comment & comment buttons
$(document).on('click', "#comment-btn", function (e) {
  var txt =  $('#content').val();

  if (txt.length > 0) {
    uiLoading(true);
    $(this).attr('disabled', 'disabled');

    // store form data
    var params = new Object();

    // set params
    params.comment = { content: txt,  user_id: $('#user_id').val(), pixi_id: $('#pixi_id').val() };

    // set path
    var pxUrl = url + '/comments.json' + token;

    // post data
    postData(pxUrl, params, 'comment');
  }
});

// process reply btn 
$(document).on('click', "#reply-btn", function (e) {
  var txt =  $('#reply_content').val();
  var id = $(this).closest("li").attr('id');
  console.log('reply btn li = ' + id);

  if (txt.length > 0) {
    uiLoading(true);
    $(this).attr('disabled', 'disabled');

    // store form data
    var params = new Object();

    // set params
    params.id = id;
    params.post = { content: txt, user_id: $('#user_id').val(), pixi_id: $('#pixi_id').val(), recipient_id: $('#recipient_id').val() };

    // set path
    var pxUrl = url + '/posts/reply.json' + token;

    // post data
    postData(pxUrl, params, 'reply');
  }
});

// submit pixi form
$(document).on("click", "#add-pixi-btn", function(e) {
  console.log('in submit pixi-form');
  uiLoading(true);

  $("#add-pixi-btn").attr("disabled","disabled");

  var imageURI = $('#smallImage').attr("src");
  var params = new Object();

  // set params
  params.temp_listing = { title: $('#title').val(), site_id: $('#site_id').val(), category_id: $('#category_id').val(),
    price: $('#price').val(), description: $('#description').val(), compensation: $('#salary').val(), year_built: $('#yr_built').val(),
    event_start_date: $('#start-date').val(), event_end_date: $('#end-date').val(), post_ip: usr.current_sign_in_ip, 
    event_start_time: $('#start-time').val(), event_end_time: $('#end-time').val(), start_date: new Date(), seller_id: usr.id };

  // push to server
  if (pxFormType == 'edit') {
    var pxUrl = tmpPath + '/' + pid + '.json' + token;
  }
  else {
    var pxUrl = tmpPath + '.json' + token;
  }

  uploadPhoto(imageURI, pxUrl, params);
  return false;
});

// complete post pixi process
function processPixiData(res) {

  if (res !== undefined) {
    console.log('post pixi success');
  }
  else {
    console.log('post pixi failed');
  }
}

// submit login form
$(document).on("submit", "#loginForm", function(e) {
  handleLogin(); // process login
  return false;
});

function handleLogin() {
  console.log('in handlelogin');
  uiLoading(true);

  //disable the button so we can't resubmit while we wait
  $("#signin-btn").attr("disabled","disabled");

  // set vars
  email = $("#email").val();
  pwd = $("#password").val();

  var fdata = $("#loginForm").serialize();
  var loginUrl = url + '/api/v1/sessions.json';

  // process login
  postData(loginUrl, fdata, 'login');
}

// complete login process
function processLogin(res, resFlg) {
  if(resFlg) {
    if(res.token.length > 0) {
      console.log('login success');

      //store credentials on device
      window.localStorage["email"] = email;
      window.localStorage["password"] = pwd;
      window.localStorage["token"] = res.token;

      // go to main board
      goToUrl("./html/listings.html", false);
    }
    else {
      console.log('login failed');
      $("#signin-btn").removeAttr("disabled");
      PGproxy.navigator.notification.alert("No token found", function() {}, 'Login', 'Done');
    }
  }
  else {
    console.log('login failed');
    $("#signin-btn").removeAttr("disabled");
    PGproxy.navigator.notification.alert("Login failed", function() {}, 'Login', 'Done');
  }
  uiLoading(false);
}

// check if credentials are already set locally
function checkPreAuth() {
  console.log("checkPreAuth");
  var $form = $("#loginForm");

  if(window.localStorage["email"] != undefined && window.localStorage["password"] != undefined) {
    console.log("in local storage");

    $("#email", $form).val(window.localStorage["email"]);
    $("#password", $form).val(window.localStorage["password"]);

    // process login
    handleLogin();
  }
}

// open camera page
$(document).on('click', "#add-pixi-link", function (e) {
  pxFormType = '';
  goToUrl("../html/new_temp_listing.html", false);
});


// edit listing
$(document).on('click', "#edit-pixi-btn", function (e) {
  pxFormType = 'edit'; 
  goToUrl("../html/new_temp_listing.html", false);
});

// add autocomplete for location fields
$(document).on('keyup', '#site_name, #buyer_name', function (e, ui) {
  var $this = $(this);
  if ($.mobile.activePage.attr("id") == 'formapp') {
    var searchUrl = url + "/loc_name.json" + token;
  }
  else {
    var searchUrl = url + "/buyer_name.json" + token;
  }
  processAutocomplete(searchUrl, $this);
}); 

// process autocomplete logic
function processAutocomplete(url, $this) {
  var nxtID = $this.next();
  var text = $this.val();
  var $sugList = $(".suggestions");

  if(text.length < 3) {
    $sugList.html('');
  }
  else {
    loadData(url, 'autocomplete', {search:text});
  }
}

// process click on autocomplete site name 
$(document).on('click', ".ac-item", function(e) {
  e.preventDefault();

  var sid = $(this).attr("data-res-id");
  var sname = $(this).html();
  console.log('sid = ' + sid);
  console.log('sname = ' + sname);

  // set fld values
  if ($.mobile.activePage.attr("id") == 'formapp') {
    $('#site_id').val(sid);
    $('#site_name').val(sname);
  }
  else {
    $('#buyer_id').val(sid);
    $('#buyer_name').val(sname);
  }
  $('.suggestions').html('');  // clear list
});

// toggle pixi path
function togglePath() {
  if (myPixiPage == 'draft') {
    pxPath = tmpPath + '/';
  }
  else {
    pxPath = listPath + '/';
  }
}

// process click on board pix
$(document).on('click', ".bd-item, .pixi-link", function(e) {
  e.preventDefault();

  // reset vars
  pid = $(this).attr("data-pixi-id");
  console.log('pid = ' + pid);

  // set correct path 
  togglePath();

  if ( pid !== undefined && pid != '' ) {
    goToUrl(listPage);
  }
});

// process click on invoice item
$(document).on('click', ".inv-item", function(e) {
  e.preventDefault();

  pid = $(this).attr("data-inv-id");
  console.log('pid = ' + pid);

  if ( pid !== undefined && pid != '' ) {
    goToUrl('../html/invoice.html', false);
  }
});

// set data for txn form page
$(document).on("pageinit", "#txn-form", function(event) {
  var invUrl = url + '/invoices/' + pid + '.json' + token;
  
  // load inv data
  loadData(invUrl, 'txn'); 
});

// parameter for show listing page
$(document).on("pageinit", "#show_listing, #comment-page", function(event) {
  var pixiUrl = pxPath + pid + '.json' + token;
  
  // load pixi data
  loadData(pixiUrl, 'pixi'); 
});

// parameter for signup page
$(document).on("pageinit", "#signup", function(event) {
  var data;
  loadUserPage(data, true);
  pixPopup("#popupPix2");  // load popup page
});

// parameter for show listing page
$(document).on("pageinit", "#show-invoice", function(event) {
  $('#popupInfo').popup({ history: false });  // clear popup history to prevent app exit
  getInvoice();
});

// process register click
$(document).on("click", "#register-btn", function(e) {
  console.log('register btn');
  e.stopImmediatePropagation();
  e.preventDefault();

  // open page
  goToUrl('./html/register.html');
  return false;
});

// get invoice data
function getInvoice() {
  var invUrl = url + '/invoices/' + pid + '.json' + token;
  
  // load inv data
  loadData(invUrl, 'invpg'); 
}

// process px done click
$(document).on("click", "#px-done-btn", function(e) {
  e.preventDefault();
  goToUrl(homePage);
});

// process menu click
$(document).on("click", ".sl-menu", function(e) {
  e.preventDefault();

  href = $(this).attr("href");
  if ( href !== undefined && href !== '' ) {

    // check for invoice form page
    if ($.mobile.activePage.attr("id") == 'inv-form' && $(this).attr("id") == 'bill-menu-btn') {
      setInvForm(); 
    } 

    if ($(this).attr("id") == 'pay-menu-btn') {
      pid = usr.unpaid_received_invoices[0].id;
      console.log('sl menu pid = ' + pid);
    }

    // open page
    goToUrl(href, false);
  }
});

var menu = [
  { title: 'Home', href: homePage, icon: '../img/home_button_blue.png', id: 'home-menu-btn' },
  { title: 'Send Bill', href: '../html/invoice_form.html', icon: '../img/162-receipt.png', id: 'bill-menu-btn' },
  { title: 'Pay Bill', href: '../html/invoice.html', icon: '../img/rsz_pixipay_wings_blue.png', id: 'pay-menu-btn' },
  { title: 'MY STUFF', href: '#', icon: '', id: 'menu-divider' },
  { title: 'My Pixis', href: '../html/pixis.html', icon: '../img/pixi_wings_blue.png', id: 'pixis-menu-btn' },
  { title: 'My Posts', href: '../html/posts.html', icon: '../img/09-chat-2.png', id: 'posts-menu-btn' },
  { title: 'My Invoices', href: '../html/invoices.html', icon: '../img/bill.png', id: 'inv-menu-btn' },
  { title: 'My Accounts', href: '../html/accounts.html', icon: '../img/190-bank.png', id: 'acct-menu-btn' },
  { title: 'Settings', href: '../html/user_form.html', icon: '../img/19-gear.png', id: 'settings-menu-btn' },
  { title: 'Sign out', href: '../index.html', icon: '../img/logout.png', id: 'signout-menu-btn' },
];

// show menu
$(document).on("pageshow", function(event) {
  var items = '', // menu items list
    ul = $(".mainMenu:empty");  // get "every" mainMenu that has not yet been processed
  
  // build menu items
  for (var i = 0; i < menu.length; i++) {
    var item_str = '';

    if(menu[i].id == 'menu-divider') {
      items += '<li data-role="list-divider" data-mini="true">' + menu[i].title + '</li>';
      continue;
    }

    // if user exists then toggle invoice-related items based on counts
    if(usr !== undefined) { 
      if(menu[i].id == 'bill-menu-btn') {
        if (usr.active_listings.length < 1) {
          console.log('usr has no active pixis');
          continue;
	}

        if (usr.bank_accounts.length < 1) {
	  menu[i].href = '../html/accounts.html';
	}
      }

      if(usr.unpaid_invoice_count < 1 && menu[i].id == 'pay-menu-btn') {
        console.log('usr has no unpaid invoices');
        continue;
      }

      // add post count if posts menu item
      if(menu[i].id == 'posts-menu-btn') {
        item_str = '<span class="ui-li-count">' + usr.unread_count + '</span>';
      }
    }

    // add menu item
    items += '<li data-mini="true"><a href="' + menu[i].href + '" id="' + menu[i].id 
      + '" class="sl-menu"><img class="ui-li-icon" src="' + menu[i].icon + '">' + menu[i].title + item_str + '</a></li>'; 
  }

  // append items
  ul.append(items).listview('refresh');
});

// check JSON returned booleans
function parseBoolean(str) {
  return /true/i.test(str);
}

// process menu click
$(document).on("click", "#show-cmt, #show-pixi", function(e) {
  uiLoading(true);  // toggle spinner

  // show pixi comments
  if ($.mobile.activePage.attr("id") !== 'comment-page') 
    { goToUrl('../html/comments.html'); }  
  else
    { goToUrl(listPage); }  
 
  return false;
});

function pixPopup(fld) {
  console.log('in pixPopup');
  var pop_str = '<ul data-role="listview" data-icon="false" data-inset="true" style="min-width:210px;" data-theme="a">'
    + '<li data-role="divider" data-theme="b">Choose Photo Source</li>'
    + '<li data-theme="a"><a href="#" id="camera"><img src="../img/rsz_camera_256.png">Camera</a></li>'
    + '<li data-theme="a"><a href="#" id="gallery"><img src="../img/rsz_gallery_icon.png">Gallery</a></li>'
    + '<li data-theme="a"><a href="#" id="album"><img src="../img/rsz_photoalbum.png">Photo Album</a></li></ul>';

  $(fld).append(pop_str).trigger('create');
  $(fld).popup({ history: false });  // clear popup history to prevent app exit
}

function curDate() {
  var d = new Date();
  var month = d.getMonth()+1;
  var day = d.getDate();

  var output = ((''+month).length<2 ? '0' : '') + month + '/' +
        ((''+day).length<2 ? '0' : '') + day + '/' + d.getFullYear(); 

  return output;
}
