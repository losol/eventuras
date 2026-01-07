import { fetchAccessToken } from '@eventuras/shipper/bring-v1';
import { Command, Flags } from '@oclif/core';

import { loadEnvFile, requireEnvVar } from '../../../utils/env.js';

export default class BringTest extends Command {
  static override description = 'Test Bring API connectivity and authentication';
static override examples = [
    '$ oxo shipper bring test',
    '$ oxo shipper bring test --json',
  ];
static override flags = {
    json: Flags.boolean({
      default: false,
      description: 'Output result as JSON',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(BringTest);

    // Load .env file
    loadEnvFile();

    // Validate required environment variables
    const clientId = requireEnvVar(
      'BRING_CLIENT_ID',
      'Error: BRING_CLIENT_ID is required. Set it in .env file'
    );
    const clientSecret = requireEnvVar(
      'BRING_CLIENT_SECRET',
      'Error: BRING_CLIENT_SECRET is required. Set it in .env file'
    );
    const customerId = requireEnvVar(
      'BRING_CUSTOMER_ID',
      'Error: BRING_CUSTOMER_ID is required. Set it in .env file'
    );

    const config = {
      apiUrl: process.env.BRING_API_URL || 'https://api.qa.bring.com',
      clientId,
      clientSecret,
      clientUrl: process.env.BRING_CLIENT_URL || 'https://eventuras.losol.io',
      customerId,
    };

    try {
      const startTime = Date.now();

      // Test authentication
      const tokenResponse = await fetchAccessToken(config);

      const responseTime = Date.now() - startTime;

      if (flags.json) {
        this.log(
          JSON.stringify(
            {
              apiUrl: config.apiUrl,
              clientId: config.clientId,
              customerId: config.customerId,
              responseTimeMs: responseTime,
              success: true,
              tokenLength: tokenResponse.access_token.length,
            },
            null,
            2
          )
        );
      } else {
        this.log('✓ Bring API connection successful!');
        this.log(`API URL: ${config.apiUrl}`);
        this.log(`Customer ID: ${config.customerId}`);
        this.log(`Client ID: ${config.clientId}`);
        this.log(`Access token length: ${tokenResponse.access_token.length} characters`);
        this.log(`Response time: ${responseTime}ms`);
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
          `Bring API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { exit: 1 }
        );
      }
    }
  }
}
