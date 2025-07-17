import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import About from './About';
import List from './List';

//function MyButton() {
  //return <button>Home</button>;
//}

// Home page 
//<MyButton/>
function Home() {
  return (
    <div style={style} className="App-header">
      <h1>Welcome to my new react web application</h1>
      
    </div>
  );
}

function AppLayout() {

  return (
    <div className="App">
      {/* Top Nav outside of header */}
      <nav className="nav-bar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/list" className="nav-link">List</Link>
      </nav>

      {/* Page content */}
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/list" element={<List />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}


//Applying styling/style alt to css page
const style = {
    backgroundColor: '#78E8F8',
    color: '#222',
    padding: '30px',
    borderRadius: '8px'
  };
