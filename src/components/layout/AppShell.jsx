import { Outlet } from 'react-router-dom';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';

export default function AppShell() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-16 pt-6 sm:pt-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
