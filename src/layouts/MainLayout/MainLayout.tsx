import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <nav>
          <Link to="/" className="mr-4">Home</Link>
          <Link to="/chat" className="mr-4">Chat</Link>
        </nav>
      </header>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
}; 