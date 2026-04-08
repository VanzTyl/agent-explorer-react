export interface SubPrompt {
  sub_prompt_name: string;
  sub_prompt_content: string;
}

export interface Agent {
  id: string; // UUID referenced in PUT/DELETE endpoints
  name: string;
  category: string;
  sub_category: string;
  sub_prompts: SubPrompt[];
}