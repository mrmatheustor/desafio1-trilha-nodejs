const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username == username);

  if (!user) {
    return response.status(404).json({ error: "Username not found!" })
  };

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExistis = users.some((user) => user.username === username);

  if (userExistis) {
    return response.status(400).json({ error: "Username already exists!" })
  }

  const createUserOperation = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(createUserOperation)

  return response.status(201).json(createUserOperation)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todoOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todoOperation);

  return response.status(201).json(todoOperation);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find(todo => todo.id == id);

  if (!todo)
    return response.status(404).json({ error: "Todo not found!" })

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const changeDone = user.todos.find((todo) => todo.id === id)

  if (!changeDone)
    return response.status(404).json({ error: "Todo not found!" })

  changeDone.done = true

  return response.json(changeDone)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params;

  const index = user.todos.findIndex((todo) => todo.id == id)
  console.log(index)

  if (index <= -1)
    return response.status(404).json({ error: "Todo not found!" })

  user.todos.splice(index, 1);

  return response.status(204).json(users)
});

module.exports = app;