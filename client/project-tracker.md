# Project Tracker

## Project Name
Agent-Explorer (Directory: `client`)

## Current Build
v0.9.6 - Agent Modal Schema Alignment

## Last Updated
Schema Alignment

## What Was Requested
Correct the Agent Modal to properly map to the defined API contract, utilizing `sub_prompts` (which contain `sub_prompt_name` and `sub_prompt_content`) instead of a root `prompt` string.

## Changes Made
- Updated `AgentModal.tsx` to dynamically render blocks based on the `sub_prompts` array.
- Added individual copy buttons for each sub-prompt section.
- Modified the footer "Copy" button to aggregate all sub-prompts into a single string for clipboard transfer.

## Project Directory
/client

## Build History
- v0.9.6: Aligned Agent View Modal with exact API schema constraints for sub_prompts.
- v0.9.5: Implemented screen-bounded, scrollable Agent View Modal with custom global scrollbars for prompt viewing.
- v0.9.4: Drag-and-drop UI completed and paused pending backend integration.
- v0.9.3: Enabled full internal grid drag-and-drop for both files and folders using `onMoveItem` context.
- v0.9.2: Implemented native HTML5 Drag and Drop for moving agents from the Workspace grid into Sidebar folders.
- v0.9.1: Fixed dark mode compliance for file explorer icons and added styled directory address bar.
- v0.9.0: Implemented Main Workspace Explorer view with breadcrumb drill-down logic and large icon cards. Wiped previous tracker history.
- v0.8.1: UI Polish - Updated static Agent icon to avoid scope creep on API endpoints.
- v0.8.0: Wired full CRUD operations to the UI with lifted state architecture and API fallback handling.
- v0.7.1: Refined context menu UX to use "Folder" terminology and added delete actions.
- v0.6.0: Upgraded context menu to a global provider to support background workspace right-clicks.
- v0.5.1: Fixed TS2322 interface mismatch in `FileTree.tsx`.
- v0.5.0: Implemented native custom right-click context menus for folders and agents.
- v0.4.0: Implemented API fetching hook and dynamic grouping logic for the File Tree.
- v0.3.0: Mapped API schema to TypeScript interfaces and added static File Tree UI.
- v0.2.2: Fixed JSX parsing failure in RootLayout by removing sibling comment node.
- v0.2.0: Implemented global theming context and duotone swatch theme selector.
- v0.1.0: Initialized React Router v7 and built the root layout shell.
- v0.0.1: Analyzed dependencies and provided Tailwind v4 + Vite setup instructions.