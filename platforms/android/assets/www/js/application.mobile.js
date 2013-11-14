//var url = 'http://localhost:3000';
var url = 'http://10.0.2.2:3000';
var listPath = url + '/listings';
var pixPath = url + '/pictures/';
var pxPath = listPath + '/';
var catPath = pxPath + 'category.json' ;
var locPath = pxPath + 'location.json' ;
var token, usr;

$(function(){
  // ajax setup
  $.ajaxSetup({
    type: 'POST',
    headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') },
    dataType: 'json'
  });
});

// reset board images to align properly
$(document).on('pageshow', '#listapp', function() {

  // initialize infinite scroll
  if( $('#px-container').length > 0 ) {
    console.log('listapp pageshow');
    load_masonry('#px-nav', '#px-nav a', '#pxboard .item', null); 
  }
});

// change page
function goToUrl(pxUrl, rFlg) {
  $.mobile.changePage( pxUrl, { transition: "none", reverse: false, reloadPage: rFlg, changeHash: false });
}

// load initial board
$(document).on('pageinit', '#listapp', function() {
  console.log('listapp pageinit');

  // set time ago format
  $("time.timeago").timeago();

  // set token string for authentication
  token = '?auth_token=' + window.localStorage["token"];
  var listUrl = listPath + '.json' + token;

  // load main board
  loadBoard(listUrl);

  // initialize infinite scroll
  load_masonry('#px-nav', '#px-nav a.nxt-pg', '#pxboard .item', 1);
});

// get pixi picture
function getPixiPic(pic, style) {
  var img_str = '<img style="' + style + '" src="' + url + pic.photo_url + '">';
  return img_str
}

// load main board based on given url
function loadBoard(listUrl) {
  var item_str, post_dt;
  console.log('listUrl = ' + listUrl);

  $.getJSON(listUrl, function(data) {
    if (data == undefined) {
      item_str = '<div class="center-wrapper">No pixis found for the specified location and/or category.</div>'

      // load msg
      $("#px-container").append(item_str);
    } 
    else {
      // store user
      usr = data.user;
      console.log('usr = ' + usr.name);

      // load pixis
      $.each(data.listings, function(index, item) {

        // build pixi item string
	post_dt = $.timeago(item.updated_at);
        item_str = '<div class="item pic-item"><div class="center-wrapper"><a href="' 
	  + pxPath + item.pixi_id + '.json' + token + '" data-ajax="false">'  
	  + getPixiPic(item.pictures[0], 'height:120px; width:120px;') + '</a>'
	  + '<div class="sm-top mbdescr">' + item.title + '</div>'
	  + '<div class="sm-top mgdescr">' + '<div class="item-cat pixi-grey-bkgnd">' 
	  + '<a href="' + catPath + token + '&cid=' + item.category_id + '"' + ' class="pixi-cat"' + ' data-cat-id=' + item.category_id + '>'
	  + item.category_name + '</a></div>' 
	  + '<div class="item-dt pixi-grey-bkgnd">' + post_dt + '</div></div></div></div>';

        // build masonry blocks for board
        $("#px-container").append(item_str);
      });

      // load categories
      if (data.categories !== undefined) {
        loadList(data.categories, '#category_id', 'Category');
      }
    }  
  }); 

  // turn off spinner
  uiLoading(false);
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
    $(".nearby-top").css('margin-top', '40px'); }
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
  console.log('submit loginForm');

  // process login
  handleLogin();

  return false;
});

function handleLogin() {
  console.log('in handlelogin');

  //disable the button so we can't resubmit while we wait
  $("#signin-btn").attr("disabled","disabled");

  uiLoading(true);

  var $form = $("#loginForm");
  var fdata = $form.serialize();
  var email = $("#email").val();
  var pwd = $("#password").val();
  var loginUrl = url + '/api/v1/sessions.json';

  $.post(loginUrl, fdata, function(res) {
  
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
      uiLoading(false);
      console.log('login failed');
      PGproxy.navigator.notification.alert("Your login failed", function() {}, 'Login', 'Done');
    }

    $("#signin-btn").removeAttr("disabled");
    uiLoading(false);
  },"json").fail(function (a, b, c) {
        PGproxy.navigator.notification.alert(b + '|' + c, function() {}, 'Login', 'Done');
  	uiLoading(false);
        console.log(b + '|' + c);
  });
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

$(document).on('pageshow', '[data-role=page]',function (event, ui) {
  $("#" + event.target.id).find("[data-role=panel]").load("./html/panel.html", function(){
    $("#" + event.target.id).find("[data-role=panel]").panel()
  });
});

// load dropdown list based on given url
function loadList(list, fld, descr) {
  var item_str = '<option value="">' + 'Select ' + descr + '</option>';
  var len = list.length;

  console.log('Rows found: ' + len);

  for (var i = 0; i < len; i++){
    item_str += "<option value='" + list[i].id + "'>" + list[i].name_title + "</option>";
  }  

  // update field
  $(fld).append(item_str).selectmenu().selectmenu('refresh', true);
}
