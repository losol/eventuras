import { BringClient } from '@eventuras/shipper/bring-v1';
import { Command, Flags } from '@oclif/core';
import { writeFileSync } from 'node:fs';

import { loadEnvFile, requireEnvVar } from '../../../utils/env.js';

export default class BringLabel extends Command {
  static override description = 'Download a Bring shipping label as PDF';
static override examples = [
    '$ oxo shipper bring label --label-url "https://api.qa.bring.com/booking/api/booking/labels/XXX"',
    '$ oxo shipper bring label --label-url "..." --output custom-label.pdf',
    '$ oxo shipper bring label --label-url "..." --json',
  ];
static override flags = {
    json: Flags.boolean({
      default: false,
      description: 'Output result as JSON',
    }),
    'label-url': Flags.string({
      description: 'Label URL from shipment creation response',
      required: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path (defaults to label-{timestamp}.pdf)',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(BringLabel);

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
      apiUrl: process.env.BRING_API_URL || 'https://api.qa.bring.com',
      clientUrl: process.env.BRING_CLIENT_URL || 'https://eventuras.losol.io',
      customerId,
    };

    try {
      // Create client
      const client = new BringClient(config);

      // Fetch label
      const labelData = await client.fetchLabel(flags['label-url']);

      // Generate output filename
      const outputPath = flags.output || `label-${Date.now()}.pdf`;

      // Write to file
      writeFileSync(outputPath, Buffer.from(labelData));

      if (flags.json) {
        this.log(
          JSON.stringify(
            {
              outputPath,
              sizeBytes: labelData.byteLength,
              success: true,
            },
            null,
            2
          )
        );
      } else {
        this.log('✓ Label downloaded successfully!');
        this.log(`File: ${outputPath}`);
        this.log(`Size: ${labelData.byteLength} bytes`);
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
          `Failed to download label: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { exit: 1 }
        );
      }
    }
  }
}
