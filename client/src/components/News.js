import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './News.css';

function News({ onDeleteNews, loggedInUser, admin }) {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/news', { withCredentials: true });
        console.log('News data:', response.data);
        setNewsList(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/news/${id}`, { withCredentials: true });
      onDeleteNews(id);
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  return (
    <div className="news">
      <h1>Новини</h1>
      <ul>
      {newsList.map((newsItem) => (
        <li key={newsItem.id}>
          <h2>{newsItem.title}</h2>
          {newsItem.image && <img src={`http://localhost:5000/${newsItem.image}`} alt={newsItem.title} />}
          <p>{newsItem.content}</p>

          {/* Условная проверка на наличие ссылки */}
          {newsItem.link && newsItem.link.trim() !== '' && (
            <p className="news-link">
              <a href={newsItem.link} target="_blank" rel="noopener noreferrer">
                {newsItem.link}
              </a>
            </p>
          )}

          {admin && (
            <button onClick={() => handleDelete(newsItem.id)}>Видалити</button>
          )}
        </li>
      ))}
      </ul>
    </div>
  );
}

export default News;
