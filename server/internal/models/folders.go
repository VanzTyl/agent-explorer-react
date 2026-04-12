package models

import (
	"time"
)

type Folder struct{
	ID string `json:"id"`
	Name string `json:"name"`
	Level int `json:"level"`
	ParentID *string `json:"parent_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}