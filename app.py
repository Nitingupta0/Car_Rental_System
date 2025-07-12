from flask import Flask, render_template, request, redirect, url_for, jsonify, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from flask_session import Session
import re

app = Flask(__name__, root_path=".")
app.secret_key = 'super_secret_123'

# Configure Flask-Session
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# -----------------------
# DATABASE SETUP
# -----------------------
def get_db_connection():
    conn = sqlite3.connect('rental_system.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = sqlite3.connect('rental_system.db')
    cursor = conn.cursor()

    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )
    ''')

    # Create cars table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT
        )
    ''')

    # Create bookings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            car_id INTEGER,
            booking_date TEXT,
            return_date TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(car_id) REFERENCES cars(id)
        )
    ''')

    # Create rental history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rental_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            car TEXT,
            user_id INTEGER,
            return_date TEXT
        )
    ''')

    conn.commit()
    conn.close()

init_db()

# -----------------------
# HELPER FUNCTIONS
# -----------------------
def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

# -----------------------
# AUTHENTICATION ROUTES
# -----------------------
@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    hashed_password = generate_password_hash(password)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", (name, email, hashed_password, role))
        conn.commit()
        conn.close()
        return jsonify({"message": "User registered successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 409

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, password, role FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user[2], password):
        session['user_id'] = user[0]
        session['user_name'] = user[1]
        session['user_role'] = user[3]
        return jsonify({"message": "Login successful", "user": {"id": user[0], "name": user[1], "role": user[3]}}), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

# -----------------------
# CARS API ROUTES
# -----------------------
@app.route('/api/cars', methods=['GET'])
def get_cars():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cars")
    cars = [dict(id=row[0], name=row[1], type=row[2], price=row[3], image=row[4]) for row in cursor.fetchall()]
    conn.close()
    return jsonify(cars)

@app.route('/api/cars/<int:car_id>', methods=['GET'])
def get_car(car_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cars WHERE id = ?", (car_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return jsonify(dict(id=row[0], name=row[1], type=row[2], price=row[3], image=row[4]))
    return jsonify({"error": "Car not found"}), 404

@app.route('/api/cars', methods=['POST'])
def add_car():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO cars (name, type, price, image) VALUES (?, ?, ?, ?)", (data['name'], data['type'], data['price'], data['image']))
    conn.commit()
    conn.close()
    return jsonify({"message": "Car added successfully"}), 201

@app.route('/api/cars/<int:car_id>', methods=['PUT'])
def update_car(car_id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE cars SET name = ?, type = ?, price = ?, image = ? WHERE id = ?", (data['name'], data['type'], data['price'], data['image'], car_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Car updated successfully"})

@app.route('/api/cars/<int:car_id>', methods=['DELETE'])
def delete_car(car_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM cars WHERE id = ?", (car_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Car deleted successfully"})

# -----------------------
# RENTAL HISTORY API
# -----------------------
@app.route('/api/add-rental', methods=['POST'])
def add_rental():
    data = request.json
    date = data.get('date')
    car = data.get('car')
    user_id = data.get('user_id')
    return_date = data.get('return_date')

    if not date or not car or not user_id or not return_date:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO rental_history (date, car, user_id, return_date) VALUES (?, ?, ?, ?)", 
                   (date, car, user_id, return_date))
    conn.commit()
    conn.close()

    return jsonify({"message": "Booking successful"}), 201

@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({'error': 'All fields are required'}), 400

    conn = sqlite3.connect('Rental_database.sql')
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email, password))
        conn.commit()
        return jsonify({'message': 'User registered successfully'}), 200
    except sqlite3.IntegrityError:
        return jsonify({'error': 'User already exists'}), 409
    finally:
        conn.close()


# -----------------------
# MAIN
# -----------------------

# Serve HTML pages
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register.html')
def register_page():
    return render_template('register.html')

@app.route('/login.html')
def login_page():
    return render_template('login.html')

@app.route('/cars.html')
def cars_page():
    return render_template('cars.html')

@app.route('/booking.html')
def booking_page():
    return render_template('booking.html')

@app.route('/rental_history.html')
def history_page():
    return render_template('rental_history.html')


if __name__ == '__main__':
    app.run(debug=True)
