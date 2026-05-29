// Shared shape + helper for maintenance request activity-log entries.
// Stored append-only in the maintenance_requests.activity_log JSONB column.

export interface ActivityEntry {
  at: string;
  message: string;
  by?: string | null;
}

/** Build a timestamped activity entry. */
export function activityEntry(message: string, by?: string | null): ActivityEntry {
  return { at: new Date().toISOString(), message, by: by ?? null };
}
