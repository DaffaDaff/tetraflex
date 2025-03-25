import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MDBContainer } from 'mdb-react-ui-kit';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
    else{
        handleLogout();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <MDBContainer className="p-3 my-5 d-flex flex-column w-50 text-center">

    </MDBContainer>
  );
}

export default Logout;
