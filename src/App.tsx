
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router/AppRouter';

function App() {
  return (
    <AuthProvider>
      <div className="bg-default text-light min-h-screen">
        <Toaster position="top-right" />
        <AppRouter />
      </div>
    </AuthProvider>
  );
}

export default App;
