import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MDBContainer, MDBBtn } from 'mdb-react-ui-kit';

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <MDBContainer className="p-3 my-5 d-flex flex-column w-50 text-center">
      <h2>Welcome to the Dashboard</h2>
      <p>You have successfully logged in!</p>

      <MDBBtn color='danger' onClick={handleLogout}>Logout</MDBBtn>
    </MDBContainer>
  );
}

export default Dashboard;
