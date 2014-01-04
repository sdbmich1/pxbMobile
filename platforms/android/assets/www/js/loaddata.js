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
  $.ajax({
    url: listUrl, 
    type: "get",
    dataType: "json",
    data: params,
    contentType: "application/json",
    success: function(data, status, xhr) {
      //console.log('loadData success: ' + data);

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
      case 'edit':
        editPixiPage(data, dFlg);
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
      case 'invedit':
        loadInvForm(data, dFlg); 
	break;
      case 'invpg':
        loadInvPage(data, dFlg); 
	break;
      case 'bank':
        loadBankPage(data, dFlg); 
	break;
      case 'user':
        loadUserPage(data, dFlg); 
	break;
      case 'contact':
        loadContactPage(data, dFlg); 
	break;
      case 'price':
        setPrice(data, dFlg);
	break;
      case 'txn':
        loadTxnForm(data, dFlg, 'invoice'); 
	break;
      default:
	break;
      }
    },
    fail: function (a, b) {
        PGproxy.navigator.notification.alert(a + '|' + b, function() {}, 'Load Data', 'Done');
  	uiLoading(false);
        console.log(a + '|' + b);
    }
  });
}

// process results
function loadResults(res, dFlg) {
  var $sugList = $(".suggestions");
  if (res !== undefined) {
    var str = "";
    for(var i=0, len=res.length; i<len; i++) {
	str += "<li><a href='#' class='ac-item' data-res-id='" + res[i].id + "'>" + res[i].name + "</a></li>";
    }
    $sugList.html(str);
  } 
  uiLoading(false);
}

// set url for pixi list pages based on switch
function loadListPage(pgType, viewType) {
  switch(pgType){
  case 'draft':
    var pixiUrl = tmpPath + '/unposted.json' + token;
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

// edit pixi page 
function editPixiPage(data, resFlg) {
  if (resFlg) {
    if (data !== undefined) {
      var pic = getPixiPic(data.listing.pictures[0].photo_url, 'height:80px; width:80px;', 'smallImage'); 
      $('#picture').html(pic);
      $('#title').val(data.listing.title);
      $('#site_id').val(data.listing.site_id);
      $('#site_name').val(data.listing.site_name);
      $('#price').val(data.listing.price);
      $('#salary').val(data.listing.compensation);
      $('#description').val(data.listing.description);
      $('#event_start_date').val(data.listing.event_start_date);
      $('#event_start_time').val(data.listing.event_start_time);
      $('#event_end_date').val(data.listing.event_end_date);
      $('#event_end_time').val(data.listing.event_end_time);
      setSelectMenu('#category_id', '', data.listing.category_id);  // set option menu
      loadYear("#yr_built", 0, 90, data.listing.year_built); // load year fld
    }
  }
  else {
    console.log('Edit pixi page failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'Edit Pixi', 'Done');
  }
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

// open pixi success page
function showPixiSuccess(data) {
  console.log('in pixi success page');
  if (data !== undefined) {
    var txt = "Your pixi <span class='pstr'>" + data.med_title + "</span> has been submitted.</div>"
    var detail_str = "<div class='mtop inv-descr'>Subject to approval, your pixi will be posted within the next hour. Thank you for your business.</div>"
      + "<div class='mtop center-wrapper'><a href='#' id='px-done-btn' data-mini='true' data-role='button' data-inline='true'"
      + " data-theme='d'>Done</a></div>";
        
    var pg_title = 'Pixi Submitted!';
    $('#px-page-title').html(pg_title);
    $('#post_form').hide();  // hide post form

    // load title
    var tstr = "<h4 class='mbot'>" + txt + "</h4>";
    $('#list_title').html(tstr);
    $('#seller-name').html('');

    $('#pixi-details').html(detail_str).trigger('create');
    $('.bx-slider').toggle();
    $('#edit-pixi-details').toggle();
    $('#pixi-footer-details').toggle();
  }
  else {
    console.log('pixi success page failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'Pixi Submitted', 'Done');
  }
}

// open pixi page
function showPixiPage(data) {
  var px_str = '', cstr='';

  // check if pixi is in temp status - if not show navbar else hide post form 
  if(pxPath.indexOf("temp_listing") < 0) {

    // set pixi header details
    cstr = "<div class='show-pixi-bar' data-role='navbar'><ul>"
      + "<li><a href='#' id='show-pixi' data-theme='d' class='ui-btn-active' data-pixi-id='" + pid + "' data-mini='true'>Details</a></li>"
      + "<li><a href='#' id='show-cmt' data-theme='d' data-mini='true' data-pixi-id='" + pid + "'>Comments (" + data.comments.length 
      + ")</a></li></ul></div>";
  } 
  else {
    var pg_title = 'Review Your Pixi';
    $('#px-page-title').html(pg_title);
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
  $('#user_id').val(usr.id);
  $('#recipient_id').val(data.listing.seller_id);
  $('#pixi_id').val(data.listing.pixi_id);

  // load pix
  $.each(data.listing.pictures, function(index, item) {
    px_str += getPixiPic(item.photo_url, 'height:200px; width:100%;');
  });

  // load slider
  $('.bxslider').append(px_str).bxSlider({ controls: false, pager: false, mode: 'fade' });

  // load details
  var detail_str = "<span class='mtop inv-descr'>DETAILS:</span><br /><div class='profile-txt'>" + data.listing.summary + "<br />";

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

    $('#post_form').hide();  // hide post form
    //$('#edit-pixi-btn').toggle();
      
    if(pxPath.indexOf("temp_listing") > 0) {
      $('#submit-pixi-btn').toggle();
    }

    if(data.listing.status == 'edit') {
      $('#cancel-pixi-btn').toggle();
    } else {
      $('#remove-pixi-btn').toggle();
    }
  }
  else {
    $('#show-list-hdr').append(cstr).trigger("create");
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
	    + "<input name='content' id='reply_content' class='slide-menu' placeholder='Type reply message...' data-theme='a' /></div></td>"
	    + "<td><input type='submit' value='Send' data-theme='b' data-inline='true' id='reply-btn' data-mini='true'></td></tr></table>"
            + "<input type='hidden' name='user_id' id='user_id' value='" + item.recipient_id + "' />"
	    + "<input type='hidden' name='pixi_id' id='pixi_id' value='" + item.pixi_id + "' />"
	    + "<input type='hidden' name='recipient_id' id='recipient_id' value='" + item.user_id + "' /></div></form>";
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
  $('#mxboard').html(item_str).trigger("create");
}

// open comment page
function showCommentPage(data) {
  console.log('in show comment page');
  var item_str = '<ol class="posts">';
  var post_dt;

  uiLoading(true);  // toggle spinner

  // clear page
  $('#show-list-hdr').html('');
  $('#comment-item').html('');
  $('#content').html('').val('');

  // set pixi header details
  var cstr = "<div class='show-pixi-bar' data-role='navbar'><ul>"
    + "<li><a href='#' id='show-pixi' data-theme='d' data-pixi-id='" + pid + "' data-mini='true'>Details</a></li>"
    + "<li><a href='#' id='show-cmt' data-theme='d' class='ui-btn-active' data-mini='true' data-pixi-id='" + pid + "'>Comments (" 
    + data.comments.length + ")</a></li></ul></div>";

  // load post values
  $('#user_id').val(usr.id);
  $('#pixi_id').val(pid);

  // load comments
  if (data.comments.length > 0) {
    $.each(data.comments, function(index, item) {
      post_dt = $.timeago(item.created_at); // set post dt
      item_str += '<li id="' + item.id + '"><div class="no-left">'
        + "<div class='sender'>" + getPixiPic(item.user.photo, 'height:30px; width:30px;') + " " + item.sender_name + " | <span class='timestamp'>"
	+ "Posted " + post_dt + "</span></div><br /><span class='fcontent'>" + item.content + "</span></div></li>";
    });
    item_str += '</ol>';
  }
  else {
    item_str += "<li class='center-wrapper'>No comments found.</li></ol>";
  }

  // append content
  $('#show-list-hdr').append(cstr).trigger("create");
  $('#comment-item').append(item_str);
  $("#comment-btn").removeAttr("disabled");

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

  var name_str = "<tr><td><level>First Name* </level></td><td><input type='text' name='first_name' id='first_name' value='"
    + fname + "' placeholder='First Name' data-theme='a' class='profile-txt cal-size' /></td></tr>"
    + "<tr><td><level>Last Name* </level></td><td><input type='text' name='last_name' id='last_name' value='" + lname 
    + "' placeholder='Last Name' class='profile-txt cal-size' data-theme='a' /></td></tr>" ;
  
  if(showFlg) {
    name_str += "<tr><td><level>Email* </level></td><td><input type='text' name='email' id='email' class='profile-txt cal-size' value='" 
      + email + "' placeholder='Email' data-theme='a' /></td></tr>";
  }

  return name_str;
}

// load user profile if needed
function showProfile(data) {
  var prof_str = "<tr><td><level>Gender</level></td><td><select name='gender' id='gender' data-mini='true'></select></td></tr>"
    + "<tr><td><level>Birth Date</level></td><td><div data-role='fieldcontain'><fieldset data-role='controlgroup' data-type='horizontal'>"
    + '<table><tr><td><select name="birth_mo" id="birth_mo" data-mini="true"></select></td>'
    + '<td><select name="birth_dt" id="birth_dt" data-mini="true"></select></td>'
    + '<td><select name="birth_yr" id="birth_yr" data-mini="true"></select><td></tr></table>'
    + '</fieldset></div></td></tr>';

  return prof_str;
}

// process user page display
function loadUserPage(data, resFlg) {
  var name_str='', photo, gender='', month='', dt='', yr='', btn_name, pwd_str='', popName; 
  if (resFlg) {

    // set pixi header details
    $('#show-list-hdr').html('');
    var cstr = "<div class='show-pixi-bar' data-role='navbar'><ul>"
      + "<li><a href='#' id='profile-nav-btn' data-dtype='user' data-mini='true' class='ui-btn-active'>Profile</a></li>"
      + "<li><a href='#' id='contact-nav-btn' data-dtype='contact' data-mini='true'>Contact</a></li>";

    if (data !== undefined) {
      var dt_arr = data.birth_date.split('-');
      dt = dt_arr[2]; month = dt_arr[1]; yr = dt_arr[0];
      gender = data.gender;
      photo = getPixiPic(data.photo, 'height:60px; width:60px;', 'smallImage'); 
      name_str = "<span class='mleft10 pstr'>" + data.name + "</span><br />";
      popName = '#popupPix1';
      btn_name = 'Save';

      // update menu
      if (data.fb_user == undefined) {
        cstr += "<li><a href='#' id='prefs-nav-btn' data-dtype='prefs' data-mini='true'>Prefs</a></li></ul></div>";
      } else {
        cstr += "</ul></div>";
      }

      // build nav bar
      $('#show-list-hdr').append(cstr).trigger("create");
    } 
    else {
      cstr += "</ul></div>";
      photo = "<img src='../img/person_icon.jpg' style='height:60px; width:60px;' id='smallImage' />";
      btn_name = 'Register';
      popName = '#popupPix2';
      pwd_str = "<tr><td><label>Password</label></td><td class='cal-size'><input type='password' name='password' id='password' placeholder='Password'" 
        + " class='profile-txt' data-theme='a' /></td></tr>"
        + "<tr><td><label>Confirm Password</label></td><td class='cal-size'><input type='password' name='password_confirmation'"
	+ " id='password_confirmation' class='profile-txt' placeholder='Re-enter Password' data-theme='a' /></td></tr>";
    }

    var user_str = "<table><tr><td>" + photo + "</td><td>" + name_str
      + "<a href='" + popName + "' class='mleft10 upload-btn' data-mini='true' data-role='button' data-inline='true' data-theme='b'"
      + "data-rel='popup' data-position-to='window' data-transition='pop'>Upload</a>"
      + "</td></tr></table><div id='edit-profile' class='sm-top'><table class='rpad10 inv-descr'>"
      + showNameEmail(data, true) + showProfile(data) + pwd_str + "</table><div class='sm-top center-wrapper'>"  
      + "<input type='submit' value='" + btn_name + "' data-theme='d' data-inline='true' id='edit-usr-btn'></div></div>";

    // build page
    $('#usr-prof').append(user_str).trigger('create');

    loadGender("#gender", gender);  // load gender
    loadYear("#birth_yr", 13, 90, yr); // load year fld
    loadMonth("#birth_mo", month); // load month fld
    loadDays("#birth_dt", month, dt); // load month fld
  }
  else {
    console.log('User page load failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'View User', 'Done');
  }
}

// set address
function showAddress(data, resFlg) {
  var addr, city, state, zip, hphone, mphone;

  if (data !== undefined) {
    addr = data.contacts[0].address || '';
    city = data.contacts[0].city || '';
    state = data.contacts[0].state || '';
    zip = data.contacts[0].zip || '';
    hphone = data.contacts[0].home_phone || '';
    mphone = data.contacts[0].mobile_phone || '';
  }

  var addr_str = "<tr><td><label>Address*</label><input type='text' name='address' id='address' value='"
    + addr + "' placeholder='Street' data-theme='a' class='profile-txt' /></td>"
    + "<td></td><td><label>City*</label><input type='text' name='city' id='city' value='"
    + city + "' placeholder='City' data-theme='a' class='profile-txt' /></td></tr>"
    + "<tr><td><label>State/Province*</label><select name='state' id='state' data-mini='true'></select>"
    + "</td><td></td><td><label>Zip* </label><input type='text' name='zip' id='zip' value='"
    + zip + "' placeholder='Zip' data-theme='a' class='profile-txt' /></td></tr>"
    + "<tr><td><label>Home Phone </label><input type='text' name='home_phone' id='home_phone' value='"
    + hphone + "' placeholder='Home Phone' data-theme='a' class='profile-txt' /></td>"
    + "<td></td><td><label>Mobile Phone </label><input type='text' name='mobile_phone' id='mobile_phone' value='"
    + mphone + "' placeholder='Mobile Phone' data-theme='a' class='profile-txt' /></td></tr>";

  return addr_str;
}

// process user contact page display
function loadContactPage(data, resFlg) {
  var state;

  if (resFlg) {
    if (data !== undefined) {
      state = data.contacts[0].state || '';
    }

    var user_str = "<table class='inv-descr'>" + showAddress(data, resFlg) + "</table><div class='sm-top center-wrapper'>" 
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
function loadInvForm(data, resFlg) {
  var dt = curDate();
  var title_str, pixi_id = '', qty=1, prc = '', buyer='', subtotal='', sales_tax='', tax_total='', amount='', comment='';

  uiLoading(true);

  if (resFlg) {
    if (data !== undefined) {
      dt = data.invoice.inv_dt;
      pixi_id = data.invoice.pixi_id;
      buyer = data.invoice.buyer_name;
      qty = data.invoice.quantity;
      prc = parseFloat(data.invoice.price).toFixed(2);
      subtotal = parseFloat(data.invoice.subtotal).toFixed(2);
      sales_tax = parseFloat(data.invoice.sales_tax).toFixed(2) || 0.0;
      tax_total = parseFloat(data.invoice.tax_total).toFixed(2);
      amount = parseFloat(data.invoice.amount).toFixed(2);
      comment = data.invoice.comment;
      title_str = "<span>Invoice #" + data.invoice.id + "</span>"; 
    }
    else {
      title_str = "<span>Create Invoice</span>"; 
    }

    // load title
    $('#inv-pg-title').html(title_str);
    $('#inv-frm').html('');

    var inv_str = "<form id='invoice-doc' data-ajax='false'><div class='mleft10'><table class='inv-descr'><tr><td>Date:</td><td>" + dt + "</td></tr>"
      + "<tr><td>Bill To:</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='buyer_name' id='buyer_name' class='' placeholder='Buyer Name' data-theme='a' value='" + buyer + "' /></div>"
      + "<ul class='suggestions' data-role='listview' data-inset='true' data-icon='false'></ul></td></tr>"
      + "<tr><td>Item:</td><td><div class='dd-list'><select name='pixi_id' id='pixi_id' data-mini='true'></div></select></td></tr>" 
      + "<tr><td class='img-valign'>Quantity:</td><td><select name='quantity' id='inv_qty' class='mtop' data-mini='true'></select></td></tr>" 
      + "<tr><td class='img-valign'>Price:</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='price' id='inv_price' placeholder='Enter Price' class=' price' data-theme='a' value='" 
      + prc + "' /></div></td></tr>" 
      + "<tr class='sls-tax' style='display:none'><td class='img-valign'>Subtotal</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='subtotal' id='inv_amt' class='price' readonly='true' data-theme='a' value='" 
      + subtotal + "' /></div></td></tr>" 
      + "<tr class='sls-tax' style='display:none'><td class='img-valign'>Sales Tax</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='sales_tax' id='inv_tax' class='price' placeholder='Enter tax (if any)' data-theme='a' value='" 
      + sales_tax + "' /></div></td></tr>" 
      + "<tr class='sls-tax' style='display:none'><td class='img-valign'>Tax</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='tax_total' id='inv_tax_total' class='price' readonly='true' data-theme='a' value='" + tax_total 
      + "' /></div></td></tr>" 
      + "<tr><td class='img-valign'>Amount Due</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='amount' id='inv_total' class='total-str price' readonly='true' data-theme='a' value='" 
      + amount + "' /></div></td></tr>" 
      + "<tr><td>Comments:</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='comment' id='comment' placeholder='Enter comments here...' data-theme='a' value='" 
      + comment + "' /></div></td></tr>"
      + "<input type='hidden' name='buyer_id' id='buyer_id' /></div></table></form>";

    // build page
    $('#inv-frm').append(inv_str).trigger('create');

    // load drop down lists
    setPixiList(usr.active_listings, '#pixi_id', pixi_id);
    loadQty('#inv_qty', qty);
  }
  else {
    console.log('Invoice page load failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'View Invoice', 'Done');
  }
  uiLoading(false);
}

// process invoice page display
function loadInvPage(data, resFlg) {
  if (resFlg) {

    // load title
    var title_str = "<span>Invoice #" + data.invoice.id + "</span>"; 
    $('#inv-pg-title').append(title_str);

    // load inv header
    var inv_str = "<div class='mleft10'><table class='inv-descr'><tr><td>Date: </td><td>" + data.invoice.inv_dt + "</td></tr><tr>"; 

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
    console.log('fee = ' + fee);

    inv_str += "<div class='mleft10'><div class='control-group'><table class='mtop inv-tbl inv-descr'>"
      + "<th><div class='center-wrapper'>Qty</div></th><th><div class='center-wrapper'>Item</div></th>"
      + "<th><div class='center-wrapper'>Price</div></th><th><div class='center-wrapper'>Amount</div></th>"
      + "<tr><td class='width120'><div class='nav-right'>" + data.invoice.quantity + "</div></td>"
      + "<td class='width360'>" + data.invoice.pixi_title + "</td>"
      + "<td class='width120'><div class='nav-right'>" + prc + "</div></td>"
      + "<td class='width120'><div class='nav-right'>" + subtotal + "</div></td></tr>"
      + "<tr class='sls-tax' style='display:none'><td></td><td><div class='nav-right'>Sales Tax</div></td>"
      + "<td class='width120'><div class='nav-right'>" + tax + "</div></td>"
      + "<td class='width120'><div class='nav-right'>" + tax_total + "</div></td></tr>"
      + "<tr class='v-align'><td></td><td class='img-valign mtop nav-right'>Fee</td>"
      + "<td><a href='#popupInfo' data-rel='popup' data-role='button' class='ui-icon-alt' data-inline='true' "
      + "data-transition='pop' data-icon='info' data-theme='a' data-iconpos='notext'>Learn more</a></td>"
      + "<td class='img-valign mtop nav-right'>" + fee + "</td></tr>"
      + "<tr><td></td><td><div class='nav-right'>Amount Due</div></td><td></td>"
      + "<td class='width120'><div class='order-total total-str nav-right'><h6>$" + total + "</h6></div></td></tr></table>";

    if (data.invoice.comment !== undefined) {
      inv_str += "<div class='mtop inv-descr control-label'>Comments: " + data.invoice.comment + "</div>";
    }
    inv_str += "</div><div class='nav-right'>"
     
    // if owned & unpaid display edit btns
    if (data.invoice.seller_id == usr.id) {
      if (data.invoice.status == 'unpaid') {
        inv_str += "<table><tr><td><a href='#' data-inv-id='" + data.invoice.id + "' data-role='button' id='edit-inv-btn'"
          + " data-theme='b'>Edit</a></td><td><a href='#' data-role='button' data-inv-id='" + data.invoice.id 
	  + "' id='remove-inv-btn'>Remove</a></td><tr></table>";
      }
    }
    else {
      if (data.invoice.status == 'unpaid') {
        inv_str += "<a href='#' data-inv-id=" + data.invoice.id + " data-role='button' data-theme='b' id='pay-btn'>Pay</a>";
      }
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
	  + getPixiPic(item.listing.photo_url, 'height:60px; width:60px;') + '<div class="pstr"><h6>' + item.short_title 
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
    myPixiPage = 'active';

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

  curMonth = curMonth || 1;

  for (var j = 1; j <= dt_arr[curMonth-1]; j++) {
    dt_str += '<option value="'+ j + '">' + j + '</option>';
  }
  setSelectMenu(fld, dt_str, parseInt(curDt));  // set option menu
}

// set dropdown selection and refresh menu
function setSelectMenu(fld, str, val) {
  var dt_str = fld + " option[value='" + val + "']";

  if(str.length > 0) {
    $(fld).append(str);
  }
  $(dt_str).attr("selected", "selected");
  $(fld).selectmenu().selectmenu('refresh', true);
}

// load gender dropdown
function loadGender(fld, val) {
  var gen_str = '<option value="">Gender</option><option value="Male">Male</option><option value="Female">Female</option>';
  setSelectMenu(fld, gen_str, val);  // set option menu
}

// load acct type dropdown
function loadAcctType(fld, val) {
  var gen_str = '<option value="">Acct Type</option><option value="checking">Checking</option><option value="savings">Savings</option>';
  setSelectMenu(fld, gen_str, val);  // set option menu
}

// set state
function setState(fld, val) {
  var pixiUrl = url + '/states.json' + token;

  if(states_str.length == 0) {
    loadData(pixiUrl, 'state');
  }
}

// load active pixi dropdown menu for invoices
function setPixiList(res, fld, val) {
  if (res !== undefined) {
    var px_str = '<option value="">Select Pixi</option>';
    for(var i=0, len=res.length; i<len; i++) {
	px_str += "<option value='" + res[i].pixi_id + "'><span>" + res[i].title + "</span></option>";
    }
    setSelectMenu(fld, px_str, val);  // set option menu
  } 
  // set long names to wrap when displayed
  $('.dd-list').find('span').each(function () { $(this).css("white-space", "normal"); });
}

// load states dropdown menu
function loadStates(res, dFlg) {
  if (res !== undefined) {
    states_str = '<option value="">State</option>';
    for(var i=0, len=res.length; i<len; i++) {
	states_str += "<option value='" + res[i].code + "'>" + res[i].state_name + "</option>";
    }
    setSelectMenu('#state', states_str, '');  // set option menu
  } 
}

// load quantity selectmenu 
function loadQty(fld, val) {
  var qty_str = '<option default value="">' + 'Qty' + '</option>';

  for (var j = 1; j <= 99; j++) {
    qty_str += '<option value="'+ j + '">' + j + '</option>';
  }
  setSelectMenu(fld, qty_str, val);  // set option menu
}

// set item price
function setPrice(data, resFlg) {
  if (resFlg) {
    if (data !== undefined) {
      $('#inv_price').val(data);
      console.log('price = ' + data);
    }
    else {
      $('#inv_price').val(0);
    }
  }
  else {
    console.log('Item price load failed');
    PGproxy.navigator.notification.alert("Item price load failed", function() {}, 'Invoice', 'Done');
  }
}

// process bank account page
function loadBankPage(data, resFlg) {
  var title_str='';

  // turn on spinner
  uiLoading(true);

  if (resFlg) {
    if (data !== undefined) {
      title_str = "<span>View Bank Account</span>"; 

      // load title
      $('#inv-pg-title').html(title_str);
      $('#acct-frm').html('');

      var inv_str = "<div id='data_error' style='display:none' class='error'></div>"
        + "<div class='mleft10'><div class='sm-top'><table class='inv-descr'>"
	+ "<tr><td>Bank Name: </td><td class='width30'></td><td>" + data.account.bank_name + "</td></tr>"
	+ "<tr><td>Account #: </td><td class='width30'></td><td>" + data.account.acct_no + "</td></tr>"
	+ "<tr><td>Account Name: </td><td class='width30'></td><td>" + data.account.acct_name + "</td></tr>"
	+ "<tr><td>Description: </td><td class='width30'></td><td>" + data.account.description + "</td></tr>"
	+ "<tr><td>Account Type: </td><td class='width30'></td><td>" + data.account.acct_type + "</td></tr></table></div>"
	+ "<div class='mtop center-wrapper'><a href='#' id='rm-acct-btn' data-role='button' data-inline='true' data-acct-id='" 
	+ data.account.id + "'>Remove</a></div></div>";

      // build page
      $('#acct-frm').append(inv_str).trigger('create');
    }
    else {
      PGproxy.navigator.notification.alert("Bank account data not found.", function() {}, 'Bank Account', 'Done');
    }
  }
  else {
    console.log('Bank account page failed');
    PGproxy.navigator.notification.alert("Page load failed", function() {}, 'Bank Account', 'Done');
  }

  // turn off spinner
  uiLoading(false);
}

// process bank account form
function loadBankAcct(data, resFlg) {
  var title_str='', routing_no='', acct_no='', acct_name='', descr='', atype = '';

  // turn on spinner
  uiLoading(true);

  if (resFlg) {
    if (data !== undefined) {
      title_str = "<span>Edit Bank Account</span>"; 
    }
    else {
      title_str = "<span>Create Bank Account</span>"; 
    }

    // load title
    $('#inv-pg-title').html(title_str);
    $('#acct-frm').html('');

    var inv_str = "<div id='data_error' style='display:none' class='error'></div>"
      + "<div class='mleft10'><form id='bank-acct-form' data-ajax='false'><div class='sm-top'><table class='inv-descr'>"
      + "<tr><td>Routing #</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='routing_number' id='routing_number' placeholder='Routing Number' data-theme='a' value='" 
      + routing_no + "' /></div></td></tr>"
      + "<tr><td>Account #</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='acct_number' id='acct_number' placeholder='Account Number' data-theme='a' value='" 
      + acct_no + "' /></div></td></tr>"
      + "<tr><td>Account Name</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='acct_name' id='acct_name' placeholder='Account Name' data-theme='a' value='" 
      + acct_name + "' /></div></td></tr>"
      + "<tr><td>Description</td><td><div data-role='fieldcontain' class='sm-top ui-hide-label'>"
      + "<input type='text' name='description' id='description' placeholder='Description' data-theme='a' value='" 
      + descr + "' /></div></td></tr>"
      + "<tr><td class='img-valign'>Account Type</td><td><select name='acct_type' id='acct_type' class='mtop'></select></td></tr></table>" 
      + "<input type='hidden' name='user_id' id='user_id' value='" + usr.id + "' /><input type='hidden' name='token' id='pay_token' />" 
      + "<input type='hidden' name='acct_no' id='acct_no' /></div></form>"
      + "<div class='center-wrapper'><img src='../img/rsz_check_sample.gif'></div>"
      + "<table><tr><td class='cal-size'><a href='#' id='px-cancel' data-role='button' data-inline='true' />Cancel</a></td></div>"
      + "<td class='nav-right'><input type='submit' value='Save' data-theme='d' data-inline='true' id='add-acct-btn'></td></tr></table>";

    // build page
    $('#acct-frm').append(inv_str).trigger('create');

    // load drop down lists
    loadAcctType('#acct_type', atype);
  }
  else {
    console.log('Load bank account failed.');
    PGproxy.navigator.notification.alert("Bank account load failed", function() {}, 'Bank Account', 'Done');
  }

  // turn off spinner
  uiLoading(false);
}

// load transaction form
function loadTxnForm(data, resFlg, txnType, promoCode) {
  var style = '', addr='', city='', state='', zip='', street='', total, alt_style;
  var d = new Date();
  var month = d.getMonth()+1;
  var yr = d.getFullYear();

  promoCode = promoCode || '';

  if (resFlg) {
    if (data !== undefined) {
      var total = parseFloat(data.invoice.get_fee + data.invoice.amount).toFixed(2);
      $('#txn-frm').html('');

      // check for user address
      if(usr.contacts.length > 0) {
        addr = data.user.contacts[0];
	street = addr.address;
	city = addr.city;
	state = addr.state;
	zip = addr.zip;

        if(addr.address !== undefined && addr.city !== undefined && addr.state !== undefined && addr.zip !== undefined) {
	  alt_style = 'display:none';
	  style = '';
	} 
	else {
	  style = 'display:none';
	  alt_style = '';
	}
      }

      // build form string
      var inv_str = "<div id='data_error' style='display:none' class='error'></div>"
        + "<div class='mleft10'><form id='payment_form' data-ajax='false'>"
        + "<div class='div-border'><table><tr><td class='cal-size title-str'>Total Due</td><td class='price title-str'>$"
	+ total + "</td></tr></table></div><div class='div-border'><table class='inv-descr addr-tbl' style='" + style + "'>"  
	+ "<tr><td><strong>" + data.user.name + "</strong><br>" + street + "<br>" + city + ", " + state + " " + zip + "</td>"
	+ "<td class='v-align price'><a href='#' id='edit-txn-addr' data-role='button' data-inline='true' data-mini='true' data-theme='b'>"
	+ "Edit</a></td></tr></table><center><table class='inv-descr user-tbl' style='" + alt_style + "'>" 
	+ "<tr><td><label>First Name* </label><input type='text' id='first_name' class='profile-txt' placeholder='First Name' "
	+ "value='" + data.user.first_name + "' /></td><td></td>"
	+ "<td><label>Last Name* </label><input type='text' id='last_name' class='profile-txt' placeholder='Last Name' value='" 
	+ data.user.last_name + "' /></td></tr>" + showAddress(data.user, resFlg) + "</table></center>"
	+ "<table class='mtop inv-descr'><tr><td class='cal-size'>Card #* <img src='../img/cc_logos.jpeg' class='cc-logo' />"
        + "<input type='text' name=nil id='card_number' size=16 /></td></tr>"
	+ "<tr><td><table><tr><td><div class='sm-top'>CVV*</div>"
        + "<input type='text' name=nil id='card_code' maxlength=4 size=4 class='card-code' /></td>"
	+ "<td></td><td><span class='neg-top'>Exp Mo</span><select name=nil id='card_month' data-mini='true'></select></td>"
        + "<td><span class='neg-top'>Exp Yr</span><select name=nil id='card_year' data-mini='true'></select></td></tr></table></td></tr></table>"
        + "<input type='hidden' name='token' id='pay_token' /><input type='hidden' id='user_id' value='" + usr.id + "' />"
	+ "<input type='hidden' id='first_name' value='" + data.user.first_name + "' /><input type='hidden' id='last_name' value='" 
	+ data.user.last_name + "' /><input type='hidden' id='email' value='" + data.user.email + "' />"
	+ "<input type='hidden' id='transaction_type' value='" + txnType + "' /><input type='hidden' id='amt' value='" 
	+ data.invoice.amount + "' /><input type='hidden' id='description' value='" + data.invoice.pixi_title + "' />"
	+ "<input type='hidden' id='processing_fee' value='" + data.invoice.get_processing_fee + "' />"
	+ "<input type='hidden' id='convenience_fee' value='" + data.invoice.convenience_fee + "' />"
        + "<input type='hidden' id='promo_code' value='" + promoCode + "' />"
        + "<table><tr><td class='cal-size'><a href='#' id='txn-prev-btn' data-role='button' data-inline='true' data-id='"
	+ data.invoice.id + "'>Prev</a></td></div>"
        + "<td class='nav-right'><input type='submit' value='Done!' data-theme='d' data-inline='true' id='payForm'></td></tr></table>"
	+ "</form></div>"; 

      // build page
      $('#txn-frm').append(inv_str).trigger('create');
      setState("#state", state);  // load state dropdown
      setSelectMenu('#state', '', state);  // set option menu
      loadYear("#card_year", -15, 0, yr+1); // load year fld
      loadMonth("#card_month", month); // load month fld
    }
  }
  else {
    console.log('Load transaction failed');
    PGproxy.navigator.notification.alert("Transaction load failed", function() {}, 'Transaction', 'Done');
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
