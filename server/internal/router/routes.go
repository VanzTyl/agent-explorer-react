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

	return mux
}