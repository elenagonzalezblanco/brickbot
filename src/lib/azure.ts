// ── Azure OpenAI shared config & helpers ──
// Supports both API key auth and Azure AD (Entra ID) bearer token auth.
// Token auth is used when AZURE_OPENAI_API_KEY is not set but
// AZURE_OPENAI_TOKEN is provided (e.g. from `az account get-access-token`).

export function getAzureConfig() {
  return {
    endpoint: (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/+$/, ''),
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    token: process.env.AZURE_OPENAI_TOKEN || '',
    textModel: process.env.AZURE_TEXT_MODEL || 'gpt-5.4',
    imageModel: process.env.AZURE_IMAGE_MODEL || 'gpt-image-1.5',
    apiVersion: process.env.AZURE_API_VERSION || '2025-01-01-preview',
  };
}

export type AzureConfig = ReturnType<typeof getAzureConfig>;

export function isAzureConfigured(config: AzureConfig): boolean {
  if (!config.endpoint) return false;
  // Need either an API key or a bearer token
  if (config.apiKey && config.apiKey !== 'PEGA-AQUI-TU-API-KEY') return true;
  if (config.token) return true;
  return false;
}

function getAuthHeaders(config: AzureConfig): Record<string, string> {
  if (config.token) {
    return { Authorization: `Bearer ${config.token}` };
  }
  return { 'api-key': config.apiKey };
}

export async function callAzureChat(
  messages: any[],
  model: string,
  config: AzureConfig,
  options: { temperature?: number } = {}
) {
  const url = `${config.endpoint}/openai/deployments/${model}/chat/completions?api-version=${config.apiVersion}`;

  const body: any = {
    messages,
    temperature: options.temperature ?? 0.8,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(config),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Azure] ${model} error (${response.status}):`, errorBody);
    throw new Error(`Azure API error ${response.status}: ${errorBody}`);
  }

  return response.json();
}
