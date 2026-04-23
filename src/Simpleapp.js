import React, { useState, useEffect } from 'react';

function Simpleapp() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/tasks')
      .then(res => res.json())
      .then(data => {
        console.log("data-type", typeof data);
        console.log("array?:", Array.isArray(data));
        console.log("content", data);
        setTasks(data)
      })
      .catch(err => console.error(err));
  }, []);

  const addTask = () => {
    if (input.trim() === '') return;

    fetch('http://localhost:5001/api/tasks', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input, done: false })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json()
      })
      .then(newTask => {
        console.log("new tasks", newTask);
        setTasks(preTasks => [...preTasks, newTask]);
        setInput('');
      })
      .catch(err => {
        console.error("addTask fail", err);
        alert("add Tasks fail" + err.message);
      });
  }

  const deleteTask = (id) => {
    fetch(`http://localhost:5001/api/tasks/${id}`, {
      method: "DELETE"
    })
      .then(() => {
        setTasks(tasks.filter(task => task.id !== id));
      })
      .catch(err => console.error(err));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Tracker (Flask Test)</h1>
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="New task..."
        />
        <button onClick={addTask}>Add</button>
      </div>
      <ul>
        {Array.isArray(tasks) && tasks.map(task => (
          <li key={task.id}>
            <span>{task.text}</span>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Simpleapp;