import { Logger } from '@eventuras/logger';
import { ShippingError, ShippingAuthError } from '../core/types';
import type {
  BringConfig,
  BringConsignment,
  BringShipmentResponse,
} from './types.js';

const logger = Logger.create({
  namespace: 'eventuras:shipper',
  context: { module: 'BringClient' },
});

/**
 * Bring Booking API client
 * Handles shipment creation, tracking, and label retrieval
 */
export class BringClient {
  constructor(private readonly config: BringConfig) {}

  /**
   * Creates a new shipment with Bring
   *
   * @param consignment - Consignment data
   * @param accessToken - OAuth access token (fetch using fetchAccessToken)
   * @returns Shipment response with tracking number and label links
   * @throws {ShippingAuthError} If authentication fails (401)
   * @throws {ShippingError} If shipment creation fails
   */
  async createShipment(
    consignment: BringConsignment,
    accessToken: string
  ): Promise<BringShipmentResponse> {
    const url = `${this.config.apiUrl}/booking/api/booking`;
    const startTime = Date.now();

    logger.info(
      {
        correlationId: consignment.correlationId,
        product: consignment.product.id,
        packageCount: consignment.packages.length,
      },
      'Creating Bring shipment'
    );

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-MyBring-API-Uid': this.config.clientId,
          'X-Bring-Client-URL': this.config.clientUrl,
        },
        body: JSON.stringify({
          schemaVersion: 1,
          consignments: [consignment],
        }),
      });

      const responseTime = Date.now() - startTime;

      // Handle authentication errors
      if (response.status === 401) {
        logger.error(
          {
            correlationId: consignment.correlationId,
            status: 401,
            responseTimeMs: responseTime,
          },
          'Bring authentication failed - invalid or expired token'
        );

        throw new ShippingAuthError(
          'Bring authentication failed. The access token may be invalid or expired.',
          { status: 401 }
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(
          {
            correlationId: consignment.correlationId,
            status: response.status,
            error: errorText,
            responseTimeMs: responseTime,
          },
          'Failed to create Bring shipment'
        );

        throw new ShippingError(
          `Failed to create Bring shipment: ${response.status} - ${errorText}`,
          'CREATE_SHIPMENT_ERROR',
          { status: response.status, body: errorText }
        );
      }

      const data = await response.json() as BringShipmentResponse;

      // Check for API-level errors
      if (data.errors && data.errors.length > 0) {
        logger.error(
          {
            correlationId: consignment.correlationId,
            errors: data.errors,
            responseTimeMs: responseTime,
          },
          'Bring API returned errors'
        );

        const errorMessages = data.errors
          .map(err => err.messages.map(m => m.message).join('; '))
          .join('; ');

        throw new ShippingError(
          `Bring API errors: ${errorMessages}`,
          'API_ERROR',
          { errors: data.errors }
        );
      }

      logger.info(
        {
          correlationId: consignment.correlationId,
          consignmentNumber: data.consignments[0]?.confirmation.consignmentNumber,
          responseTimeMs: responseTime,
        },
        'Successfully created Bring shipment'
      );

      return data;
    } catch (error) {
      if (error instanceof ShippingError || error instanceof ShippingAuthError) {
        throw error;
      }

      logger.error(
        {
          error,
          correlationId: consignment.correlationId,
        },
        'Unexpected error creating Bring shipment'
      );

      throw new ShippingError(
        `Unexpected error creating Bring shipment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR',
        { originalError: error }
      );
    }
  }

  /**
   * Fetches the PDF label for a shipment
   *
   * @param labelUrl - Label URL from the shipment response
   * @param accessToken - OAuth access token
   * @returns PDF label as ArrayBuffer
   * @throws {ShippingAuthError} If authentication fails (401)
   * @throws {ShippingError} If label fetch fails
   */
  async fetchLabel(
    labelUrl: string,
    accessToken: string
  ): Promise<ArrayBuffer> {
    const startTime = Date.now();

    logger.info({ labelUrl }, 'Fetching Bring label');

    try {
      const response = await fetch(labelUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/pdf',
        },
      });

      const responseTime = Date.now() - startTime;

      if (response.status === 401) {
        logger.error(
          { labelUrl, status: 401, responseTimeMs: responseTime },
          'Bring authentication failed while fetching label'
        );

        throw new ShippingAuthError(
          'Bring authentication failed. The access token may be invalid or expired.',
          { status: 401 }
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(
          {
            labelUrl,
            status: response.status,
            error: errorText,
            responseTimeMs: responseTime,
          },
          'Failed to fetch Bring label'
        );

        throw new ShippingError(
          `Failed to fetch Bring label: ${response.status} - ${errorText}`,
          'FETCH_LABEL_ERROR',
          { status: response.status, body: errorText }
        );
      }

      const pdfData = await response.arrayBuffer();

      logger.info(
        {
          labelUrl,
          sizeBytes: pdfData.byteLength,
          responseTimeMs: responseTime,
        },
        'Successfully fetched Bring label'
      );

      return pdfData;
    } catch (error) {
      if (error instanceof ShippingError || error instanceof ShippingAuthError) {
        throw error;
      }

      logger.error(
        { error, labelUrl },
        'Unexpected error fetching Bring label'
      );

      throw new ShippingError(
        `Unexpected error fetching Bring label: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR',
        { originalError: error }
      );
    }
  }
}

/**
 * Creates a new Bring API client instance
 *
 * @param config - Bring API configuration
 * @returns BringClient instance
 */
export function createBringClient(config: BringConfig): BringClient {
  return new BringClient(config);
}
