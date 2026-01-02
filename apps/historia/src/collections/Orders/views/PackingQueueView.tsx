'use client';

import React, { useEffect, useState } from 'react';
import { Button, Pill, toast } from '@payloadcms/ui';
import Link from 'next/link';

import { getPackingQueue, markOrderPacked } from '@/app/actions/packing';
import { formatPhoneForDisplay } from '@/lib/utils/formatPhone';
import type { Order } from '@/payload-types';

import styles from './PackingQueueView.module.css';

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
    let cancelled = false;

    const initialLoad = async () => {
      // Avoid synchronous setState in the effect body.
      const result = await getPackingQueue();

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      setOrders(result.data);
      setLoading(false);
    };

    void initialLoad();

    return () => {
      cancelled = true;
    };
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
      <div className={styles.backLinkRow}>
        <Button el="link" Link={Link} to="/admin/collections/orders" buttonStyle="icon-label">
          ← Back to Orders
        </Button>
      </div>

      <h1 className={styles.heading}>
        Packing Queue <Pill>{orders.length}</Pill>
      </h1>

      <div className={styles.actionsRow}>
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
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeaderRow}>
              <div>
                <h2 className={styles.orderTitle}>Order #{order.id.slice(0, 8)}</h2>
                <div className={styles.orderMeta}>
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

            <div className={styles.customerInfo}>
              <p className={styles.customerLine}><strong>Customer:</strong> {order.userEmail}</p>
              {typeof order.customer === 'object' && order.customer && 'phone_number' in order.customer && order.customer.phone_number && (
                <p className={styles.customerPhoneLine}><strong>Phone:</strong> {formatPhoneForDisplay(order.customer.phone_number)}</p>
              )}
            </div>

            {order.shippingAddress && (
              <div className={styles.shippingInfo}>
                <p className={styles.shippingTitle}><strong>Shipping Address:</strong></p>
                <address className={styles.shippingAddress}>
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

            <h3 className={styles.itemsHeading}>Items</h3>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th className={`${styles.itemsHeaderCell} ${styles.itemsHeaderCellLeft}`}>Product</th>
                  <th className={`${styles.itemsHeaderCell} ${styles.itemsHeaderCellRight}`}>Qty</th>
                  <th className={`${styles.itemsHeaderCell} ${styles.itemsHeaderCellRight}`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items ?? []).map((item) => (
                  <tr key={item.itemId}>
                    <td className={styles.itemsCell}>
                      {typeof item.product === 'object' && item.product ? item.product.title : item.product}
                    </td>
                    <td className={`${styles.itemsCell} ${styles.itemsCellRight}`}>{item.quantity}</td>
                    <td className={`${styles.itemsCell} ${styles.itemsCellRight}`}>
                      {order.currency} {(item.lineTotal ? item.lineTotal / 100 : (item.price.amountExVat * item.quantity) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className={styles.itemsFooterLabel}><strong>Total:</strong></td>
                  <td className={styles.itemsFooterValue}>
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
