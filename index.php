<?php
    session_start();

    // Check if the user is logged in
    if (isset($_SESSION['user_id'])) {
        // User is logged in, display welcome message and logout link
        $userId = $_SESSION['user_id'];
        $userEmail = $_SESSION['email'];
        echo "<h1>Welcome!</h1>";
        echo "<p>User ID: $userId</p>";
        echo "<p>Email: $userEmail</p>";
        echo "<p><a href='logout.php'>Logout</a></p>";
        // You can add more content for logged-in users here
    } else {
        // User is not logged in, display login form
        echo "<h1>Login</h1>";
        echo "<form action='login.php' method='post'>";
        echo "    <label for='email'>Email:</label><br>";
        echo "    <input type='email' id='email' name='email'><br><br>";
        echo "    <label for='password'>Password:</label><br>";
        echo "    <input type='password' id='password' name='password'><br><br>";
        echo "    <input type='submit' value='Login'>";
        echo "</form>";
        echo "<p>Don't have an account? <a href='register.php'>Register here</a></p>"; // Optional registration link
    }
?>