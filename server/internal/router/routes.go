package router

import (
	"net/http"

	"agent-explorer/internal/handlers"
)

func SetupRoutes() *http.ServeMux{
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request){
		w.Write([]byte("Agent Explorer API is ready"))
	})

	mux.HandleFunc("POST /api/agents", handlers.CreateAgent)
	mux.HandleFunc("GET /api/agents", handlers.GetAgents)
	mux.HandleFunc("PUT /api/agents", handlers.UpdateAgent)
	mux.HandleFunc("DELETE /api/agents", handlers.DeleteAgent)
	mux.HandleFunc("PUT /api/agents/{id}/move", handlers.MoveAgent)

	mux.HandleFunc("POST /api/folders", handlers.CreateFolder)
	mux.HandleFunc("GET /api/folders", handlers.GetFolders)
	mux.HandleFunc("PUT /api/folders", handlers.UpdateFolder)
	mux.HandleFunc("DELETE /api/folders", handlers.DeleteFolder)

	return mux
}