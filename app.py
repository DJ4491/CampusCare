from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("home.html", title="Campus Connect")


#! Partial content routes


@app.route("/contenthome")
def content_home():
    return render_template("content/home.html")


@app.route("/search")
def content_search():
    return render_template("content/search.html")


@app.route("/create")
def content_create():
    return render_template("content/create.html")


@app.route("/notifications")
def content_notifications():
    return render_template("content/notifications.html")


@app.route("/user_profile")
def content_profile():
    user_data = {
        "AboutMe": "Hi I am John Doe and I'm just going...",
        "username": "john_doe",
        "email":"Johndoe@gmail.com"
    }
    return render_template("content/user_profile.html", user_data=user_data)


if __name__ == "__main__":
    app.run(debug=True)
