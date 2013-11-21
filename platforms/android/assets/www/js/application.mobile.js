//var url = 'http://localhost:3000';
var url = 'http://10.0.2.2:3000';
var listPath = url + '/listings';
var pixPath = url + '/pictures/';
var pxPath = listPath + '/';
var listPage = '../html/show_listing.html';
var catPath = pxPath + 'category.json' ;
var locPath = pxPath + 'location.json' ;
var pid, token, usr, categories;

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
    //load_masonry('#px-nav', '#px-nav a', '#pxboard .item', null); 
  }
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
  //load_masonry('#px-nav', '#px-nav a.nxt-pg', '#pxboard .item', 1);
});

// load pixi form data
$(document).on('pageinit', '#formapp', function() {
  if (categories !== undefined) {
    loadList(categories, '#category_id', 'Category');
  }
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
  //console.log('listUrl = ' + listUrl);

  if(resFlg) {
    // load pixis
    $.each(data.listings, function(index, item) {

        // build pixi item string
	post_dt = $.timeago(item.updated_at);
	localUrl = 'data-pixi-id="' + item.pixi_id + '"';
	//console.log('localUrl = ' + localUrl);

        item_str += '<div class="item"><div class="center-wrapper">'
	  + '<a href="#" ' + localUrl + ' class="bd-item" data-ajax="false">'  
	  + getPixiPic(item.pictures[0].photo_url, 'height:120px; width:120px;') + '</a>'
	  + '<div class="sm-top mbdescr">' + item.title + '</div>'
	  + '<div class="sm-top mgdescr">' + '<div class="item-cat pixi-grey-bkgnd">' 
	  + '<a href="' + catPath + token + '&cid=' + item.category_id + '"' + ' class="pixi-cat"' + ' data-cat-id=' + item.category_id + '>'
	  + item.category_name + '</a></div>' 
	  + '<div class="item-dt pixi-grey-bkgnd">' + post_dt + '</div></div></div></div>';
    });

    // build masonry blocks for board
    $container.imagesLoaded(function(){
      var $elem = $(item_str);
      $container.append($elem).masonry( 'appended', $elem, true).masonry('reloadItems');
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
}

// load data based on given url & display type
function loadData(listUrl, dType) {
  console.log('in loadData');
  var dFlg;

  $.getJSON(listUrl, function(data) {
    if (data == undefined) {
      dFlg = false;  // set flag
    } 
    else {
      usr = data.user;  // store user
      dFlg = true;  // set flag
    }  

    if (dType == 'board') 
      { loadBoard(data, dFlg); }
    else 
      { loadListView(data, dFlg); }
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

/*
$(document).on('pageinit', '[data-role=page]', function(event, ui) {
  $('<div>').attr({'id':'navpanel','data-role':'panel'}).appendTo($(this));
  $.mobile.activePage.find('#navpanel').panel();
  $(document).on('click', '#list', function(){   
    $.mobile.activePage.find('#navpanel').panel("open");       
  });
});
*/

// load dropdown list based on given url
function loadList(list, fld, descr) {
  var item_str = '<option value="">' + 'Select ' + descr + '</option>';
  var len = list.length;

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

// used to retrieve user data
function getUserData(val) {
  switch (val) {
    case 'id':
      return usr.id;
    case 'ip':
      return usr.post_ip;
    default:
      console.log('val not found; val= ' + val);
      break;
  }
}

// add autocomplete for location fields
$(document).on('keyup', '#site_name', function (e, ui) {
  var nxtID = $(this).next();
  var text = $(this).val();

  if(text.length < 3) {
    $(nxtID).html("");
    $(nxtID).hide('fast');
  }
  else {
    $.get(url + "/listings/loc_name.json" + token, {search:text}, function(res,code) {
      var str = "";

      for(var i=0, len=res.length; i<len; i++) {
	str += "<li><a href='#'>"+res[i]+"</a></li>";
      }

      $(nxtID).html(str);
      $(nxtID).show('fast');
    },"json");
  }
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
$(document).on("pageinit", "#show_listing", function(event) {
  var pixiUrl = pxPath + pid + '.json' + token
  console.log('pixiUrl => ' + pixiUrl);

  // get server data to build page
  $.getJSON(pixiUrl, function(data) {
    if (data !== undefined) {

      // set pixi header details
      var cstr = "<div class='show-pixi-bar' data-role='navbar'><ul>"
        + "<li><a href='#' id='show-pixi' data-theme='d' class='ui-btn-active' data-pixi-id='" + pid + "' data-mini='true'>Details</a></li>"
        + "<li><a href='#' id='show-cmt' data-theme='d' data-mini='true' data-pixi-id='" + pid + "'>Comments (" + data.comments.length 
	+ ")</a></li></ul></div>";
      $('#show-list-hdr').append(cstr).trigger("create");

      // show pixi details
      if ($.mobile.activePage.attr("id") == 'show_listing') 
        { showPixiPage(data); 
  	  console.log('in active pixiPage' );
	}  // load page data
      else
        { showCommentPage(data); } // load comment data
    }
  });
});

// process menu click
$(document).on("click", ".sl-menu", function(e) {
  e.preventDefault();

  href = $(this).attr("href");
  console.log('href = ' + href);

  if ( href !== undefined && href != '' ) {
    goToUrl(href);
  }
});

var menu = [
  { title: 'Home', href: './html/listings.html', icon: '../img/home_button_blue.png' },
  { title: 'Send Bill', href: './html/invoice.html', icon: '../img/162-receipt.png' },
  { title: 'Pay Bill', href: './html/payment.html', icon: '../img/rsz_money-bag-hi_blue-icon.png' },
  { title: 'My Pixis', href: './html/pixis.html', icon: '../img/pixi_wings_blue.png' },
  { title: 'My Posts', href: './html/posts.html', icon: '../img/09-chat-2.png' },
  { title: 'My Invoices', href: './html/invoices.html', icon: '../img/bill.png' },
  { title: 'My Accounts', href: './html/accounts.html', icon: '../img/190-bank.png' },
  { title: 'Settings', href: './html/settings.html', icon: '../img/19-gear.png' },
  { title: 'Sign out', href: './html/signout.html', icon: '../img/logout.png' },
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
  ul.append(items);
  ul.listview('refresh');
});

// open pixi page
function showPixiPage(data) {
  var px_str = '';

  // load title
  var tstr = "<h4 class='mbot major_evnt'>" + data.listing.title + "</h4>"
  $('#list_title').append(tstr);

  // load seller
  var seller_str = "<div class='sdescr'>Posted By: " + getPixiPic(data.listing.seller_photo, 'height:30px; width:30px;') 
    + ' ' + data.listing.seller_name + "</div>";
  $('#seller-name').append(seller_str);

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
  detail_str += '<div class="grey-text dt-descr mtop row">ID: ' + data.listing.id + ' | Posted: ' + data.listing.start_date 
    + ' | Updated: ' + data.listing.updated_at + '</div>'
  $('#pixi-details').append(detail_str);

  // check if listing owner
  if(data.listing.seller_id == usr.id) {
    var btn_str = "<a href='#' id='del-pixi-btn' data-role='button' data-inline='true'>Remove</a>" 
      + "<a href='#' id='edit-pixi-btn' data-role='button' data-inline='true' data-theme='b'>Edit</a>"; 

    $('#edit-pixi-details').append(btn_str); // show btns
  }
}

// open comment page
function showCommentPage (data) {

  // load comments
  $.each(data.comments, function(index, item) {
  });
}
