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
    "sub_prompts": [
      {
        "sub_prompt_name": "String",
        "sub_prompt_content": "String"
      }
    ]
  }

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