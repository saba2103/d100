import { SupabaseClient } from "@supabase/supabase-js";

export interface ProfileQueryTarget {
  userId: string;
  profileTag: "S" | "A";
  isConnected: boolean;
  partnerEmail: string | null;
  partnerName: string | null;
  partnerAvatarUrl: string | null;
}

/**
 * Resolves the query target (user_id and profile_tag) based on the active profile switcher setting
 * and partner connection status.
 */
export async function getProfileQueryTarget(
  supabase: SupabaseClient,
  currentUserId: string
): Promise<ProfileQueryTarget> {
  // 1. Fetch user settings to get active profile tag
  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_profile")
    .eq("user_id", currentUserId)
    .single();

  const activeProfile = settings?.active_profile || "S";

  // 2. Fetch logged in user's profile info
  const { data: currentUser } = await supabase
    .from("profiles")
    .select("email, partner_email")
    .eq("id", currentUserId)
    .single();

  if (!currentUser) {
    return {
      userId: currentUserId,
      profileTag: "S",
      isConnected: false,
      partnerEmail: null,
      partnerName: null,
      partnerAvatarUrl: null,
    };
  }

  // 3. If partner email is set, check if connection is active (two-way link)
  if (currentUser.partner_email) {
    const cleanPartnerEmail = currentUser.partner_email.trim().toLowerCase();

    // Query partner's profile
    const { data: partnerProfile } = await supabase
      .from("profiles")
      .select("id, email, partner_email, full_name, display_name")
      .eq("email", cleanPartnerEmail)
      .maybeSingle();

    if (partnerProfile) {
      const cleanSelfEmail = currentUser.email?.trim().toLowerCase();
      const cleanPartnerLink = partnerProfile.partner_email?.trim().toLowerCase();

      // Check if partner linked back to this user
      if (cleanSelfEmail && cleanPartnerLink === cleanSelfEmail) {
        // Fetch partner's tag "S" member profile for name and avatar
        const { data: partnerMember } = await supabase
          .from("member_profiles")
          .select("full_name, avatar_url")
          .eq("user_id", partnerProfile.id)
          .eq("profile_tag", "S")
          .maybeSingle();

        const name = partnerMember?.full_name || partnerProfile.full_name || partnerProfile.display_name || "Partner";

        // Connection established!
        return {
          // If active profile tag is "A" (partner), we query partner's user ID and their primary tag "S"
          userId: activeProfile === "A" ? partnerProfile.id : currentUserId,
          profileTag: activeProfile === "A" ? "S" : "S",
          isConnected: true,
          partnerEmail: partnerProfile.email,
          partnerName: name,
          partnerAvatarUrl: partnerMember?.avatar_url || null,
        };
      }
    }
  }

  // Fallback if not connected or active profile is "S"
  return {
    userId: currentUserId,
    profileTag: activeProfile as "S" | "A",
    isConnected: false,
    partnerEmail: currentUser.partner_email || null,
    partnerName: null,
    partnerAvatarUrl: null,
  };
}
