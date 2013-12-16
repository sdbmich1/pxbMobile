var states_str = '';

// load data based on given url & display type
function loadData(listUrl, dType, params) {
  console.log('in loadData: ' + listUrl);
  var dFlg;

  // turn on spinner
  uiLoading(true);

  // set params
  params = params || {};

  // get data from server
  $.getJSON(listUrl, params, function(data) {
    if (data == undefined) {
      dFlg = false; }
    else {
      dFlg = true; }

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
      case 'state':
        loadStates(data, dFlg);
	break;
      case 'pixi':
        loadPixiPage(data, dFlg);
	break;
      case 'post':
        loadPosts(data, dFlg);
	break;
      case 'view':
        loadListView(data, dFlg); 
	break;
      case 'inv':
        loadInvList(data, dFlg); 
	break;
      case 'invpg':
        loadInvPage(data, dFlg); 
	break;
      case 'user':
        loadUserPage(data, dFlg); 
	break;
      case 'contact':
        loadContactPage(data, dFlg); 
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

// process results
function loadResults(res, dFlg) {
  var $sugList = $(".suggestions");
  if (res !== undefined) {
    var str = "";
    for(var i=0, len=res.length; i<len; i++) {
	str += "<li><a href='#' class='ac-item' data-site-id='" + res[i].id + "'>" + res[i].name + "</a></li>";
    }
    $sugList.html(str);
  } 
  uiLoading(false);
}

// set url for pixi list pages based on switch
function loadListPage(pgType, viewType) {
  switch(pgType){
  case 'draft':
    var pixiUrl = tmpPath + 'unposted.json' + token;
    break;
  case 'sold':
    var pixiUrl = pxPath + 'sold.json' + token;
    break;
  case 'active':
    var pixiUrl = pxPath + 'seller.json' + token;
    break;
  case 'sent':
    var pixiUrl = url + '/invoices.json' + token;
    break;
  case 'received':
    var pixiUrl = url + '/invoices/received.json' + token;
    break;
  case 'recv':
    var pixiUrl = url + '/posts.json' + token;
    break;
  case 'post':
    var pixiUrl = url + '/posts/sent.json' + token;
    break;
  case 'user':
    var pixiUrl = url + '/settings.json' + token;
    break;
  case 'contact':
    var pixiUrl = url + '/settings/contact.json' + token;
    break;
  }
  
  // load pixi data
  console.log('loadListPage pixiUrl => ' + pixiUrl);
  loadData(pixiUrl, viewType); 
}

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

// open pixi page
function showPixiPage(data) {
  var px_str = '';

  // check if pixi is in temp status - if not show navbar else hide post form 
  if(pxPath.indexOf("temp_listing") < 0) {

    // set pixi header details
    var cstr = "<div class='show-pixi-bar' data-role='navbar'><ul>"
      + "<li><a href='#' id='show-pixi' data-theme='d' class='ui-btn-active' data-pixi-id='" + pid + "' data-mini='true'>Details</a></li>"
      + "<li><a href='#' id='show-cmt' data-theme='d' data-mini='true' data-pixi-id='" + pid + "'>Comments (" + data.comments.length 
      + ")</a></li></ul></div>";
    $('#show-list-hdr').append(cstr).trigger("create");
  } 
  else {
    $('#post_form').hide();  // hide post form
  }

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
    detail_str += "<div class='mtop'>Price: <span class='pstr'>$" + prc + "</span></div></div>";
  } 
  else {
    if(data.listing.compensation !== undefined) {
      detail_str += "<div class='mtop'>Salary: <span class='pstr'>" + data.listing.compensation + "</span></div></div>";
    } 
  }
  $('#pixi-details').append(detail_str);

  // add pixi footer
  var post_dt = $.timeago(data.listing.updated_at); // set post dt
  var footer_str = '<div class="grey-text dt-descr mtop row">ID: ' + data.listing.pixi_id + '<br />Posted: ' + data.listing.start_dt 
    + ' | Updated: ' + post_dt + '</div>'
  $('#pixi-footer-details').append(footer_str);

  // check if listing owner to display edit buttons
  if(data.listing.seller_id == usr.id) {
    var stat_str = "<div class='px-status' data-status-type='" + data.listing.status + "'></div>";
    $('#edit-pixi-details').append(stat_str);
      
    $('#edit-tmp-pixi-btn').toggle();
    $('#submit-pixi-btn').toggle();

    if(data.listing.status == 'edit') {
      $('#cancel-pixi-btn').toggle();
    } else {
      $('#remove-pixi-btn').toggle();
    }
  }
  uiLoading(false);  // toggle spinner
}

// open post page
function loadPosts(data, resFlg) {
  var item_str = '<ul class="posts">';

  // load listview
  if(resFlg) {
    if (data.posts.length > 0) {
      $.each(data.posts, function(index, item) {
        var post_dt = $.timeago(item.created_at); // set post dt
        item_str += "<li id='" + item.id + "'><div class='sender'>";

        // display correct photo based on whether user is sender or recipient
        if(postType == 'recv') {
          item_str += getPixiPic(item.user.photo, 'height:30px; width:30px;') + ' ' + item.sender_name;
        }
        else {
          item_str += getPixiPic(item.recipient.photo, 'height:30px; width:30px;') + ' ' + item.recipient_name;
        }

	// display post content
	item_str += " | <span class='timestamp'>Posted " + post_dt + ".</span></div><div class='clear-all'></div><div class=''>"
 	  + "<div>RE: <a href='#' data-pixi-id='" + item.pixi_id + "' class='pixi-link'>" + item.pixi_title + "</a></div>"
	  + "<span>" + item.content + "</span>";
	
	// render post form if user
	if(usr.id == item.recipient_id) {
	  item_str += "<form id='post-frm' method='post' data-ajax='false'>" 
	    + '<div id="notice" style="display:none"></div><div id="form_errors"></div>'
	    + "<div class='clear-all'><table><tr><td class='cal-size'><div data-role='fieldcontain' class='ui-hide-label'>"
	    + "<input name='content' class='reply_content slide-menu' placeholder='Type reply message...' data-theme='a' /></div></td>"
	    + "<td><input type='submit' value='Send' data-theme='b' data-inline='true' id='reply-btn' data-mini='true'></td></tr></table>"
	    + "</div></form>";
	}
	item_str += "</div><div class='clear-all'></div></li>";
      });

      item_str += "</ul>";
    }
    else {
      item_str = '<div class="center-wrapper">No posts found.</div>'
    }
  }
  else {
    item_str = '<div class="center-wrapper">No posts found.</div>'
  }

  // render content
  $('#mxboard').append(item_str).trigger("create");
}

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
        + "<div class='sender'>" + getPixiPic(item.user.photo, 'height:30px; width:30px;') + " " + item.sender_name + " | <span class='timestamp'>"
	+ "Posted " + post_dt + "</span></div><br /><span class='fcontent'>" + item.content + "</span></div></li>";
    });
    item_str += '</ol>';
  }
  else {
    item_str = "<li class='center-wrapper'>No comments found.</li>";
  }

  // append content
  $('#comment-item').append(item_str);
  uiLoading(false);  // toggle spinner
}

// load user name & email if needed
function showNameEmail(data, showFlg) {
  var fname = '', lname = '', email = '';

  if (data !== undefined) {
    fname = data.first_name || '';
    lname = data.last_name || '';
    email = data.email || '';
  }

  var name_str = "<tr><td>First Name* </td><td><input type='text' name='first_name' id='first_name' value='"
    + fname + "' placeholder='First Name' data-theme='a' class='profile-txt' /></td></tr>"
    + "<tr><td>Last Name* </td><td><input type='text' name='last_name' id='last_name' value='" + lname 
    + "' placeholder='Last Name' class='profile-txt' data-theme='a' /></td></tr>" ;
  
  if(showFlg) {
    name_str += "<tr><td>Email* </td><td><input type='text' name='email' id='email' class='profile-txt' value='" 
      + email + "' placeholder='Email' data-theme='a' /></td></tr>";
  }

  return name_str;
}

// load user profile if needed
function showProfile(data) {
  var prof_str = "<tr><td>Gender</td><td><select name='gender' id='gender' data-mini='true'></select></td></tr>"
    + "<tr><td>Birth Date</td><td><div data-role='fieldcontain'><fieldset data-role='controlgroup' data-type='horizontal'>"
    + '<table><tr><td><select name="birth_mo" id="birth_mo" data-mini="true"></select></td>'
    + '<td><select name="birth_dt" id="birth_dt" data-mini="true"></select></td>'
    + '<td><select name="birth_yr" id="birth_yr" data-mini="true"></select><td></tr></table>'
    + '</fieldset></div></td></tr>';

  return prof_str;
}

// process user page display
function loadUserPage(data, resFlg) {
  if (resFlg) {
    // set pixi header details
    $('#show-list-hdr').html('');
    var cstr = "<div class='show-pixi-bar' data-role='navbar'><ul>"
      + "<li><a href='#' id='profile-nav-btn' data-dtype='user' data-mini='true' class='ui-btn-active'>Profile</a></li>"
      + "<li><a href='#' id='contact-nav-btn' data-dtype='contact' data-mini='true'>Contact</a></li>";
    
    // update menu
    if (data.fb_user == undefined) {
      cstr += "<li><a href='#' id='prefs-nav-btn' data-dtype='prefs' data-mini='true'>Prefs</a></li></ul></div>";
    } else {
      cstr += "</ul></div>";
    }

    var arr = data.birth_date.split('-');
    var user_str = "<table><tr><td>" + getPixiPic(data.photo, 'height:80px; width:80px;', 'smallImage') 
      + "</td><td><span class='mleft10 pstr'>" + data.name + "</span><br />"
      + "<a href='#popupPix1' class='mleft10 upload-btn' data-mini='true' data-role='button' data-inline='true' data-theme='b'"
      + "data-rel='popup' data-position-to='window' data-transition='pop'>Upload</a>"
      + "</td></tr></table><div id='edit-profile' class='sm-top'><table class='inv-descr'>"
      + showNameEmail(data, true) + showProfile(data) + "</table><div class='sm-top center-wrapper'>"  
      + '<input type="submit" value="Save" data-theme="d" data-inline="true" id="edit-usr-btn"></div></div>';

    // build page
    $('#show-list-hdr').append(cstr).trigger("create");
    $('#usr-prof').append(user_str).trigger('create');

    loadGender("#gender", data.gender);  // load gender
    loadYear("#birth_yr", 13, 90, arr[0]); // load year fld
    loadMonth("#birth_mo", arr[1]); // load month fld
    loadDays("#birth_dt", arr[1], arr[2]); // load month fld
  }
  else {
    console.log('User page load failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'View User', 'Done');
  }
}

// process user contact page display
function loadContactPage(data, resFlg) {
  var addr, city, state, zip, hphone, mphone;

  if (resFlg) {
    if (data !== undefined) {
      addr = data.contacts[0].address || '';
      city = data.contacts[0].city || '';
      state = data.contacts[0].state || '';
      zip = data.contacts[0].zip || '';
      hphone = data.contacts[0].home_phone || '';
      mphone = data.contacts[0].mobile_phone || '';
    }

    var user_str = "<table class='inv-descr'><tr><td><label>Address*</label><input type='text' name='address' id='address' value='"
      + addr + "' placeholder='Street' data-theme='a' class='profile-txt' /></td>"
      + "<td></td><td><label>City*</label><input type='text' name='city' id='city' value='"
      + city + "' placeholder='City' data-theme='a' class='profile-txt' /></td></tr>"
      + "<tr><td><label>State/Province*</label><select name='state' id='state' data-mini='true'></select>"
      + "</td><td></td><td><label>Zip* </label><input type='text' name='zip' id='zip' value='"
      + zip + "' placeholder='Zip' data-theme='a' class='profile-txt' /></td></tr>"
      + "<tr><td><label>Home Phone </label><input type='text' name='home_phone' id='home_phone' value='"
      + hphone + "' placeholder='Home Phone' data-theme='a' class='profile-txt' /></td>"
      + "<td></td><td><label>Mobile Phone </label><input type='text' name='mobile_phone' id='mobile_phone' value='"
      + mphone + "' placeholder='Mobile Phone' data-theme='a' class='profile-txt' /></td></tr></table>"
      + "<div class='sm-top center-wrapper'>"      
      + '<input type="submit" value="Save" data-theme="d" data-inline="true" id="edit-usr-btn"></div>';

    $('#usr-prof').append(user_str).trigger('create');
    setState("#state", state);  // load state dropdown
    setSelectMenu('#state', '', state);  // set option menu
  }
  else {
    console.log('Contact page load failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'View Contact', 'Done');
  }
}

// process invoice page display
function loadInvPage(data, resFlg) {
  if (resFlg) {

    // load title
    var title_str = "<span>Invoice #" + data.invoice.id + "</span>"; 
    $('#inv-pg-title').append(title_str);

    // load inv header
    var inv_str = "<div class='mleft15'><table class='inv-descr'><tr><td>Date: </td><td>" + data.invoice.inv_dt + "</td></tr><tr>"; 

    // display correct photo based on whether user is buyer or seller
    if(data.invoice.seller_id == usr.id) {
      inv_str += "<td>From: </td><td>" + getPixiPic(data.invoice.seller.photo, 'height:30px; width:30px;') 
        + ' ' + data.invoice.seller_name + "</td>";
    }
    else {
      inv_str += "<td>Bill To: </td><td>" + getPixiPic(data.invoice.buyer.photo, 'height:30px; width:30px;') 
        + ' ' + data.invoice.buyer_name + "</td>";
    }
    inv_str += "</tr></table></div>";

    // set invoice details
    var prc = parseFloat(data.invoice.price).toFixed(2);
    var subtotal = parseFloat(data.invoice.subtotal).toFixed(2);
    var tax = parseFloat(data.invoice.sales_tax).toFixed(2) || 0.0;
    var tax_total = parseFloat(data.invoice.tax_total).toFixed(2);
    var fee = parseFloat(data.invoice.get_fee).toFixed(2);
    var total = parseFloat(data.invoice.get_fee + data.invoice.amount).toFixed(2);

    inv_str += "<div class='mleft15'><div class='control-group inv-tbl'><table class='mtop inv inv-descr'>"
      + "<th><div class='center-wrapper'>Qty</div></th><th><div class='center-wrapper'>Item</div></th>"
      + "<th><div class='center-wrapper'>Price</div></th><th><div class='center-wrapper'>Amount</div></th>"
      + "<tr><td class='width120'><div class='nav-right'>" + data.invoice.quantity + "</div></td>"
      + "<td class='width360'>" + data.invoice.pixi_title + "</td>"
      + "<td class='width120'><div class='nav-right'>" + prc + "</div></td>"
      + "<td class='width120'><div class='nav-right'>" + subtotal + "</div></td></tr>"
      + "<tr class='sls-tax' style='display:none'><td></td><td><div class='nav-right'>Sales Tax</div></td>"
      + "<td class='width120'><div class='nav-right'>" + tax + "</div></td>"
      + "<td class='width120'><div class='nav-right'>" + tax_total + "</div></td></tr>"
      + "<tr class='v-align'><td></td><td class='img-valign nav-right'>Fee</td>"
      + "<td><a href='#popupInfo' data-rel='popup' data-role='button' class='ui-icon-alt' data-inline='true' "
      + "data-transition='pop' data-icon='info' data-theme='a' data-iconpos='notext'>Learn more</a></td>"
      + "<td class='img-valign nav-right'>" + fee + "</td></tr>"
      + "<tr><td></td><td><div class='nav-right'>Amount Due</div></td><td></td>"
      + "<td class='width120'><div class='order-total title-str nav-right'><h6>" + total + "</h6></div></td></tr></table>";

    if (data.invoice.comment !== undefined) {
      inv_str += "<div class='sm-top control-label'>Comments: " + data.invoice.comment + "</div>";
    }
    inv_str += "</div><div class='nav-right'>"
      
    if (data.invoice.seller_id == usr.id && data.invoice.status == 'unpaid') {
      inv_str += "<table><tr><td><a href='../html/invoice_form.html' data-inv-id=" + data.invoice.id + "data-role='button' id='edit-inv-btn'"
        + "data-theme='b'>Edit</a></td><td><a href='#' data-role='button' id='remove-inv-btn'>Remove</a></td><tr></table>";
    }
    else {
      inv_str += "<a href='#' data-inv-id=" + data.invoice.id + " data-role='button' data-theme='b' id='pay-btn'>Pay</a>";
    }
    inv_str += "</div></div>";
    $('#inv_details').append(inv_str).trigger("create");
  }
  else {
    console.log('inv page load failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'View Invoice', 'Done');
  }
}

// load list view if resFlg else return not found
function loadInvList(data, resFlg) {
  var $container = $('#pixi-list');
  var localUrl, item_str = '';

  // load listview
  if(resFlg) {
    if (data.invoices.length > 0) {
      $.each(data.invoices, function(index, item) {
        var amt = parseFloat(item.amount).toFixed(2);

	// set invoice name
	if(myPixiPage == 'received') {
	  var inv_name = item.seller_name; }
	else {
	  var inv_name = item.buyer_name; }

        // build pixi item string
	localUrl = 'data-inv-id="' + item.id + '"';

        item_str += "<li class='plist'>"
	  + '<a href="#" ' + localUrl + ' class="pending_title inv-item" data-ajax="false">'  
	  + getPixiPic(item.listing.photo_url, 'height:60px; width:60px;')
	  + '<div class="pstr"><h6>' + item.short_title 
	  + '<span class="nav-right">$' + amt + '</span></h6></div>'
	  + '<p>Invoice #' + item.id + ' - ' + inv_name + '<br />' + item.inv_dt + ' | ' + item.nice_status + '</p></a></li>';
      });
    } 
    else {
      item_str = '<li class="center-wrapper">No invoices found.</li>'
    }
  }
  else {
    item_str = '<li class="center-wrapper">No invoices found.</li>'
  }

  // append items
  $container.append(item_str).listview('refresh');
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

// load list view if resFlg else return not found
function loadListView(data, resFlg) {
  var localUrl, post_dt, item_str = '';
  var $container = $('#pixi-list');

  // load listview
  if(resFlg) {
    if (data.listings.length > 0) {
      $.each(data.listings, function(index, item) {
	post_dt = $.timeago(item.updated_at); // set post dt

        // build pixi item string
	localUrl = 'data-pixi-id="' + item.pixi_id + '"';

        item_str += "<li class='plist'>"
	  + '<a href="#" ' + localUrl + ' class="pending_title bd-item" data-ajax="false">'  
	  + getPixiPic(item.pictures[0].photo_url, 'height:60px; width:60px;')
	  + '<div class="pstr"><h6>' + item.med_title + '</h6></div>'
	  + '<p>' + item.site_name + '<br />' + item.category_name + ' | ' + post_dt + '</p></a></li>';
      });
    }
    else {
      item_str = '<li class="center-wrapper">No pixis found.</li>'
    }
  }
  else {
    item_str = '<li class="center-wrapper">No pixis found.</li>'
  }

  // append items
  $container.append(item_str).listview('refresh');
}

// load year dropdown
function loadYear(fld, minVal, maxVal, yr) {
  var curYr = new Date().getFullYear(); 
  var minYr = curYr - minVal;
  var maxYr = curYr - maxVal;
  var item_str = '<option default value="">' + 'Year' + '</option>';

  // build option list
  for (i = minYr; i > maxYr; i--) {
    item_str += '<option value="'+ i + '">' + i + '</option>';
   // $(fld).append($('<option />').val(i).html(i));
  }
  setSelectMenu(fld, item_str, yr);  // set option menu
}

// load month selectmenu
function loadMonth(fld, curMonth) {
  var arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var item_str = '<option default value="">' + 'Mon' + '</option>';

  // build option list
  for (var i = 1; i <= arr.length; i++) {
    item_str += '<option value="'+ i + '">' + arr[i-1] + '</option>';
  }
  setSelectMenu(fld, item_str, parseInt(curMonth));  // set option menu
}

// load day selectmenu based on current month
function loadDays(fld, curMonth, curDt) {
  var dt_arr = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var dt_str = '<option default value="">' + 'Day' + '</option>';

  for (var j = 1; j <= dt_arr[curMonth-1]; j++) {
    dt_str += '<option value="'+ j + '">' + j + '</option>';
  }
  setSelectMenu(fld, dt_str, curDt);  // set option menu
}

// set dropdown selection and refresh menu
function setSelectMenu(fld, str, val) {
  var dt_str = fld + " option[value='" + val + "']";

  $(fld).append(str);
  $(dt_str).attr("selected", "selected");
  $(fld).selectmenu().selectmenu('refresh', true);
}

// load gender
function loadGender(fld, val) {
  var gen_str = '<option value="">Gender</option><option value="Male">Male</option><option value="Female">Female</option>';
  setSelectMenu(fld, gen_str, val);  // set option menu
}

// set state
function setState(fld, val) {
  var pixiUrl = url + '/states.json' + token;

  if(states_str.length == 0) {
    loadData(pixiUrl, 'state');
  }
}

function loadStates(res, dFlg) {
  console.log('in loadStates');
  if (res !== undefined) {
    states_str = '<option value="">State</option>';
    for(var i=0, len=res.length; i<len; i++) {
	states_str += "<option value='" + res[i].code + "'>" + res[i].state_name + "</option>";
    }
    setSelectMenu('#state', states_str, '');  // set option menu
  } 
}
