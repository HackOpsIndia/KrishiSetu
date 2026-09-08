/**
 * Environment isolation guards and non-secret metadata helpers.
 * Ensures demo operations (resets, demo seeding, mock switches) CANNOT execute in production.
 */

export interface SafeEnvironmentMeta {
  environment: 'production' | 'demo' | 'development' | 'test';
  demoMode: boolean;
  timestamp: string;
}

/**
 * Determine canonical runtime environment identifier.
 */
export function getAppEnv(): 'production' | 'demo' | 'development' | 'test' {
  const env = (process.env.APP_ENV || process.env.NEXT_PUBLIC_APP_ENV || '').toLowerCase().trim();
  if (env === 'production' || env === 'prod') return 'production';
  if (env === 'demo') return 'demo';
  if (env === 'test') return 'test';
  
  // Fallback based on DEMO_MODE or NODE_ENV
  if (process.env.DEMO_MODE === 'true') return 'demo';
  if (process.env.NODE_ENV === 'production') return 'production';
  return 'development';
}

/**
 * Check if the current process is running in demo mode.
 * In production, DEMO_MODE must strictly be false.
 */
export function isDemoMode(): boolean {
  if (getAppEnv() === 'production') {
    return false;
  }
  return process.env.DEMO_MODE === 'true' || getAppEnv() === 'demo';
}

/**
 * Assert that a destructive or demo-only operation is allowed.
 * Throws a fatal Error if invoked in a production environment.
 */
export function assertDemoOnly(actionName: string): void {
  const appEnv = getAppEnv();
  const demoMode = process.env.DEMO_MODE === 'true';

  if (appEnv === 'production' || (!demoMode && appEnv !== 'test' && appEnv !== 'development')) {
    throw new Error(
      `[CRITICAL SECURITY GUARD] ${actionName} is strictly forbidden in PRODUCTION environment (APP_ENV=${appEnv}, DEMO_MODE=${process.env.DEMO_MODE}). Operation aborted.`
    );
  }
}

/**
 * Validate that the database connection string aligns safely with the expected APP_ENV.
 * Prevents accidentally attaching a production API to a demo DB or vice-versa.
 */
export function validateDatabaseEnvAlignment(databaseUrl?: string): { valid: boolean; reason?: string } {
  if (!databaseUrl) {
    return { valid: true };
  }

  const appEnv = getAppEnv();
  const lowerUrl = databaseUrl.toLowerCase();

  // Guard against known demo markers in production
  if (appEnv === 'production') {
    if (lowerUrl.includes('demo') || lowerUrl.includes('krishisetu-demo')) {
      return {
        valid: false,
        reason: 'Production environment is configured with a database URL containing demo identifiers.',
      };
    }
  }

  return { valid: true };
}

/**
 * Expose non-sensitive runtime metadata for health and UI indicator endpoints.
 * NEVER exposes connection strings, passwords, or secrets.
 */
export function getSafeEnvironmentMeta(): SafeEnvironmentMeta {
  const env = getAppEnv();
  return {
    environment: env,
    demoMode: env !== 'production' && isDemoMode(),
    timestamp: new Date().toISOString(),
  };
}
