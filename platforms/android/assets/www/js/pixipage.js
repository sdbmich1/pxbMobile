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
    item_str = "<li class='center-wrapper'>No comments found.</li>";
  }

  // append content
  $('#comment-item').append(item_str);
  uiLoading(false);  // toggle spinner
}

// process invoice page display
function loadInvPage(data, resFlg) {
  if (resFlg) {

    // load title
    var title_str = "<span>Invoice #" + data.invoice.id + "</span>"; 
    $('#inv-pg-title').append(title_str);
    console.log('invoice title = ' + title_str);

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
      + "<tr><td></td><td class='img-valign nav-right'>Fee</td>"
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
