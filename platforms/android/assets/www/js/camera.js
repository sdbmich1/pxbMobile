
// Called when a photo is successfully retrieved
function onPhotoDataSuccess(imageData) {
  // Uncomment to view the base64 encoded image data
  // console.log(imageData);

  // Get image handle
  var smallImage = document.getElementById('image');

  // Unhide image elements
  smallImage.style.display = 'block';

  // Show the captured photo
  smallImage.src = "data:image/jpeg;base64," + imageData;
}

// Called when a photo is successfully retrieved
function onPhotoURISuccess(imageURI) {
  // Uncomment to view the base64 encoded image data
  // console.log(imageURI);

  // Get image handle
  var largeImage = document.getElementById('image');

	      // Unhide image elements
	      largeImage.style.display = 'block';

	      // Show the captured photo
              largeImage.src = imageURI;
	    }

// Take picture using device camera and retrieve image as base64-encoded string
function capturePhoto() {
  navigator.camera.getPicture(onPhotoDataSuccess, fail, { quality: 50 });
}

// Retrieve image file location from specified source
function getPhoto(source) {
  var pictureSource = navigator.camera.PictureSourceType;   // picture source
  var destinationType = navigator.camera.DestinationType; // sets the format of returned value 

  navigator.camera.getPicture(uploadPhoto, fail, { quality: 50, 
  destinationType: destinationType.FILE_URI,
  sourceType: source });
}

// Retrieve image file location from specified source
$("#camera").click(function(){
  alert('In camera');
  getPhoto(pictureSource.CAMERA);
});

// Retrieve image file location from specified source
$("#gallery").click(function(){
  getPhoto(pictureSource.PHOTOLIBRARY);
});

// Retrieve image file location from specified source
$("#album").click(function(){
  getPhoto(pictureSource.SAVEDPHOTOALBUM);
});

function uploadPhoto(imageURI) {
  $("#image").attr("src", imageURI);

  var options = new FileUploadOptions();
  options.chunkedMode = false;
  options.fileKey="file";
  options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1)+'.png';
  options.mimeType="image/jpeg";

  var params = new Object();
  options.params = params;

  var ft = new FileTransfer();
  ft.upload(imageURI, encodeURI(url + "/pictures"), win, fail, options);
}

function win(r) {
  console.log("Code = " + r.responseCode);
  console.log("Response = " + r.response);
  console.log("Sent = " + r.bytesSent);
}

function fail(error) {
  alert("An error has occurred: Code = " = error.code);
  console.log("upload error source " + error.source);
  console.log("upload error target " + error.target);
}

