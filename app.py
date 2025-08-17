from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("home.html", title="Campus Connect")


#! Partial content routes


@app.route("/content/home")
def content_home():
    return render_template("content/home.html")


@app.route("/content/search")
def content_search():
    return render_template("content/search.html")


@app.route("/content/create")
def content_create():
    return render_template("content/create.html")


@app.route("/content/notifications")
def content_notifications():
    return render_template("content/notifications.html")


@app.route("/content/user_profile")
def content_profile():
    user_data = {
        "username": "john_doe",
        "bio": "Software engineer passionate about web development.",
        "posts": [
            {"title": "My First Post", "content": "Hello world!"},
            {"title": "Flask Tips", "content": "Using Jinja for dynamic rendering."},
        ],
        "follower_count": 150,
    }
    return render_template("content/user_profile.html", user_data=user_data)


if __name__ == "__main__":
    app.run(debug=True)
