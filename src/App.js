import React from 'react';
import './App.css';
import BookTable from './components/BookTable';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Admin Dashboard</h1>
      </header>
      <BookTable />
    </div>
  );
}

export default App;
