<?php
$imgfile = 'palette.png';
$img = imagecreatefrompng($imgfile);
$offsetx = $_GET['offsetx'];
$offsety = $_GET['offsety'];
$rgb = ImageColorAt($img, $offsetx, $offsety);
$r = ($rgb >> 16) & 0xFF;
$g = ($rgb >> 8) & 0xFF;
$b = $rgb & 0xFF;

printf('#%02s%02s%02s', dechex($r), dechex($g), dechex($b));
?>