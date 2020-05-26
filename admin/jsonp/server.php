<?php 
	// header('Access-Control-Allow-Origin: http://myfilew');
	// header('Content-Type: application/javascript');
	// $res = '[{"id":"59d632855434e","title":"\u9519\u8fc7","artist":"\u6881\u548f\u742a","images":["\/uploads\/img\/1.jpg"],"source":"\/uploads\/mp3\/1.mp3"},{"id":"59d632855434f","title":"\u5f00\u59cb\u61c2\u4e86","artist":"\u5b59\u71d5\u59ff","images":["\/uploads\/img\/2.jpg"],"source":"\/uploads\/mp3\/2.mp3"},{"id":"59d6328554350","title":"\u4e00\u751f\u4e2d\u6700\u7231","artist":"\u8c2d\u548f\u9e9f","images":["\/uploads\/img\/3.jpg"],"source":"\/uploads\/mp3\/3.mp3"},{"id":"59d6328554351","title":"\u7231\u5728\u6df1\u79cb","artist":"\u8c2d\u548f\u9e9f","images":["\/uploads\/img\/4.jpg"],"source":"\/uploads\/mp3\/4.mp3"},{"id":"59f0592aa33d8","title":"123123","artist":"123123","images":"123","source":"1231"}]';
	$conn = mysqli_connect('localhost','root','123456','users');
	if (empty($_GET['id'])) {
		$query = mysqli_query($conn,'select * from users;');
	} else{
		$query = mysqli_query($conn,'select * from users where id in (' . $_GET['id'] . ');');
		// if ($query == 'NULL') {
		// 	exit('<h1>没有此参数的数据</h1>');
		// }
		$item = mysqli_fetch_assoc($query);
		if ($item == '') {
			exit('document.body.innerText="没有此参数的数据"');
		} else {
			$res[] = Array($item['id'],$item['name'],$item['age'],$item['drenger']);
			while($item = mysqli_fetch_assoc($query)) {
				$res[] = Array($item['id'],$item['name'],$item['age'],$item['drenger']);
			}
		}
	}
	// while($item = mysqli_fetch_assoc($query)) {
	// 	$GLOBALS['res'] = Array($item['id'],$item['name'],$item['age'],$item['drenger']);
	// }
		// var_dump($res);
	$data = json_encode($res);
	// $index = array_search($_GET['id'], $res);
	// var_dump($res);
	// if (empty($_GET['id'])) {
	// 	echo "typeof {$_GET['callback']}=='function' && {$_GET['callback']}({$data})";
	// 	exit();
	// }else {
		// echo "typeof {$_GET['callback']}=='function' && {$_GET['callback']}(" + $data[$_GET['id']] + ')';
	// }
	echo "typeof {$_GET['callback']}=='function' && {$_GET['callback']}({$data})";
 ?>