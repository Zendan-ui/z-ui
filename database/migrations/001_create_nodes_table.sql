-- Migration: Create nodes table for Multi-Node Management
-- Date: 2026-07-07

CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    port INTEGER DEFAULT 2053,
    api_key TEXT,
    status TEXT DEFAULT 'offline',
    last_seen DATETIME,
    cpu REAL DEFAULT 0,
    ram REAL DEFAULT 0,
    disk REAL DEFAULT 0,
    network_in INTEGER DEFAULT 0,
    network_out INTEGER DEFAULT 0,
    xray_version TEXT,
    online_users INTEGER DEFAULT 0,
    owner_id INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nodes_owner ON nodes(owner_id);
CREATE INDEX IF NOT EXISTS idx_nodes_status ON nodes(status);
