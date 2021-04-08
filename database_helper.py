import sqlite3
from flask import g

DATABASE_URI = "databaseV4.db"

def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
    return db

def disconnect_db():
    db = getattr(g, 'db', None)
    if db is not None:
        g.db.close()
        g.db = None

def save_user(email, password, firstname, familyname, gender, city, country):
    try:
        get_db().execute("insert into user values(?,?,?,?,?,?,?);", [email, password, firstname, familyname, gender, city, country])
        get_db().commit()
        return True
    except:
        return False

def get_user(email):
    cursor = get_db().execute("SELECT * FROM user WHERE email = ?;", [email])
    user = cursor.fetchone()
    
    if user:
        result = {'email': user[0], 'password': user[1], 'firstname': user[2], 'familyname': user[3], 'gender': user[4], 'city': user[5], 'country': user[6]}
        return result
    else:
        return None

def save_token(email, token):
    try:
        get_db().execute("INSERT into loggedinusers values(?, ?);", [token, email])
        get_db().commit()
        return True
    except:
        return False

def delete_token(token):
    try:
        get_db().execute("delete from loggedinusers where token = ?;", [token])
        get_db().commit()
        return True
    except:
        return False

def get_loggedinuser(token):
    cursor = get_db().execute("SELECT * FROM loggedinusers WHERE token = ?;", [token])
    loggedinuser = cursor.fetchone()
    
    if loggedinuser:
        result = {'token': loggedinuser[0], 'email': loggedinuser[1]}
        return result
    else:
        return None

def get_usermessages(toemail):
    cursor = get_db().execute("SELECT * FROM messages WHERE toemail = ?;", [toemail])
    messages = cursor.fetchall()
    if messages:
        return messages
    else:
        return None

def save_message(content, fromemail, toemail):
    try:
        get_db().execute("insert into messages values(?, ?, ?);", [content, fromemail, toemail])
        get_db().commit()
        return True
    except:
        return False

def change_password(email, newpassword):
    try:
        get_db().execute("UPDATE user SET password = ? WHERE email = ?;", [newpassword, email])
        get_db().commit()
        return True
    except:
        return False
    