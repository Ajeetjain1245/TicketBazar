<?php
$host = 'localhost';
$user = 'root';
$pass = ''; // If you're using XAMPP default settings
$db = 'mydb';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>