import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SWAGGER_URL = process.env.SWAGGER_URL || 'http://localhost:8080/swagger/v3/swagger.json';
const OUTPUT_PATH = join(__dirname, 'swagger.json');

const downloadFile = async (url: string, outputPath: string): Promise<void> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Could not download swagger definition: ${response.statusText}`);
        }
        const data = await response.text();
        await fs.writeFile(outputPath, data);
        console.log(`Swagger JSON has been downloaded and saved to ${outputPath}`);
    } catch (error) {
        console.warn('Warning: Could not download swagger definition.');
    }
};

downloadFile(SWAGGER_URL, OUTPUT_PATH);
