import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Content from './components/Content';
import News from './components/News';
import Templates from './components/Templates';
import LoginForm from './components/LoginForm';
import Cabinet from './components/Cabinet';
import Contacts from './components/Contacts';
import ScrollToTop from './components/ScrollToTop'; // Импортируем ScrollToTop

function AnimatedRoutes({ loggedInUser, onLogin, onLogout, onAddNews, newsList, onDeleteNews, admin }) {
  const location = useLocation();

  return (
    <>
      <ScrollToTop /> {/* Прокрутка страницы к началу при каждом изменении маршрута */}
      <TransitionGroup>
        <CSSTransition key={location.key} timeout={300} classNames="fade">
          <div>
            <Routes location={location}>
              <Route path="/" element={<Content loggedInUser={loggedInUser} />} />
              <Route path="/news" element={<News newsList={newsList} onDeleteNews={onDeleteNews} loggedInUser={loggedInUser} admin={admin}/>} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route
                path="/login"
                element={loggedInUser ? <Navigate to="/cabinet" /> : <LoginForm onLogin={onLogin} />}
              />
              <Route
                path="/cabinet"
                element={loggedInUser ? <Cabinet loggedInUser={loggedInUser} onLogout={onLogout} onAddNews={onAddNews} admin={admin} /> : <Navigate to="/login" />}
              />
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </>
  );
}

export default AnimatedRoutes;
