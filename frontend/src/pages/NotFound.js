import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="page not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary mt-2">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
