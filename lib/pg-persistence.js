const { dbQuery } = require('./db-query');

module.exports = class PgPersistence {

  constructor(session) {
    // this._todoLists = session.todoLists || deepCopy(SeedData);
    // session.todoLists = this._todoLists;
  }

  _partitionTodoLists(todoLists) {
    let undone = [];
    let done = [];

    todoLists.forEach(todoList => {
      if (this.isDoneTodoList(todoList)) {
        done.push(todoList);
      } else {
        undone.push(todoList);
      }
    });

    return undone.concat(done);
  } 

  isDoneTodoList(todoList) {
    return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done);
  }

  async sortedTodoLists() {
    const ALL_TODOLISTS = "SELECT * FROM todolists ORDER BY lower(title) ASC";
    const FIND_TODOS = "SELECT * FROM todos WHERE todolist_id = $1";

    let result = await dbQuery(ALL_TODOLISTS);
    let todoLists = result.rows;

    for (let i = 0; i < todoLists.length; ++i) {
      let todoList = todoLists[i];
      let todos = await dbQuery(FIND_TODOS, todoList.id);
      todoList.todos = todos.rows;
    }

    return this._partitionTodoLists(todoLists);
  }

  hasUndoneTodos(todoList) {
    // return todoList.todos.some(todo => !todo.done);
  }

  sortedTodos(todoList) {
    // let copiedTodoList = deepCopy(todoList);
    // let undone = copiedTodoList.todos.filter(todo => !todo.done);
    // let done = copiedTodoList.todos.filter(todo => todo.done);
    // return sortItems(undone, done);
  }

  // Returns a copy of the list
  loadTodoList(todoListId) {
    // let list = this._findTodoList(todoListId);
    // return deepCopy(list);
  }

  // Returns a copy of the todo
  loadTodo (todoListId, todoId) {
    // let todo = this._findTodo(todoListId, todoId);
    // return deepCopy(todo);
  }

  // Returns the todo reference
  _findTodo(todoListId, todoId) {
    // let list = this._findTodoList(todoListId);
    // if (!list) return undefined;

    // return list.todos.find(todo => todo.id === todoId);
  }

  // Returns the list reference
  _findTodoList(todoListId) {
    // return this._todoLists.find(todoLists => todoLists.id === todoListId);
  } 

  toggleDoneTodo(todoListId, todoId) {
    // let todo = this._findTodo(todoListId, todoId);
    // if (!todo) return false;

    // todo.done = !todo.done;
    // return true;
  }

  removeTodo(todoListId, todoId) {
    // let list = this._findTodoList(todoListId);
    // let todo = this._findTodo(todoListId, todoId);

    // list.todos.splice(list.todos.indexOf(todo), 1);
  }

  removeTodoList(todoListId) {
    // let list = this._findTodoList(todoListId);
    // let index = this._todoLists.indexOf(list);
    // this._todoLists.splice(index, 1);
  }

  markAllDone(todoListId) {
    // let list = this._findTodoList(todoListId);
    // list.todos.forEach(todo => todo.done = true);
  }

  createTodo(todoListId, title) {
    // let todoList = this._findTodoList(todoListId);
    // if (!todoList) return false;

    // todoList.todos.push({
    //   title,
    //   id: nextId(),
    //   done: false,
    // });

    // return true;
  }

  setListTitle(todoListId, newTitle) {
    // let list = this._findTodoList(todoListId);
    // list.title = newTitle;
  }

  existsTodoListTitle(title) {
    // return this._todoLists.some(todoList => todoList.title === title);
  }

  creatTodoList(title) {
  //   this._todoLists.push({
  //     title,
  //     id: nextId(),
  //     todos: [],
  //   });
    
  //   return true;
  }
};