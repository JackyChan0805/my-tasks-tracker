// src/App.js
import React, { useState } from 'react';

function App() {
  const [tasks, setTasks] = useState(() => {
   const saved = localStorage.getItem('myTasks');
   return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState('');

  const addTask = () => {
    if (input.trim()) {
      const newTasks = [...tasks, { text: input, done: false }];
      setTasks(newTasks);
      localStorage.setItem('myTasks',JSON.stringify(newTasks));
      setInput('');
    }
  };

  const toggleDone = (idx) => {
    const newTasks = [...tasks];
    newTasks[idx].done = !newTasks[idx].done;
    setTasks(newTasks);
    localStorage.setItem("myTasks", JSON.stringify(newTasks));
  };

  const deleteTask = (idx) => {
    const newTasks = tasks.filter((_, i) => i !== idx);
    setTasks(newTasks);
    localStorage.setItem("myTasks", JSON.stringify(newTasks));

  };

  return (  //show in website
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>😊 My Task Tracker</h1>
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a new task..."
        />
        <button onClick={addTask}>Add</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map((task, idx) => (
          <li key={idx} style={{ margin: '10px 0' }}>
            <span
              style={{
                textDecoration: task.done ? 'line-through' : 'none',
                cursor: 'pointer',
                marginRight: '10px'
              }}
              onClick={() => toggleDone(idx)}
            >
              {task.text}
            </span>
            <button onClick={() => deleteTask(idx)}>delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;