# TASK.MD - RFP Response Assistant

## Phase 0: Initial Project Setup & UI Scaffolding (Largely Done with Bolt.new, Finalized in Cursor)

*   [x] Export project from Bolt.new to Cursor.
*   [x] Configure Next.js for dynamic routing (remove `output: 'export'` from `next.config.js`, remove `generateStaticParams` from dynamic route pages like `app/rfps/[id]/page.tsx`).
*   [x] Set up `.gitignore` (ensure `node_modules/`, `.env.local` are included).
*   [x] Initialize Git repository and make initial commit.
*   [x] UI: Consolidate "Dashboard" and "My RFPs" into a single `/dashboard` route displaying RFP projects as cards.
*   [x] UI: Ensure `/my-rfps` route also points to or displays the same card view as `/dashboard`.
*   [x_IN_PROGRESS] UI (`RFP Workspace`): Refine question row display:
    *   [x] Circular Trust Score with color-coding and numeric value.
    *   [x] Assignee initials/avatars displayed on the far right.
    *   [x] Interactive placeholder for assigning users (mockup of dropdown/popover appearing and staying visible).
*   [x_IN_PROGRESS] UI (`RFP Workspace`): Refine Project Status cards in header to show numeric ratios (e.g., "50 of 127 Draft").
*   [x_IN_PROGRESS] UI (`RFP Workspace`): Implement expandable comments section UI per question (toggled by "Comment" button, shows placeholder existing comments, "Add a comment" textarea, "Post Comment" button).

## Phase 1: Backend Foundation - Supabase & n8n Integration

*   **Supabase Setup:**
    *   [ ] **Create Supabase Project:** (Assumed you have this).
    *   [ ] **Create `rfp_projects` table in Supabase** (as per SQL DDL provided).
    *   [ ] **Create `rfp_questions` table in Supabase** (as per SQL DDL provided).
    *   [ ] Define initial Row Level Security (RLS) policies (basic ones for backend access initially).
*   **n8n Callback Endpoint:**
    *   [ ] Design JSON payload structure for n8n to send processed RFP data.
    *   [ ] Create a backend API endpoint (Supabase Edge Function OR Next.js API Route at `/api/n8n-callback/rfp-results`) to receive data from n8n.
    *   [ ] Implement logic in this endpoint to:
        *   [ ] Securely validate the incoming request (optional, basic for now).
        *   [ ] Create a new record in `rfp_projects` table.
        *   [ ] Create new records in `rfp_questions` table, linked to the project.
*   **n8n Workflow Modification:**
    *   [ ] Update the n8n workflow:
        *   [ ] Ensure Office Script payload to n8n includes `originalFilename`.
        *   [ ] Aggregate all processed question-answer pairs into the defined JSON structure.
        *   [ ] Add a final HTTP Request node to POST this JSON payload to the new backend endpoint.
*   **Environment Variables:**
    *   [ ] Create `.env.local` file in the Next.js project root.
    *   [ ] Add Supabase URL, `anon` key, and `service_role` key to `.env.local`.
    *   [ ] Ensure `.env.local` is in `.gitignore`.

## Phase 2: Connecting Frontend UI to Supabase (Read Operations)

*   **Dashboard Page (`/dashboard`):**
    *   [ ] Implement data fetching from `rfp_projects` table in Supabase.
    *   [ ] Dynamically render RFP project cards based on fetched data.
    *   [ ] Ensure card click navigates to `/rfps/[actual_rfp_id]`.
*   **RFP Workspace Page (`/rfps/[id]`):**
    *   [ ] Implement data fetching for a single project from `rfp_projects` using `params.id`.
    *   [ ] Implement data fetching for associated questions from `rfp_questions` using `project_id`.
    *   [ ] Populate the Project Context Header (Details, Status Cards) with dynamic data.
    *   [ ] Populate the "Questions & Responses" list dynamically.
        *   [ ] Display actual question text, AI-generated response, trust score, assignees (placeholders initially), status from DB.
        *   [ ] Display AI sources from DB.
        *   [ ] Display Editor/Reviewer from DB (if fields exist).
    *   [ ] Populate "Collaborators" tab with dynamic data.

## Phase 3: Implementing UI "Write" Operations to Supabase

*   **RFP Workspace Page - Edit Response:**
    *   [ ] Frontend: Ensure "Edit" button makes response textarea editable and shows "Save"/"Cancel".
    *   [ ] Backend: Create API endpoint (Next.js API route or Supabase Edge Function) to handle updates to `rfp_questions.edited_answer` and `rfp_questions.status`.
    *   [ ] Frontend: On "Save," call the update API endpoint and refresh UI.
*   **RFP Workspace Page - Change Question Status:**
    *   [ ] Frontend: Make status tags or "More Actions" menu interactive to change a question's status (e.g., "Draft" -> "In Review" -> "Approved").
    *   [ ] Backend: Create API endpoint to update `rfp_questions.status`.
    *   [ ] Frontend: Call update API and refresh UI.
    *   [ ] UI: (Later) Attempt to make Project Status header counts update dynamically based on these changes.
*   **RFP Workspace Page - Assign User(s):**
    *   [ ] Frontend: Implement UI for selecting user(s) from a (mock) list when "Assign" interaction is triggered.
    *   [ ] Backend: Create API endpoint to update assignee(s) for a question in `rfp_questions`.
    *   [ ] Frontend: Call update API and refresh assignee display.
*   **RFP Workspace Page - Add/Post Comment:**
    *   [ ] Frontend: When "Post Comment" is clicked, capture comment text.
    *   [ ] Backend: Create API endpoint to add a new comment to a question (might need a new `rfp_comments` table or store as JSONB in `rfp_questions`).
    *   [ ] Frontend: Call API and refresh comment list for that question.

## Phase 4: Export Functionality

*   [ ] Backend: Create API endpoint that takes a `project_id`.
*   [ ] Backend Logic: Fetch project details and all its finalized questions/answers from Supabase.
*   [ ] Backend Logic: Generate an Excel file (.xlsx) from this data.
*   [ ] Frontend: "Export Responses" button calls this API and triggers file download.

## Future Enhancements (Post-MVP)
*   [ ] Implement full user authentication (Supabase Auth).
*   [ ] Implement roles and permissions.
*   [ ] Direct file upload into the web app (server-side parsing to replace PA/Office Script).
*   [ ] Advanced Analytics page.
*   [ ] Real-time features (e.g., live comment updates, collaborator cursors).