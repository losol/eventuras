import { writeFileSync } from 'fs';
import { notitiaTemplates } from '../src/notitiaTemplates';

// Generate example order shipped email
const exampleEmail = notitiaTemplates.render(
  'email',
  'order-shipped',
  {
    name: 'Skodde Losen',
    orderId: '9b4b8a46-eb66-4889-854f-c82bb574f894',
    trackingNumber: 'TRACK-NO-123456789',
    trackingUrl: 'https://tracking.posten.no/TRACK-NO-123456789',
    estimatedDelivery: '15. januar 2026',
    organizationName: 'Losvik kommune',
    items: [
      { name: 'Ergonomisk kontorstol', quantity: 2 },
      { name: 'Skrivebordsmatte', quantity: 1 },
      { name: 'USB-C hub', quantity: 3 },
    ],
    shippingAddress: {
      addressLine1: 'Storgata 42',
      addressLine2: 'Leilighet 5B',
      postalCode: '0123',
      city: 'Oslo',
      country: 'Norge',
    },
  },
  { locale: 'nb-NO' },
);

// Write to HTML file
writeFileSync('example-order-shipped-email.html', exampleEmail.content);

console.log('\n✅ Eksempel-epost generert!');
console.log(`📧 Emne: ${exampleEmail.subject}`);
console.log('📄 Fil: example-order-shipped-email.html');
console.log('\nÅpne filen i en nettleser for å se hvordan e-posten ser ut!\n');
