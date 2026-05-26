import { useEffect, useState } from 'react';
import { apiRequest } from '../api/apiClient';
import { useAuth } from '../auth/AuthContext';


type Order = {
  id: string;
  customerId: string;
  total: number;
  status: string;
};

type BlobFile = {
  name: string;
  size: number;
  contentType: string;
  lastModified: string;
  url: string;
};

type OrderGridRow = {
  id: string;
  customerId: string;
  total: number;
  status: string;
  invoice?: {
    url: string;
    name: string;
  };
};

export function OrderHubPage() {
   const { user, logout } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [gridData, setGridData] = useState<OrderGridRow[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');

  const formatOrderId = (id: string | number) => {
    return `order-${String(id).padStart(3, '0')}`;
  };

  const formatDisplayOrderId = (id: string | number) => {
    return String(id).padStart(3, '0');
  };

  const getOrderIdFromBlobName = (blobName: string): string | null => {
    const match = blobName.match(/^order-(\d{3})\//);
    return match ? match[1] : null;
  };

  const loadGridData = async () => {
    try {
      const [ordersData, filesData]: [Order[], BlobFile[]] = await Promise.all([
        apiRequest('/orders'),
        apiRequest('/files'),
      ]);

      const fileMap = new Map<string, { url: string; name: string }>();

      filesData.forEach((file) => {
        const orderId = getOrderIdFromBlobName(file.name);

        if (orderId) {
          const fileName = file.name.split('/').pop() || file.name;

          fileMap.set(orderId, {
            url: file.url,
            name: fileName,
          });
        }
      });

      const mergedData: OrderGridRow[] = ordersData.map((order) => {
        const paddedId = formatDisplayOrderId(order.id);

        return {
          id: paddedId,
          customerId: order.customerId,
          total: order.total,
          status: order.status,
          invoice: fileMap.get(paddedId),
        };
      });

      setOrders(ordersData);
      setGridData(mergedData);

      if (ordersData.length > 0 && !selectedOrderId) {
        setSelectedOrderId(ordersData[0].id);
      }
    } catch (error) {
      console.error(error);
      setMessage('Ocurrió un error al cargar órdenes y archivos.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedOrderId) {
      setMessage('Debes seleccionar una orden y un archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('orderId', formatOrderId(selectedOrderId));

    try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/files`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('orderhub_token')}`,
            },
            body: formData,
            });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      setMessage(
        `Archivo cargado correctamente para la orden: ${data.orderId}: ${data.fileName}`
      );

      setSelectedFile(null);
      await loadGridData();
    } catch (error) {
      console.error(error);
      setMessage('Ocurrió un error al subir el archivo.');
    }
  };

  useEffect(() => {
    loadGridData();
  }, []);

  return (
<div
  style={{
    minHeight: '100vh',
    padding: '2rem',
    fontFamily: 'Arial',
    backgroundColor: '#111827',
    color: 'black',
  }}
>
    <p style={{ color: '#d1d5db' }}>
    Sesión activa: {user?.email} ({user?.role})
    </p>
    <button onClick={logout}
    style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0.4rem 0.8rem',
            cursor: 'pointer',
    }}>Cerrar sesión</button>
        <h1 style={{ color: '#f9fafb' }}>OrderHub</h1>
        <h2 style={{ color: '#f9fafb' }}>Órdenes</h2>

      <select
        value={selectedOrderId}
        onChange={(e) => setSelectedOrderId(e.target.value)}
      >
        {orders.map((order) => (
          <option key={order.id} value={order.id}>
            {formatDisplayOrderId(order.id)} - {order.customerId} - {order.status}
          </option>
        ))}
      </select>

      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #374151' }}>
        <h3 style={{ color: '#f9fafb' }}>Adjuntos de la orden</h3>
        <p style={{ color: '#f9fafb' }}>
          Orden seleccionada:{' '}
          <strong>
            {selectedOrderId ? formatDisplayOrderId(selectedOrderId) : 'Ninguna'}
          </strong>
        </p>

        <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            style={{ color: '#d1d5db' }}        
            />

        <button onClick={handleUpload} 
            style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    cursor: 'pointer',
                    }}>
          Subir archivo
        </button>

        <p style={{ marginTop: '1rem' }}>{message}</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#f9fafb' }}>Listado de Ordenes</h3>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem',
            border: '1px solid #374151',
          }}
        >
          <thead>
            <tr>
              <th style={{ border: '1px solid #374151', padding: '8px', textAlign: 'left', color: '#f9fafb' }}>
                ID
              </th>
              <th style={{ border: '1px solid #374151', padding: '8px', textAlign: 'left', color: '#f9fafb' }}>
                Customer
              </th>
              <th style={{ border: '1px solid #374151', padding: '8px', textAlign: 'left', color: '#f9fafb' }}>
                Total
              </th>
              <th style={{ border: '1px solid #374151', padding: '8px', textAlign: 'left', color: '#f9fafb' }}>
                Estatus
              </th>
              <th style={{ border: '1px solid #374151', padding: '8px', textAlign: 'left', color: '#f9fafb' }}>
                Factura
              </th>
            </tr>
          </thead>
          <tbody>
            {gridData.map((row) => (
              <tr key={row.id}>
                <td style={{ border: '1px solid #374151', padding: '8px', color: '#d1d5db', }}>{row.id}</td>
                <td style={{ border: '1px solid #374151', padding: '8px', color: '#d1d5db', }}>{row.customerId}</td>
                <td style={{ border: '1px solid #374151', padding: '8px', color: '#d1d5db', }}>
                  {Number(row.total).toFixed(2)}
                </td>
                <td style={{ border: '1px solid #374151', padding: '8px', color: '#d1d5db', }}>
                  <span
                    style={{
                      color:
                        row.status === 'Completed' ? 'green'
                        : row.status === 'Pending' ? 'orange'
                        : row.status === 'Cancelled' ? 'red'
                        : 'black',
                      fontWeight: 'bold',
                    }}
                  >
                    {row.status}
                  </span>
                </td>                
                <td style={{ border: '1px solid #374151', padding: '8px', color: '#d1d5db', }}>
                  {row.invoice ? (
                    <a
                    href={row.invoice.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#60a5fa' }}
                    >
                    {row.invoice.name}
                    </a>
                  ) : (
                    'Sin factura'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}