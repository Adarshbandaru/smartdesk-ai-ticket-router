import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewTicket from './pages/NewTicket';
import Inbox from './pages/Inbox';
import Analytics from './pages/Analytics';
import FeedbackQueue from './pages/FeedbackQueue';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="new" element={<NewTicket />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="feedback" element={<FeedbackQueue />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
