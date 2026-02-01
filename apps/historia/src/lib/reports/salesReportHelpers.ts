import type { Order, Product, Transaction } from '@/payload-types';
import {
  toMajorUnits,
  getProductName,
  getProductId,
  getPriceExVatMinor,
  getVatRate,
} from '@/lib/packing/orderHelpers';

export interface ProductSummaryLine {
  productId: string;
  productName: string;
  vatRate: number;
  totalQuantity: number;
  totalExVat: number;
  totalVat: number;
  totalIncVat: number;
}

export interface TransactionSummary {
  totalAuthorized: number;
  totalCaptured: number;
  totalRefunded: number;
  totalPending: number;
  transactionCount: number;
}

export interface OrderTransactionSummary {
  authorized: number;
  captured: number;
  refunded: number;
  pending: number;
}

export interface ResolvedTransaction {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentReference: string;
  createdAt: string;
}

export interface OrderWithTransactions extends Order {
  transactionSummary: OrderTransactionSummary;
  resolvedTransactions: ResolvedTransaction[];
}

type ProductVatKey = `${string}_${number}`;

function createProductVatKey(productId: string, vatRate: number): ProductVatKey {
  return `${productId}_${vatRate}`;
}

export function calculateProductSummary(orders: Order[]): ProductSummaryLine[] {
  const summaryMap = new Map<ProductVatKey, ProductSummaryLine>();

  for (const order of orders) {
    const isTaxExempt = order.taxExempt === true;

    for (const item of order.items ?? []) {
      const productId = getProductId(item);
      const productName = getProductName(item);
      const vatRate = getVatRate(item, isTaxExempt);
      const quantity = item.quantity || 1;
      const priceExVat = getPriceExVatMinor(item);

      const key = createProductVatKey(productId, vatRate);
      const existing = summaryMap.get(key);

      const lineExVat = priceExVat * quantity;
      const lineVat = Math.round(lineExVat * (vatRate / 100));
      const lineIncVat = lineExVat + lineVat;

      if (existing) {
        existing.totalQuantity += quantity;
        existing.totalExVat += lineExVat;
        existing.totalVat += lineVat;
        existing.totalIncVat += lineIncVat;
      } else {
        summaryMap.set(key, {
          productId,
          productName,
          vatRate,
          totalQuantity: quantity,
          totalExVat: lineExVat,
          totalVat: lineVat,
          totalIncVat: lineIncVat,
        });
      }
    }
  }

  return Array.from(summaryMap.values()).sort((a, b) => {
    const nameCompare = a.productName.localeCompare(b.productName, 'nb-NO');
    return nameCompare !== 0 ? nameCompare : a.vatRate - b.vatRate;
  });
}

export function calculateTransactionSummary(orders: Order[]): TransactionSummary {
  const summary: TransactionSummary = {
    totalAuthorized: 0,
    totalCaptured: 0,
    totalRefunded: 0,
    totalPending: 0,
    transactionCount: 0,
  };

  for (const order of orders) {
    const transactions = order.transactions?.docs ?? [];

    for (const txn of transactions) {
      if (typeof txn === 'string') continue;

      const transaction = txn as Transaction;
      summary.transactionCount++;

      const amount = Math.abs(transaction.amount);

      switch (transaction.status) {
        case 'authorized':
          summary.totalAuthorized += amount;
          break;
        case 'captured':
          summary.totalCaptured += amount;
          break;
        case 'refunded':
          summary.totalRefunded += amount;
          break;
        case 'pending':
          summary.totalPending += amount;
          break;
      }
    }
  }

  return summary;
}

export function enrichOrdersWithTransactionSummary(orders: Order[]): OrderWithTransactions[] {
  return orders.map((order) => {
    const transactions = order.transactions?.docs ?? [];
    const summary: OrderTransactionSummary = { authorized: 0, captured: 0, refunded: 0, pending: 0 };
    const resolvedTransactions: ResolvedTransaction[] = [];

    for (const txn of transactions) {
      if (typeof txn === 'string') continue;

      const transaction = txn as Transaction;
      const amount = Math.abs(transaction.amount);

      resolvedTransactions.push({
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        paymentReference: transaction.paymentReference,
        createdAt: transaction.createdAt,
      });

      switch (transaction.status) {
        case 'authorized':
          summary.authorized += amount;
          break;
        case 'captured':
          summary.captured += amount;
          break;
        case 'refunded':
          summary.refunded += amount;
          break;
        case 'pending':
          summary.pending += amount;
          break;
      }
    }

    return { ...order, transactionSummary: summary, resolvedTransactions };
  });
}

export function formatCurrency(amountMinor: number, currency = 'NOK', locale = 'nb-NO'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(toMajorUnits(amountMinor));
}

export function formatNumber(value: number, locale = 'nb-NO'): string {
  return new Intl.NumberFormat(locale).format(value);
}
