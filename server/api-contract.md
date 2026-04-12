## GET /health
- Method: GET
- Route: /health
- Description: Simple health check to verify the API is running.
- Request Body: N/A
- Response Shape: Plain text string ("Agent Explorer API is healthy!")
- Error Codes: 500
- Auth Required: No

## POST /api/agents
- Method: POST
- Route: /api/agents
- Description: Creates a new AI agent in the database.
- Request Body:
```json
{
  "name": "String",
  "category": "String",
  "sub_category": "String",
  "folder_id": "String | null",
  "sub_prompts": [
    {
      "sub_prompt_name": "String",
      "sub_prompt_content": "String"
    }
  ]
}
```
- Response Shape: Returns agent_id, created_at, updated_at
- Error Codes: 400 (Invalid Payload), 500 (Database Error)
- Auth Required: No

## GET /api/agents
- Method: GET
- Route: /api/agents
- Description: Fetches all AI agents from the database, ordered by newest first.
- Request Body: None
- Response Shape: Array of Agent objects. Returns `[]` if no agents exist.
- Error Codes: 500 (Database Error)
- Auth Required: No

## PUT /api/agents
- Method: PUT
- Route: /api/agents
- Description: Updates an existing agent's details and sub-prompts.
- Path Parameters: id (UUID)
- Request Body: Same as POST.
- Response Shape: {"message": "Agent updated successfully"}
- Error Codes: 404 (Not Found), 500 (Database Error)
- Auth Required: No

### DELETE /api/agents/{id}
- Method: DELETE
- Route: /api/agents/{id}
- Description: Permanently removes an agent from the database.
- Path Parameters: id (UUID)
- Response Shape: 204 No Content
- Error Codes: 404 (Not Found), 500 (Database Error)
- Auth Required: No

### PUT /api/agents/{id}/move
- Method: PUT
- Route: /api/agents/{id}/move
- Description: Moves an agent to a new folder (used for drag-and-drop).
Request Body:
```json
{
  "folder_id": "String | null"
}
```
- Response Shape: {"message": "Agent moved successfully"}
- Error Codes: 400, 404, 500
- Auth Required: No

### POST /api/folders
- Method: POST
- Route: /api/folders
- Description: Creates a new explicit folder for organizing agents.
- Request Body:
```json
{
  "name": "String",
  "level": "Number",
  "parent_id": "String | null"
}
```

### GET /api/folders
- Method: GET
- Route: /api/folders
- Description: Fetches all explicit folders in the database, ordered by level.
- Request Body: N/A
- Response Shape: Array of Folder objects ([])
- Error Codes: 500
- Auth Required: No

### PUT /api/folders/{id}
- Method: PUT
- Route: /api/folders/{id}
- Description: Update an existing folder's name
- Request Body:
```json
{
  "name": "String"
}
```
- Response Shape: {"message": "Folder updated successfully"}
- Error Codes: 400, 404, 500
- Auth Required: No

### DELETE /api/folders/{id}
- Method: Delete
- Route: /api/folders/{id}
- Description: Deletes a specific folder. Cascade deletes any sub-folders and agents inside it.
- Request Body: N/A
- Response Shape: N/A (204 No Content)
- Error Codes: 400, 404, 500
- Auth Required: No