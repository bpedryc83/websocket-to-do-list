import io from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';
import shortid from 'shortid';

const App = () => {

  const [socket, setSocket] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');

  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) {
      const socketUseEffect = io('localhost:8000');
      setSocket(socketUseEffect);
      socketUseEffect.on('updateData', (array) => updateData(array));
      socketUseEffect.on('removeTask', (id, isFromServer) => { 
      removeTask(id, isFromServer);  
      })
      socketUseEffect.on('addTask', (task) => addTask(task));
    }
    return () => {
      ref.current = true;
    };
  }, []);

  const removeTask = (id, isFromServer) => {
    if (!isFromServer) {
      socket.emit('removeTask', id);
    }
    setTasks(tasks => tasks.filter(task => task.id !== id ));
  }

  const removeClick = (e, taskId) => {
    e.preventDefault();
    removeTask(taskId, false);
  }

  const submitForm = (e) => {
    e.preventDefault();
    const id = shortid();
    addTask({id: id, name: taskName});
    socket.emit('addTask', { id: id, name: taskName });
    setTaskName('');
  }

  const addTask = (task) => {
    setTasks(tasks => [...tasks, task]);
  }

  const updateData = (array) => {
    setTasks(array);
  }

  return (
    <div className="App">
  
      <header>
        <h1>ToDoList.app</h1>
      </header>
  
      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>
  
        <ul className="tasks-section__list" id="tasks-list">
          {tasks.map(task => (
            <li key={task.id} className='task'>{task.name}<button className='btn btn--red' onClick={e => removeClick(e, task.id)}>Remove</button></li>
          ))}
        </ul>

        <form id="add-task-form" onSubmit={e => submitForm(e)}>
          <input className="text-input" autoComplete="off" type="text" placeholder="Type your description" id="task-name" value={taskName} onChange={e => setTaskName(e.target.value)}/>
          <button className="btn" type="submit">Add</button>
        </form>
  
      </section>
    </div>
  );
}

export default App;