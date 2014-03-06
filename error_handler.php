<?php

set_error_handler('chatErrorHandler', E_ALL);

function chatErrorHandler($number, $text, $theFile, $theLine) {
	//get length of the output buffer, then clean it if something is in it
	//chr(10) go to a new line, 13 is to the left
	if(ob_get_length()) ob_clean();
	$errorMessage = 'Error: ' . $number . chr(10) .
					'Message: ' . $text . chr(10) .
					'File: ' . $theFile . chr(10) .
					'Line: ' . $theLine;
	echo $errorMessage;
	exit;
}

?>