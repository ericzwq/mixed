;(function () {
	let template = `
<header class="header">
	<h1>todos</h1>
	<input class="new-todo" placeholder="What needs to be done?" autofocus @keydown.enter="handleAddNewTodo">
</header>`;
	window.todoHeader = {
		template,
		data() {
			return {}
		},
		methods: {
			handleAddNewTodo(e) {
				let value = e.target.value.trim();
				if (value) {
					this.$emit('new-todo', value);
					e.target.value = '';
				} else {
					return false;
				}
			}
		}
	};
}())
