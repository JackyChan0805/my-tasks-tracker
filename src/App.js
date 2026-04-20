import React, { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  // Load tasks from localStorage when page loads
  useEffect(() => {
    const saved = localStorage.getItem('myTasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('myTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (input.trim() === '') return;

    const newTask = {
      id: Date.now(),  // Use timestamp as unique id
      text: input,
      done: false
    };
    setTasks([...tasks, newTask]);
    setInput('');
  };

  const toggleDone = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  const deleteTask = (id) => {
    if(window.confirm("Are you sure you want to delete this task?")){
    setTasks(tasks.filter(task => task.id !== id));
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.done;
    if (filter === 'completed') return task.done;
    return true;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.done).length,
    completed: tasks.filter(t => t.done).length
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          <span style={styles.titleIcon}>✅</span>
          Task Tracker
        </h1>

        {/* Input Section */}
        <div style={styles.inputSection}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="What needs to be done?"
            style={styles.input}
          />
          <button onClick={addTask} style={styles.addButton}>
            Add
          </button>
        </div>

        {/* Filter Buttons */}
        <div style={styles.filterSection}>
          <button
            onClick={() => setFilter('all')}
            style={{ ...styles.filterButton, ...(filter === 'all' ? styles.filterActive : {}) }}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('active')}
            style={{ ...styles.filterButton, ...(filter === 'active' ? styles.filterActive : {}) }}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setFilter('completed')}
            style={{ ...styles.filterButton, ...(filter === 'completed' ? styles.filterActive : {}) }}
          >
            Completed ({stats.completed})
          </button>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📭</span>
            <p>No tasks here...</p>
          </div>
        ) : (
          <ul style={styles.taskList}>
            {filteredTasks.map((task) => (
              <li key={task.id} style={styles.taskItem}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleDone(task.id)}
                  style={styles.checkbox}
                />
                <span
                  style={{
                    ...styles.taskText,
                    ...(task.done ? styles.taskTextCompleted : {})
                  }}
                  onClick={() => toggleDone(task.id)}
                >
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={styles.deleteButton}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  card: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    padding: '30px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333'
  },
  titleIcon: {
    marginRight: '10px'
  },
  inputSection: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px'
  },
  input: {
    flex: 1,
    padding: '14px 18px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  addButton: {
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  filterSection: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center'
  },
  filterButton: {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  filterActive: {
    backgroundColor: '#667eea',
    color: 'white'
  },
  taskList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #eee',
    animation: 'fadeIn 0.3s ease'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginRight: '15px',
    cursor: 'pointer',
    accentColor: '#667eea'
  },
  taskText: {
    flex: 1,
    fontSize: '16px',
    color: '#333',
    cursor: 'pointer',
    transition: 'color 0.2s'
  },
  taskTextCompleted: {
    textDecoration: 'line-through',
    color: '#aaa'
  },
  deleteButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#ccc',
    transition: 'color 0.2s',
    padding: '5px 10px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '50px 20px',
    color: '#aaa'
  },
  emptyIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '10px'
  }
};

// Add animation style to document
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  button:hover {
    opacity: 0.85;
  }
  input:focus {
    border-color: #667eea;
  }
  button:hover {
    opacity: 0.85;
  }
`;
document.head.appendChild(styleSheet);

export default App;