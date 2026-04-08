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

	subPromptsJSON, err := json.Marshal(agent.Subprompts)

	if err != nil {
		http.Error(w, "Failed to process sub-prompts", http.StatusInternalServerError)
		return
	}

	query := `
		INSERT INTO agents (name, sub_prompts, category, sub_category)
		VALUES ($1, $2, $3, $4)
		RETURNING id, name, sub_prompts, category, sub_category, created_at, updated_at
	`

	// context acts as an async function, meaning to say the server won't stop just because the function is being executed. this takes the var agent that we initialized and uses this data, 
	// the &values are basically pointers to the physical memory location of the agents, retrieving its value
	err = database.DB.QueryRow(
		context.Background(),
		query,
		agent.Name,
		subPromptsJSON,
		agent.Category,
		agent.SubCategory,
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

	query :=  `
		SELECT id, name, sub_prompts, category, sub_category, created_at, updated_at
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
		var subPromptBytes []byte

		err := rows.Scan(
			&agent.ID,
			&agent.Name,
			&subPromptBytes,
			&agent.Category,
			&agent.SubCategory,
			&agent.CreatedAt,
			&agent.UpdatedAt,
		)

		if err != nil {
			log.Printf("Row Scan Error: %v\n", err)
			continue
		}

		err = json.Unmarshal(subPromptBytes, &agent.Subprompts)
		if err != nil {
			log.Printf("JSON Unmarshal Error for Agent ID %s: %v\n", agent.ID, err)
		}
		
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
	if err := json.NewDecoder(r.Body).Decode(&agent); err != nil{
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	subPromptsJSON, err := json.Marshal(agent.Subprompts)
	if err != nil{
		http.Error(w, "Failed to process sub-prompts", http.StatusInternalServerError)
		return
	}

	query := `
		UPDATE agents
		SET name = $1, sub_prompts = $2, category = $3, sub-category = $4
		WHERE id = $5
	`

	result, err := database.DB.Exec(context.Background(), query, agent.Name, subPromptsJSON, agent.Category, id)

	if err != nil{
		log.Printf("Database Update Error: %v\n", err)
		http.Error(w, "Failed to update agent", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		http.Error(w, "Agent not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Agent updated successfully"})
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