//var url = 'http://pixiboard.com';
var url = 'http://10.0.2.2:3000';
var listPath = url + '/listings';
var pixPath = url + '/pictures.json';
var tmpPath = url + '/temp_listings.json';
var pxPath = listPath + '/';
var listPage = '../html/show_listing.html';
var homePage = "../html/listings.html";
var catPath = pxPath + 'category.json' ;
var locPath = pxPath + 'location.json' ;
var email, pwd, pid, token, usr, categories;

$(function(){
  // ajax setup
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

// load initial board
$(document).on('pageinit', '#listapp', function() {

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
$(document).on('pageinit', '#formapp', function() {
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

  // load year fld
  var item_str = '<option default value="">' + 'Year' + '</option>';
  $("#yr_built").append(item_str);

  for (i = new Date().getFullYear(); i > 1930; i--)
    { $('#yr_built').append($('<option />').val(i).html(i)); }

  $("#yr_built").selectmenu().selectmenu('refresh', true);
  $('#popupPix').popup({ history: false });  // clear popup history to prevent app exit
});

// get pixi picture
function getPixiPic(pic, style) {
  var img_str = '<img style="' + style + '" src="' + url + pic + '">';
  return img_str
}

// load list view if resFlg else return not found
function loadListView(data, resFlg) {
  var $container = $('#pixi-list');
  var localUrl, post_dt, item_str = '';

  if(resFlg) {
    // load pixis
    $.each(data.listings, function(index, item) {
	post_dt = $.timeago(item.updated_at); // set post dt

        // build pixi item string
	localUrl = 'data-pixi-id="' + item.pixi_id + '"';

        item_str += "<li class='plist'>"
	  + '<a href="#" ' + localUrl + ' class="pending_title bd-item" data-ajax="false">'  
	  + getPixiPic(item.pictures[0].photo_url, 'height:100px; width:100px;')
	  + '<div class="pstr"><h6>' + item.short_title + '</h6></div>'
	  + '<p>' + item.site_name + '<br />' + item.category_name + ' | ' + post_dt + '</p></a></li>';
    });
  }
  else {
    // not found
    item_str = '<div class="center-wrapper">No pixis found.</div>'
  }

  // append items
  $container.append(item_str);
  $container.listview('refresh');
}

// load board if resFlg else return not found
function loadBoard(data, resFlg) {
  var $container = $('#px-container').masonry({ itemSelector : '.item', gutter : 1, isFitWidth: true, columnWidth : 1 });
  var item_str = '';
  var post_dt, localUrl;

  if(resFlg) {
    usr = data.user;  // store user

    // load pixis
    $.each(data.listings, function(index, item) {

        // build pixi item string
	post_dt = $.timeago(item.updated_at);
	localUrl = 'data-pixi-id="' + item.pixi_id + '"';

        item_str += '<div class="item"><div class="center-wrapper">'
	  + '<a href="#" ' + localUrl + ' class="bd-item" data-ajax="false">'  
	  + getPixiPic(item.pictures[0].photo_url, 'height:115px; width:115px;') + '</a>'
	  + '<div class="sm-top mbdescr">' + item.title + '</div>'
	  + '<div class="sm-top mgdescr">' + '<div class="item-cat pixi-grey-bkgnd">' 
	  + '<a href="' + catPath + token + '&cid=' + item.category_id + '"' + ' class="pixi-cat"' + ' data-cat-id=' + item.category_id + '>'
	  + item.category_name + '</a></div>' 
	  + '<div class="item-dt pixi-grey-bkgnd">' + post_dt + '</div></div></div></div>';
    });

    // build masonry blocks for board
    var $elem = $(item_str).css({ opacity: 0 });
    $container.imagesLoaded(function(){
      $elem.animate({ opacity: 1 });
      $container.append($elem).masonry('appended', $elem, true).masonry('reloadItems');
    });

    // load categories
    if (data.categories !== undefined) {
      categories = data.categories;
      loadList(data.categories, '#category_id', 'Category');
    }
  } 
  else {
    // not found
    item_str = '<div class="center-wrapper">No pixis found for this location and/or category.</div>'

    // load msg
    $container.append(item_str);
  }

  // turn off spinner
  uiLoading(false);
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
        processLogin(res);
	break;
      case 'pixi':
        processPixiData(res);
	break;
      default:
        return res;
	break;
    }
  },"json").fail(function (a, b, c) {
  	uiLoading(false);
        PGproxy.navigator.notification.alert(b + ' | ' + c, function() {}, 'Error', 'Done');
        console.log(b + ' | ' + c);
  });
}

// load data based on given url & display type
function loadData(listUrl, dType, params) {
  console.log('in loadData: ' + listUrl);
  var dFlg;

  // turn on spinner
  uiLoading(true);

  // set params
  params = params || {};

  $.getJSON(listUrl, params, function(data) {
    if (data == undefined) {
      dFlg = false;  // set flag
    } 
    else {
      dFlg = true;  // set flag
    }  

    // load data based on display type
    switch (dType) {
      case 'board':
        loadBoard(data, dFlg); 
	break;
      case 'list':
	return data;
	break;
      case 'autocomplete':
        loadResults(data, dFlg);
	break;
      case 'pixi':
        loadPixiPage(data, dFlg);
	break;
      case 'view':
        loadListView(data, dFlg); 
	break;
      default:
	break;
    }
  }).fail(function (a, b, c) {
        PGproxy.navigator.notification.alert(b + '|' + c, function() {}, 'Load Data', 'Done');
  	uiLoading(false);
        console.log(b + '|' + c);
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

// confirm cancellation
$(document).on('click', '#px-cancel', function(e) {
  e.preventDefault();
  navigator.notification.confirm('Are you sure? All changes will be lost!', onConfirm, 'Cancel', 'No, Yes');
});

function onConfirm(button) {
  if (button == 2) {
    goToUrl(homePage, false);  // go to main board
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

// toggle comment & comment buttons
$(document).on('click', "#comment-btn, #contact-btn", function (e) {
  uiLoading(true);
  $(this).parent().attr('disabled', 'disabled');
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
  uploadPhoto(imageURI, tmpPath + token, params);

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
  console.log('submit loginForm');

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
function processLogin(res) {
  
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
    PGproxy.navigator.notification.alert("Your login failed", function() {}, 'Login', 'Done');
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

// load dropdown list based on given url
function loadList(list, fld, descr) {
  var item_str = '<option value="">' + 'Select ' + descr + '</option>';
  var len = list.length;
  console.log('loadList = ' + list[0].name_title);

  // load list as options for select
  for (var i = 0; i < len; i++){
    item_str += "<option value='" + list[i].id + "'>" + list[i].name_title + "</option>";
  }  

  // update field
  $(fld).append(item_str).selectmenu().selectmenu('refresh', true);
}

// open camera page
$(document).on('click', "#add-pixi-link", function (e) {
  console.log("add-pixi-link");
  goToUrl("../html/new_temp_listing.html", false);
});

// add autocomplete for location fields
$(document).on('keyup', '#site_name', function (e, ui) {
  var nxtID = $(this).next();
  var text = $(this).val();
  var searchUrl = url + "/loc_name.json" + token;
  var $sugList = $(".suggestions");

  if(text.length < 3) {
    $sugList.html('');
  }
  else {
    loadData(searchUrl, 'autocomplete', {search:text});
  }
}); 

// process results
function loadResults(res, dFlg) {
  var $sugList = $(".suggestions");
  if (res !== undefined) {
    var str = "";
    for(var i=0, len=res.length; i<len; i++) {
	str += "<li><a href='#' class='ac-item' data-site-id='" + res[i].id + "'>" + res[i].name + "</a></li>";
    }
    $sugList.html(str);
    //$sugList.listview("refresh"); // update list
  } 
  uiLoading(false);
}

// process click on autocomplete site name 
$(document).on('click', ".ac-item", function(e) {
  e.preventDefault();

  var sid = $(this).attr("data-site-id");
  var sname = $(this).html();
  console.log('sid = ' + sid);
  console.log('sname = ' + sname);

  // set fld values
  $('#site_id').val(sid);
  $('#site_name').val(sname);
  $('.suggestions').html('');  // clear list
});

// process click on board pix
$(document).on('click', ".bd-item", function(e) {
  e.preventDefault();

  pid = $(this).attr("data-pixi-id");
  console.log('pid = ' + pid);

  if ( pid !== undefined && pid != '' ) {
    goToUrl(listPage);
  }
});

// parameter for show listing page
$(document).on("pageinit", "#show_listing, #comment-page", function(event) {
  var pixiUrl = pxPath + pid + '.json' + token
  console.log('pixiUrl => ' + pixiUrl);
  
  // load pixi data
  loadData(pixiUrl, 'pixi'); 
});

// process pixi page display
function loadPixiPage(data, resFlg) {
  if (resFlg) {

    // show pixi details
    if ($.mobile.activePage.attr("id") == 'show_listing') 
      { showPixiPage(data); }  // load page data
    else
      { showCommentPage(data); } // load comment data
  }
  else {
    console.log('pixi page load failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'View Pixi', 'Done');
  }
}

// process menu click
$(document).on("click", ".sl-menu", function(e) {
  e.preventDefault();

  href = $(this).attr("href");
  if ( href !== undefined && href != '' ) {
    goToUrl(href, false);
  }
});

var menu = [
  { title: 'Home', href: homePage, icon: '../img/home_button_blue.png' },
  { title: 'Send Bill', href: '../html/invoice.html', icon: '../img/162-receipt.png' },
  { title: 'Pay Bill', href: '../html/payment.html', icon: '../img/rsz_money-bag-hi_blue-icon.png' },
  { title: 'My Pixis', href: '../html/pixis.html', icon: '../img/pixi_wings_blue.png' },
  { title: 'My Posts', href: '../html/posts.html', icon: '../img/09-chat-2.png' },
  { title: 'My Invoices', href: '../html/invoices.html', icon: '../img/bill.png' },
  { title: 'My Accounts', href: '../html/accounts.html', icon: '../img/190-bank.png' },
  { title: 'Settings', href: '../html/settings.html', icon: '../img/19-gear.png' },
  { title: 'Sign out', href: '../html/signout.html', icon: '../img/logout.png' },
];

// show menu
$(document).on("pageshow", function(event) {
  var items = '', // menu items list
    ul = $(".mainMenu:empty");  // get "every" mainMenu that has not yet been processed

  for (var i = 0; i < menu.length; i++) {
    items += '<li data-mini="true"><a href="' + menu[i].href + '" class="sl-menu"><img class="ui-li-icon" src="' + menu[i].icon + '">' 
      + menu[i].title + '</a></li>';
  }

  // append items
  ul.append(items).listview('refresh');
});

// open pixi page
function showPixiPage(data) {
  var px_str = '';

  // set pixi header details
  var cstr = "<div class='show-pixi-bar' data-role='navbar'><ul>"
    + "<li><a href='#' id='show-pixi' data-theme='d' class='ui-btn-active' data-pixi-id='" + pid + "' data-mini='true'>Details</a></li>"
    + "<li><a href='#' id='show-cmt' data-theme='d' data-mini='true' data-pixi-id='" + pid + "'>Comments (" + data.comments.length 
    + ")</a></li></ul></div>";
  $('#show-list-hdr').append(cstr).trigger("create");

  // load title
  var tstr = "<h4 class='mbot major_evnt'>" + data.listing.title + "</h4>"
  $('#list_title').append(tstr);

  // load seller
  var seller_str = "<div class='sdescr'>Posted By: " + getPixiPic(data.listing.seller_photo, 'height:30px; width:30px;') 
    + ' ' + data.listing.seller_name + "</div>";
  $('#seller-name').append(seller_str);

  // load post values
  $('#user_id').val(data.user.id);
  $('#seller_id').val(data.listing.seller_id);
  $('#pixi_id').val(data.listing.pixi_id);

  // load pix
  $.each(data.listing.pictures, function(index, item) {
    px_str += getPixiPic(item.photo_url, 'height:200px; width:100%;');
  });

  // load slider
  $('.bxslider').append(px_str).bxSlider({ controls: false, pager: false, mode: 'fade' });

  // load details
  var detail_str = "<span class='mtop inv-descr'>DETAILS:</span><br /><div class='inv-descr'>" + data.listing.summary + "<br />";
  if(data.listing.price !== undefined) {
    var prc = parseFloat(data.listing.price).toFixed(2);
    detail_str += "<div class='mtop'>Price: <span class='pstr'>$" + prc + "</span></div></div>"
  }

  // add pixi footer
  var post_dt = $.timeago(data.listing.updated_at); // set post dt
  detail_str += '<div class="grey-text dt-descr mtop row">ID: ' + data.listing.pixi_id + '<br />Posted: ' + data.listing.start_dt 
    + ' | Updated: ' + post_dt + '</div>'
  $('#pixi-details').append(detail_str);

  // check if listing owner
  if(data.listing.seller_id == usr.id) {
    var btn_str = "<a href='#' id='del-pixi-btn' data-role='button' data-inline='true'>Remove</a>" 
      + "<a href='#' id='edit-pixi-btn' data-role='button' data-inline='true' data-theme='b'>Edit</a>"; 
    $('#edit-pixi-details').append(btn_str); // show btns
  }
  
  uiLoading(false);  // toggle spinner
}

// process menu click
$(document).on("click", "#show-cmt, #show-pixi", function(e) {
  e.preventDefault();

  // show pixi comments
  if ($.mobile.activePage.attr("id") !== 'comment-page') 
    { goToUrl('../html/comments.html'); }  
  else
    { goToUrl('../html/show_listing.html'); }  
});

// open comment page
function showCommentPage(data) {
  console.log('in show comment page');
  var item_str = '<ol class="posts">';
  var post_dt;

  // set pixi header details
  var cstr = "<div class='show-pixi-bar' data-role='navbar'><ul>"
    + "<li><a href='#' id='show-pixi' data-theme='d' data-pixi-id='" + pid + "' data-mini='true'>Details</a></li>"
    + "<li><a href='#' id='show-cmt' data-theme='d' class='ui-btn-active' data-mini='true' data-pixi-id='" + pid + "'>Comments (" 
    + data.comments.length + ")</a></li></ul></div>";
  $('#show-list-hdr').append(cstr).trigger("create");

  // load post values
  $('#user_id').val(data.user.id);
  $('#pixi_id').val(data.listing.pixi_id);

  // load comments
  if (data.comments.length > 0) {
    $.each(data.comments, function(index, item) {
      post_dt = $.timeago(item.created_at); // set post dt
      item_str += '<li id="' + item.id + '"><div class="cal-size no-left">'
        + "<div class='sender'>" + item.sender_name + "<span class='timestamp'>"
	+ "Posted " + post_dt + "</span></div>"
	+ "<span class='fcontent'>" + item.content + "</span></div>"
	+ "<div class='nav-right'>"
        + "<div class='sdescr'>" + getPixiPic(item.user.photo, 'height:30px; width:30px;') 
        + ' ' + item.sender_name + "</div></div><div class='clear-all'></div></li>";
    });
    item_str += '</ol>';
  }
  else {
    item_str = "<div class='center-wrapper'>No comments found.</div>";
  }

  // append content
  $('#comment-item').append(item_str);
  uiLoading(false);  // toggle spinner
}
