<?php
$conn = mysqli_connect('localhost','root','123456','users');
if (!$conn) {
	exit('<h1>连接数据库失败</h1>');
}
$query = mysqli_query($conn,"delete from users where id=" . $_GET['id']);
var_dump($query);
if (!$query) {
	exit('<h1>查询数据库失败</h1>');
}
$item = mysqli_fetch_assoc($query);
header('Location: connMysql.php');
mysqli_free_result($query);
mysqli_close($conn);