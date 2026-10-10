CREATE TABLE auth_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  csrf_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  credential_version TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX auth_sessions_expiry ON auth_sessions (expires_at);
--> statement-breakpoint
CREATE TABLE auth_attempts (
  attempt_key TEXT PRIMARY KEY NOT NULL,
  attempts INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX auth_attempts_expiry ON auth_attempts (expires_at);
