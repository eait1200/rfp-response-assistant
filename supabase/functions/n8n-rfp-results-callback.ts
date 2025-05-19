import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Environment variables for service role key and project URL
const SUPABASE_URL = Deno.env.get("MY_SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    console.log("Received payload:", JSON.stringify(payload, null, 2));

    const { original_filename, n8n_job_id, questions } = payload;
    if (!original_filename || !Array.isArray(questions)) {
      return new Response(JSON.stringify({ error: "Invalid payload structure" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert into rfp_projects
    const { data: project, error: projectError } = await supabase
      .from("rfp_projects")
      .insert({
        original_filename,
        status: "pending_review",
        uploaded_at: new Date().toISOString(),
        n8n_job_id: n8n_job_id ?? null,
      })
      .select("id")
      .single();

    if (projectError || !project) {
      console.error("Error inserting rfp_projects:", projectError);
      return new Response(JSON.stringify({ error: "Failed to insert project" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const project_id = project.id;

    // Prepare question rows
    const questionRows = questions.map((q: any) => ({
      project_id,
      original_sheet_name: q.original_sheet_name ?? null,
      original_row_number: q.original_row_number ?? null,
      section_header: q.section_header ?? null,
      identified_question_text: q.identified_question_text,
      ai_generated_answer: q.ai_generated_answer ?? null,
      confidence_text: q.confidence_text ?? null,
      confidence_score_calculated: q.confidence_score_calculated ?? null,
      review_required_text: q.review_required_text ?? null,
      sources_text: q.sources_text ?? null,
      status: "Draft",
    }));

    // Insert all questions in one batch
    if (questionRows.length > 0) {
      const { error: questionsError } = await supabase
        .from("rfp_questions")
        .insert(questionRows);
      if (questionsError) {
        console.error("Error inserting rfp_questions:", questionsError);
        return new Response(JSON.stringify({ error: "Failed to insert questions" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ success: true, project_id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}); 