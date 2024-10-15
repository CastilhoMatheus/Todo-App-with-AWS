import CognitoUserPool from "./userPool";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react'
import './RegisterScreen.css'
import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import { useNavigate } from 'react-router-dom'

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
     
    const login = () => {
        const authenticationData = {
            Username : email,
            Password : password,
        };
        const authenticationDetails = new AuthenticationDetails(authenticationData);
        const userData = {
            Username : email,
            Pool : CognitoUserPool
        };
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                console.log('Logged in!', result.getIdToken().getJwtToken());
                navigate('/');
            },

            onFailure: function(err) {
                console.log(err.message);
            },
        });
    }

    const handlePressEnter = (key: React.KeyboardEvent) => {
        if(email && password === '') return;
        if (key.keyCode === 13) {
            login();
        }
    }

    return (
        <form style={{display: 'flex-box', width: '400px', margin: '15px'}}>
            <h1>Login</h1>
            <Form.Label>Email address</Form.Label>
            <Form.Control 
                autoFocus
                type="text" 
                placeholder="Enter email"
                value={email}
                onChange={ (e) => { setEmail(e.target.value) } }
                onKeyUp= {(key) => handlePressEnter(key)}
            />
            <Form.Label>Password</Form.Label>
            <Form.Control 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={ (e) => { setPassword(e.target.value) } }
                onKeyUp= {(key) => handlePressEnter(key)}
            />
            <Button onClick={ () => login() }>Submit</Button>
            <Button className="login-button" variant="link" onClick={() => navigate('/register')}>Sign up</Button>
        </form>
    );
}
