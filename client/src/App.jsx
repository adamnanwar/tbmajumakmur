import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import LowStock from './pages/LowStock';
import SlowMoving from './pages/SlowMoving';
import POS from './pages/POS';
import Reports from './pages/Reports';
import StockMovement from './pages/StockMovement';
import Users from './pages/Users';
import Settings from './pages/Settings';
import MainLayout from './components/layout/MainLayout';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes with Layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="low-stock" element={<LowStock />} />
          <Route path="slow-moving" element={<SlowMoving />} />
          <Route path="pos" element={<POS />} />
          <Route path="reports" element={<Reports />} />
          <Route path="stock-movement" element={<StockMovement />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
