import CognitoUserPool from "./userPool";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react'
import './RegisterScreen.css'
import { useNavigate } from 'react-router-dom'


  
export function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
     
    const register = () => {
        CognitoUserPool.signUp(email, password, [], [], () => navigate('/login'));
    }


    return (
        <form style={{display: 'flex-box', width: '400px', margin: '15px'}}>
            <h1>Create Account</h1>
            <Form.Label>Email address</Form.Label>
            <Form.Control 
                autoFocus
                type="text" 
                placeholder="Enter email"
                value={email}
                onChange={ (e) => { setEmail(e.target.value) } }
            />
            <Form.Label>Password</Form.Label>
            <Form.Control 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={ (e) => { setPassword(e.target.value) } }
            />
            <Button onClick={ () => register() }>Submit</Button>
            <Button className="login-button" variant="link" onClick={() => navigate('/login')}>Sign in</Button>
        </form>
    );
}
