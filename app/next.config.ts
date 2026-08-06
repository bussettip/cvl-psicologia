import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    'cfdi-sat-nodejs',
    'saxon-js',
    '@xmldom/xmldom',
    'xpath',
    'soap',
    'pdfkit',
    'qrcode',
    'node-forge',
  ],
};

export default nextConfig;
