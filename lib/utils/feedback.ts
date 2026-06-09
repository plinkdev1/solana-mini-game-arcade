import { supabase } from "@/lib/supabase/client"

/**
 * Submit feedback to Sewer Arena
 * Anonymous feedback encouraged - wallet is optional and can be shortened/hashed for privacy
 * No PII stored - only message, optional rating, and optional contact method
 */
export async function submitFeedback({
  message,
  rating,
  wallet,
}: {
  message: string
  rating?: number
  wallet?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate required fields
    if (!message || message.trim().length === 0) {
      return { success: false, error: "Message is required" }
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return { success: false, error: "Rating must be between 1 and 5" }
    }

    // Insert feedback into database
    const { error } = await supabase.from("feedback_entries").insert([
      {
        message: message.trim(),
        rating: rating || null,
        user_wallet: wallet || null, // Anonymous if not provided
      },
    ])

    if (error) {
      console.error("[v0] Feedback submission error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("[v0] Feedback submission exception:", err)
    return { success: false, error: "Failed to submit feedback" }
  }
}

/**
 * Get admin feedback (admin-only)
 * Used for admin dashboard to view all feedback
 */
export async function getAdminFeedback() {
  try {
    const { data, error } = await supabase
      .from("feedback_entries")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Get feedback error:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error("[v0] Get feedback exception:", err)
    return { data: null, error: err }
  }
}

/**
 * Mark feedback as replied (admin-only)
 */
export async function markFeedbackReplied(feedbackId: string) {
  try {
    const { error } = await supabase.from("feedback_entries").update({ replied: true }).eq("id", feedbackId)

    if (error) {
      console.error("[v0] Mark replied error:", error)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error("[v0] Mark replied exception:", err)
    return { success: false, error: err }
  }
}
