<?php
// Replace with your actual database credentials
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

$sql = "SELECT ticket_id, event_name, price, event_date, event_location, event_category FROM tickets"; // Adjust column names to match your database
$result = $conn->query($sql);

$tickets_from_db = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $tickets_from_db[] = array(
            'title' => $row['event_name'],
            'date' => $row['event_date'],
            'location' => $row['event_location'],
            'category' => $row['event_category'],
            'price' => $row['price'] // You can include the price if you want to display it
            // Add other relevant fields from your 'tickets' table
        );
    }
}
$conn->close();

header('Content-Type: application/json');
echo json_encode($tickets_from_db);
exit();
?>