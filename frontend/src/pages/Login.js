import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  MDBContainer,
  MDBInput,
  MDBBtn,
}
from 'mdb-react-ui-kit';
import "mdb-react-ui-kit/dist/css/mdb.min.css";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const hardcodedUsername = "admin";
  const hardcodedPassword = "tetra123";

  const handleLogin = () => {
    if (username === hardcodedUsername && password === hardcodedPassword) {
      localStorage.setItem('isAuthenticated', 'true');
      alert("Login successful!");
      navigate('/')
    } else {
      alert("Invalid username or password");
    }
  };


  return (
    <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
      <MDBInput 
        wrapperClass='mb-4' 
        label='Username' 
        id='form1' 
        type='text' 
        value={username} 
        onChange={(e) => setUsername(e.target.value)}
      />
      <MDBInput 
        wrapperClass='mb-4' 
        label='Password' 
        id='form2' 
        type='password' 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
      />

      <MDBBtn className="mb-4" onClick={handleLogin}>Sign in</MDBBtn>
    </MDBContainer>
  );
}

export default Login;