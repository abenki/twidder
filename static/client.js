window.onload = function() {
    displayView();
}

function displayView() {
    if (window.localStorage.getItem("token") == "null") {
        document.getElementById("firstview").innerHTML = document.getElementById("welcomeview").innerHTML;
    }
    else {
        document.getElementById("firstview").innerHTML = document.getElementById("profileview").innerHTML;
        displayTabs();
    }
}

function checkSamePasswords() {
    var p1 = document.getElementById('password2').value;
    var p2 = document.getElementById('password3').value;
    var message = document.getElementById("message");

    if (p1 != p2) {
        message.innerHTML = "Passwords are different";
        return false;
    } else {
        message.innerHTML = "";
        return true;
    }
}

function signUpMechanism() {
    var email = document.getElementById("email2").value;
    var password = document.getElementById("password2").value;
    var firstname = document.getElementById("firstname").value;
    var familyname = document.getElementById("familyname").value;
    var gender = document.getElementById("gender").value;
    var city = document.getElementById("city").value;
    var country = document.getElementById("country").value;
    var signUpData = {'email': email, 'password': password, 'firstname': firstname, 'familyname': familyname, 'gender': gender, 'city': city, 'country': country};

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            response = JSON.parse(request.responseText);
            if (response["success"] == false) {
                document.getElementById("signuperror").innerHTML = response["msg"];
                console.log("error");
            }
            else {
                document.getElementById("signuperror").innerHTML = "User successfully created, please log in";
            }
        }
    }
    request.open("POST", "/user/signup", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(signUpData));
}

function signInMechanism() {
    var email = document.getElementById("email1").value;
    var password = document.getElementById("password1").value;
    var signInData = {'email': email, 'password': password};

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            response = JSON.parse(request.responseText);
            if (response["success"] == true) {
                window.localStorage.setItem("token", response["data"]);
                connectWebSocket(response["data"]);
                displayView();
            }
            else {
                document.getElementById("signinerror").innerHTML = response["msg"];
            }
        }
    }
    request.open("POST", "/user/signin", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(signInData));
}

//This function allows to display the panel according to the tab selected
function displayTabs() {
    const tabs = document.querySelectorAll('.tabs');
    const content = document.querySelectorAll('.content');
    let index = 0;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if(tab.classList.contains('active')){
                return;
            } else {
                tab.classList.add('active');
            }

            index=tab.getAttribute('data-id');
            console.log(index);

            for(i=0; i < tabs.length; i++) {
                if(tabs[i].getAttribute('data-id') != index) {
                    tabs[i].classList.remove('active');
                }
            }

            for(j=0; j < content.length; j++) {
                if(content[j].getAttribute('data-id') == index) {
                    content[j].classList.add('activeContent');
                } else {
                    content[j].classList.remove('activeContent');
                }
            }
        })
    })
}

// This function allows the user to sign out.
function signOut() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            response = JSON.parse(request.responseText);
            if (this.status == 200) {
                localStorage.setItem("token", null);
                console.log("signed out");
                displayView();
            }
            else if (this.status == 500) {
                //document.getElementById("signinerror").innerHTML = response["msg"];
                console.log("error");
            }
        }
    }
    request.open("POST", "/user/signout", true);
    request.setRequestHeader("token", localStorage.getItem("token"));
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(null);
}

function connectWebSocket(token) {
    var connection = new WebSocket('ws://127.0.0.1:5000/api');
    connection.onopen = function () {
        console.log("websocket initialized");
        connection.send(token);
    }
}

// This function allows the user to change his password
function changePassword() {
    var oldpassword = document.getElementById("password4").value;
    var newpassword = document.getElementById("password5").value;
    var changepswData = {oldpassword: oldpassword, newpassword: newpassword};

    var request = new XMLHttpRequest();
    request.open("POST", "/user/changepsw", true);
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            response = JSON.parse(request.responseText);
            if (response["success"] == false) {
                console.log(response["msg"]);
                document.getElementById("changepswmsg").innerHTML = response["msg"];
            } else {
                console.log(response["msg"]);
                document.getElementById("changepswmsg").innerHTML = response["msg"];
            }
        }
    }
    request.setRequestHeader("token", localStorage.getItem("token"));
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(changepswData));
}

//This function allow to check if the two passwords are identical or not when changing the password
function checkSamePasswords2() {
    var p1 = document.getElementById('password5').value;
    var p2 = document.getElementById('password6').value;
    var message = document.getElementById("changepswmsg");

    if (p1 != p2) {
        message.innerHTML = "Passwords are different";
        return false;
    } else {
        message.innerHTML = "";
        return true;
    }
}

// This function take the necessary inputs and calls the serverstub function to post the message
function postTheMessage() {
    message = document.getElementById("textpostmessage").value;
    token = localStorage.getItem("token");
    toemail = "";

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            response = JSON.parse(request.responseText);
            if (response["success"] == true) {
                toemail = response["data"]["email"];
                data = {"toemail": toemail, "message": message}

                var request2 = new XMLHttpRequest();
                request2.onreadystatechange = function() {
                    if (this.readyState == 4) {
                        var response2 = JSON.parse(request2.responseText);
                        console.log(response2["msg"]);
                    }
                }
                request2.open("POST", "/user/messages/post", true);
                request2.setRequestHeader("token", token);
                request2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                request2.send(JSON.stringify(data));
            }
        }
    }
    request.open("GET", "/user/data/getbytoken", true);
    request.setRequestHeader("token", token);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(null);
}

// This function displays all the posted messages
function displayPostedMessages() {
    var x = document.getElementById("wall");
    x.innerHTML = "";
    token = localStorage.getItem("token");

    var request = new XMLHttpRequest();
    request.open("GET", "/user/messages/getbytoken", true);
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            response = JSON.parse(request.responseText);
            if (response["success"] == true) {
                data = response["data"];
                console.log(data);
                for (i=0; i<data.length; i++) {
                    publi = data[i];
                    console.log(publi)
                    x.innerHTML += publi[1];
                    x.innerHTML += ": ";
                    x.innerHTML += publi[0];
                    x.innerHTML += "<br>";
                }
            }
        }
    }
    request.setRequestHeader("token", token);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(null);
}

// This function allows to display the personal informations of the user
function displayPersonalInfos() {
    var x = document.getElementById("personalinfos");
    x.innerHTML = "";
    x.style.display = "block";
    token = localStorage.getItem("token");

    var request = new XMLHttpRequest();
    request.open("GET", "/user/data/getbytoken", true);
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            response = JSON.parse(request.responseText);
            if (response["success"] == true) {
                infos = response["data"];
                console.log(infos);
                for (const name in infos) {
                    x.innerHTML += name;
                    x.innerHTML += ": ";
                    x.innerHTML += infos[name];
                    x.innerHTML += "<br>";
                }
            }
        }
    }
    request.setRequestHeader("token", token);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(null));
}

// This function clears the text area of the message input of Home tab
function clearTextarea() {
    document.getElementById("textpostmessage").value = "";
}

// This function allows to search for another user
function searchUser() {
    token = localStorage.getItem("token");
    email = document.getElementById("searchuser").value;

    var request1 = new XMLHttpRequest();
    request1.open("GET", "/user/data/getbyemail/"+email, true);
    request1.onreadystatechange = function() {
        if (this.readyState == 4) {
            response = JSON.parse(request1.responseText);
            if (response["success"] == true) {
                var x = document.getElementById("userinfos");
                x.innerHTML = "";
                x.style.display = "block";
                userdata = response["data"];
                for (const name in userdata) {
                    x.innerHTML += name;
                    x.innerHTML += ": ";
                    x.innerHTML += userdata[name];
                    x.innerHTML += "<br>";
                }

                var y = document.getElementById("userwall");
                y.innerHTML = "";

                var request2 = new XMLHttpRequest();
                request2.open("GET", "/user/messages/getbyemail/"+email, true);
                request2.onreadystatechange = function() {
                    if (this.readyState == 4) {
                        response2 = JSON.parse(request2.responseText);
                        if (response2["success"]==true) {
                            messages = response2["data"];
                            if (messages != null) {
                                for (i=0; i<messages.length; i++) {
                                    publi = messages[i];
                                    y.innerHTML += publi[1];
                                    y.innerHTML += ": ";
                                    y.innerHTML += publi[0];
                                    y.innerHTML += "<br>";
                                }
                            } else {
                                y.innerHTML = "No messages posted on this wall";
                            }
                            
                        }
                    }
                }
                request2.setRequestHeader("token", token);
                request2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                request2.send(JSON.stringify(email));
            } else {
                document.getElementById("searchusermessage").innerHTML = response["msg"];
                document.getElementById("searchresult").innerHTML = "";
            }
        }
    }
    request1.setRequestHeader("token", token);
    request1.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request1.send(JSON.stringify(email));
}

// This function allows the user to post messages on other user's wall
function postTheMessageOtherWall() {
    message = document.getElementById("textpostmessageotheruser").value;
    token = localStorage.getItem("token");
    toemail = document.getElementById("searchuser").value;
    data = {"toemail": toemail, "message": message};
    
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            var response = JSON.parse(request.responseText);
            console.log(response["msg"]);
        }
    }
    request.open("POST", "/user/messages/post", true);
    request.setRequestHeader("token", token);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
}

// This function allows to update the wall of other people
function updatePostedMessages() {
    var x = document.getElementById("userwall");
    x.innerHTML = "";
    token = localStorage.getItem("token");
    email = document.getElementById("searchuser").value;
    
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            response = JSON.parse(request.responseText);
            if (response["success"] == true) {
                data = response["data"];
                console.log(data);
                for (i=0; i<data.length; i++) {
                    publi = data[i];
                    console.log(publi)
                    x.innerHTML += publi[1];
                    x.innerHTML += ": ";
                    x.innerHTML += publi[0];
                    x.innerHTML += "<br>";
                }
            }
        }
    }
    request.open("GET", "/user/messages/getbyemail/"+email, true);
    request.setRequestHeader("token", token);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(email));
}

// This function clears the text area of the message input of Browse tab
function clearBrowseTextarea() {
    document.getElementById("textpostmessageotheruser").value = "";
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("data", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("data");
    ev.target.appendChild(document.getElementById(data));
}
