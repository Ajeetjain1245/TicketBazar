from flask import Flask, render_template, redirect, url_for, request, flash

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a secure secret key

# Dummy event data
events = [
    {'title': 'Music Concert', 'date': '2025-04-15', 'location': 'Guretha', 'description': 'A live music concert featuring local bands.'},
    {'title': 'Food Festival', 'date': '2025-04-20', 'location': 'Guretha', 'description': 'Taste food from all around the world!'},
    {'title': 'Tech Talk', 'date': '2025-04-22', 'location': 'Guretha', 'description': 'Join industry experts for a talk on the latest in tech.'},
    # Add more events as needed
]

# Route for the homepage
@app.route('/')
def home():
    return render_template('front.html')

# Route for the login page
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # For simplicity, we'll just check if the username and password match a hardcoded value
        if username == 'user' and password == 'password':
            flash('Login successful!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Invalid credentials, please try again.', 'danger')
    
    return render_template('login.html')

# Route for the signup page
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        
        # Here, you would normally save the user data to a database
        flash('Signup successful! Please login to continue.', 'success')
        return redirect(url_for('login'))
    
    return render_template('signup.html')

# Route for the All Events page
@app.route('/allevents')
def allevents():
    return render_template('allevents.html', events=events)

if __name__ == '__main__':
    app.run(debug=True)
