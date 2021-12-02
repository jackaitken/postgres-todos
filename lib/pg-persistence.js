const { dbQuery } = require('./db-query');

module.exports = class PgPersistence {
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

  async toggleDoneTodo(todoListId, todoId) {
    const TOGGLE_DONE = `UPDATE todos SET done = NOT done
                          WHERE todolist_id = $1 AND id = $2`;

    let result = await dbQuery(TOGGLE_DONE, todoListId, todoId);
    return result.rowCount > 0;
  }

  async deleteTodo(todoListId, todoId) {
    const DELETE_TODO = `DELETE FROM todos WHERE todolist_id = $1 AND id = $2`;

    let result = await dbQuery(DELETE_TODO, todoListId, todoId);
    return result.rowCount > 0;
  }

  async deleteTodoList(todoListId) {
    const DELETE_TODOLIST = `DELETE FROM todolists WHERE id = $1`;

    let result = await dbQuery(DELETE_TODOLIST, todoListId);
    return result.rowCount > 0;
  }

  async completeAllTodos(todoListId) {
    const COMPLETE_ALL = `UPDATE todos SET done = true WHERE todolist_id = $1`;

    let result = await dbQuery(COMPLETE_ALL, todoListId);
    return result.rowCount > 0;
  }

  async createTodo(todoListId, title) {
    const NEW_TODO = `INSERT INTO todos (title, todolist_id)
                      VALUES ($1, $2)`;
    
    let result = await dbQuery(NEW_TODO, title, todoListId);
    return result.rowCount > 0;
  }

  async setListTitle(todoListId, newTitle) {
    const UPDATE_TITLE = "UPDATE todolists SET title = $1 WHERE id = $2";

    let result = await dbQuery(UPDATE_TITLE, title, todoListId);
    return result.rowCount > 0;
  }

  async existsTodoListTitle(title) {
    const FIND_TODOLIST = "SELECT null FROM todolists WHERE title = $1";

    let result = await dbQuery(FIND_TODOLIST, title);
    return result.rowCount > 0;
  }

  isUniqueConstraintViolation(err) {
    return /duplicate key value violates unique constraint/.test(String(err));
  }

  async createTodoList(title) {
    const CREATE_TODOLIST = "INSERT INTO todolists (title) VALUES ($1)";

    try {
      let result = await dbQuery(CREATE_TODOLIST, title);
      return result.rowCount > 0;
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) return false;
      throw error;
    }
  }
};