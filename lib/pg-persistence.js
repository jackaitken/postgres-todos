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
    return todoList.todos.some(todo => !todo.done);
  }

  async sortedTodos(todoList) {
    let todoListId = todoList.id;

    const FIND_TODOS = `SELECT * FROM todos WHERE todolist_id = $1
      ORDER BY done ASC, lower(title) ASC;`;
    
    let resultTodos = await dbQuery(FIND_TODOS, todoListId);
    return resultTodos.rows;
  }

  // Returns a copy of the list
  async loadTodoList(todoListId) {
    const FIND_TODOLIST = "SELECT * FROM todolists WHERE id = $1";
    const FIND_TODOS = "SELECT * FROM todos WHERE todolist_id = $1";

    let resultTodoList = dbQuery(FIND_TODOLIST, todoListId);
    let resultTodos = dbQuery(FIND_TODOS, todoListId);
    let resultBoth = await Promise.all([resultTodoList, resultTodos]);

    let todoList = resultBoth[0].rows[0];
    if (!todoList) return undefined;

    todoList.todos = resultBoth[1].rows;
    return todoList;
  }

  // Returns a copy of the todo
  async loadTodo (todoListId, todoId) {
    const FIND_TODO = `SELECT * FROM todos WHERE todolist_id = $1 AND id = $2`;

    let result = await dbQuery(FIND_TODO, todoListId, todoId);
    return result.rows[0];
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

  async toggleDoneTodo(todoListId, todoId) {
    const TOGGLE_DONE = `UPDATE todos SET done = NOT done
                          WHERE todolist_id = $1 AND id = $2`;

    let result = await dbQuery(TOGGLE_DONE, todoListId, todoId);
    return result.rowCount > 0;
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