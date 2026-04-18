package main

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL not set")
	}

	conn, err := pgx.Connect(context.Background(), dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close(context.Background())

	query := `
		ALTER TABLE agents 
		RENAME COLUMN category TO categories;
		ALTER TABLE agents 
		RENAME COLUMN sub_category TO sub_categories;

		ALTER TABLE agents 
		ALTER COLUMN categories TYPE JSONB USING to_jsonb(categories),
		ALTER COLUMN sub_categories TYPE JSONB USING to_jsonb(sub_categories);
	`

	_, err = conn.Exec(context.Background(), query)
	if err != nil {
		log.Printf("Migration Error (Maybe columns already renamed?): %v", err)
        // Try just the type change if rename failed
        query2 := `
            ALTER TABLE agents 
            ALTER COLUMN categories TYPE JSONB USING to_jsonb(categories),
            ALTER COLUMN sub_categories TYPE JSONB USING to_jsonb(sub_categories);
        `
        _, err = conn.Exec(context.Background(), query2)
        if err != nil {
            log.Fatal(err)
        }
	}

	log.Println("Migration successful: categories and sub_categories are now JSONB")
}
