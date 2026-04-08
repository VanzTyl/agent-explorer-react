# Project Tracker

## Project Name
Agent Explorer API

## Current Build
v0.7.0 - Full CRUD Completion (PUT/DELETE)

## Last Updated
2026-04-08

## What Was Requested
Complete the RESTful API by implementing Update and Delete functionality, ensuring the database handles complex JSON structures, and documenting the full API contract.

## Build History
- **v0.7.0 - Full CRUD Completion (PUT/DELETE):** Implemented `UpdateAgent` and `DeleteAgent` handlers. Leveraged Go 1.22 path parameters (`{id}`) for targeted database operations and added proper `RowsAffected` validation to handle 404 cases.
v0.6.0 - Local Dev: GET /api/agents Endpoint: Created fetch logic in `agentHandler.go` to retrieve all agents ordered by creation date. Implemented row iteration and JSON unmarshaling to safely convert `JSONB` database columns back into Go structs.
v0.5.0 - Architecture Pivot: Migrated database schema to use `JSONB` for embedded, MongoDB-style `sub_prompts`. Updated `models.go` to include nested `SubPrompt` structs and updated `agentHandler.go` to marshal JSON arrays before database insertion.
v0.4.0 - Local Dev: POST /api/agents Endpoint: Created `agentHandler.go` to parse JSON, securely execute an INSERT query to Supabase using `pgxpool`, and return the generated record.
v0.3.0 - Database Integration: Configured pgxpool for secure Supabase connections.
v0.2.0 - Data Model Creation: Created the Agent struct to define our core data shape.
v0.1.0 - Initial Server Setup: Configured `net/http` server and basic routing.

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