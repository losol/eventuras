import configPromise from '@payload-config';
import { getPayload } from 'payload';

/**
 * Migration script to create shipping products
 * Run with: DATABASE_URI="your-db-uri" PAYLOAD_SECRET="your-secret" pnpm tsx scripts/seed-shipping-products.ts
 */
async function seedShippingProducts() {
  const payload = await getPayload({ config: configPromise });

  console.log('Creating shipping products...');

  try {
    // Create Standard Shipping product
    const standardShipping = await payload.create({
      collection: 'products',
      data: {
        title: 'Standard Shipping',
        lead: 'Standard delivery within 3-5 business days',
        productType: 'shipping',
        price: {
          amount: 9900, // 99.00 NOK in cents (will be converted by hook)
          currency: 'NOK',
          vatRate: 25,
        },
        sku: 'SHIP-STANDARD',
        slug: 'shipping-standard',
        resourceId: 'shipping-standard',
        _status: 'published',
      },
    });

    console.log('✅ Created Standard Shipping product:', standardShipping.id);

    // Create Express Shipping product
    const expressShipping = await payload.create({
      collection: 'products',
      data: {
        title: 'Express Shipping',
        lead: 'Fast delivery within 1-2 business days',
        productType: 'shipping',
        price: {
          amount: 19900, // 199.00 NOK in cents (will be converted by hook)
          currency: 'NOK',
          vatRate: 25,
        },
        sku: 'SHIP-EXPRESS',
        slug: 'shipping-express',
        resourceId: 'shipping-express',
        _status: 'published',
      },
    });

    console.log('✅ Created Express Shipping product:', expressShipping.id);

    // Create Pickup - Popup Store product
    const pickupPopup = await payload.create({
      collection: 'products',
      data: {
        title: 'Hent i Popup butikk',
        lead: 'Gratis henting i popup butikk',
        productType: 'shipping',
        price: {
          amount: 0, // Free
          currency: 'NOK',
          vatRate: 0,
        },
        sku: 'SHIP-PICKUP-POPUP',
        slug: 'shipping-pickup-popup',
        resourceId: 'shipping-pickup-popup',
        _status: 'published',
      },
    });

    console.log('✅ Created Pickup - Popup Store product:', pickupPopup.id);

    // Create Pickup - Valnesfjord product
    const pickupValnesfjord = await payload.create({
      collection: 'products',
      data: {
        title: 'Hent etter avtale i Valnesfjord',
        lead: 'Gratis henting etter avtale',
        productType: 'shipping',
        price: {
          amount: 0, // Free
          currency: 'NOK',
          vatRate: 0,
        },
        sku: 'SHIP-PICKUP-VALNESFJORD',
        slug: 'shipping-pickup-valnesfjord',
        resourceId: 'shipping-pickup-valnesfjord',
        _status: 'published',
      },
    });

    console.log('✅ Created Pickup - Valnesfjord product:', pickupValnesfjord.id);

    console.log('\n✨ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update payment-callback/actions.ts with the correct product IDs:');
    console.log(`   - Standard: "${standardShipping.id}"`);
    console.log(`   - Express: "${expressShipping.id}"`);
    console.log(`   - Pickup Popup: "${pickupPopup.id}"`);
    console.log(`   - Pickup Valnesfjord: "${pickupValnesfjord.id}"`);
    console.log('2. Or use resourceId lookup in the code instead');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating shipping products:', error);
    process.exit(1);
  }
}

seedShippingProducts();
