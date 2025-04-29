<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Database connection details (replace with your actual credentials)
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "mydb";

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Get user input from the form
    $email = $_POST["email"];
    $username = $_POST["username"];
    $plain_password = $_POST["password"]; // Get the plain password

    // Basic email validation
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format";
        $conn->close();
        exit();
    }

    // Hash the password securely
    $hashed_password = password_hash($plain_password, PASSWORD_DEFAULT);

    // Check if the username or email already exists
    $sql_check = "SELECT id FROM users WHERE email='$email' OR username='$username'";
    $result_check = $conn->query($sql_check);

    if ($result_check->num_rows > 0) {
        echo "Email or username already exists";
    } else {
        // Prepare and bind the SQL statement to prevent SQL injection
        $stmt = $conn->prepare("INSERT INTO users (email, username, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $email, $username, $hashed_password); // Store the hashed password

        if ($stmt->execute()) {
            echo "Account created successfully!";
            // Optionally, redirect the user to a login page
            // header("Location: login.html");
            // exit();
        } else {
            echo "Error creating account: " . $stmt->error;
        }

        $stmt->close();
    }
    $conn->close();
} else {
    // If the script is accessed directly (not via POST), return an error
    header("HTTP/1.0 405 Method Not Allowed");
    echo "Method Not Allowed";
}
?>