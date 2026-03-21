import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8 shadow-inner">
          <FileQuestion className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-7xl font-extrabold text-foreground tracking-tight">404</h1>
        <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="pt-8">
          <Button size="lg" onClick={() => navigate('/')} className="w-full sm:w-auto h-12 px-8 font-semibold shadow-md transition-transform hover:scale-105">
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
