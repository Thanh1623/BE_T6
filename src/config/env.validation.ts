const REQUIRED_NCPTSP_PRODUCTION = [
  'CRON_SECRET',
  'APP_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SECRET_KEY',
] as const;

/**
 * Fail fast khi production thiếu biến cho worker NCPTSP.
 */
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  if (config.NODE_ENV !== 'production') {
    return config;
  }

  const missing = REQUIRED_NCPTSP_PRODUCTION.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(', ')}`,
    );
  }

  return config;
}