from flask import Flask, render_template, request


app = Flask(__name__)


@app.route("/")
def home():
    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return render_template("home.html")  # just content block
    return render_template("base.html", content_template="home.html")


#! Partial content routes


@app.route("/log_on")
def content_in():
    return render_template("Pages/log_in.html")


@app.route("/search")
def search():
    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return render_template("content/search.html")  # just content block
    return render_template("base.html", content_template="content/search.html")


@app.route("/create")
def create():
    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return render_template("content/create.html")  # just content block
    return render_template("base.html", content_template="content/create.html")

@app.route("/All_Reports")
def content_reports():
    return render_template("Pages/All_Reports.html")


@app.route("/notifications")
def notifications():
    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return render_template("content/notifications.html")  # just content block
    return render_template("base.html", content_template="content/notifications.html")


@app.route("/user_profile")
def user_profile():
    user_data = {
        "AboutMe": "Hi I am John Doe...",
        "username": "john_doe",
        "email": "Johndoe@gmail.com",
    }
    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return render_template(
            "content/user_profile.html", user_data=user_data
        )  # just content block
    return render_template(
        "base.html", content_template="content/user_profile.html", user_data=user_data
    )


if __name__ == "__main__":
    app.run(debug=True)
