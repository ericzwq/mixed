;(function () {
    // let todos = [
    //     {
    //         id: 0,
    //         title: '吃饭',
    //         completed: true
    //     },
    //     {
    //         id: 1,
    //         title: '睡觉',
    //         completed: false
    //     },
    //     {
    //         id: 2,
    //         title: '打豆豆',
    //         completed: false
    //     }
    // ];
    var vm = new Vue({
        el: '#app',
        data: {
            todos: JSON.parse(localStorage.getItem('todos')) || [],
            currentEdit: null,
            hash: localStorage.getItem('hash') || '/'
        },
        methods: {
            handleAddNewTodo(e) {
                let title = e.target.value.trim();
                if (!title) return false;
                this.todos.push({
                    id: this.todos.length && this.todos[this.todos.length - 1].id + 1 || 0,
                    title: title,
                    completed: false
                });
                e.target.value = '';
            },
            handleDeleteTodo(index) {
                this.todos.splice(index, 1)
                console.log(location.hash)
            },
            handleDeleteAllTodo() {
                for (let i = this.todos.length - 1; i >= 0; i--) {
                    if (this.todos[i].completed === true) this.todos.splice(i, 1);
                }
            },
            handleToggleCheckAll(e) {
                let check = e.target.checked;
                this.todos.forEach(function (item) {
                    item.completed = check;
                })
            },
            handleEditingTodo(e) {
                this.currentEdit = e.target.nextElementSibling.id;
            },
            handleEditedTodo(index, e) {
                this.currentEdit = null;
                if (e.target.value === '') {
                    this.todos.splice(index, 1)
                } else {
                    this.todos[index].title = e.target.value;
                }
            }
        },
        computed: {
            remainTodo() {
                return this.todos.filter(t => !t.completed).length;
            },
            changeToggleState() {
                return this.todos.every(t => t.completed);
            },
            filterTodos() {
                return this.hash === '/' ? this.todos : this.hash === '/active' ? this.todos.filter(t => !t.completed) : this.todos.filter(t => t.completed);
            }
        },
        watch: {
            todos: {
                handler(val) {
                    localStorage.setItem('todos', JSON.stringify(val));
                },
                deep: true
            },
        }
    });
    window.onhashchange = function () {
        var hash = location.hash.substr(1);
        if (hash === '/') {
            vm.hash = '/';
            localStorage.setItem('hash', '/');
        } else if (hash === '/active') {
            vm.hash = '/active';
            localStorage.setItem('hash', '/active');
        } else if (hash === '/completed') {
            vm.hash = '/completed';
            localStorage.setItem('hash', '/completed');
        }
    }
}())