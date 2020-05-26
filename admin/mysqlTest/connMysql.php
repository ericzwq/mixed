<?php $conn = mysqli_connect('127.0.0.1','root','123456','users');
	if (!$conn) {
		exit('<h1>数据库连接失败</h1>');
	}
	$query = mysqli_query($conn,'select * from users');
	if (!$query) {
		exit('<h1>数据库查询失败</h1>');
	} ?>
<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>
	<a href="add.php">增加</a>
<table style="text-align: center;">
	<thead>
		<th>编号</th>
		<th>姓名</th>
		<th>年龄</th>
		<th>性别</th>
		<th>操作</th>
	</thead>
	<tbody>
		<?php while ($item = mysqli_fetch_assoc($query)): $id = $item['id']; ?>
			<tr>
				<td><?php echo $item['id'] ?></td>
				<td><?php echo $item['name'] ?></td>
				<td><?php echo $item['age'] ?></td>
				<td><?php echo $item['drenger'] ?></td>
				<td>
					<a href="delete.php?id=<?php echo($id); ?>">删除</a>
					<a href="update.php?id=<?php echo($id); ?>">修改</a>
				</td>
			</tr>
		<?php endwhile ?>
		<?php mysqli_free_result($query);
		mysqli_close($conn); ?>
	</tbody>
</table>
</body>
</html>