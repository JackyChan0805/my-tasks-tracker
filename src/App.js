import { prettyDOM } from '@testing-library/dom';
import React, { useState, useEffect } from 'react';

function App() {
  // State declarations
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [showTimeInput, setShowTimeInput] = useState(null);

  // Load tasks from api on mount
  useEffect(() => {
    fetch('http://localhost:5001/api/tasks')
    .then(res => res.json())
    .then(data => {
      if(Array.isArray(data)){
        setTasks(data);
      }
    })
    .catch(err => console.error('Error loading tasks:', err))

  }, []);
  // Function: Add new task
  const addTask = () => {
    if (input.trim() === '') return;

    fetch('http://localhost:5001/api/tasks',{
      method : "POST",
      headers : {'Content-Type' : 'application/json'},
      body: JSON.stringify({text : input ,done : false})
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
  };

  // Function: Toggle task completion status
  const toggleDone = (id, currentdone) => {
    fetch(`http://localhost:5001/api/tasks/${id}`,{
      method : "PUT",
      headers : {'Content-Type': 'application/json'},
      body: JSON.stringify({done : !currentdone})
    })
    .then(res => {
      if(!res.ok){
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json()
    })
    .then(updatedTask =>{
      setTasks(preTasks => preTasks.map(task => task.id === id ? updatedTask : task));
    })
    .catch(err => console.error('Error updating task:', err))
  };

  // Function: Delete task
  const deleteTask = (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    fetch(`http://localhost:5001/api/tasks/${id}`,{
      method: "DELETE",
    })
    .then(() => {
      setTasks(prevTask => prevTask.filter(task => task.id !== id));
    })
    .catch(err => console.error('Error deleting task:', err));
  };

  // Function: Add or edit manual time
  const addTimeSpent = (id, minutes) => {
    const time = parseInt(minutes, 10);
    if (isNaN(time) || time <= 0) {
      alert('Please enter a valid number (positive integer)');
      return;
    }
    
    fetch(`http://localhost:5001/api/tasks/${id}`,{
      method: "PUT",
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify({timeSpent : time})
    })
    .then(res => res.json())
    .then(updatedTask => {
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      setShowTimeInput(null);
    })
    .catch(err => console.error('Error adding time:',err))
  };

  // Helper: Format minutes to readable string
  const formatTime = (minutes) => {
    if (!minutes && minutes !== 0) return null;
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${hours} hr ${mins} min`;
  };

  // Helper: Calculate duration from creation to completion
  const getCompletionDuration = (task) => {
    if (!task.completedAt || !task.createdAt) return null;
    const durationMs = task.completedAt - task.createdAt;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    return durationMinutes;
  };

  // Helper: Format timestamp to readable date/time
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleString();
  };


  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.done;
    if (filter === 'completed') return task.done;
    return true;
  });

  // Statistics
  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.done).length,
    completed: tasks.filter(t => t.done).length,
    totalTime: tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0)
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          <span style={styles.titleIcon}>⏱️</span>
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

        {/* Stats Bar */}
        {stats.totalTime > 0 && (
          <div style={styles.statsBar}>
            ⏱️ Total working time: {formatTime(stats.totalTime)}
          </div>
        )}

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📭</span>
            <p>No tasks here...</p>
          </div>
        ) : (
          <ul style={styles.taskList}>
            {filteredTasks.map((task) => {
              const completionDuration = getCompletionDuration(task);
              return (
                <li key={task.id} style={styles.taskItem}>
                  <div style={styles.taskContent}>
                    <div style={styles.taskLeft}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleDone(task.id, task.done)}
                        style={styles.checkbox}
                      />
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            ...styles.taskText,
                            ...(task.done ? styles.taskTextCompleted : {})
                          }}
                          onClick={() => toggleDone(task.id,task.done)}
                        >
                          {task.text}
                        </span>

                        {/* Created time */}
                        <div style={styles.timeMeta}>
                          📅 Created: {formatDate(task.createdAt)}
                        </div>

                        {/* Completion duration (auto-calculated) */}
                        {task.done && completionDuration !== null && (
                          <div style={styles.timeMetaSuccess}>
                            ✅ Completed in: {formatTime(completionDuration)}
                          </div>
                        )}

                        {/* Manual time badge */}
                        {task.timeSpent && (
                          <div style={styles.timeBadge}>
                            ⏱️ Manual: {formatTime(task.timeSpent)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={styles.taskActions}>
                      <button
                        onClick={() => setShowTimeInput(task.id)}
                        style={styles.timeButton}
                      >
                        {task.timeSpent ? '✏️ Edit time' : '⏱️ Add time'}
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={styles.deleteButton}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {showTimeInput === task.id && (
                    <div style={styles.timeInputContainer}>
                      <input
                        type="number"
                        placeholder="Minutes spent"
                        style={styles.timeInput}
                        autoFocus
                        defaultValue={task.timeSpent || ''}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addTimeSpent(task.id, e.target.value);
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.target.previousSibling;
                          addTimeSpent(task.id, input.value);
                        }}
                        style={styles.timeConfirmButton}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setShowTimeInput(null)}
                        style={styles.timeCancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
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
    maxWidth: '700px',
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
    transition: 'borderColor 0.2s'
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
    transition: 'opacity 0.2s'
  },
  filterSection: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
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
  statsBar: {
    textAlign: 'center',
    padding: '10px',
    marginBottom: '15px',
    backgroundColor: '#f0f0f0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#555'
  },
  taskList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  taskItem: {
    padding: '12px 0',
    borderBottom: '1px solid #eee',
    animation: 'fadeIn 0.3s ease'
  },
  taskContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  taskLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flex: 1
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginTop: '2px',
    cursor: 'pointer',
    accentColor: '#667eea'
  },
  taskText: {
    fontSize: '16px',
    color: '#333',
    cursor: 'pointer',
    transition: 'color 0.2s',
    display: 'inline-block'
  },
  taskTextCompleted: {
    textDecoration: 'line-through',
    color: '#aaa'
  },
  timeMeta: {
    fontSize: '11px',
    color: '#999',
    marginTop: '4px'
  },
  timeMetaSuccess: {
    fontSize: '11px',
    color: '#4caf50',
    marginTop: '2px'
  },
  timeBadge: {
    fontSize: '11px',
    color: '#667eea',
    marginTop: '2px'
  },
  taskActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  timeButton: {
    backgroundColor: '#f0f0f0',
    border: 'none',
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s'
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
  timeInputContainer: {
    marginTop: '10px',
    display: 'flex',
    gap: '8px',
    paddingLeft: '32px'
  },
  timeInput: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    outline: 'none'
  },
  timeConfirmButton: {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  timeCancelButton: {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
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
`;
document.head.appendChild(styleSheet);

export default App;