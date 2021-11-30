const SeedData = require('./seed-data');
const deepCopy = require('./deep-copy');
const { sortItems } = require('./sort');
const nextId = require('./next-id');

module.exports = class SessionPersistence {
  constructor(session) {
    this._todoLists = session.todoLists || deepCopy(SeedData);
    session.todoLists = this._todoLists;
  }

  isDoneTodoList(todoList) {
    return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done);
  }

  sortedTodoLists() {
    let todoLists = deepCopy(this._todoLists);
    let undone = todoLists.filter(todoList => !this.isDoneTodoList(todoList));
    let done = todoLists.filter(todoList => this.isDoneTodoList(todoList));
    return sortItems(undone, done);
  }

  hasUndoneTodos(todoList) {
    return todoList.todos.some(todo => !todo.done);
  }

  sortedTodos(todoList) {
    let copiedTodoList = deepCopy(todoList);
    let undone = copiedTodoList.todos.filter(todo => !todo.done);
    let done = copiedTodoList.todos.filter(todo => todo.done);
    return sortItems(undone, done);
  }

  // Returns a copy of the list
  loadTodoList(todoListId) {
    let list = this._findTodoList(todoListId);
    return deepCopy(list);
  }

  // Returns a copy of the todo
  loadTodo (todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    return deepCopy(todo);
  }

  // Returns the todo reference
  _findTodo(todoListId, todoId) {
    let list = this._findTodoList(todoListId);
    if (!list) return undefined;

    return list.todos.find(todo => todo.id === todoId);
  }

  // Returns the list reference
  _findTodoList(todoListId) {
    return this._todoLists.find(todoLists => todoLists.id === todoListId);
  } 

  toggleDoneTodo(todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    if (!todo) return false;

    todo.done = !todo.done;
    return true;
  }

  removeTodo(todoListId, todoId) {
    let list = this._findTodoList(todoListId);
    let todo = this._findTodo(todoListId, todoId);

    list.todos.splice(list.todos.indexOf(todo), 1);
  }

  removeTodoList(todoListId) {
    let list = this._findTodoList(todoListId);
    let index = this._todoLists.indexOf(list);
    this._todoLists.splice(index, 1);
  }

  markAllDone(todoListId) {
    let list = this._findTodoList(todoListId);
    list.todos.forEach(todo => todo.done = true);
  }

  createTodo(todoListId, title) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    todoList.todos.push({
      title,
      id: nextId(),
      done: false,
    });

    return true;
  }

  setListTitle(todoListId, newTitle) {
    let list = this._findTodoList(todoListId);
    list.title = newTitle;
  }

  existsTodoListTitle(title) {
    return this._todoLists.some(todoList => todoList.title === title);
  }

  creatTodoList(title) {
    this._todoLists.push({
      title,
      id: nextId(),
      todos: [],
    });
    
    return true;
  }
};