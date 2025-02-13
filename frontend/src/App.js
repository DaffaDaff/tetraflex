import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MapPage from './pages/MapPage';
import InsertPage from './pages/InsertPage';
import { AuthProvider } from "./pages/AuthContext";
import Register from './pages/Register';
import Login from "./pages/Login";
import Users from "./pages/Users";
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <nav style={{ padding: '10px', background: '#ddd' }}>
          <Link to="/" style={{ marginRight: '10px' }}>View Map</Link>
          <Link to="/insert" style={{ marginRight: '10px' }}>Insert New Marker</Link>
          <Link to="/register" style={{ marginRight: '10px' }}>Register</Link>
          <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
          <Link to="/users" style={{ marginRight: '10px' }}>User Page</Link>
        </nav>

        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/insert" element={<InsertPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/users" element={<Users />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
