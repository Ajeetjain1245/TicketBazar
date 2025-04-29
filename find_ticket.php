<?php
header("Content-Type: application/json");
include 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = trim($_POST['query']);
    $input = $conn->real_escape_string($input);

    $sql = is_numeric($input) ?
        "SELECT * FROM tickets WHERE id = '$input' LIMIT 1" :
        "SELECT * FROM tickets WHERE title LIKE '%$input%' LIMIT 1";

    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        $ticket = $result->fetch_assoc();
        echo json_encode([
            'status' => 'success',
            'ticket' => [
                'title' => $ticket['title'],
                'price' => $ticket['price'],
                'description' => $ticket['description'],
                'event_date' => $ticket['event_date'],
                'ticket_type' => $ticket['ticket_type'],
                'venue' => $ticket['city'] . ', ' . $ticket['state'],
                'id' => $ticket['id']
            ]
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No ticket found.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}

$conn->close(); // Added to close the connection
?>