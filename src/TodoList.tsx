import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Spinner from 'react-bootstrap/Spinner';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Task } from './Task'
import { useState, useEffect } from 'react'
import { TaskData } from './types';
import CognitoUserPool from "./userPool";
import { CognitoUserSession } from 'amazon-cognito-identity-js';
import { useNavigate } from 'react-router-dom';

export function TodoList() {
    const [todos, setTodos] = useState<TaskData[]>([]);
    const [completed, setCompleted] = useState<TaskData[]>([]);
    const [inputText, setInputText] = useState("");
    const [email, setEmail] = useState();
    const [loading, setLoading] = useState(true); 
    const navigate = useNavigate();

    useEffect(() => {
        if(CognitoUserPool.getCurrentUser() === null) {
            navigate('/login');
        } 
    });
   

    const getTask = async () => {
        setLoading(true);
        CognitoUserPool.getCurrentUser()?.getSession(async (err: Error | null, session: CognitoUserSession) => {
            const response = await fetch('https://0f2d2ottx5.execute-api.sa-east-1.amazonaws.com/beta/get-task', {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Authorization': session.getIdToken().getJwtToken(),
                    'Content-Type': 'application/json',
                }
            });
            const myJson: TaskData[] = await response.json(); //extract JSON from the http response
            setTodos(myJson.filter(item => item.status === 0));
            setCompleted(myJson.filter(item => item.status === 1));
            setLoading(false);
        }); 
        
    }
    
    const getUsername = async () => {
        CognitoUserPool.getCurrentUser()?.getSession(async (err: Error | null, session: CognitoUserSession) => {
            const response = await fetch(`https://0f2d2ottx5.execute-api.sa-east-1.amazonaws.com/beta/get-username/`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Authorization': session.getIdToken().getJwtToken(),
                    'Content-Type': 'application/json',
                }
            });
            const myJson = await response.json();
            setEmail(myJson.email[0].email);
        }); 
    }
    useEffect(() => { 
        getTask();
        getUsername();
    }, []);
    
    const instertIntoRds = async (label: string) => { 
        setLoading(true);
         return CognitoUserPool.getCurrentUser()?.getSession(async (err: Error | null, session: CognitoUserSession) => {
            const response = await fetch('https://0f2d2ottx5.execute-api.sa-east-1.amazonaws.com/beta/add-todo', {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({label}),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': session.getIdToken().getJwtToken()
                }
            });

            const jsonData = await response.json();
            setLoading(false);
            return jsonData.task_id as number;
        }) 
    }

    const updateStatus = async (newStatus: number, id: number) => {   
        setLoading(true);
        CognitoUserPool.getCurrentUser()?.getSession(async (err: Error | null, session: CognitoUserSession) => {
            const updateTask = await fetch('https://0f2d2ottx5.execute-api.sa-east-1.amazonaws.com/beta/uptade-task', {
                method: 'PATCH',
                mode: 'cors',
                body: JSON.stringify({ 
                    "newStatus": newStatus,
                    "task_id": id, 
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': session.getIdToken().getJwtToken()
                }
            });
            setLoading(false);
        })
        
    }

    const clearCompletedTasks = async () => {   
        setLoading(true);
        CognitoUserPool.getCurrentUser()?.getSession(async (err: Error | null, session: CognitoUserSession) => {
            const clearTasks = await fetch('https://0f2d2ottx5.execute-api.sa-east-1.amazonaws.com/beta/clear-completed', {
                method: 'DELETE',
                body: JSON.stringify({ 
                    "status": 1,
                }),
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': session.getIdToken().getJwtToken()
                }
            });

            setLoading(false);
        })
    }

    const handleBackTodo = (taskData: TaskData) => {
        updateStatus(0, taskData.id);

        setCompleted(completed.filter(curValue => curValue.id !== taskData.id));
        setTodos([...todos, {...taskData, status: 0}]);   
    }

    const handleAddToCompleted = (taskData: TaskData) => {
        updateStatus(1, taskData.id);
        
        setTodos(todos.filter(curValue => curValue.id !== taskData.id));
        setCompleted([...completed, {...taskData, status: 1}])
    }

    const handleAddTodo = async () => {
        if(inputText === '') return;
        const task_id = await instertIntoRds(inputText) as unknown as number;
        setTodos ([...todos, { id: task_id, label: inputText, status: 0}]);
        setInputText ("");
        //this.refInput.current?.focus();
    }

    const handleClearCompleted = () => {
        setCompleted([])
        clearCompletedTasks();
    }

    const handlePressEnter = (key: React.KeyboardEvent) => {
        if(inputText === '') return;
        if (key.keyCode === 13) {
            handleAddTodo();
        }
    }

    const logout = () => {
        const user = CognitoUserPool.getCurrentUser();
        if (user) {
            user.signOut();
        }
    }

    if(CognitoUserPool.getCurrentUser() !== null) {
        return (
            <>   
                <Navbar>
                    <Container>
                        <Navbar.Brand href="#home">Todo List</Navbar.Brand>
                        <Navbar.Collapse className="justify-content-end">
                            <NavDropdown title={email} id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1" onClick={() => logout()}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                <div style={{display: 'flex', width: '500px', marginTop: '15px'}}>
                    <Form.Control 
                    autoFocus
                    //ref={this.refInput}
                    type="text" 
                    placeholder="Add Item"
                    value={inputText}
                    onChange={ (e) => { setInputText(e.target.value) } }
                    onKeyUp= {(key) => handlePressEnter(key)}
                    />
                    <Button variant="primary m-2" onClick={handleAddTodo}>+</Button>
                </div>
                <div>
                    <ul className='todo-list'>
                        { todos.map((task: TaskData) =>
                            <li key={task.id} style={{ listStyle: 'none' }}>
                                <Task taskData={task} onChange={handleAddToCompleted} />
                            </li>
                        )}
                    </ul>
                </div>
                <div>
                    <div style={{display: 'flex', width: '500px', margin: '15px', alignItems: 'center'}}>
                        <Card.Title style={{ margin: '15px' }}>Completed</Card.Title>
                        <Button variant="secondary m-2" onClick={handleClearCompleted} style={{ margin: '15px' }}>Clear</Button>
                        <Spinner animation="border" role="status" className={loading ? '' : 'visually-hidden'}></Spinner>
                    </div>
                    <ul className='completed-list'>
                        { completed.map((task: TaskData) => 
                            <li key={task.id} style={{ listStyle: 'none' }}>
                                <Task taskData={task} onChange={handleBackTodo} />
                            </li>
                        )}
                    </ul>
                </div>
            </>
        );
    }
    return null;
}
