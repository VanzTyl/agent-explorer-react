# Project Tracker

## Project Name
Agent Explorer API

## Current Build
v1.1.0 - Folder Handlers & Database Safety

## Last Updated
2026-04-11

## What Was Requested
Debug and finalize the backend folder handlers to support root-level folder creation and correct JSON array formatting for front-end consumption.

## Build History
- **v1.1.0 - Folder Handlers & Database Safety:** Refactored `CreateFolder` to handle Go's zero values and safely dereference the `ParentID` pointer, allowing the creation of root folders by passing valid `NULL` values to PostgreSQL. Corrected the `GetFolders` loop logic to append rows into a single slice and encode the payload exactly once, returning a properly formatted JSON array to the front-end.
- **v1.0.0 - CORS Implementation & API Finalization:** Created custom `CORS` middleware in `internal/middleware/cors.go` to inject required `Access-Control` headers and intercept HTTP `OPTIONS` preflight requests. Wrapped the standard library `ServeMux` with the middleware in `main.go`. The API is now fully prepared for frontend integration.
- **v0.11.0 - Agent to Folder Linking:** Updated `CreateAgent` and `GetAgents` to parse and return `FolderID`. Corrected parameter/placeholder mismatches in `UpdateAgent` and scan errors in `CreateAgent`. Implemented `MoveAgent` handler (`PUT /api/agents/{id}/move`) specifically for handling partial payload updates necessary for drag-and-drop interactions.
- **v0.10.0 - Folder CRUD Completion (PUT/DELETE):** Implemented `UpdateFolder` and `DeleteFolder` handlers in `folderHandler.go`. Matched existing project conventions for header initialization, JSON decoding, and error logging. Leveraged Go 1.22 path values for targeted database operations and `RowsAffected()` for 404 validation.
- **v0.9.0 - Folder Endpoints (GET/POST):** Created `folderHandler.go` with `CreateFolder` and `GetFolders` functions. Utilized `database.DB.QueryRow` with PostgreSQL `RETURNING` clauses for efficient inserts, and `database.DB.Query` with slice allocation to ensure safe JSON array responses for the frontend. Registered new standard library `ServeMux` routes.
- **v0.8.0 - Data Modeling (Folders):** Created `folders.go` struct and updated `agents.go` struct to include a `FolderID` pointer (`*string`). This maps to our new Supabase schema which utilizes strict Foreign Keys for physical folder hierarchy while retaining `category` and `sub_category` as flexible string tags.
- **v0.7.0 - Full CRUD Completion (PUT/DELETE):** Implemented `UpdateAgent` and `DeleteAgent` handlers. Leveraged Go 1.22 path parameters (`{id}`) for targeted database operations and added proper `RowsAffected` validation to handle 404 cases.
- v0.6.0 - Local Dev: GET /api/agents Endpoint: Created fetch logic in `agentHandler.go` to retrieve all agents ordered by creation date. Implemented row iteration and JSON unmarshaling to safely convert `JSONB` database columns back into Go structs.
- v0.5.0 - Architecture Pivot: Migrated database schema to use `JSONB` for embedded, MongoDB-style `sub_prompts`. Updated `models.go` to include nested `SubPrompt` structs and updated `agentHandler.go` to marshal JSON arrays before database insertion.
- v0.4.0 - Local Dev: POST /api/agents Endpoint: Created `agentHandler.go` to parse JSON, securely execute an INSERT query to Supabase using `pgxpool`, and return the generated record.
- v0.3.0 - Database Integration: Configured pgxpool for secure Supabase connections.
- v0.2.0 - Data Model Creation: Created the Agent struct to define our core data shape.
- v0.1.0 - Initial Server Setup: Configured `net/http` server and basic routing.

## Project Directory
/server
├── cmd
│   └── api
│       └── main.go
├── internal
│   ├── database
│   │   └── db.go
│   ├── handlers
│   │   └── agentHandler.go
│   ├── models            <-- Move here
│   │   └── agents.go
│   └── router            <-- Move here (and check if it's "router" or "routers")
│       └── routes.go
├── .env
├── go.mod
└── go.sum