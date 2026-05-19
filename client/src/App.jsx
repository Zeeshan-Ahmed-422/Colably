import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminAuth from './pages/AdminAuth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Campaigns from './pages/Campaigns.jsx';
import CampaignDetail from './pages/CampaignDetail.jsx';
import CreateCampaign from './pages/CreateCampaign.jsx';
import MyCampaigns from './pages/MyCampaigns.jsx';
import Applications from './pages/Applications.jsx';
import CampaignApplicants from './pages/CampaignApplicants.jsx';
import Influencers from './pages/Influencers.jsx';
import InfluencerDetail from './pages/InfluencerDetail.jsx';
import Collaborations from './pages/Collaborations.jsx';
import CollaborationDetail from './pages/CollaborationDetail.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminCampaigns from './pages/AdminCampaigns.jsx';

export default function App() {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/sign-in" element={<AdminAuth />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/new" element={<ProtectedRoute roles={['brand']}><CreateCampaign /></ProtectedRoute>} />
        <Route path="/campaigns/mine" element={<ProtectedRoute roles={['brand']}><MyCampaigns /></ProtectedRoute>} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/campaigns/:id/applicants" element={<ProtectedRoute roles={['brand', 'admin']}><CampaignApplicants /></ProtectedRoute>} />

        <Route path="/applications" element={<Applications />} />

        <Route path="/influencers" element={<ProtectedRoute roles={['brand', 'admin']}><Influencers /></ProtectedRoute>} />
        <Route path="/influencers/:id" element={<InfluencerDetail />} />

        <Route path="/collaborations" element={<Collaborations />} />
        <Route path="/collaborations/:id" element={<CollaborationDetail />} />

        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/campaigns" element={<ProtectedRoute roles={['admin']}><AdminCampaigns /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
