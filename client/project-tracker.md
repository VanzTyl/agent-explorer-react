# Project Tracker

## Project Name
Agent-Explorer
## Current Build
v0.13.8 - Sidebar Integration & Validation
## Last Updated
Prevented duplicate folder creation and upgraded FileTree to support explicit folders and drag-and-drop.
## What Was Requested
1. Prevent duplication of folder names in the same directory.
2. Upgrade `FileTree.tsx` to render explicit database folders instead of categories.
3. Enable dragging and dropping items from the Workspace directly into the FileTree sidebar.
## Changes Made
- Added duplicate name validation in `FolderFormModal.tsx` before API submission.
- Updated `RootLayout.tsx` to pass the `folders` and `onMoveItem` props to `<FileTree />`.
- Completely rewrote `FileTree.tsx` with recursive rendering to support infinite nesting depth, matching the drag-and-drop logic of the main Workspace perfectly.
## Build History
- v0.13.8: Added name validation, integrated FileTree with explicit folders and DnD.
- v0.13.7: Fixed permanent active state on root workspace breadcrumb and resolved drag event flickering.
- v0.13.6: Fixed breadcrumb UI so drag-hover states are accurate and non-permanent.
- v0.13.5: Fixed drag outline CSS, fixed layout event collisions, and added folder drag-and-drop logic.
- v0.13.4: Patched `RootLayout.tsx` context action logic to preserve `parent_id`.
- v0.13.3: Debugging state pipeline between Workspace, ContextMenu, and RootLayout.
- v0.13.2: Fixed sub-folder `parent_id` tracking for Context Menu triggers.
- v0.13.1: Finalized real folder integration utilizing the user's preferred "clean" UI layout.
- v0.13.0: Backend fixed; Migrating Workspace to render explicit database folders.
- v0.12.11: Pinpointed the backend loop/write bug.
- v0.12.10: Diagnosing JSON syntax error from backend response.
- v0.12.9: Debugging `GET /api/folders` failing silently into the fallback state.
- v0.12.8: Clarified automatic state synchronization architecture.
- v0.12.7: Verified API contract routing. Backend debugging continues.
- v0.12.6: Completed dynamic folder level payload generation.
- v0.12.5: Hook validation and 0-index level logic mapping.
- v0.12.4: Verifying frontend-to-backend API routing.
- v0.12.3: Locked in the exact payload parameters for Root vs Sub-folder creation.
- v0.12.2: Adjusting frontend payload logic for root-level folder creation.
- v0.12.1: Pivoted to debugging backend server integration.
- v0.12.0: Finalized Agent Detail View on the preferred clean layout and completed the core feature roadmap. Workspace.tsx rollback and isolated Agent Modal trigger logic.
- v0.11.2: Reverted to clean layout; Integrated Agent Detail View Modal.
- v0.11.1: Integrated Agent Detail View (Read-Only Modal) into the main Workspace grid.
- v0.11.0: Implemented Global Search in RootLayout, filtering agents dynamically and introducing a modern top header.
- v0.10.2: Resolved TS error by expanding `ContextTargetType` in `ContextMenuContext.tsx`.
- v0.10.1: Patched `ContextMenu.tsx` to include the missing "Rename Folder" UI button.
- v0.10.0: Upgraded FolderFormModal to handle renaming. Wired `PUT /api/folders/{id}` to the Context Menu and RootLayout.
- v0.9.9: Added `moveAgent` with optimistic fallback. Rewrote `useFolders.ts` to include full CRUD. Wired delete actions to API. Fixed TS errors.
- v0.9.8: Refactored AgentFormModal with native searchable `<datalist>` inputs and contextual folder targeting.
- v0.9.7: Integrated explicit Folder API contract, built secure Create Form, and wired real drag-and-drop logic in RootLayout.
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

## Project Directory
/client
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── project-tracker.md
└── src/
    ├── main.tsx
    ├── index.css                 (Global styles, Tailwind imports, custom scrollbars)
    │
    ├── types/
    │   └── agent.ts              (Interfaces: Agent, Folder, SubPrompt)
    │
    ├── contexts/
    │   └── ContextMenuContext.tsx (Right-click state and provider)
    │
    ├── hooks/
    │   ├── useAgents.ts          (Fetches GET/POST/PUT/DELETE for /api/agents)
    │   └── useFolders.ts         (Fetches GET/POST for /api/folders)
    │
    ├── layouts/
    │   └── RootLayout.tsx        (Main layout, sidebar wrapper, context logic, drag-and-drop wiring)
    │
    ├── pages/
    │   └── Workspace.tsx         (Main grid view, breadcrumb address bar, drag/drop target mapping)
    │
    └── components/
        ├── AgentFormModal.tsx    (Create/Edit agent form with Folder dropdown selector)
        ├── FolderFormModal.tsx   (Create folder form, auto-calculates parent/level)
        ├── AgentModal.tsx        (Read-only prompt viewer with copy functionality)
        ├── FileTree.tsx          (Sidebar hierarchy mapping explicit DB folders/agents)
        ├── ContextMenu.tsx       (The floating right-click UI component)
        └── ThemeSwitcher.tsx     (Light/Dark mode toggle)