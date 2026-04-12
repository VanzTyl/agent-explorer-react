export interface SubPrompt {
  sub_prompt_name: string;
  sub_prompt_content: string;
}

export interface Agent {
  id: string;
  name: string;
  category: string;
  sub_category: string;
  folder_id: string | null; // <-- Added from new API
  sub_prompts: SubPrompt[];
}

// New Folder Type
export interface Folder {
  id: string;
  name: string;
  level: number; // 1 = Category, 2 = Sub-Category
  parent_id: string | null;
}