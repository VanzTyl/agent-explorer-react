package handlers

import (
	"context" // Context is like the promise await and async function for js
	"encoding/json" // Json Parser
	"log" // To debug errors
	"net/http" // This is like the express() for js

	"agent-explorer/internal/database"
	"agent-explorer/internal/models"
)

func CreateAgent(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var agent models.Agent

	err := json.NewDecoder(r.Body).Decode(&agent)

	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	categoriesJSON, _ := json.Marshal(agent.Categories)
	subCategoriesJSON, _ := json.Marshal(agent.SubCategories)
	subPromptsJSON, err := json.Marshal(agent.Subprompts)

	if err != nil {
		http.Error(w, "Failed to process sub-prompts", http.StatusInternalServerError)
		return
	}
	// Added folder id
	query := `
		INSERT INTO agents (name, sub_prompts, categories, sub_categories, folder_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	// context acts as an async function, meaning to say the server won't stop just because the function is being executed. this takes the var agent that we initialized and uses this data, 
	// the &values are basically pointers to the physical memory location of the agents, retrieving its value
	err = database.DB.QueryRow(
		context.Background(),
		query,
		agent.Name,
		subPromptsJSON,
		categoriesJSON,
		subCategoriesJSON,
		agent.FolderID, // Finds for folder id now
	).Scan(
		&agent.ID,
		&agent.CreatedAt,
		&agent.UpdatedAt,
	)

	if err != nil{
		log.Printf("Database Insert Error: %v\n", err)
		http.Error(w, "Failed to save agent to the database", http.StatusInternalServerError)
		return
	}

	// Sends 201 created status and returns agent in json format
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(agent)
}

func GetAgents(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Content-Type", "application/json")

	// Added folder id
	query :=  `
		SELECT id, name, sub_prompts, categories, sub_categories, folder_id, created_at, updated_at
		FROM agents
		ORDER by created_at DESC
	`

	rows, err := database.DB.Query(context.Background(), query)
	if err != nil {
		log.Printf("Database Query Error: %v\n", err)
		http.Error(w, "Failed to fetch agents", http.StatusInternalServerError)
		return
	}

	defer rows.Close() // Closes row connection to ensure no database leak connections

	var agents []models.Agent // Empty array for agents

	for rows.Next() {
		var agent models.Agent
		var subPromptBytes, categoriesBytes, subCategoriesBytes []byte

		err := rows.Scan(
			&agent.ID,
			&agent.Name,
			&subPromptBytes,
			&categoriesBytes,
			&subCategoriesBytes,
			&agent.FolderID, // Returns folder id now
			&agent.CreatedAt,
			&agent.UpdatedAt,
		)

		if err != nil {
			log.Printf("Row Scan Error: %v\n", err)
			continue
		}

		json.Unmarshal(subPromptBytes, &agent.Subprompts)
		json.Unmarshal(categoriesBytes, &agent.Categories)
		json.Unmarshal(subCategoriesBytes, &agent.SubCategories)
		
		agents = append(agents, agent)
	}
	if agents == nil{
		agents = []models.Agent{}
	}

	json.NewEncoder(w).Encode(agents)
}

func UpdateAgent(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Content-Type", "application/json")

	id := r.PathValue("id")

	var agent models.Agent

	// 1. Fetch current values into the struct first to support partial updates
	fetchQuery := `SELECT id, name, categories, sub_categories, folder_id, created_at, updated_at, sub_prompts FROM agents WHERE id = $1`
	var subPromptBytes, categoriesBytes, subCategoriesBytes []byte
	err := database.DB.QueryRow(context.Background(), fetchQuery, id).Scan(
		&agent.ID,
		&agent.Name,
		&categoriesBytes,
		&subCategoriesBytes,
		&agent.FolderID,
		&agent.CreatedAt,
		&agent.UpdatedAt,
		&subPromptBytes,
	)

	if err != nil {
		if err.Error() == "no rows in result set" {
			http.Error(w, "Agent not found", http.StatusNotFound)
			return
		}
		log.Printf("Database fetch error: %v\n", err)
		http.Error(w, "Failed to retrieve agent data", http.StatusInternalServerError)
		return
	}

	// Unmarshal existing states
	json.Unmarshal(subPromptBytes, &agent.Subprompts)
	json.Unmarshal(categoriesBytes, &agent.Categories)
	json.Unmarshal(subCategoriesBytes, &agent.SubCategories)

	// 2. Decode the incoming JSON OVER the existing data (merges the fields)
	if err := json.NewDecoder(r.Body).Decode(&agent); err != nil{
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	subPromptsJSON, _ := json.Marshal(agent.Subprompts)
	categoriesJSON, _ := json.Marshal(agent.Categories)
	subCategoriesJSON, _ := json.Marshal(agent.SubCategories)

	query := `
		UPDATE agents
		SET name = $1, sub_prompts = $2, categories = $3, sub_categories = $4, updated_at = NOW()
		WHERE id = $5
		RETURNING id, name, sub_prompts, categories, sub_categories, folder_id, created_at, updated_at
	`

	err = database.DB.QueryRow(context.Background(), query, agent.Name, subPromptsJSON, categoriesJSON, subCategoriesJSON, id).Scan(
		&agent.ID,
		&agent.Name,
		&subPromptBytes,
		&categoriesBytes,
		&subCategoriesBytes,
		&agent.FolderID,
		&agent.CreatedAt,
		&agent.UpdatedAt,
	)

	if err != nil{
		if err.Error() == "no rows in result set" {
			http.Error(w, "Agent not found", http.StatusNotFound)
			return
		}
		log.Printf("Database Update Error: %v\n", err)
		http.Error(w, "Failed to update agent", http.StatusInternalServerError)
		return
	}

	json.Unmarshal(subPromptBytes, &agent.Subprompts)
	json.Unmarshal(categoriesBytes, &agent.Categories)
	json.Unmarshal(subCategoriesBytes, &agent.SubCategories)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(agent)
}

func DeleteAgent(w http.ResponseWriter, r *http.Request){
	id := r.PathValue("id")

	query := `DELETE FROM agents WHERE id = $1`
	result, err := database.DB.Exec(context.Background(), query, id)

	if err != nil{
		log.Printf("Database Delete Error: %v\n", err)
		http.Error(w, "Failed to delete agent", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0{
		http.Error(w, "Agent not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent) // 204 for deletes, this is the standard when successfully deleting
}

func MoveAgent(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Content-Type", "application/json")

	id := r.PathValue("id")

	var payload struct {
		FolderID *string `json:"folder_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil{
		http.Error(w, "Invalid payload request", http.StatusBadRequest)
		return
	}

	query := `
		UPDATE agents
		SET folder_id = $1, updated_at = NOW()
		WHERE id = $2
		RETURNING id, name, sub_prompts, categories, sub_categories, folder_id, created_at, updated_at
	`

	var agent models.Agent
	var subPromptBytes, categoriesBytes, subCategoriesBytes []byte
	err := database.DB.QueryRow(context.Background(), query, payload.FolderID, id).Scan(
		&agent.ID,
		&agent.Name,
		&subPromptBytes,
		&categoriesBytes,
		&subCategoriesBytes,
		&agent.FolderID,
		&agent.CreatedAt,
		&agent.UpdatedAt,
	)

	if err != nil{
		if err.Error() == "no rows in result set" {
			http.Error(w, "Agent not found", http.StatusNotFound)
			return
		}
		log.Printf("Database move error: %v\n", err)
		http.Error(w, "Failed to move agent", http.StatusInternalServerError)
		return
	}

	json.Unmarshal(subPromptBytes, &agent.Subprompts)
	json.Unmarshal(categoriesBytes, &agent.Categories)
	json.Unmarshal(subCategoriesBytes, &agent.SubCategories)
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(agent)
}