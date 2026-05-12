import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-grid-faint bg-grid-20 opacity-[0.35]"
        aria-hidden
      />
      <div className="pointer-events-none fixed -left-32 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-brand-500/15 blur-[120px]" />
      <div className="pointer-events-none fixed -right-32 top-32 -z-10 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px]" />

      <Navbar />
      <div className="container flex gap-6 py-6">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
