package database

import(
	"context"
	"fmt"
	"log"
	"os"
	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func InitDB() error{
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == ""{
		return fmt.Errorf("DATABASE_URL environment variable is not set")
	}

	var err error

	DB, err = pgxpool.New(context.Background(), dbURL)
	if err != nil{
		return fmt.Errorf("Unable to create connection pool; %v", err)
	}

	err = DB.Ping(context.Background())
	if err != nil{
		return fmt.Errorf("Database ping failed: %v", err)
	}

	log.Println("Successfully connected to Supabase")
	return nil
}

func CloseDB() {
	if DB != nil {
		DB.Close()
		log.Println("Database connection closed")
	}
}