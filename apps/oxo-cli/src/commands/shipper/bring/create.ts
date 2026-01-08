import { BringClient, toBringAddress } from '@eventuras/shipper/bring-v1';
import { Command, Flags } from '@oclif/core';

import { loadEnvFile, requireEnvVar } from '../../../utils/env.js';

export default class BringCreate extends Command {
  static override description = 'Create a Bring shipment';
static override examples = [
    `$ oxo shipper bring create \\
      --correlation-id "EVENT-2026-001" \\
      --sender-name "Eventuras AS" \\
      --sender-address "Testveien 1" \\
      --sender-postal "0001" \\
      --sender-city "Oslo" \\
      --recipient-name "Test Recipient" \\
      --recipient-address "Testgata 42" \\
      --recipient-postal "0010" \\
      --recipient-city "Oslo" \\
      --weight 1000 \\
      --length 30 --width 20 --height 10`,
    `$ oxo shipper bring create --correlation-id "REG-456" --json [options]`,
  ];
static override flags = {
    'correlation-id': Flags.string({
      description: 'Correlation ID for tracking (e.g., EVENT-123, ORDER-456, REG-789)',
      required: true,
    }),
    height: Flags.integer({
      description: 'Package height in cm',
      required: true,
    }),
    json: Flags.boolean({
      default: false,
      description: 'Output result as JSON',
    }),
    length: Flags.integer({
      description: 'Package length in cm',
      required: true,
    }),
    // Shipping options
    product: Flags.string({
      default: 'SERVICEPAKKE',
      description: 'Bring product code',
    }),
    'recipient-address': Flags.string({
      description: 'Recipient street address',
      required: true,
    }),
    'recipient-address2': Flags.string({
      description: 'Recipient address line 2 (optional)',
    }),
    'recipient-city': Flags.string({
      description: 'Recipient city',
      required: true,
    }),
    'recipient-country': Flags.string({
      default: 'NO',
      description: 'Recipient country code (ISO 3166-1 alpha-2)',
    }),
    'recipient-email': Flags.string({
      description: 'Recipient email address',
    }),
    // Recipient flags
    'recipient-name': Flags.string({
      description: 'Recipient name',
      required: true,
    }),
    'recipient-phone': Flags.string({
      description: 'Recipient phone number',
    }),
    'recipient-postal': Flags.string({
      description: 'Recipient postal code',
      required: true,
    }),
    'sender-address': Flags.string({
      description: 'Sender street address',
      required: true,
    }),
    'sender-address2': Flags.string({
      description: 'Sender address line 2 (optional)',
    }),
    'sender-city': Flags.string({
      description: 'Sender city',
      required: true,
    }),
    'sender-country': Flags.string({
      default: 'NO',
      description: 'Sender country code (ISO 3166-1 alpha-2)',
    }),
    'sender-email': Flags.string({
      description: 'Sender email address',
    }),
    // Sender flags
    'sender-name': Flags.string({
      description: 'Sender name',
      required: true,
    }),
    'sender-phone': Flags.string({
      description: 'Sender phone number',
    }),
    'sender-postal': Flags.string({
      description: 'Sender postal code',
      required: true,
    }),
    'shipping-date': Flags.string({
      description: 'Shipping date (YYYY-MM-DD, defaults to tomorrow)',
    }),
    // Package flags
    weight: Flags.integer({
      description: 'Package weight in grams',
      required: true,
    }),
    width: Flags.integer({
      description: 'Package width in cm',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(BringCreate);

    // Load .env file
    loadEnvFile();

    // Validate required environment variables
    const apiUid = requireEnvVar(
      'BRING_API_UID',
      'Error: BRING_API_UID is required. Set it in .env file'
    );
    const apiKey = requireEnvVar(
      'BRING_API_KEY',
      'Error: BRING_API_KEY is required. Set it in .env file'
    );
    const customerId = requireEnvVar(
      'BRING_CUSTOMER_ID',
      'Error: BRING_CUSTOMER_ID is required. Set it in .env file'
    );

    const config = {
      apiKey,
      apiUid,
      clientUrl: process.env.BRING_CLIENT_URL || 'https://eventuras.losol.io',
      customerId,
      environment: (process.env.BRING_ENVIRONMENT || 'test') as 'production' | 'test',
    };

    // Warn if using production API
    const isProduction = config.environment === 'production';
    if (isProduction && !flags.json) {
      this.warn('⚠️  WARNING: Using PRODUCTION Bring API!');
      this.warn('   This will create a REAL shipment and may incur costs.');
      this.warn('   Set BRING_ENVIRONMENT=test to use test environment.');
      this.error('Production environment requires explicit --production flag (not yet implemented)', { exit: 1 });
    }

    try {
      // Create client
      const client = new BringClient(config);

      // Generate shipping date (tomorrow if not specified)
      const shippingDate =
        flags['shipping-date'] ||
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]!;

      // Create consignment with correct Bring types
      const consignment = {
        correlationId: flags['correlation-id'],
        packages: [
          {
            correlationId: `${flags['correlation-id']}-pkg-1`,
            dimensions: {
              heightInCm: flags.height,
              lengthInCm: flags.length,
              widthInCm: flags.width,
            },
            weightInGrams: flags.weight,
          },
        ],
        parties: {
          recipient: toBringAddress({
            addressLine1: flags['recipient-address'],
            addressLine2: flags['recipient-address2'],
            city: flags['recipient-city'],
            countryCode: flags['recipient-country'],
            email: flags['recipient-email'],
            name: flags['recipient-name'],
            phone: flags['recipient-phone'],
            postalCode: flags['recipient-postal'],
          }),
          sender: toBringAddress({
            addressLine1: flags['sender-address'],
            addressLine2: flags['sender-address2'],
            city: flags['sender-city'],
            countryCode: flags['sender-country'],
            email: flags['sender-email'],
            name: flags['sender-name'],
            phone: flags['sender-phone'],
            postalCode: flags['sender-postal'],
          }),
        },
        product: {
          customerNumber: customerId,
          id: flags.product,
        },
        shippingDateTime: shippingDate,
      };

      // Create shipment
      const response = await client.createShipment(consignment);

      const shipment = response.consignments?.[0];
      if (!shipment) {
        throw new Error('Bring API did not return any consignments for the created shipment.');
      }

      const pkg = shipment.confirmation.packages?.[0];

      if (flags.json) {
        this.log(
          JSON.stringify(
            {
              consignmentNumber: shipment.confirmation.consignmentNumber,
              labelUrl: shipment.confirmation.links.labels,
              packageNumber: pkg?.packageNumber,
              success: true,
              trackingUrl: shipment.confirmation.links.tracking,
            },
            null,
            2
          )
        );
      } else {
        this.log('✓ Shipment created successfully!');
        this.log(`Consignment number: ${shipment.confirmation.consignmentNumber}`);
        if (pkg?.packageNumber) {
          this.log(`Package number: ${pkg.packageNumber}`);
        }

        this.log(`Tracking URL: ${shipment.confirmation.links.tracking}`);
        if (shipment.confirmation.links.labels) {
          this.log(`Label URL: ${shipment.confirmation.links.labels}`);
        }
      }
    } catch (error) {
      if (flags.json) {
        this.log(
          JSON.stringify(
            {
              error: error instanceof Error ? error.message : 'Unknown error',
              success: false,
            },
            null,
            2
          )
        );
      } else {
        this.error(
          `Failed to create shipment: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { exit: 1 }
        );
      }
    }
  }
}
