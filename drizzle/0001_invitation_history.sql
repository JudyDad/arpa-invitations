CREATE TABLE invitation_operations (id TEXT PRIMARY KEY, payload_hash TEXT NOT NULL, created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE invitation_history (id TEXT PRIMARY KEY, operation_id TEXT NOT NULL REFERENCES invitation_operations(id), row_index INTEGER NOT NULL, name TEXT NOT NULL, language TEXT NOT NULL CHECK(language IN ('ar','en')), source TEXT NOT NULL CHECK(source IN ('single','excel')), width INTEGER NOT NULL, height INTEGER NOT NULL, created_at INTEGER NOT NULL, UNIQUE(operation_id,row_index));
--> statement-breakpoint
CREATE INDEX invitation_history_created ON invitation_history(created_at DESC,id DESC);
--> statement-breakpoint
CREATE INDEX invitation_history_language_created ON invitation_history(language,created_at DESC);
