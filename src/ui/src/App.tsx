import { useAuth } from './auth/AuthContext';
import { LoginPage } from './auth/LoginPage';
import { OrderHubPage } from './orders/OrderHubPage';

function App() {
  const { user } = useAuth();

  return user ? <OrderHubPage /> : <LoginPage />;
}

export default App;