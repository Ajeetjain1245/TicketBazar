<?php
session_start();
include 'db_connect.php';

$error_message = ""; // Initialize an error message variable

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];

    // It's generally a good practice to use prepared statements to prevent SQL injection
    $stmt = $conn->prepare("SELECT id, email, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email']; // You had this commented out, but it's useful
            header('Location: /LPBEI/TicketBazar-main/index.php'); // Redirect to homepage
            exit();
        } else {
            $error_message = "Invalid password!";
        }
    } else {
        $error_message = "No account found with this email!";
    }

    $stmt->close(); // Close the prepared statement
}

// $conn->close(); // Connection can be closed in db_connect.php or later if needed
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
</head>
<body>
    <h1>Login</h1>
    <?php if (!empty($error_message)): ?>
        <p style="color: red;"><?php echo $error_message; ?></p>
    <?php endif; ?>
    <form action="login.php" method="post">
        <label for="email">Email:</label><br>
        <input type="email" id="email" name="email" required><br><br>
        <label for="password">Password:</label><br>
        <input type="password" id="password" name="password" required><br><br>
        <input type="submit" value="Login" >
    </form>
    <p>Don't have an account? <a href="register.php">Register here</a></p>
</body>
</html>