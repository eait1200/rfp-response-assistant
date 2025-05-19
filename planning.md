# PLANNING.MD - RFP Response Assistant

## 1. Project Vision & Purpose

**Vision:** To create an intelligent web application, the "RFP Response Assistant," that significantly streamlines the process of responding to Requests for Proposals (RFPs).

**Purpose:**
*   Allow users to upload RFP Excel files.
*   Automatically extract questions and relevant context (sections, original row numbers, sheet names) from these files.
*   Leverage an AI agent (integrated with a Pinecone vector knowledge base of past Q&A) to generate high-quality, draft responses to these questions.
*   Provide a user-friendly web interface for users to review, edit, approve, comment on, and assign these AI-generated responses.
*   Enable users to export the finalized questions and answers into a structured Excel format.
*   Maintain a consistent and professional user experience aligned with Everstream Analytics branding.

## 2. Target Users

*   Sales executives, proposal managers, subject matter experts, and any team members involved in creating RFP responses at Everstream Analytics.

## 3. Core Features & Functionality

### 3.1. RFP Ingestion & Processing
    *   **File Upload:** User initiates RFP processing by uploading an Excel file (.xlsx, .xls, .csv) via a designated SharePoint/OneDrive link.
    *   **Automated Extraction:** A Power Automate flow triggers an Office Script to parse the uploaded Excel file, extracting data from all relevant sheets and columns.
    *   **Data Transfer to n8n:** The Office Script sends the extracted raw row data (including sheet name, row number, and cell content for typically columns A-E) to an n8n webhook.
    *   **n8n Workflow:**
        *   Receives raw row data.
        *   Identifies explicit and implicit questions from the row data using an AI model (e.g., Gemini).
        *   For each identified question:
            *   Queries a Pinecone vector database (containing historical Q&A) to find relevant context.
            *   Uses an AI Agent (e.g., Gemini) to synthesize a draft answer, confidence score, and source references.
        *   Aggregates all processed questions and answers for the RFP.
        *   Sends the complete set of results (original filename, project identifiers, and an array of question-answer objects) to a callback API endpoint in the RFP Response Assistant web application.

### 3.2. Web Application (RFP Response Assistant) - User Interface & Experience

    *   **Main Pages/Views:**
        *   **`/upload` (Upload RFP Page):** Interface to initiate the upload process by linking to the SharePoint/OneDrive upload location. Shows status of current uploads.
        *   **`/dashboard` (RFP Dashboard Page):** Displays a card-based grid view of all RFP projects. Each card shows RFP Title, Overall Status (e.g., "Processing," "Pending Review," "Completed"), Key Dates, Compact Progress Indicator, Quick Stats (e.g., "X Questions," "Y Issues"), and placeholder Key Assignee(s) for the project. Each card is clickable and navigates to the RFP Workspace.
        *   **`/rfps/[rfpId]` (RFP Workspace Page):** Dedicated page for working on a single RFP.
            *   **Persistent Project Context Header:**
                *   *Left Column (RFP Details):* Client, Due Date, RFP ID, Value, Description, Tags, Project Lead.
                *   *Right Column (Project Status):* Cards for "Total Questions," "Draft Responses" (with count/total & progress bar), "In Review Responses" (with count/total & progress bar), "Approved Responses" (with count/total & progress bar).
            *   **Tabs below header:** "Questions & Responses" (default), "Collaborators."
            *   **"Questions & Responses" Tab Content:**
                *   Search and filter controls for questions.
                *   List of individual question items, each showing:
                    *   Section/Context & Question Text.
                    *   Response Area (initially AI-generated, becomes editable textarea on clicking "Edit" button, with "Save"/"Cancel" actions).
                    *   Circular Trust Score Indicator (color-coded: Green for 80-100, Orange/Yellow for 50-79, Red for 0-49; fill percentage based on score; numeric score visible; info icon).
                    *   AI Source Information (expandable section).
                    *   Assignee(s) Display (placeholder initials/avatars on the far right).
                    *   Interactive Assignee Element (placeholder dropdown/popover appears on click to simulate user selection).
                    *   Status Tag (e.g., "Draft," "In Review," "Approved").
                    *   Action Buttons: "Edit," "Comment," "More Actions" (e.g., for changing status).
                    *   Expandable Comments Section (toggled by "Comment" button): shows existing placeholder comments (user, timestamp, text) and an input area to "Add a new comment" with a "Post Comment" button.
            *   **"Collaborators" Tab Content:** UI to view team members associated with the RFP and an "Add Member" functionality.
    *   **User Authentication (Future):** Not in MVP, but planned.
    *   **Export Functionality:** Users can export the finalized Q&A for an RFP into a new Excel file.

### 3.3. Backend & Data Storage
    *   **Backend Logic:** Implemented via Next.js API Routes and/or Supabase Edge Functions.
    *   **Database:** Supabase (PostgreSQL).
        *   `rfp_projects` table: Stores overall RFP project information.
        *   `rfp_questions` table: Stores individual questions, AI answers, user edits, statuses, assignees, comments, etc., linked to an `rfp_project`.
    *   **API Endpoint for n8n:** A dedicated endpoint for n8n to post processed RFP results, which are then saved to Supabase.

## 4. Technology Stack

*   **Frontend:** Next.js (React)
*   **Styling:** Tailwind CSS, with a design philosophy aligned with ShadCN/ui components.
*   **Backend (Web App):** Next.js API Routes and/or Supabase Edge Functions (TypeScript/JavaScript).
*   **Database:** Supabase (PostgreSQL).
*   **Initial Data Extraction:** Microsoft Office Script (run via Power Automate).
*   **Workflow Orchestration & AI Processing:** n8n.
*   **Vector Database (for AI knowledge):** Pinecone.
*   **AI Models:** Gemini (or similar, via n8n integration).
*   **Development Environment (Local):** Cursor IDE.

## 5. Design & Branding

*   Adhere to **Everstream Analytics branding guidelines**:
    *   **Logo:** Everstream Analytics logo.
    *   **Colors:** Primary Blue (`#0076a9`), Accent Orange (`#ea931a`), Secondary Gray (`#838792`), White.
    *   **Typography:** Raleway (headings), Work Sans (body).
*   **Overall Aesthetic:** Modern, clean, professional, intuitive, "Brand Bold," with liberal use of white space.

## 6. Key Non-Functional Requirements

*   **Responsiveness:** Web application must be responsive across common screen sizes.
*   **Usability:** Intuitive and efficient user workflows.
*   **Security (Future Focus):** Secure handling of data and environment variables (especially Supabase keys).

## 7. Assumptions & Constraints

*   Bolt.new was used for initial UI scaffolding but had limitations with Supabase integration for Next.js and some dynamic routing configurations. Project now primarily developed in Cursor.
*   Initial file upload relies on SharePoint/OneDrive link and Power Automate/Office Script.
*   Focus is on core functionality for MVP; advanced analytics, full user roles/permissions, and complex collaboration features are for later phases.

## 8. Key Future Enhancements (Post-MVP)

*   Full user authentication and roles (Admin, Editor, User).
*   Direct file upload within the web app (server-side parsing).
*   Advanced analytics dashboard.
*   Real-time collaboration features (e.g., live comment updates).
*   Direct "write-back" to a *copy* of the original Excel or a structured Word document.
*   Integration with other internal systems.