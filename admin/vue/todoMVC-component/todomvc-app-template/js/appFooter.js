;(function () {
	let template = `
<footer class="info">
	<p>Double-click to edit a todo</p>
	<p>Template by <a href="http://sindresorhus.com">Sindre Sorhus</a></p>
	<p>Created by <a href="http://todomvc.com">you</a></p>
	<p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
</footer>`;
	window.appFooter = {
		template,
		data(){
			return {}
		}
	};
}())
