import { useAuth } from './auth/AuthContext';
import { LoginPage } from './auth/LoginPage';
import { OrdersPage } from './orders/OrdersPage';

function App() {
  const { user } = useAuth();

  return user ? <OrdersPage /> : <LoginPage />;
}

export default App;