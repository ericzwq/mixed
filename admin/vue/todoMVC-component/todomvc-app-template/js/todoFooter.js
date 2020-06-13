;(function () {
	let template = `<footer class="footer">
\t\t<span class="todo-count"><strong>0</strong> item left</span>
\t\t<ul class="filters">
\t\t\t<li>
\t\t\t\t<a class="selected" href="#/">All</a>
\t\t\t</li>
\t\t\t<li>
\t\t\t\t<a href="#/active">Active</a>
\t\t\t</li>
\t\t\t<li>
\t\t\t\t<a href="#/completed">Completed</a>
\t\t\t</li>
\t\t</ul>
\t\t<button class="clear-completed">Clear completed</button>
\t</footer>`;
	window.todoFooter = {
		template,
		data() {
			return {}
		}
	};
}())
