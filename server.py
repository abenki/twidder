from flask import Flask, request, url_for, redirect, jsonify
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket import WebSocketError
from gevent.pywsgi import WSGIServer
import random as rd
import json

import database_helper

#Dictionary used to implement the auto-logout functionality
activeSessions = {}

app = Flask(__name__)

@app.route('/')
def root():
    return app.send_static_file("client.html")

@app.route('/api')
def api():
    print(activeSessions)
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        token = ws.receive()
        email = database_helper.get_loggedinuser(token)['email']
        if email in activeSessions:
            #activeSessions[email].send(json.dumps("signout"))
            database_helper.delete_token(activeSessions[email])
            del activeSessions[email]
            activeSessions[email] = token
            print("active websocket replaced")
            print(activeSessions)
        else:
            activeSessions[email] = token
            print("new active websocket added")
            print(activeSessions)
        while True:
            message = ws.receive()
            print(message)
            ws.send(message)
        return ""
# def api():
#     if request.environ.get('wsgi.websocket'):
#         ws = request.environ['wsgi.websocket']
#         while True:
#             token = ws.receive()
#             print(token)
#             print("test")
#             ws.send(token)
#         return ""


@app.route('/user/signin', methods=['POST'])
def sign_in():
    data = request.get_json()
    user = database_helper.get_user(data['email'])
    if user != None:
        if user['password'] == data['password']:
            characters = "abcdefghiklmnopqrstuvwwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
            token = ""
            for i in range(36):
                token += characters[rd.randint(0, 61)]
            database_helper.save_token(data['email'], token)
            return jsonify({"success": True, "msg": "Successfully signed in", "data": token})
        else:
            return jsonify({"success": False, "msg": "Wrong password"})
    else:
        return jsonify({"success": False, "msg": "User doesn't exist"})

@app.route('/user/signup', methods=['POST'])
def sign_up():
    data = request.get_json()
    if 'email' in data and 'password' in data and 'firstname' in data and 'familyname' in data and 'gender' in data and 'city' in data and 'country' in data:
        if len(data['password']) > 7:
            result = database_helper.save_user(data['email'], data['password'], data['firstname'], data['familyname'], data['gender'], data['city'], data['country'])
            if result == True:
                return jsonify({"success": True, "msg": "User succesfully created"})
        else:
            return jsonify({"success": False, "msg": "Password is too short"})
    else:
        return jsonify({"success": False, "msg": "Not good data"})

@app.route('/user/signout', methods=['POST'])
def sign_out():
    token = request.headers.get("token")
    if database_helper.get_loggedinuser(token) != None:
        email = database_helper.get_loggedinuser(token)['email']
        database_helper.delete_token(token)
        del activeSessions[email]
        return jsonify({"success": True, "msg": "User succesfully signed out"})
    else:
        return jsonify({"success": False, "msg": "User is not signed in"})

@app.route('/user/changepsw', methods=['POST'])
def change_password():
    data = request.get_json()
    token = request.headers.get("token")
    if database_helper.get_loggedinuser(token) != None:
        email = database_helper.get_loggedinuser(token)['email']
        if database_helper.get_user(email)['password'] == data['oldpassword']:
            database_helper.change_password(email, data['newpassword'])
            return jsonify({"success": True, "msg": "Password changed"})
        else:
            return jsonify({"success": False, "msg": "Wrong password"})
    else:
        return jsonify({"success": False, "msg": "User is not signed in"})

@app.route('/user/data/getbytoken', methods=['GET'])
def get_user_data_by_token():
    token = request.headers.get("token")
    email = database_helper.get_loggedinuser(token)['email']
    return get_user_data_by_email(email)

@app.route('/user/data/getbyemail/<email>', methods=['GET'])
def get_user_data_by_email(email):
    token = request.headers.get("token")
    if database_helper.get_loggedinuser(token) != None:
        if database_helper.get_user(email) != None:
            data = database_helper.get_user(email)
            result = {"email": data['email'], "firstname": data['firstname'], "familyname": data['familyname'], "gender": data['gender'], "city": data['city'], "country": data['country']}
            return {"success": True, "msg": "User data retrieved", "data": result}
        else:
            return jsonify({"success": False, "msg": "User doesn't exist"})
    else:
        return jsonify({"success": False, "msg": "User is not signed in"})

@app.route('/user/messages/getbytoken', methods=['GET'])
def get_user_messages_by_token():
    token = request.headers.get("token")
    email = database_helper.get_loggedinuser(token)['email']
    return get_user_messages_by_email(email)

@app.route('/user/messages/getbyemail/<email>', methods=['GET'])
def get_user_messages_by_email(email):
    token = request.headers.get("token")
    if database_helper.get_loggedinuser(token) != None:
        if database_helper.get_user(email) != None:
            messages = database_helper.get_usermessages(email)
            if messages != None:
                result = [message for message in messages]
                return jsonify({"success": True, "msg": "User messages retrieved", "data": result})
            else:
                return jsonify({"success": True, "msg": "User messages retrieved", "data": None})
        else:
            return jsonify({"success": False, "msg": "User doesn't exist"})
    else:
        return jsonify({"success": False, "msg": "User is not signed in"})

@app.route('/user/messages/post', methods=['POST'])
def post_message():
    data = request.get_json()
    token = request.headers.get("token")
    fromemail = database_helper.get_loggedinuser(token)['email']
    if database_helper.get_user(fromemail) != None:
        if data['toemail'] == None:
            data['toemail'] = fromemail
        if database_helper.get_user(data['toemail']) != None:
            database_helper.save_message(data['message'], fromemail, data['toemail'])
            return {"success": True, "msg": "Message posted"}
        else:
            return jsonify({"success": False, "msg": "Recipient user doesn't exist"})
    else:
        return jsonify({"success": False, "msg": "User is not signed in"})

# @app.route('/user/test/<email>', methods=['POST'])
# def test(email):
#     print(database_helper.get_usermessages(email))
#     return jsonify(database_helper.get_usermessages(email))


if __name__ == '__main__':
    app.debug = True
    http_server = WSGIServer(('127.0.0.1', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
