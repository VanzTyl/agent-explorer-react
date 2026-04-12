package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"agent-explorer/internal/database"
	"agent-explorer/internal/models"
)

func CreateFolder(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Content-Type", "application/json")

	var folder models.Folder

	if err  := json.NewDecoder(r.Body).Decode(&folder); err != nil{
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	if folder.Level == 0 {
		folder.Level = 1
	}

	if folder.ParentID != nil && *folder.ParentID == "" {
		folder.ParentID = nil
	}

	query := `
		INSERT INTO folders (name, level, parent_id)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at
	`
	err := database.DB.QueryRow(
		context.Background(), 
		query, 
		folder.Name, 
		folder.Level, 
		folder.ParentID,
	).Scan(
		&folder.ID,
		&folder.CreatedAt,
		&folder.UpdatedAt,
	)
	
	if err != nil{
		http.Error(w, "Failed to create folder. Ensure parent_id is valid.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(folder)
}

func GetFolders(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Content-Type", "application/json")

	query := `
		SELECT id, name, level, parent_id, created_at, updated_at
		FROM folders
		ORDER BY level ASC, created_at ASC
	`

	rows, err := database.DB.Query(context.Background(), query)
	if err != nil {
		http.Error(w, "Failed to fetch folders", http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	var folders []models.Folder

	for rows.Next(){
		var f models.Folder
		err := rows.Scan(
			&f.ID,
			&f.Name,
			&f.Level,
			&f.ParentID,
			&f.CreatedAt,
			&f.UpdatedAt,
		)
		if err != nil{
			log.Printf("Row Scan Error: %v\n", err)
			continue
		}
		folders = append(folders, f)

	}

	if folders == nil{
		folders = []models.Folder{}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(folders)
}

func UpdateFolder(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Content-Type", "application/json")

	id := r.PathValue("id")
	if id == ""{
		http.Error(w, "Folder ID is required", http.StatusBadRequest)
		return
	}

	var folder models.Folder

	err := json.NewDecoder(r.Body).Decode(&folder)

	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	query := `
		UPDATE folders
		SET name = $1, updated_at = NOW()
		WHERE id = $2
	`

	tag, err := database.DB.Exec(context.Background(), query,  folder.Name, id)

	if err != nil {
		log.Printf("Database update error: %v\n", err)
		http.Error(w, "Failed to update folder", http.StatusInternalServerError)
		return
	}

	if tag.RowsAffected() == 0{
		http.Error(w, "Folder not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Folder updated successfully"})
}

func DeleteFolder(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Content-Type", "application/json")

	id := r.PathValue("id")
	if id == ""{
		http.Error(w, "Folder ID is required", http.StatusBadRequest)
		return
	}

	query := `DELETE FROM folders where id = $1`

	tag, err := database.DB.Exec(context.Background(), query, id)

	if err != nil{
		log.Printf("Database delete error: %v\n", err)
		http.Error(w, "Failed to delete folder", http.StatusInternalServerError)
		return
	}

	if tag.RowsAffected() == 0{
		http.Error(w, "Folder not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}