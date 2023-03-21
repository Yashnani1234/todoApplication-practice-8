const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1

const outPutResult = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};

app.get("/todos/", async (request, response) => {
  let data;
  let getTodoQuery = "";
  const requestQuery = request.query;
  const { search_q = "", priority, status } = requestQuery;

  switch (true) {
    case requestQuery.priority !== undefined &&
      requestQuery.status !== undefined: //if this is true then below query is taken in the code
      getTodoQuery = ` SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}' AND priority = '${priority}';`;
      break;
    case requestQuery.priority !== undefined:
      getTodoQuery = ` SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}';`;
      break;
    case requestQuery.status !== undefined:
      getTodoQuery = ` SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}';`;
      break;
    default:
      getTodoQuery = ` SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodoQuery);
  response.send(data);
});

// API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery2 = `SELECT * FROM todo WHERE id = ${todoId};`;
  const todo2 = await db.get(getTodoQuery2);
  response.send(todo2);
});

//API 3

app.post("/todos/", async (request, response) => {
  const todoDetails3 = request.body;
  const { id, todo, priority, status } = todoDetails3;
  const addTodoQuery3 = `INSERT INTO todo( id, todo, priority, status ) VALUES (${id}, ${todo}, ${priority}, ${status});`;
  await db.run(addTodoQuery3);
  response.send("Todo Successfully Added");
});

//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const { id, todo, priority, status } = request.body;
  const requestBody = request.body;
  switch (true) {
    case request.body.status !== undefined:
      updateColumn = "status ";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "priority";
      break;
    case request.todo !== undefined:
      updateColumn = "todo";
      break;
  }

  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);

  const updateTodoQuery = `UPDATE todo SET todo = ${todo}, priority = ${priority}, status = ${status} WHERE id = ${todoId};`;
  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery5 = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`;
  await db.run(deleteTodoQuery5);
  response.send("Todo Deleted");
});

module.exports = app;
