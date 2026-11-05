import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from postgrest import APIError
from supabase import Client, create_client
from supabase.lib.client_options import ClientOptions

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": (os.environ.get("CORS_ORIGINS") or "*").split(",")}})


def client(access_token=None) -> Client:
    url, key = os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be configured")
    options = ClientOptions(headers={"Authorization": f"Bearer {access_token}"}) if access_token else None
    return create_client(url, key, options=options)


def require_user():
    authorization = request.headers.get("Authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        return None, None, (jsonify(error="Bearer access token required"), 401)
    try:
        supabase = client()
        user = supabase.auth.get_user(token.strip()).user
        if user is None:
            raise ValueError("No user")
        return user, token.strip(), None
    except Exception:
        return None, None, (jsonify(error="Invalid or expired access token"), 401)


def db_error(error):
    app.logger.exception("Supabase request failed")
    return jsonify(error="A database request failed"), 500


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.get("/api/events")
def list_events():
    try:
        return jsonify(client().table("events").select("*").execute().data)
    except Exception as error:
        return db_error(error)


@app.get("/api/events/<event_id>")
def event_details(event_id):
    try:
        rows = client().table("events").select("*").eq("id", event_id).limit(1).execute().data
        return (jsonify(rows[0]), 200) if rows else (jsonify(error="Event not found"), 404)
    except Exception as error:
        return db_error(error)


@app.post("/api/registrations")
def create_registration():
    user, token, error_response = require_user()
    if error_response:
        return error_response
    payload = request.get_json(silent=True) or {}
    event_id = payload.get("event_id")
    if event_id is None or str(event_id).strip() == "":
        return jsonify(error="event_id is required"), 400
    try:
        db = client(token)
        event = db.table("events").select("id").eq("id", event_id).limit(1).execute().data
        if not event:
            return jsonify(error="Event not found"), 404
        rows = db.table("registrations").insert({"event_id": event_id, "user_id": user.id}).execute().data
        return jsonify(rows[0] if rows else {}), 201
    except APIError as error:
        if getattr(error, "code", None) == "23505":
            return jsonify(error="Already registered for this event"), 409
        return db_error(error)
    except Exception as error:
        return db_error(error)


@app.get("/api/me/registrations")
def my_registrations():
    user, token, error_response = require_user()
    if error_response:
        return error_response
    try:
        rows = client(token).table("registrations").select("*").eq("user_id", user.id).execute().data
        return jsonify(rows)
    except Exception as error:
        return db_error(error)


@app.get("/api/events/<event_id>/registrations")
def event_registrations(event_id):
    user, token, error_response = require_user()
    if error_response:
        return error_response
    try:
        db = client(token)
        events = db.table("events").select("id,organizer_id").eq("id", event_id).limit(1).execute().data
        if not events:
            return jsonify(error="Event not found"), 404
        if events[0].get("organizer_id") != user.id:
            return jsonify(error="Only the event organizer can view attendees"), 403
        rows = db.table("registrations").select("*").eq("event_id", event_id).execute().data
        return jsonify(rows)
    except Exception as error:
        return db_error(error)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")))
