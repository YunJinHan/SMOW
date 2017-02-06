/*
Chatting
 */
SimpleMeeting.prototype.loadMessages = function() {
    this.messagesRef = this.database.ref('messages');
    this.messagesRef.off();

    var setMessage = function(data) {
        var val = data.val();
        this.displayMessage(data.key, val.id, val.name, val.text, val.photoUrl, val.imageUrl);
    }.bind(this);
    this.messagesRef.limitToLast(20).on('child_added', setMessage);
    this.messagesRef.limitToLast(20).on('child_changed', setMessage);
};

SimpleMeeting.prototype.saveMessage = function(e) {
    e.preventDefault();
    if (this.messageInput.value && this.checkSignedInWithMessage()) {
        var currentUser = this.auth.currentUser;

        var hasName = true;
        if (currentUser.displayName == null || typeof currentUser.displayName == 'undefined') {
            hasName = false;
        }
        this.messagesRef.push({
            id: currentUser.uid,
            name: (hasName ? currentUser.displayName : "No Name"),
            text: this.messageInput.value,
            photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
        }).then(function() {
            this.resetMaterialTextfield(this.messageInput);
            this.toggleButton();
        }.bind(this)).catch(function(error) {
            console.error('Error writing new message to Firebase Database', error);
        });
    }
};

SimpleMeeting.prototype.setImageUrl = function(imageUri, imgElement) {
    if (imageUri.startsWith('gs://')) {
        imgElement.src = SimpleMeeting.LOADING_IMAGE_URL;
        this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
            imgElement.src = metadata.downloadURLs[0];
        });
    } else {
        imgElement.src = imageUri;
    }
};

SimpleMeeting.prototype.saveImageMessage = function(event) {
    var file = event.target.files[0];

    this.imageForm.reset();
    if (!file.type.match('image.*')) {
        var data = {
            message: 'You can only share images',
            timeout: 2000
        };
        this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
        return;
    }
    if (this.checkSignedInWithMessage()) {

        var currentUser = this.auth.currentUser;
        this.messagesRef.push({
            name: currentUser.displayName,
            imageUrl: SimpleMeeting.LOADING_IMAGE_URL,
            photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
        }).then(function(data) {

            this.storage.ref(currentUser.uid + '/' + Date.now() + '/' + file.name)
                .put(file, {
                    contentType: file.type
                })
                .then(function(snapshot) {
                    var filePath = snapshot.metadata.fullPath;
                    data.update({
                        imageUrl: this.storage.ref(filePath).toString()
                    });
                }.bind(this)).catch(function(error) {
                    console.error('There was an error uploading a file to Firebase Storage:', error);
                });
        }.bind(this));
    }
};

SimpleMeeting.prototype.checkSignedInWithMessage = function() {

    if (this.auth.currentUser) {
        return true;
    }
    var data = {
        message: 'You must sign-in first',
        timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return false;
};

SimpleMeeting.prototype.resetMaterialTextfield = function(element) {
    element.value = '';
    element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

SimpleMeeting.MY_MESSAGE_TEMPLATE =
    '<div class="message-container my_message">' +
    '<div class="spacing"><div class="pic"></div></div>' +
    '<div class="message"></div>' +
    '<div class="name"></div>' +
    '</div>';

SimpleMeeting.OTHER_MESSAGE_TEMPLATE =
    '<div class="message-container other_message">' +
    '<div class="spacing"><div class="pic"></div></div>' +
    '<div class="message"></div>' +
    '<div class="name"></div>' +
    '</div>';


SimpleMeeting.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';


SimpleMeeting.prototype.displayMessage = function(key, id, name, text, picUrl, imageUri) {
    var div = document.getElementById(key);

    if (!div) {
        var container = document.createElement('div');
        container.innerHTML = (this.auth.currentUser.uid == id ? SimpleMeeting.MY_MESSAGE_TEMPLATE : SimpleMeeting.OTHER_MESSAGE_TEMPLATE);
        div = container.firstChild;
        div.setAttribute('id', key);
        this.messageList.appendChild(div);
    }
    if (picUrl) {
        div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
    }
    div.querySelector('.name').textContent = name;
    var messageElement = div.querySelector('.message');
    if (text) {
        messageElement.textContent = text;
        messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
    } else if (imageUri) {
        var image = document.createElement('img');
        image.addEventListener('load', function() {
            this.messageList.scrollTop = this.messageList.scrollHeight;
        }.bind(this));
        this.setImageUrl(imageUri, image);
        messageElement.innerHTML = '';
        messageElement.appendChild(image);
    }

    setTimeout(function() {
        div.classList.add('visible')
    }, 1);
    this.messageList.scrollTop = this.messageList.scrollHeight;
    this.messageInput.focus();
};

SimpleMeeting.prototype.toggleButton = function() {
    if (this.messageInput.value) {
        this.submitButton.removeAttribute('disabled');
    } else {
        this.submitButton.setAttribute('disabled', 'true');
    }
};
