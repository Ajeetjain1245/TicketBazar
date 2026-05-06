import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative bg-slate-950 text-slate-100">
      <Navbar className="relative z-10" />
      <main className="flex-grow relative z-10">
        <Outlet />
      </main>
      <Footer className="relative z-10" />
    </div>
  );
};

export default MainLayout;
