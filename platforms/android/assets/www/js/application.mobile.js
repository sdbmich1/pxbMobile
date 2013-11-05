// ajax setup
$(function(){
  $.ajaxSetup({
    type: 'POST',
    headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
    dataType: 'json'
  });
});

$(document).on("pageshow","#loginPage",function() {
  console.log("pageshow run");
  //checkPreAuth();
});

// reset board images to align properly
$(document).on('pagebeforeshow', '#list', function() {

  // load board on doc ready
  if( $('#px-container').length > 0 ) {
    resetBoard();
  }
});

// change page
function goToUrl(url, rFlg) {
  $.mobile.changePage( url, { transition: "none", reverse: false, reloadPage: rFlg, changeHash: false });
}

// load initial board
$(document).on('pageinit', '#listapp', function() {

  // initialize infinite scroll
  if( $('#px-container').length > 0 ) {
    initScroll('#px-container', '#px-nav', '#px-nav a', '#pxboard .item', null); 
  }
});

$(document).on('pageinit', '#formapp', function() {

  // initialize slider
  load_slider(false);

  // set tab
  if( $('#show-pixi').length > 0 ) {
    $('#show-pixi').addClass('ui-btn-active');
  }
});

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

// remove header icons
$(document).ready(function(){
  $('a[data-theme="app-bar"], a[data-theme="app-loc"]').find('.ui-icon').remove();
});

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

function reset_top(tag, str) {
  $(tag).toggle();
  $(str).hide(300);

  if ($('#pixi-loc').is(':visible') || $('#cat-top').is(':visible') || $('#px-search').is(':visible')) {
    $(".nearby-top").css('margin-top', '50px'); }
  else {
    $(".nearby-top").css('margin-top', '0'); 	
  }
}

// toggle menu state
$(document).on('click', '#show-pixi, #show-cmt', function(e) {
  $('.item-descr, .list-ftr, #px-pix, #comment_form, #post_form, #edit-pixi-btn').toggle();
});

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

// toggle comment & comment buttons
$(document).on('click', "#comment-btn, #contact-btn", function (e) {
  uiLoading(true);
  $(this).parent().attr('disabled', 'disabled');
});

// submit login form
$(document).on("submit", "#loginForm", function(e) {

  //prevent the default submission of the form
  //e.preventDefault();
  PGproxy.navigator.notification.alert("submit login", function() {}, 'Submit', 'Done');

  // process login
  handleLogin();

  return false;
});

function handleLogin() {

  //disable the button so we can't resubmit while we wait
  $("#signin-btn").attr("disabled","disabled");

  uiLoading(true);

  var $form = $("#loginForm");
  var fdata = $form.serialize();
  var email = $("#email").val();
  var pwd = $("#password").val();
  //var url = 'http://localhost:3000';
  var url = 'http://10.0.2.2:3000';
  var loginUrl = url + '/api/v1/sessions.json';

  $.post(loginUrl, fdata, function(res) {
    PGproxy.navigator.notification.alert("fdata = " + fdata, function() {}, 'Login', 'Done');
  
    if(res.token.length > 0) {
      console.log('login success');
      PGproxy.navigator.notification.alert("Your login succeeded", function() {}, 'Login', 'Done');

      //store credentials on device
      window.localStorage["email"] = email;
      window.localStorage["password"] = pwd;
      window.localStorage["token"] = res.token;
      //goToUrl("./html/listings.html", false);
      window.location.href = './html/listings.html';
    }
    else {
      console.log('login failed');
      PGproxy.navigator.notification.alert("Your login failed", function() {}, 'Login', 'Done');
      goToUrl("./html/signup.html", false);
    }

    $("#signin-btn").removeAttr("disabled");
    uiLoading(false);
  },"json").fail(function (a, b, c) {
        PGproxy.navigator.notification.alert(b + '|' + c, function() {}, 'Login', 'Done');
        console.log(b + '|' + c);
      });
}

function checkPreAuth() {
  console.log("checkPreAuth");
  PGproxy.navigator.notification.alert("checkPreAuth", function() {}, 'Login', 'Done');
  var $form = $("#loginForm");

  if(window.localStorage["email"] != undefined && window.localStorage["password"] != undefined) {
    PGproxy.navigator.notification.alert("inLocalStorage", function() {}, 'Storage', 'Done');
    $("#email").val(window.localStorage["email"]);
    $("#password").val(window.localStorage["password"]);

    handleLogin();
  }
}
