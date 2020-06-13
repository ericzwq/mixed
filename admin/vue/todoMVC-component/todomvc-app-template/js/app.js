;(function () {
	let todos = [
		{
			id: 0,
			title: '吃饭',
			completed: true
		},
		{
			id: 1,
			title: '睡觉',
			completed: false
		},
		{
			id: 2,
			title: '打豆豆',
			completed: false
		}
	];
	window.App = {
		template: `
			<div>
				<section class="todoapp">
					<todoHeader @new-todo="addNewTodo"></todoHeader>
					<todoList :todos="todos" :hash="hash"></todoList>
					<todoFooter></todoFooter>
				</section>
				<appFooter></appFooter>
			</div>`,
		components: {
			todoHeader,
			todoList,
			todoFooter,
			appFooter
		},
		data() {
			return {
				todos,
				hash: '/'
			}
		},
		methods: {
			addNewTodo(value) {
				todos.push({
					id: todos.length && todos[todos.length - 1] + 1,
					title: value,
					completed: false
				});
			}
		},
		created() {
			window.onhashchange = () => {
				let hash = location.hash.substr(1);
				this.hash = hash;
			}
		}
	};
})();
