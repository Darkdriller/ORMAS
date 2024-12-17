import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Schedule } from './pages/Schedule';
import { Foods } from './pages/Foods';
import { Feedback } from './pages/Feedback';
import { Administrator } from './pages/Administrator';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Data } from './pages/Data';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/foods" element={<Foods />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/administrator" element={<Administrator />} />
        <Route 
          path="/data" 
          element={
            <ProtectedRoute>
              <Data />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;