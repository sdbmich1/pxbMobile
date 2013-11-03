$(document).on('pageshow', '#app, #formapp', function() {
  if ($('.fld').length > 0){ 
    $(".fld").css('background-color', '#FFF');
  }

  // repaint file fields
  if( $('.cabinet').length > 0 ) {
    SI.Files.stylizeAll();
  }
});

$(document).on('pagebeforeshow', '#list', function() {

  // load board on doc ready
  if( $('#px-container').length > 0 ) {
    resetBoard();
  }
});

function goToUrl(url, rFlg) {
  $.mobile.changePage( url, { transition: "none", reverse: false, reloadPage: rFlg, changeHash: false });
}

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
  e.preventDefault();

  //disable the button so we can't resubmit while we wait
  $("#signin-btn").attr("disabled","disabled");

  var $this = $(this);
  var u = $("#email").val();
  var p = $("#password").val();
  var url = "http://10.0.0.2:3000"; // site url
  var loginUrl = url + '/users/sign_in';
  var fdata = $this.serialize();

  $.ajax({
    type:  'POST',
    url:   loginUrl,
    dataType: 'jsonp',
    data:  fdata,
    jsonpCallback: callback,
    jsonp: false,
    success: function(response, textStatus, jqXHR){
      if(response.exists){
	console.log(response.access_token);
	//window.localStorage.setItem("user", JSON.stringify({"name": response.name, "id": response.id, "token":response.access_token}, null));
      }
    },
    error: function (xhr, ajaxOptions, thrownError) {
      console.log("Error: " + xhr.status + "\n" +
            "Message: " + xhr.statusText + "\n" +
	    "Response: " + xhr.responseText + "\n" + thrownError);
    }
  });
});

function callback() {
}
