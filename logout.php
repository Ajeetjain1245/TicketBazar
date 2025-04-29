<?php
    session_start();
    session_destroy();
    header("Location: front.html"); // Redirect to your homepage after logout
    exit();
?>