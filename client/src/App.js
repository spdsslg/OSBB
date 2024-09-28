import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import AnimatedRoutes from './AnimatedRoutes';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [admin, setAdmin]=useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setLoggedInUser(storedUser);
      if (storedUser === '123456') {
        setAdmin(true);
      }
    }
  }, []);
  
  const handleLogin = (login) => {
    setLoggedInUser(login);
    localStorage.setItem('loggedInUser', login);
  };
  
  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('loggedInUser');
  };
  const handleAddNews = (newNews) => {
    setNewsList([...newsList, newNews]);
  };

  const handleDeleteNews = (id) => {
    setNewsList(newsList.filter((newsItem) => newsItem.id !== id));
  };

  return (
    <Router>
      <Header loggedInUser={loggedInUser} onLogin={handleLogin} />
      <AnimatedRoutes
        loggedInUser={loggedInUser}
        admin={admin}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onAddNews={handleAddNews}
        newsList={newsList}
        onDeleteNews={handleDeleteNews}
      />
    <Footer/>
    </Router>
  );
}

export default App;
