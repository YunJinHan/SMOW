
SimpleMeeting.prototype.startDatabaseQueries = function() {
    var myUserId = firebase.auth().currentUser.uid;
    var recentPostsRef = firebase.database().ref('posts').limitToLast(100);
    var toggleStar = function(postRef, uid) {
        postRef.transaction(function(post) {
            if (post) {
                if (post.stars && post.stars[uid]) {
                    post.starCount--;
                    post.stars[uid] = null;
                } else {
                    post.starCount++;
                    if (!post.stars) {
                        post.stars = {};
                    }
                    post.stars[uid] = true;
                }
            }
            return post;
        });
    }

    var createNewComment = function(postId, username, uid, text) {
        firebase.database().ref('post-comments/' + postId).push({
            text: text,
            author: username,
            uid: uid
        });
    }

    var updateStarredByCurrentUser = function(postElement, starred) {
        if (starred) {
            postElement.getElementsByClassName('starred')[0].style.display = 'inline-block';
            postElement.getElementsByClassName('not-starred')[0].style.display = 'none';
        } else {
            postElement.getElementsByClassName('starred')[0].style.display = 'none';
            postElement.getElementsByClassName('not-starred')[0].style.display = 'inline-block';
        }
    }

    var updateStarCount = function(postElement, nbStart) {
        postElement.getElementsByClassName('star-count')[0].innerText = nbStart;
    }

    var addCommentElement = function(postElement, id, text, author) {
        var comment = document.createElement('div');
        comment.classList.add('comment-' + id);
        comment.innerHTML = '<span class="commnetUsername"></span><span class="comment"></span>';
        comment.getElementsByClassName('comment')[0].innerText = text;
        comment.getElementsByClassName('commnetUsername')[0].innerText = (author || "No Name") + "  ";

        var commentsContainer = postElement.getElementsByClassName('comments-container')[0];
        commentsContainer.appendChild(comment);
    }

    var setCommentValues = function(postElement, id, text, author) {
        var comment = postElement.getElementsByClassName('comment-' + id)[0];
        comment.getElementsByClassName('comment')[0].innerText = text;
        comment.getElementsByClassName('fp-username')[0].innerText = (author || "No Name") + "  ";
    }

    var deleteComment = function(postElement, id) {
        var comment = postElement.getElementsByClassName('comment-' + id)[0];
        comment.parentElement.removeChild(comment);
    }

    var createPostElement = function(postId, title, text, author, authorId, authorPic) {
        var uid = firebase.auth().currentUser.uid;
        if (uid == authorId) {
            var html =
                '<div class="post post-' + postId + ' mdl-cell mdl-cell--12-col ' +
                'mdl-cell--6-col-tablet mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">' +
                '<div class="mdl-card mdl-shadow--2dp">' +
                '<div class="mdl-card__title mdl-color--light-blue-600 mdl-color-text--white">' +
                '<h4 class="mdl-card__title-text"></h4>' +
                '</div>' +
                '<div class="header">' +
                '<div>' +
                '<div class="avatar"></div>' +
                '<div id="post_userNmae" class="username mdl-color-text--black"></div>' +
                '</div>' +
                '</div>' +
                '<span class="star">' +
                '<div class="not-starred material-icons">star_border</div>' +
                '<div class="starred material-icons">star</div>' +
                '<div class="star-count">0</div>' +
                '<div id="deletePost" onclick="deletePostContent(\'' + postId + '\')"></div>' +
                '</span>' +
                '<div class="text"></div>' +
                '<div class="comments-container"></div>' +
                '<form class="add-comment" action="#">' +
                '<div class="mdl-textfield mdl-js-textfield">' +
                '<input class="mdl-textfield__input new-comment" type="text">' +
                '<label class="mdl-textfield__label">Comment...</label>' +
                '</div>' +
                '</form>' +
                '</div>' +
                '</div>';
        }
        else {
            var html =
                '<div class="post post-' + postId + ' mdl-cell mdl-cell--12-col ' +
                'mdl-cell--6-col-tablet mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">' +
                '<div class="mdl-card mdl-shadow--2dp">' +
                '<div class="mdl-card__title mdl-color--light-blue-600 mdl-color-text--white">' +
                '<h4 class="mdl-card__title-text"></h4>' +
                '</div>' +
                '<div class="header">' +
                '<div>' +
                '<div class="avatar"></div>' +
                '<div id="post_userNmae" class="username mdl-color-text--black"></div>' +
                '</div>' +
                '</div>' +
                '<span class="star">' +
                '<div class="not-starred material-icons">star_border</div>' +
                '<div class="starred material-icons">star</div>' +
                '<div class="star-count">0</div>' +
                '</span>' +
                '<div class="text"></div>' +
                '<div class="comments-container"></div>' +
                '<form class="add-comment" action="#">' +
                '<div class="mdl-textfield mdl-js-textfield">' +
                '<input class="mdl-textfield__input new-comment" type="text">' +
                '<label class="mdl-textfield__label">Comment...</label>' +
                '</div>' +
                '</form>' +
                '</div>' +
                '</div>';
        }

        var div = document.createElement('div');
        div.innerHTML = html;
        var postElement = div.firstChild;
        if (componentHandler) {
            componentHandler.upgradeElements(postElement.getElementsByClassName('mdl-textfield')[0]);
        }

        var addCommentForm = postElement.getElementsByClassName('add-comment')[0];
        var commentInput = postElement.getElementsByClassName('new-comment')[0];
        var star = postElement.getElementsByClassName('starred')[0];
        var unStar = postElement.getElementsByClassName('not-starred')[0];


        postElement.getElementsByClassName('text')[0].innerText = text;
        postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = title;
        postElement.getElementsByClassName('username')[0].innerText = author || "No Name";
        postElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' + (authorPic || './silhouette.jpg') + '")';

        var commentsRef = firebase.database().ref('post-comments/' + postId);
        commentsRef.on('child_added', function(data) {
            addCommentElement(postElement, data.key, data.val().text, data.val().author);
        });

        commentsRef.on('child_changed', function(data) {
            setCommentValues(postElement, data.key, data.val().text, data.val().author);
        });

        commentsRef.on('child_removed', function(data) {
            deleteComment(postElement, data.key);
        });

        var starCountRef = firebase.database().ref('posts/' + postId + '/starCount');
        starCountRef.on('value', function(snapshot) {
            updateStarCount(postElement, snapshot.val());
        });

        var starredStatusRef = firebase.database().ref('posts/' + postId + '/stars/' + uid)
        starredStatusRef.on('value', function(snapshot) {
            updateStarredByCurrentUser(postElement, snapshot.val());
        });

        addCommentForm.onsubmit = function(e) {
            e.preventDefault();
            createNewComment(postId, firebase.auth().currentUser.displayName, uid, commentInput.value);
            commentInput.value = '';
            commentInput.parentElement.MaterialTextfield.boundUpdateClassesHandler();
        };

        var onStarClicked = function() {
            var globalPostRef = firebase.database().ref('/posts/' + postId);
            var userPostRef = firebase.database().ref('/user-posts/' + authorId + '/' + postId);
            toggleStar(globalPostRef, uid);
            toggleStar(userPostRef, uid);
        };

        unStar.onclick = onStarClicked;
        star.onclick = onStarClicked;

        return postElement;
    }

    var fetchPosts = function(postsRef, sectionElement) {
        postsRef.on('child_added', function(data) {

            var author = data.val().author;

            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            containerElement.insertBefore(
                createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().authorPic),
                containerElement.firstChild);
        });
        postsRef.on('child_changed', function(data) {
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
            postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = data.val().title;
            postElement.getElementsByClassName('username')[0].innerText = data.val().author;
            postElement.getElementsByClassName('text')[0].innerText = data.val().body;
            postElement.getElementsByClassName('star-count')[0].innerText = data.val().starCount;
        });
        postsRef.on('child_removed', function(data) {
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            var post = containerElement.getElementsByClassName('post-' + data.key)[0];
            post.parentElement.removeChild(post);
        });
    };

    fetchPosts(recentPostsRef, this.recentPostsSection);
}

SimpleMeeting.prototype.writeNewPost = function(uid, username, picture, title, body) {
    // A post entry.
    var postData = {
        author: username,
        uid: uid,
        body: body,
        title: title,
        starCount: 0,
        authorPic: picture
    };

    var newPostKey = firebase.database().ref().child('posts').push().key;

    var updates = {};
    updates['/posts/' + newPostKey] = postData;
    updates['/user-posts/' + uid + '/' + newPostKey] = postData;

    return firebase.database().ref().update(updates);
}

SimpleMeeting.prototype.writeUserData = function(userId, name, email, imageUrl) {
    firebase.database().ref('users/' + userId).set({
        username: name,
        email: email,
        profile_picture: imageUrl
    });
}

SimpleMeeting.prototype.savePost = function(e){
    e.preventDefault();
    var title = this.titleInput.value;
    var content = this.postInput.value;
    if (title && content) {
        this.resetMaterialTextfield(this.titleInput);
        this.resetMaterialTextfield(this.postInput);
        if (this.userName.innerText == null || typeof this.userName.innerText == 'undefined') {
            this.userName.innerText = "No Name";
        }
        this.writeNewPost(firebase.auth().currentUser.uid,this.userName.innerText,firebase.auth().currentUser.photoURL,title,content);
    }
}

function deletePostContent(postId) {

    var deletePostContentRef = firebase.database().ref('post-comments/' + postId);
    deletePostContentRef.remove()
        .then(function() {
        })
        .catch(function(error) {
        });

    var deletePostContentRef2 = firebase.database().ref('posts/' + postId);
     deletePostContentRef2.remove()
        .then(function() {
        })
        .catch(function(error) {
        });
    var deletePostContentRef3 = firebase.database().ref('user-posts/' + firebase.auth().currentUser.uid + '/' + postId);
    deletePostContentRef3.remove()
        .then(function() {
        })
        .catch(function(error) {
        });
}
