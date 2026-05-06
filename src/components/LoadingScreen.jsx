import { Ticket } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative inline-block">
          <Ticket className="w-16 h-16 text-primary-600 animate-bounce" />
          <div className="absolute inset-0 bg-primary-400 rounded-full blur-xl opacity-30 animate-pulse" />
        </div>
        <p className="mt-4 text-gray-600 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
