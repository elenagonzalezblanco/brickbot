// ── Azure OpenAI shared config & helpers ──
// Auth priority:
// 1. API key (AZURE_OPENAI_API_KEY)
// 2. Static token (AZURE_OPENAI_TOKEN) — from dev:azure script
// 3. @azure/identity DefaultAzureCredential — auto-acquires tokens
//    (uses az login locally, managed identity on Azure, env vars on Vercel)

import { DefaultAzureCredential } from '@azure/identity';
import https from 'https';

export function getAzureConfig() {
  return {
    endpoint: (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/+$/, ''),
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    staticToken: process.env.AZURE_OPENAI_TOKEN || '',
    textModel: process.env.AZURE_TEXT_MODEL || 'gpt-5.4',
    imageModel: process.env.AZURE_IMAGE_MODEL || 'gpt-image-1.5',
    apiVersion: process.env.AZURE_API_VERSION || '2025-01-01-preview',
  };
}

export type AzureConfig = ReturnType<typeof getAzureConfig>;

// ── Token cache ──
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken(config: AzureConfig): Promise<string> {
  // 1. API key — use directly as api-key header
  if (config.apiKey) return '';

  // 2. Static token from env
  if (config.staticToken) return config.staticToken;

  // 3. Auto-acquire via DefaultAzureCredential (cached for 50 min)
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  try {
    const credential = new DefaultAzureCredential();
    const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');
    cachedToken = tokenResponse.token;
    // Cache until 5 min before expiry
    tokenExpiry = tokenResponse.expiresOnTimestamp - 5 * 60 * 1000;
    console.log('[Azure] Token acquired, expires in', Math.round((tokenExpiry - now) / 60000), 'min');
    return cachedToken;
  } catch (err: any) {
    console.error('[Azure] Failed to acquire token:', err.message);
    throw new Error('Azure auth failed. Run "az login" or set AZURE_OPENAI_TOKEN.');
  }
}

export async function isAzureConfigured(config: AzureConfig): Promise<boolean> {
  if (!config.endpoint) return false;
  if (config.apiKey) return true;
  if (config.staticToken) return true;
  // Try DefaultAzureCredential
  try {
    await getToken(config);
    return true;
  } catch {
    return false;
  }
}

export async function callAzureChat(
  messages: any[],
  model: string,
  config: AzureConfig,
  options: { temperature?: number } = {}
) {
  const url = `${config.endpoint}/openai/deployments/${model}/chat/completions?api-version=${config.apiVersion}`;

  const token = await getToken(config);
  const authHeaders: Record<string, string> = config.apiKey
    ? { 'api-key': config.apiKey }
    : { Authorization: `Bearer ${token}` };

  const body: any = {
    messages,
    temperature: options.temperature ?? 0.8,
  };

  const bodyStr = JSON.stringify(body);

  // Use native https module to avoid Next.js fetch patching (causes connect timeouts)
  const data: any = await new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
          ...authHeaders,
        },
        timeout: 60000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            console.error(`[Azure] ${model} error (${res.statusCode}):`, data);
            reject(new Error(`Azure API error ${res.statusCode}: ${data}`));
          } else {
            try {
              resolve(JSON.parse(data));
            } catch {
              reject(new Error(`Invalid JSON from Azure: ${data.slice(0, 200)}`));
            }
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Azure API request timed out'));
    });
    req.write(bodyStr);
    req.end();
  });

  return data;
}
