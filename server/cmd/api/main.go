package main

import (
	"log"
	"net/http"
	"os"
	"agent-explorer/internal/middleware"
	"agent-explorer/internal/database"
	"agent-explorer/internal/router"
	"github.com/joho/godotenv"
)

func main(){

	godotenv.Load()

	err := database.InitDB()

	if err != nil{
		log.Fatal("Could not connect to database", err)
	}

	defer database.CloseDB()

	mux := router.SetupRoutes()

	port := os.Getenv("PORT")
	if port == ""{
		port = "8080"
	}

	log.Println("Server starting on http://localhost:" + port)

	err = http.ListenAndServe(":"+port, middleware.CORS(mux))

	if err != nil {
		log.Fatal("Server failed to start: ",  err)
	}
}