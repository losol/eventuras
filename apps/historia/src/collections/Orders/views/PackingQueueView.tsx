'use client';

import React, { useEffect, useState } from 'react';
import { Button, Pill, toast } from '@payloadcms/ui';
import Link from 'next/link';

import { getPackingQueue, markOrderPacked } from '@/app/actions/packing';
import { formatPhoneForDisplay } from '@/lib/utils/formatPhone';
import type { Order } from '@/payload-types';

export function PackingQueueView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packingOrderId, setPackingOrderId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    const result = await getPackingQueue();

    if (!result.success) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    setOrders(result.data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleMarkPacked = async (orderId: string) => {
    if (!confirm('Mark this order as packed and ready to ship?')) {
      return;
    }

    setPackingOrderId(orderId);

    const result = await markOrderPacked(orderId);

    if (!result.success) {
      toast.error(result.error.message);
      setPackingOrderId(null);
      return;
    }

    toast.success('Order marked as packed!');
    await loadOrders();
    setPackingOrderId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div>
        <h1>Packing Queue</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Packing Queue</h1>
        <p>Error: {error}</p>
        <Button onClick={loadOrders}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
        <Button el="link" Link={Link} to="/admin/collections/orders" buttonStyle="icon-label">
          ← Back to Orders
        </Button>
      </div>

      <h1 style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
        Packing Queue <Pill>{orders.length}</Pill>
      </h1>

      <div style={{ marginBottom: 'calc(var(--base) * 2)', display: 'flex', gap: 'var(--base)' }}>
        <Button onClick={loadOrders} buttonStyle="secondary">
          Refresh
        </Button>
        <Button onClick={handlePrint} buttonStyle="primary">
          Print
        </Button>
      </div>

      {orders.length === 0 ? (
        <p>✅ No orders to pack!</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              borderTop: '1px solid var(--theme-elevation-150)',
              paddingTop: 'calc(var(--base) * 2)',
              marginTop: 'calc(var(--base) * 2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--base)' }}>
              <div>
                <h2 style={{ margin: 0 }}>Order #{order.id.slice(0, 8)}</h2>
                <div style={{ marginTop: 'calc(var(--base) * 0.5)' }}>
                  <Pill>{order.status}</Pill>
                  {' '}
                  {new Date(order.createdAt).toLocaleDateString('nb-NO')}
                </div>
              </div>

              <Button
                onClick={() => handleMarkPacked(order.id)}
                disabled={packingOrderId === order.id}
                buttonStyle="primary"
                size="large"
              >
                {packingOrderId === order.id ? '⏳ Processing...' : '✓ Mark as Packed'}
              </Button>
            </div>

            <div style={{ marginTop: 'calc(var(--base) * 1.5)' }}>
              <p style={{ margin: 0 }}><strong>Customer:</strong> {order.userEmail}</p>
              {typeof order.customer === 'object' && order.customer && 'phone_number' in order.customer && order.customer.phone_number && (
                <p style={{ margin: 'calc(var(--base) * 0.25) 0 0 0' }}><strong>Phone:</strong> {formatPhoneForDisplay(order.customer.phone_number)}</p>
              )}
            </div>

            {order.shippingAddress && (
              <div style={{ marginTop: 'calc(var(--base) * 1.5)' }}>
                <p style={{ margin: 0, marginBottom: 'calc(var(--base) * 0.5)' }}><strong>Shipping Address:</strong></p>
                <address style={{ fontStyle: 'normal' }}>
                  {typeof order.customer === 'object' && order.customer && 'given_name' in order.customer && (
                    <>{[order.customer.given_name, order.customer.middle_name, order.customer.family_name].filter(Boolean).join(' ')}<br /></>
                  )}
                  {order.shippingAddress.addressLine1}<br />
                  {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}<br />
                  {order.shippingAddress.country || 'NO'}
                </address>
              </div>
            )}

            <h3 style={{ marginTop: 'calc(var(--base) * 2)', marginBottom: 'var(--base)' }}>Items</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 'calc(var(--base) * 0.5)', borderBottom: '1px solid var(--theme-elevation-150)' }}>Product</th>
                  <th style={{ textAlign: 'right', padding: 'calc(var(--base) * 0.5)', borderBottom: '1px solid var(--theme-elevation-150)' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: 'calc(var(--base) * 0.5)', borderBottom: '1px solid var(--theme-elevation-150)' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items ?? []).map((item) => (
                  <tr key={item.itemId}>
                    <td style={{ padding: 'calc(var(--base) * 0.5)' }}>
                      {typeof item.product === 'object' && item.product ? item.product.title : item.product}
                    </td>
                    <td style={{ textAlign: 'right', padding: 'calc(var(--base) * 0.5)' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: 'calc(var(--base) * 0.5)' }}>
                      {order.currency} {(item.lineTotal ? item.lineTotal / 100 : (item.price.amountExVat * item.quantity) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} style={{ textAlign: 'right', padding: 'calc(var(--base) * 0.5)', borderTop: '1px solid var(--theme-elevation-150)' }}><strong>Total:</strong></td>
                  <td style={{ textAlign: 'right', padding: 'calc(var(--base) * 0.5)', borderTop: '1px solid var(--theme-elevation-150)' }}>
                    <strong>{order.currency} {((order.totalAmount ?? 0) / 100).toFixed(2)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
