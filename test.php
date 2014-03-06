<?php
require_once('chat.class.php');

$chat = new Chat();

echo $chat->getNewMessages();
?>