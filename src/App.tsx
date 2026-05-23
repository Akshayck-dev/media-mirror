import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import Payments from './pages/Payments';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import useStudioStore from './store/studioStore';

function App() {
  const { fetchAllData } = useStudioStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return (
    <HashRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/bookings/:id" element={<BookingDetails />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </HashRouter>
  );
}

export default App;
