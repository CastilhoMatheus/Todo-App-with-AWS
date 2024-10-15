//import './App.css'
import { TodoList } from './TodoList'
import { BrowserRouter,Routes, Route, Navigate } from 'react-router-dom'
import { Register } from './RegisterScreen'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Login } from './LoginScreen'

function App() {
  return (
    <BrowserRouter >
      <Routes>
        <Route 
          path="/register" 
          element={<Register />}
        />
        <Route 
          path="/login" 
          element={<Login />} 
        />
        <Route 
          path="/" 
          element={<TodoList />} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App;