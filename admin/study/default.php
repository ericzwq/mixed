<?php if ($_SERVER['REQUEST_METHOD'] == 'GET') {
	//file_put_contents('users.txt', $_POST['text1'] . '|' . $_POST['password'] . "\r",FILE_APPEND);
	//$arr=array();
	// $file1=$_FILES['file'];
	//array(5) { ["name"]=> string(10) "公告.png" ["type"]=> string(9) "image/png" ["tmp_name"]=> string(27) "C:\Windows\Temp\php5C2C.tmp" ["error"]=> int(0) ["size"]=> int(1918692) }
	// var_dump($file1);
	// if ($file1['error']!==0) {
	// 	echo $file1['error'];
	// }
	// $filename=$file1['tmp_name'];
	// $destination ='uploads/' . $file1['name'];
	// move_uploaded_file($filename, $destination);
	// header('Content-Type: text/css');
	// header('Location: js.php');
	// $arrData = '[{"name":"1","age":"1"},{"name":"2","age":"2"},{"name":"3","age":"3"}]';
	$objData = '{"name":[1,2],"age":[3,4]}';
	// $arrDa=json_decode($arrData,true);
	// var_dump($arrDa[0]);
	// echo "=======================";
	$objDa = json_decode($objData);
	var_dump($objDa->name);
	//PHP双引号解析变量
	// $str='str';
	// $str2 = "ss${str}ss";
	// echo $str2;

	// $arr = array(array(1,2), 'b' => 2, 'c' => 3, 'd' => 4, 'e' => 5);
	//    echo json_encode($arr);
	class Site {
		/* 成员变量 */
		var $url;
		var $title;

		/* 成员函数 */
		function setUrl($par) {
			$this->url = $par;
		}

		function getUrl() {
			echo $this->url . PHP_EOL;
		}

		function setTitle($par) {
			$this->title = $par;
		}

		function getTitle() {
			echo $this->title . PHP_EOL;
		}
	}
	$s = new Site;
	echo $s->url;
}?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>员工信息管理系统</title>
</head>
<body>
<!-- <link rel="stylesheet" href="js.php"> -->
<form action="<?php echo $_SERVER['PHP_SELF'] ?>" method="POST" enctype="multipart/form-data">
    姓名<input type="text" name="text1">
    密码<input type="password" name="password">
    <input type="checkbox" name="ck" value="ckVal">
    A<input type="radio" name="ra1">
    B<input type="radio" name="ra1">
    <input type="file" name="file">
    <br>
    <button>提交</button>
</form>
<!-- <?php echo $_SERVER['PHP_SELF']; ?> -->
<div id="dv"></div>
<?php
$i = 1;
while ($i <= 2): ?>
    <p><?php echo $i;
$i++; ?></p>
<?php endwhile?>
<script src="jq/jquery-1.12.2.js"></script>
<script type="text/javascript">
    //JS中反引号解析变量
    var str = 'str'
    var str2 = `ss${str}ss`
    console.log(str2)
    $(function () {
        $("#dv").load("test.html")
    })
</script>
</body>
</html>