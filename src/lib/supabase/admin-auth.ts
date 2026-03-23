/**
 * Helper to read admin auth context from middleware-injected headers.
 * Middleware validates the session and injects x-user-id and x-stylist-id headers.
 */

export interface AdminContext {
  userId: string;
  stylistId: string;
}

export function getAdminContext(request: Request): AdminContext | null {
  const userId = request.headers.get("x-user-id");
  const stylistId = request.headers.get("x-stylist-id");
  if (!userId || !stylistId) return null;
  return { userId, stylistId };
}
