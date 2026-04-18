package models

import "time"

type SubPrompt struct {
	Name string `json:"sub_prompt_name"`
	Content string `json:"sub_prompt_content"`
}

type Agent struct {
	ID string `json:"id"`
	Name string `json:"name"`
	Subprompts []SubPrompt `json:"sub_prompts"`
	Categories []string `json:"categories"`
	SubCategories []string `json:"sub_categories"`
	FolderID string `json:"folder_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}