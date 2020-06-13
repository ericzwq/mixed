;(function () {
	let template = `<section class="main" @click="test">
\t\t<input id="toggle-all" class="toggle-all" type="checkbox">
\t\t<label for="toggle-all">Mark all as complete</label>
\t\t<ul class="todo-list">
\t\t\t<li :class="i.completed?'completed':''" v-for="i in filterTodos">
\t\t\t\t<div class="view">
\t\t\t\t\t<input class="toggle" type="checkbox" v-model="i.completed">
\t\t\t\t\t<label>{{ i.title }}</label>
\t\t\t\t\t<button class="destroy"></button>
\t\t\t\t</div>
\t\t\t\t<input class="edit" value="Create a TodoMVC template">
\t\t\t</li>
\t\t</ul>
\t</section>
`;
	window.todoList = {
		template,
		props: ['todos','hash'],
		data() {
			return {}
		},
		methods: {
			test() {
				console.log(this.todos,this.hash)
			}
		},
		computed:{
			filterTodos() {
				return this.hash === '/' ? this.todos : this.hash === '/active' ? this.todos.filter(t => !t.completed) : this.todos.filter(t => t.completed);
			}
		}
	};
}())
