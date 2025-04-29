<?php
// Database connection details (replace with your actual credentials)
$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "mydb";

// Check if the form is submitted using the POST method
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Create a database connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Retrieve form data and sanitize it to prevent SQL injection
    $eventName = mysqli_real_escape_string($conn, $_POST["event-name"]);
    $eventType = mysqli_real_escape_string($conn, $_POST["eventType"]);
    $eventDate = mysqli_real_escape_string($conn, $_POST["event-date"]);
    $country = mysqli_real_escape_string($conn, $_POST["country"]);
    $state = mysqli_real_escape_string($conn, $_POST["state"]);
    $city = mysqli_real_escape_string($conn, $_POST["city"]);
    $ticketPrice = mysqli_real_escape_string($conn, $_POST["ticket-price"]);
    $description = mysqli_real_escape_string($conn, $_POST["description"]);
    $createdAt = date("Y-m-d H:i:s"); // Current timestamp

    // SQL query to insert data into the 'tickets' table
    $sql = "INSERT INTO tickets (title, price, seller, description, created_at, ticket_type, event_date, country, state, city)
            VALUES ('$eventName', '$ticketPrice', 'user_placeholder', '$description', '$createdAt', '$eventType', '$eventDate', '$country', '$state', '$city')";

    if ($conn->query($sql) === TRUE) {
        echo "New event added successfully!";
        // Optionally, you can redirect the user to a success page
        // header("Location: success.html");
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

    $conn->close();
} else {
    echo "Invalid request method.";
}
?>