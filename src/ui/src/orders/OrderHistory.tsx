import { useEffect, useState } from 'react';
import { apiRequest } from '../api/apiClient';

type AuditEvent = {
  id: string;
  type: string;
  userEmail: string;
  createdAt: string;
  data?: Record<string, any>;
};

type Props = {
  selectedOrderId: string;
  refreshKey: number;
};

export default function OrderHistory({ selectedOrderId, refreshKey }: Props) {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    if (!selectedOrderId) return;

    const normalizedOrderId = String(Number(selectedOrderId));

    apiRequest(`/audit/orders/${normalizedOrderId}`)
      .then(setEvents)
      .catch(console.error);
  }, [selectedOrderId, refreshKey]);

  return (
    <section style={{ marginTop: '2rem' }}>
      <h3 style={{ color: '#f9fafb' }}>Historial de la orden</h3>

      {events.length === 0 ? (
        <p style={{ color: '#d1d5db' }}>No hay eventos para esta orden.</p>
      ) : (
        events.map((event) => (
          <div
            key={event.id}
            style={{
              border: '1px solid #374151',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              borderRadius: '6px',
              color: '#d1d5db',
            }}
          >
            <strong style={{ color: '#60a5fa' }}>{event.type}</strong>
            <br />
            <span>orden: {selectedOrderId}</span>
            <br />
            <span>{new Date(event.createdAt).toLocaleString()}</span>
            <br />
            <small>{event.userEmail}</small>
          </div>
        ))
      )}
    </section>
  );
}