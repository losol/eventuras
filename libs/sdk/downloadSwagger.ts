import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SWAGGER_URL = 'http://localhost:8080/swagger/v3/swagger.json';
const OUTPUT_PATH = join(__dirname, 'swagger.json');

const downloadFile = async (url: string, outputPath: string): Promise<void> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
    }
    const data = await response.text();
    await fs.writeFile(outputPath, data);
    console.log(`Swagger JSON has been downloaded and saved to ${outputPath}`);
};

downloadFile(SWAGGER_URL, OUTPUT_PATH).catch(error => {
    console.error('Error:', error);
});
