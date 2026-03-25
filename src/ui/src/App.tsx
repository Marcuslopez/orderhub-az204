import { useEffect, useState } from 'react';

type Order = {
  id: string;
  customerId: string;
  total: number;
  status: string;
};
function App() {
  const [health, setHealth] = useState<string>('Checking...');
  const [orders, setOrders] = useState<Order[]>([]);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const fetchHealth = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/health`);
      const data = await response.json();
      setHealth(data.ok ? 'API OK' : 'API Error');
    }
    catch {
      setHealth('API unreachable');
    }
  };
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/orders`);
      const data = await response.json(); setOrders(data);
    }
    catch (error) {
      console.error(error);
    }
  };
  useEffect(() => { fetchHealth(); fetchOrders(); }, []);

  //Estilo de la grilla
  const cellHeader: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
    fontWeight: 'bold',
  };

  const cell: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '8px',
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>OrderHub UI</h1>

      <p>
        <strong>Health:</strong> {health}
      </p>

      <button onClick={fetchOrders} style={{ marginBottom: '1rem' }}>
        Refresh Orders
      </button>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '1rem',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th style={cellHeader}>ID</th>
            <th style={cellHeader}>Customer</th>
            <th style={cellHeader}>Total</th>
            <th style={cellHeader}>Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td style={cell}>{order.id}</td>
              <td style={cell}>{order.customerId}</td>
              <td style={cell}>${order.total}</td>
              <td style={cell}>
                <span
                  style={{
                    color: order.status === 'Completed' ? 'green' : 'orange',
                    fontWeight: 'bold',
                  }}
                >
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    /*<div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>OrderHub UI</h1> <p><strong>Health:</strong> {health}</p>
      <button onClick={fetchOrders}>Refresh Orders</button> <ul>
        {orders.map((order) =>
        (<li key={order.id}> {order.id} - {order.customerId} - ${order.total} - {order.status}
        </li>))} </ul> </div> */

  );
}
export default App;