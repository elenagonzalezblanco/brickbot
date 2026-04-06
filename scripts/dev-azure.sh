#!/bin/bash
# ── BrickBot: Start dev server with Azure AD authentication ──
# This script fetches a fresh token from Azure CLI and passes it to Next.js.

set -e

echo "🧱 BrickBot — Arrancando con Azure OpenAI..."
echo ""

# Check az cli
if ! command -v az &> /dev/null; then
  echo "❌ Azure CLI (az) no está instalado."
  echo "   Instálalo con: brew install azure-cli"
  exit 1
fi

# Check login
if ! az account show &> /dev/null; then
  echo "⚠️  No estás logueado en Azure CLI. Abriendo login..."
  az login
fi

ACCOUNT=$(az account show --query name -o tsv 2>/dev/null)
echo "✅ Cuenta Azure: $ACCOUNT"

# Get token for Cognitive Services
echo "🔑 Obteniendo token de Azure AD..."
TOKEN=$(az account get-access-token --resource https://cognitiveservices.azure.com --query accessToken -o tsv 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ No se pudo obtener el token. Ejecuta: az login"
  exit 1
fi

echo "✅ Token obtenido (expira en ~1 hora)"
echo ""
echo "🚀 Arrancando Next.js en http://localhost:3000 ..."
echo "   Chat con IA: ✅"
echo "   Generación 3D con IA: ✅"
echo ""

# Export token and start Next.js
export AZURE_OPENAI_TOKEN="$TOKEN"
exec npx next dev
