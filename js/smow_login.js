/*
Login
 */

// Signs-in with Google.
SimpleMeeting.prototype.signIn1 = function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithPopup(provider);
};

// Signs-in with Facebook.
SimpleMeeting.prototype.signIn2 = function() {
    var provider = new firebase.auth.FacebookAuthProvider();
    this.auth.signInWithPopup(provider);
};

// Signs-in with Github.
SimpleMeeting.prototype.signIn3 = function() {
    var provider = new firebase.auth.GithubAuthProvider();
    this.auth.signInWithPopup(provider);
};

// Signs-out.
SimpleMeeting.prototype.signOut = function() {
    // Sign out of Firebase.
    this.auth.signOut();

    while (this.messageList.hasChildNodes()) {
        this.messageList.removeChild(this.messageList.firstChild);
    }
    while (this.postList.hasChildNodes()) {
        this.postList.removeChild(this.postList.firstChild);
    }

    this.messageList.innerHTML = "<span id=\"message-filler\"></span>";
};


SimpleMeeting.prototype.onAuthStateChanged = function(user) {

    if (user) { // User is signed in
        var profilePicUrl = user.photoURL;
        var userName = user.displayName;

        this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';

        if (userName == null || typeof userName == 'undefined'){
            userName = 'No Name';
        }
        this.userName.textContent = userName;

        this.userName.removeAttribute('hidden');
        this.userPic.removeAttribute('hidden');
        this.signOutButton.removeAttribute('hidden');

        this.signInButton1.setAttribute('hidden', 'true');
        this.signInButton2.setAttribute('hidden', 'true');
        this.signInButton3.setAttribute('hidden', 'true');

        this.loadMessages();

        this.writeUserData(user.uid, user.displayName, user.email, user.photoURL);
        this.startDatabaseQueries();

    } else { // User is signed out

        this.userName.setAttribute('hidden', 'true');
        this.userPic.setAttribute('hidden', 'true');
        this.signOutButton.setAttribute('hidden', 'true');

        this.signInButton1.removeAttribute('hidden');
        this.signInButton2.removeAttribute('hidden');
        this.signInButton3.removeAttribute('hidden');
    }
};
