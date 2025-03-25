import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MapPage from './pages/MapPage';
import InsertPage from './pages/InsertPage';
import {AuthProvider} from "./hooks/AuthContext";
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import Logout from './pages/Logout';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* <nav style={{ padding: '10px', background: '#ddd' }}>
          <Link to="/" style={{ marginRight: '10px' }}>View Map</Link>
          <Link to="/insert" style={{ marginRight: '10px' }}>Insert New Marker</Link>
          <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
        </nav> */}

        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/insert" element={<InsertPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/logout" element={<Logout />}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
