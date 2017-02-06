'use strict';

// Initializes SimpleMeeting.
function SimpleMeeting() {
    this.checkSetup();

    this.messageList = document.getElementById('messages');
    this.messageForm = document.getElementById('message-form');
    this.messageInput = document.getElementById('message');
    this.submitButton = document.getElementById('submit');
    this.submitImageButton = document.getElementById('submitImage');
    this.imageForm = document.getElementById('image-form');
    this.mediaCapture = document.getElementById('mediaCapture');
    this.userPic = document.getElementById('user-pic');
    this.userName = document.getElementById('user-name');
    this.signInButton1 = document.getElementById('sign-in-google');
    this.signInButton2 = document.getElementById('sign-in-facebook');
    this.signInButton3 = document.getElementById('sign-in-github');
    this.signOutButton = document.getElementById('sign-out');
    this.signInSnackbar = document.getElementById('must-signin-snackbar');

    this.postList = document.getElementById('posts_List');
    this.postForm = document.getElementById('post-form');
    this.postInput = document.getElementById('message_post_input');
    this.titleInput = document.getElementById('title_post_input');

    this.recentPostsSection = document.getElementById('recent-posts-list');

    this.postForm.addEventListener('submit', this.savePost.bind(this));

    this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    this.signInButton1.addEventListener('click', this.signIn1.bind(this));
    this.signInButton2.addEventListener('click', this.signIn2.bind(this));
    this.signInButton3.addEventListener('click', this.signIn3.bind(this));

    var buttonTogglingHandler = this.toggleButton.bind(this);
    this.messageInput.addEventListener('keyup', buttonTogglingHandler);
    this.messageInput.addEventListener('change', buttonTogglingHandler);

    this.submitImageButton.addEventListener('click', function() {
        this.mediaCapture.click();
    }.bind(this));
    this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

    this.initFirebase();
}

SimpleMeeting.prototype.initFirebase = function() {

    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();

    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

SimpleMeeting.prototype.checkSetup = function() {
    if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
        window.alert('You have not configured and imported the Firebase SDK. ' +
            'Make sure you go through the codelab setup instructions.');
    } else if (config.storageBucket === '') {
        window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
            'actually a Firebase bug that occurs rarely. ' +
            'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
            'and make sure the storageBucket attribute is not empty. ' +
            'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
            'displayed there.');
    }
};

window.onload = function() {
    window.simpleMeeting = new SimpleMeeting();
};
