import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Check } from 'lucide-react';
import './App.css';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/todos`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
      setLoading(false);
    } catch (err) {
      setError('Unable to connect to the API. Make sure FastAPI server is running.');
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo, completed: false })
      });

      if (!response.ok) throw new Error('Failed to add todo');
      const todo = await response.json();
      setTodos([...todos, todo]);
      setNewTodo('');
      setError(null);
    } catch (err) {
      setError('Failed to add todo');
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);

    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...todo, completed: !todo.completed })
      });

      if (!response.ok) throw new Error('Failed to update todo');
      const updatedTodo = await response.json();

      setTodos(todos.map(t => (t.id === id ? updatedTodo : t)));
    } catch (err) {
      setError('Failed to update todo');
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete');
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete');
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="page">
      <div className="todo-container">
        <h1 className="title">Todo List</h1>
        <p className="subtitle">Stay organized and productive</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={addTodo} className="add-form">
          <input
            type="text"
            className="todo-input"
            placeholder="Add a new todo..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <button type="submit" className="add-btn">
            <Plus size={18} /> Add
          </button>
        </form>

        <div className="todo-list">
          {todos.length === 0 ? (
            <div className="empty">No todos yet. Add one!</div>
          ) : (
            todos.map((todo) => (
              <div key={todo.id} className="todo-item">
                <button
                  className={`check-btn ${todo.completed ? 'checked' : ''}`}
                  onClick={() => toggleTodo(todo.id)}
                >
                  {todo.completed && <Check size={16} color="#fff" />}
                </button>

                <span className={`todo-text ${todo.completed ? 'done' : ''}`}>
                  {todo.title}
                </span>

                <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="summary">
          <span>{todos.filter(t => !t.completed).length} active</span>
          <span>{todos.filter(t => t.completed).length} completed</span>
        </div>
      </div>
    </div>
  );
}
