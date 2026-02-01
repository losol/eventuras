'use client';

import React, { useState } from 'react';
import { Button, toast } from '@payloadcms/ui';
import Link from 'next/link';

import { getSalesReport, type SalesReportData } from '@/app/actions/salesReport';
import {
  formatCurrency,
  formatNumber,
  type OrderWithTransactions,
} from '@/lib/reports/salesReportHelpers';
import type { Product, User } from '@/payload-types';

import styles from './SalesReportView.module.css';

function getProductName(item: OrderWithTransactions['items'][0]): string {
  const product = item.product as Product | string;
  if (typeof product === 'string') return 'Ukjent produkt';
  return product?.title || 'Ukjent produkt';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Ventende',
    authorized: 'Autorisert',
    captured: 'Captured',
    refunded: 'Refundert',
    failed: 'Feilet',
    canceled: 'Kansellert',
  };
  return labels[status] || status;
}

function getCustomerName(customer: OrderWithTransactions['customer']): string | null {
  if (!customer || typeof customer === 'string') return null;
  const user = customer as User;
  const parts = [user.given_name, user.middle_name, user.family_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : null;
}

function ReceiptCard({ order, currency }: { order: OrderWithTransactions; currency: string }) {
  const isTaxExempt = order.taxExempt === true;
  const customerName = getCustomerName(order.customer);
  const addr = order.shippingAddress;

  // Calculate totals
  let totalExVat = 0;
  let totalVat = 0;
  let totalIncVat = 0;

  const items = order.items ?? [];
  items.forEach((item) => {
    const quantity = item.quantity || 1;
    const priceExVat = item.price?.amountExVat ?? 0;
    const vatRate = isTaxExempt ? 0 : (item.price?.vatRate ?? 25);
    const lineExVat = priceExVat * quantity;
    const lineVat = Math.round(lineExVat * (vatRate / 100));
    totalExVat += lineExVat;
    totalVat += lineVat;
    totalIncVat += lineExVat + lineVat;
  });

  return (
    <div className={styles.receipt}>
      <div className={styles.receiptHeader}>
        <div>
          <h3 className={styles.receiptTitle}>KVITTERING</h3>
          <p className={styles.receiptOrderId}>
            <Link href={`/admin/collections/orders/${order.id}`}>
              Ordre #{order.id}
            </Link>
          </p>
        </div>
        <div className={styles.receiptHeaderRight}>
          <p className={styles.receiptDate}>
            {new Date(order.createdAt).toLocaleDateString('nb-NO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className={styles.receiptStatus}>{order.status}</p>
          {isTaxExempt && <p className={styles.receiptTaxExempt}>MVA-fritatt</p>}
        </div>
      </div>

      <div className={styles.receiptInfo}>
        <div className={styles.receiptCustomer}>
          <h4>Kunde</h4>
          <p className={styles.receiptCustomerName}>{customerName || 'Ikke registrert'}</p>
          <p>{order.userEmail}</p>
          {addr && (
            <address className={styles.receiptAddress}>
              {addr.addressLine1}<br />
              {addr.addressLine2 && <>{addr.addressLine2}<br /></>}
              {addr.postalCode} {addr.city}<br />
              {addr.country || 'Norge'}
            </address>
          )}
        </div>
      </div>

      <table className={styles.receiptTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Produkt</th>
            <th className={styles.rightAlign}>Ant.</th>
            <th className={styles.rightAlign}>Pris eks. MVA</th>
            <th className={styles.rightAlign}>MVA</th>
            <th className={styles.rightAlign}>Sum</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const vatRate = isTaxExempt ? 0 : (item.price?.vatRate ?? 25);
            return (
              <tr key={item.itemId}>
                <td>{index + 1}</td>
                <td>{getProductName(item)}</td>
                <td className={styles.rightAlign}>{item.quantity}</td>
                <td className={styles.rightAlign}>{formatCurrency(item.price?.amountExVat ?? 0, currency)}</td>
                <td className={styles.rightAlign}>{vatRate}%</td>
                <td className={styles.rightAlign}>{formatCurrency(item.lineTotal ?? 0, currency)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={styles.receiptTotals}>
        <div className={styles.receiptTotalLine}>
          <span>Sum eks. MVA:</span>
          <span>{formatCurrency(totalExVat, currency)}</span>
        </div>
        <div className={styles.receiptTotalLine}>
          <span>MVA:</span>
          <span>{formatCurrency(totalVat, currency)}</span>
        </div>
        <div className={styles.receiptTotalFinal}>
          <span>Totalt:</span>
          <span>{formatCurrency(totalIncVat, currency)}</span>
        </div>
      </div>

      {order.resolvedTransactions.length > 0 && (
        <div className={styles.receiptTransactions}>
          <h4>Transaksjoner</h4>
          <table className={styles.receiptTable}>
            <thead>
              <tr>
                <th>Dato</th>
                <th>Status</th>
                <th>Metode</th>
                <th>Referanse</th>
                <th className={styles.rightAlign}>Beløp</th>
              </tr>
            </thead>
            <tbody>
              {order.resolvedTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{new Date(txn.createdAt).toLocaleDateString('nb-NO')}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status_${txn.status}`] || ''}`}>
                      {getStatusLabel(txn.status)}
                    </span>
                  </td>
                  <td>{txn.paymentMethod}</td>
                  <td className={styles.receiptRef}>{txn.paymentReference}</td>
                  <td className={styles.rightAlign}>{formatCurrency(txn.amount, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type DatePreset = 'last-week' | 'last-month' | 'year-to-date' | 'custom';

interface DateRange {
  start: string;
  end: string;
}

function getLastWeekRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

function getLastMonthRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

function getYearToDateRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return {
    start: start.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0],
  };
}

function getDateRangeForPreset(preset: DatePreset): DateRange {
  switch (preset) {
    case 'last-week':
      return getLastWeekRange();
    case 'last-month':
      return getLastMonthRange();
    case 'year-to-date':
      return getYearToDateRange();
    case 'custom':
    default:
      return getLastWeekRange();
  }
}

const presetLabels: Record<DatePreset, string> = {
  'last-week': 'Siste 7 dager',
  'last-month': 'Forrige måned',
  'year-to-date': 'Hittil i år',
  'custom': 'Egendefinert',
};

export function SalesReportView() {
  const [datePreset, setDatePreset] = useState<DatePreset>('last-week');
  const initialRange = getLastWeekRange();
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [reportData, setReportData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      const range = getDateRangeForPreset(preset);
      setStartDate(range.start);
      setEndDate(range.end);
    }
  };

  const isValidDateRange = startDate <= endDate;

  const handleGenerateReport = async () => {
    if (!isValidDateRange) {
      setError('Fra-dato må være før eller lik til-dato');
      toast.error('Ugyldig datoperiode');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getSalesReport({
      startDate: `${startDate}T00:00:00.000Z`,
      endDate: `${endDate}T23:59:59.999Z`,
    });

    if (!result.success) {
      setError(result.error?.message ?? 'Ukjent feil');
      toast.error('Kunne ikke generere rapport');
      setLoading(false);
      return;
    }

    setReportData(result.data);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const productTotals = reportData
    ? {
        exVat: reportData.productSummary.reduce((sum, l) => sum + l.totalExVat, 0),
        vat: reportData.productSummary.reduce((sum, l) => sum + l.totalVat, 0),
        incVat: reportData.productSummary.reduce((sum, l) => sum + l.totalIncVat, 0),
      }
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.backLinkRow}>
        <Button el="link" Link={Link} to="/admin/collections/orders" buttonStyle="icon-label">
          ← Tilbake til ordrer
        </Button>
      </div>

      <h1 className={styles.heading}>
        Salgsrapport{reportData?.tenantName ? ` - ${reportData.tenantName}` : ''}
      </h1>

      {reportData && (
        <p className={styles.dateRangeDisplay}>
          Periode: {new Date(reportData.dateRange.startDate).toLocaleDateString('nb-NO')} - {new Date(reportData.dateRange.endDate).toLocaleDateString('nb-NO')}
        </p>
      )}

      <div className={styles.dateRangeSection}>
        <div className={styles.presetSelector}>
          {(['last-week', 'last-month', 'year-to-date', 'custom'] as DatePreset[]).map((preset) => (
            <button
              key={preset}
              type="button"
              className={`${styles.presetButton} ${datePreset === preset ? styles.presetButtonActive : ''}`}
              onClick={() => handlePresetChange(preset)}
            >
              {presetLabels[preset]}
            </button>
          ))}
        </div>
        {datePreset === 'custom' && (
          <div className={styles.customDateInputs}>
            <div className={styles.dateInputGroup}>
              <label htmlFor="startDate">Fra dato</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.dateInputGroup}>
              <label htmlFor="endDate">Til dato</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
          </div>
        )}
        <Button onClick={handleGenerateReport} disabled={loading || (datePreset === 'custom' && !isValidDateRange)} buttonStyle="primary">
          {loading ? 'Genererer...' : 'Generer rapport'}
        </Button>
      </div>

      {error && <p className={styles.error}>Feil: {error}</p>}

      {reportData && (
        <>
          <div className={styles.actionsRow}>
            <Button onClick={handlePrint} buttonStyle="secondary">
              Skriv ut rapport
            </Button>
          </div>

          <section className={styles.reportSection}>
            <h2>Produktoversikt</h2>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th className={styles.rightAlign}>MVA %</th>
                  <th className={styles.rightAlign}>Antall</th>
                  <th className={styles.rightAlign}>Eks. MVA</th>
                  <th className={styles.rightAlign}>MVA</th>
                  <th className={styles.rightAlign}>Inkl. MVA</th>
                </tr>
              </thead>
              <tbody>
                {reportData.productSummary.map((line, idx) => (
                  <tr key={`${line.productId}-${line.vatRate}-${idx}`}>
                    <td>{line.productName}</td>
                    <td className={styles.rightAlign}>{line.vatRate}%</td>
                    <td className={styles.rightAlign}>{formatNumber(line.totalQuantity)}</td>
                    <td className={styles.rightAlign}>
                      {formatCurrency(line.totalExVat, reportData.currency)}
                    </td>
                    <td className={styles.rightAlign}>
                      {formatCurrency(line.totalVat, reportData.currency)}
                    </td>
                    <td className={styles.rightAlign}>
                      {formatCurrency(line.totalIncVat, reportData.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {productTotals && (
                <tfoot>
                  <tr className={styles.totalRow}>
                    <td colSpan={3}>
                      <strong>Totalt</strong>
                    </td>
                    <td className={styles.rightAlign}>
                      <strong>{formatCurrency(productTotals.exVat, reportData.currency)}</strong>
                    </td>
                    <td className={styles.rightAlign}>
                      <strong>{formatCurrency(productTotals.vat, reportData.currency)}</strong>
                    </td>
                    <td className={styles.rightAlign}>
                      <strong>{formatCurrency(productTotals.incVat, reportData.currency)}</strong>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </section>

          <section className={styles.reportSection}>
            <h2>Transaksjonsoversikt</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Autorisert</span>
                <span className={styles.summaryValue}>
                  {formatCurrency(reportData.transactionSummary.totalAuthorized, reportData.currency)}
                </span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Captured</span>
                <span className={styles.summaryValue}>
                  {formatCurrency(reportData.transactionSummary.totalCaptured, reportData.currency)}
                </span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Refundert</span>
                <span className={styles.summaryValue}>
                  {formatCurrency(reportData.transactionSummary.totalRefunded, reportData.currency)}
                </span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Ventende</span>
                <span className={styles.summaryValue}>
                  {formatCurrency(reportData.transactionSummary.totalPending, reportData.currency)}
                </span>
              </div>
            </div>
            <p className={styles.transactionCount}>
              Totalt antall transaksjoner: {reportData.transactionSummary.transactionCount}
            </p>
          </section>

          <section className={styles.reportSection}>
            <h2>Kvitteringer ({reportData.orders.length})</h2>
            {reportData.orders.map((order) => (
              <ReceiptCard key={order.id} order={order} currency={reportData.currency} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
