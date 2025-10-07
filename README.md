# 📱 Campus Utility App (Minor Project)

A **Django-based web application** with an Android wrapper that brings essential campus utilities in one place.
Features include **event & activity notifications**, **lost and found system**, **campus map & facilities**, and **issue reporting**.

The app is accessible both via **web browser** and as a **mobile app (WebView)**.

---

## 🚀 Features

* 📢 **Notifications** – Stay updated with campus events and activities.
* 🗺 **Campus Map & Facilities** – Quick access to important locations & services.
* 🛠 **Issue Reporting** – Report and track problems around campus.
* 🎒 **Lost & Found** – Submit or browse lost & found items (AI-assisted matching planned).
* 🔑 **User Accounts** – Google Sign-In integration (planned).

---

## 🛠️ Tech Stack

**Frontend**

* HTML5, CSS3, JavaScript
* Responsive UI with modern design

**Backend**

* Django (Python)
* SQLite Database

**Android Wrapper**

* Android Studio (Java / Kotlin)
* WebView integration

---

## 📂 Project Structure

```
CampusApp/
│── backend/              # Flask backend
│   ├── app.py            # Main Flask app
│   ├── models.py         # Database models
│   ├── templates/        # HTML templates (Jinja2)
│   └── static/           # CSS, JS, images
│
│── android/              # Android Studio project
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/example/MainActivity.java
│   │   └── res/
│
│── README.md             # Project documentation
```

---

## ⚙️ Installation & Setup

### 1️⃣ Web App (Flask)

```bash
# Clone repo
git clone https://github.com/djbhai9/CampusCare.git
cd CampusApp/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Django server
manage.py runserver
```

App runs on: `http://127.0.0.1:8000/`

---

### 2️⃣ Android App (WebView Wrapper)

1. Open `android/` folder in **Android Studio**.
2. Replace the WebView URL in `MainActivity.java` with your server/public domain:

   ```java
   webView.loadUrl("http://your-flask-server.com");
   ```
3. Build & run on emulator / device.

---

## 🔮 Future Improvements

* ✅ AI-assisted Lost & Found (text + image matching).
* ✅ Push Notifications for events & reports.
* ✅ Campus facility booking (labs, halls, equipment).
* ✅ Offline support via **Progressive Web App (PWA)**.

---

## 🤝 Contribution

Contributions are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature-name`)
3. Commit changes (`git commit -m 'Add feature xyz'`)
4. Push to branch (`git push origin feature-name`)
5. Create a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** – feel free to use and modify.

---



