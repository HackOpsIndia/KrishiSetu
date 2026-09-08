/**
 * Server-side Admin Authorization Utility
 * Checks against environment variable ADMIN_EMAILS / ADMIN_EMAIL.
 * No hardcoded emails are permitted in source code for privacy and security.
 */

export function getAdminEmailsFromEnv(): string[] {
  const envRaw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
  return envRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isServerAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmailsFromEnv();
  return adminEmails.includes(email.toLowerCase().trim());
}

export function isUserAdmin(user?: { role?: string; email?: string } | null): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return isServerAdminEmail(user.email);
}
