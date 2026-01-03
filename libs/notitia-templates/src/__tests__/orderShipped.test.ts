import { describe, expect, it } from 'vitest';

import { notitiaTemplates } from '../notitiaTemplates';

describe('Order Shipped Template', () => {
  it('should render order shipped notification with all details', () => {
    const result = notitiaTemplates.render(
      'email',
      'order-shipped',
      {
        name: 'Skodde Losen',
        orderId: 'asdf',
        trackingNumber: 'TRACK-123456',
        trackingUrl: 'https://tracking.example.com/TRACK-123456',
        estimatedDelivery: '15. januar 2026',
        organizationName: 'Losvik kommune',
        items: [
          { name: 'Product A', quantity: 2 },
          { name: 'Product B', quantity: 1 },
        ],
        shippingAddress: {
          addressLine1: 'Storgata 1',
          addressLine2: 'Leilighet 42',
          postalCode: '0123',
          city: 'Oslo',
          country: 'Norge',
        },
      },
      { locale: 'nb-NO' },
    );

    // Check subject
    expect(result.subject).toContain('Din ordre er sendt');
    expect(result.subject).toContain('9b4b8a46-eb66-4889-854f-c82bb574f894');

    // Check content includes key elements
    expect(result.content).toContain('Skodde Losen');
    expect(result.content).toContain('9b4b8a46-eb66-4889-854f-c82bb574f894');
    expect(result.content).toContain('TRACK-123456');
    expect(result.content).toContain('https://tracking.example.com/TRACK-123456');
    expect(result.content).toContain('15. januar 2026');
    expect(result.content).toContain('Losvik kommune');

    // Check items
    expect(result.content).toContain('Product A');
    expect(result.content).toContain('Product B');

    // Check shipping address
    expect(result.content).toContain('Storgata 1');
    expect(result.content).toContain('Leilighet 42');
    expect(result.content).toContain('0123');
    expect(result.content).toContain('Oslo');
    expect(result.content).toContain('Norge');

    // Check HTML structure
    expect(result.content).toContain('<!DOCTYPE html>');
    expect(result.content).toContain('Ordren din er sendt');
    expect(result.content).toContain('Sendingsdetaljer');
    expect(result.content).toContain('Sendte produkter');
    expect(result.content).toContain('Leveringsadresse');
  });

  it('should render without optional fields', () => {
    const result = notitiaTemplates.render('email', 'order-shipped', {
      name: 'Test User',
      orderId: 'ORD-123',
      organizationName: 'Test Org',
    });

    expect(result.subject).toContain('ORD-123');
    expect(result.content).toContain('Test User');
    expect(result.content).toContain('Test Org');
    expect(result.content).not.toContain('TRACK');
  });

  it('should render in English locale', () => {
    const result = notitiaTemplates.render(
      'email',
      'order-shipped',
      {
        name: 'John Doe',
        orderId: 'ORD-456',
        trackingNumber: 'TRACK-789',
        estimatedDelivery: 'January 20, 2026',
        organizationName: 'Test Company',
      },
      { locale: 'en-US' },
    );

    expect(result.subject).toContain('Your Order Has Shipped');
    expect(result.content).toContain('Your Order Has Shipped!');
    expect(result.content).toContain('Shipment Details');
    expect(result.content).toContain('Order Number');
  });

  it('should render in Nynorsk locale', () => {
    const result = notitiaTemplates.render(
      'email',
      'order-shipped',
      {
        name: 'Ola Nordmann',
        orderId: 'ORD-789',
        trackingNumber: 'TRACK-999',
        estimatedDelivery: '20. januar 2026',
        organizationName: 'Testfirma',
      },
      { locale: 'nn-NO' },
    );

    expect(result.subject).toContain('Ordren din er sendt');
    expect(result.content).toContain('Ordren din er sendt!');
    expect(result.content).toContain('Sendingsdetaljar');
  });
});
