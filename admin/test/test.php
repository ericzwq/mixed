<?php
var_dump($_SERVER['HTTP_REFERER']);
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title></title>
	<style type="text/css">
	</style>
</head>
<body>
  <form action="<?php $_SERVER['PHP_SELF']?>">
    <input type="number" value="11" name="num">
    <input type="text" name="text" value="aa">
    <button>aa</button>
  </form>
	<canvas id="myChart" width="400" height="400"></canvas>
	<!-- <script src="/static/assets/venders/chart/Chart.js"></script> -->
  <script src="fun.php"></script>
<script>
a()
</script>
</body>
</html>