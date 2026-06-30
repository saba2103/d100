"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppUser } from "@/lib/contexts/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  User,
  Phone,
  Calendar,
  GenderNeuter,
  Ruler,
  Scales,
  SignOut,
  Camera,
  CheckCircle,
  Warning,
  ArrowsLeftRight,
  ShieldWarning,
  CircleNotch,
  GearSix,
  Envelope,
  Lock,
} from "@phosphor-icons/react";

// Local helper to format dates in local timezone as YYYY-MM-DD
function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, activeProfile, setActiveProfile, refresh } = useAppUser();

  // Core loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form Field States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [height, setHeight] = useState("");
  const [startingWeight, setStartingWeight] = useState("");
  const [startDate, setStartDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Goal Form Field States
  const [weightGoal, setWeightGoal] = useState("");
  const [bodyFatGoal, setBodyFatGoal] = useState("");

  // Partner connection states
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerConnectionStatus, setPartnerConnectionStatus] = useState<"none" | "awaiting" | "connected">("none");

  // Keep original values to check dirty state
  const [originalValues, setOriginalValues] = useState({
    fullName: "",
    phone: "",
    dob: "",
    gender: "" as "male" | "female" | "other" | "",
    height: "",
    startingWeight: "",
    startDate: "",
    weightGoal: "",
    bodyFatGoal: "",
    partnerEmail: "",
  });

  // Warnings & Modals
  const [showDateWarning, setShowDateWarning] = useState(false);
  const [pendingStartDate, setPendingStartDate] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phase Progress Statistics States
  const [phaseStats, setPhaseStats] = useState({
    dayNumber: 1,
    phaseNumber: 1,
    daysRemaining: 35,
    workoutsCompleted: 0,
    supplementCompliance: 0,
  });

  // Load profile details from member_profiles database table
  const loadProfileData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Query settings to get active profile tag
      const { data: settingsData } = await supabase
        .from("user_settings")
        .select("active_profile")
        .eq("user_id", user.id)
        .single();

      const activeTag = (settingsData?.active_profile || activeProfile || "S") as "S" | "A";

      // 1. Fetch main profiles row for partner email & self email
      const { data: profileRow } = await (supabase
        .from("profiles")
        .select("partner_email, email") as any)
        .eq("id", user.id)
        .single();

      let pEmail = (profileRow as any)?.partner_email || "";
      let pStatus: "none" | "awaiting" | "connected" = "none";

      if (pEmail) {
        const { data: partnerRow } = await (supabase
          .from("profiles")
          .select("email, partner_email") as any)
          .eq("email", pEmail.trim().toLowerCase())
          .maybeSingle();

        if (partnerRow) {
          const selfEmailClean = (profileRow as any)?.email?.trim().toLowerCase();
          const partnerLinkClean = (partnerRow as any).partner_email?.trim().toLowerCase();
          if (selfEmailClean && partnerLinkClean === selfEmailClean) {
            pStatus = "connected";
          } else {
            pStatus = "awaiting";
          }
        } else {
          pStatus = "awaiting";
        }
      }

      setPartnerEmail(pEmail);
      setPartnerConnectionStatus(pStatus);

      // 2. Fetch member_profiles row
      let { data: memberProfile, error } = await supabase
        .from("member_profiles")
        .select("*")
        .eq("user_id", user.id)
        .eq("profile_tag", activeTag)
        .single();

      // If it doesn't exist yet, insert a default row
      if (error && error.code === "PGRST116") {
        const defaultName = activeTag === "S" ? "Saba" : "Ancy";
        const { data: newRow } = await supabase
          .from("member_profiles")
          .insert({
            user_id: user.id,
            profile_tag: activeTag,
            full_name: defaultName,
          })
          .select()
          .single();
        memberProfile = newRow;
      }

      if (memberProfile) {
        const initialForm: {
          fullName: string;
          phone: string;
          dob: string;
          gender: "male" | "female" | "other" | "";
          height: string;
          startingWeight: string;
          startDate: string;
          weightGoal: string;
          bodyFatGoal: string;
          partnerEmail: string;
        } = {
          fullName: memberProfile.full_name || "",
          phone: memberProfile.phone || "",
          dob: memberProfile.date_of_birth || "",
          gender: (memberProfile.gender as "male" | "female" | "other" | null) || "",
          height: memberProfile.height_cm ? String(memberProfile.height_cm) : "",
          startingWeight: memberProfile.starting_weight_kg ? String(memberProfile.starting_weight_kg) : "",
          startDate: memberProfile.program_start_date || "",
          weightGoal: memberProfile.current_weight_goal_kg ? String(memberProfile.current_weight_goal_kg) : "",
          bodyFatGoal: memberProfile.target_body_fat_pct ? String(memberProfile.target_body_fat_pct) : "",
          partnerEmail: pEmail,
        };

        setFullName(initialForm.fullName);
        setPhone(initialForm.phone);
        setDob(initialForm.dob);
        setGender(initialForm.gender);
        setHeight(initialForm.height);
        setStartingWeight(initialForm.startingWeight);
        setStartDate(initialForm.startDate);
        setAvatarUrl(memberProfile.avatar_url || "");
        setWeightGoal(initialForm.weightGoal);
        setBodyFatGoal(initialForm.bodyFatGoal);

        setOriginalValues(initialForm);

        // Calculate progress & compliance statistics
        await calculateStatistics(activeTag, initialForm.startDate);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = async (profileTag: string, progStartDate: string) => {
    if (!user) return;
    try {
      // 1. Calculate Day Number and Phase
      let dayNumber = 1;
      let phaseNumber = 1;
      let daysRemaining = 35;

      if (progStartDate) {
        const start = new Date(progStartDate);
        start.setHours(0, 0, 0, 0);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const diffTime = now.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        dayNumber = Math.max(1, Math.min(100, diffDays));
      }

      if (dayNumber > 91) {
        phaseNumber = 5;
        daysRemaining = 100 - dayNumber;
      } else if (dayNumber > 63) {
        phaseNumber = 4;
        daysRemaining = 91 - dayNumber;
      } else if (dayNumber > 35) {
        phaseNumber = 3;
        daysRemaining = 63 - dayNumber;
      } else if (dayNumber > 7) {
        phaseNumber = 2;
        daysRemaining = 35 - dayNumber;
      } else {
        phaseNumber = 1;
        daysRemaining = 7 - dayNumber;
      }

      // 2. Fetch Workouts completed in current phase
      const { count: workoutCount } = await supabase
        .from("workout_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("phase", phaseNumber);

      // 3. Fetch Supplement compliance this phase
      let compliance = 0;
      if (progStartDate) {
        const start = new Date(progStartDate);
        const phaseStart = new Date(start);
        const phaseEnd = new Date(start);

        if (phaseNumber === 1) {
          phaseEnd.setDate(phaseEnd.getDate() + 34);
        } else if (phaseNumber === 2) {
          phaseStart.setDate(phaseStart.getDate() + 35);
          phaseEnd.setDate(phaseEnd.getDate() + 69);
        } else {
          phaseStart.setDate(phaseStart.getDate() + 70);
          phaseEnd.setDate(phaseEnd.getDate() + 99);
        }

        const { data: suppLogs } = await supabase
          .from("supplement_logs")
          .select("supplements")
          .eq("user_id", user.id)
          .gte("logged_at", formatDateLocal(phaseStart))
          .lte("logged_at", formatDateLocal(phaseEnd));

        if (suppLogs && suppLogs.length > 0) {
          let totalSum = 0;
          suppLogs.forEach((log) => {
            const list = Array.isArray(log.supplements) ? log.supplements : [];
            const total = list.length;
            const taken = list.filter((i: any) => i.taken).length;
            totalSum += total > 0 ? (taken / total) * 100 : 0;
          });
          compliance = Math.round(totalSum / suppLogs.length);
        }
      }

      setPhaseStats({
        dayNumber,
        phaseNumber,
        daysRemaining,
        workoutsCompleted: workoutCount || 0,
        supplementCompliance: compliance,
      });
    } catch (err) {
      console.error("Error calculating phase stats:", err);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [user, activeProfile]);

  // Check if form is dirty
  const isDirty = useMemo(() => {
    return (
      fullName !== originalValues.fullName ||
      phone !== originalValues.phone ||
      dob !== originalValues.dob ||
      gender !== originalValues.gender ||
      height !== originalValues.height ||
      startingWeight !== originalValues.startingWeight ||
      startDate !== originalValues.startDate ||
      weightGoal !== originalValues.weightGoal ||
      bodyFatGoal !== originalValues.bodyFatGoal ||
      partnerEmail !== originalValues.partnerEmail
    );
  }, [fullName, phone, dob, gender, height, startingWeight, startDate, weightGoal, bodyFatGoal, partnerEmail, originalValues]);

  // Actions: Save Profile
  const handleSaveForm = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const parsedHeight = height ? Number(height) : null;
      const parsedWeight = startingWeight ? Number(startingWeight) : null;
      const parsedWeightGoal = weightGoal ? Number(weightGoal) : null;
      const parsedFatGoal = bodyFatGoal ? Number(bodyFatGoal) : null;

      // 1. Save to member_profiles
      const { error: memberError } = await supabase
        .from("member_profiles")
        .upsert({
          user_id: user.id,
          profile_tag: activeProfile,
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          height_cm: parsedHeight,
          starting_weight_kg: parsedWeight,
          date_of_birth: dob || null,
          gender: gender || null,
          program_start_date: startDate || null,
          current_weight_goal_kg: parsedWeightGoal,
          target_body_fat_pct: parsedFatGoal,
          updated_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      // 2. Sync to active main profiles table
      const { error: profileError } = await (supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          height_cm: parsedHeight,
          starting_weight_kg: parsedWeight,
          date_of_birth: dob || null,
          gender: gender || null,
          program_start_date: startDate || null,
          current_weight_goal_kg: parsedWeightGoal,
          target_body_fat_pct: parsedFatGoal,
          partner_email: partnerEmail.trim() || null,
          updated_at: new Date().toISOString(),
        } as any) as any)
        .eq("id", user.id);

      if (profileError) throw profileError;

      alert("Profile updated successfully!");
      setOriginalValues({
        fullName,
        phone,
        dob,
        gender,
        height,
        startingWeight,
        startDate,
        weightGoal,
        bodyFatGoal,
        partnerEmail,
      });

      await refresh();
      await loadProfileData();
    } catch (err: any) {
      console.error(err);
      alert("Failed to save changes: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Actions: Switch S <-> A active profile
  const handleSwitchProfile = async () => {
    if (!user) return;
    setSwitching(true);
    try {
      const nextProfile = activeProfile === "S" ? "A" : "S";

      // Discard unsaved changes or prompt
      if (isDirty) {
        const confirmSwitch = confirm("You have unsaved changes. Are you sure you want to switch profiles and discard edits?");
        if (!confirmSwitch) {
          setSwitching(false);
          return;
        }
      }

      // 1. Fetch details of other profile from member_profiles
      let { data: targetProfile, error } = await supabase
        .from("member_profiles")
        .select("*")
        .eq("user_id", user.id)
        .eq("profile_tag", nextProfile)
        .single();

      // If it doesn't exist yet, insert a default row
      if (error && error.code === "PGRST116") {
        const defaultName = nextProfile === "S" ? "Saba" : "Ancy";
        const { data: newRow } = await supabase
          .from("member_profiles")
          .insert({
            user_id: user.id,
            profile_tag: nextProfile,
            full_name: defaultName,
          })
          .select()
          .single();
        targetProfile = newRow;
      }

      if (targetProfile) {
        // 2. Synchronize main profiles row
        const { error: syncError } = await (supabase
          .from("profiles")
          .update({
            display_name: nextProfile,
            full_name: targetProfile.full_name || "",
            phone: targetProfile.phone || null,
            height_cm: targetProfile.height_cm || null,
            starting_weight_kg: targetProfile.starting_weight_kg || null,
            date_of_birth: targetProfile.date_of_birth || null,
            gender: targetProfile.gender || null,
            program_start_date: targetProfile.program_start_date || null,
            avatar_url: targetProfile.avatar_url || null,
            current_weight_goal_kg: targetProfile.current_weight_goal_kg || null,
            target_body_fat_pct: targetProfile.target_body_fat_pct || null,
            updated_at: new Date().toISOString(),
          } as any) as any)
          .eq("id", user.id);

        if (syncError) throw syncError;
      }

      // 3. Set global active settings profile
      await setActiveProfile(nextProfile);
      await refresh();
    } catch (err: any) {
      console.error(err);
      alert("Failed to switch profile: " + (err.message || err));
    } finally {
      setSwitching(false);
    }
  };

  // Actions: Avatar Photo Uploading
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      alert("Invalid file type. Please upload an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum avatar size is 5MB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const filePath = `${user.id}/avatar.jpg`;

      // Upload file to avatars storage bucket (upsert to overwrite existing)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "0",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Cache-busting URL parameter
      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

      // Update both member_profiles & main profiles table
      await supabase
        .from("member_profiles")
        .update({ avatar_url: cacheBustedUrl })
        .eq("user_id", user.id)
        .eq("profile_tag", activeProfile);

      await supabase
        .from("profiles")
        .update({ avatar_url: cacheBustedUrl })
        .eq("id", user.id);

      setAvatarUrl(cacheBustedUrl);
      await refresh();
      alert("Avatar uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to upload avatar: " + (err.message || err));
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Actions: Program start date warnings
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate !== originalValues.startDate && originalValues.startDate !== "") {
      setPendingStartDate(selectedDate);
      setShowDateWarning(true);
    } else {
      setStartDate(selectedDate);
    }
  };

  const handleConfirmDateChange = () => {
    setStartDate(pendingStartDate);
    setShowDateWarning(false);
  };

  const handleCancelDateChange = () => {
    setPendingStartDate("");
    setShowDateWarning(false);
    // Reset datepicker value
    const picker = document.getElementById("program-start-date") as HTMLInputElement;
    if (picker) {
      picker.value = originalValues.startDate;
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="pb-24 pt-8 px-4 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <CircleNotch size={32} className="animate-spin text-[var(--accent-start)]" />
        <p className="font-body text-xs text-[var(--text-muted)] uppercase tracking-widest">
          Loading active profile details...
        </p>
      </div>
    );
  }

  // Initials fallback calculations
  const initials = activeProfile === "S" ? "S" : "A";
  const activeProfileName = activeProfile === "S" ? "SABA" : "ANCY";
  const otherProfileName = activeProfile === "S" ? "Ancy (A)" : "Saba (S)";

  return (
    <div className="pb-28 pt-4 px-4 max-w-6xl mx-auto space-y-8">
      {/* Header Info */}
      <div>
        <h1 className="font-display text-4xl text-[var(--text-primary)] font-black tracking-wide uppercase">
          Profile Settings
        </h1>
        <p className="font-body text-xs font-body-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">
          Manage your personal details, program timeline, and stats
        </p>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Header Card (Desktop: Spans 4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card variant="surface" className="p-6 flex flex-col items-center text-center space-y-4">
            {/* Avatar Circle Container */}
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-center transition-all duration-200 group-hover:border-[var(--accent-start)] shadow-inner">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display text-5xl font-black text-[var(--text-secondary)]">
                    {initials}
                  </span>
                )}
              </div>

              {/* Upload Overlay */}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {uploadingAvatar ? (
                  <CircleNotch size={24} className="animate-spin text-white" />
                ) : (
                  <Camera size={24} className="text-white" />
                )}
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />

            {/* Display names & tag badge */}
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-black tracking-wider text-[var(--text-primary)] uppercase">
                {fullName || activeProfileName}
              </h2>
              <span className="inline-block px-3 py-1 bg-[var(--accent-start)]/10 border border-[var(--accent-start)]/20 text-[var(--accent-text)] rounded-full text-[10px] font-display uppercase tracking-widest font-black">
                DAY {phaseStats.dayNumber}
              </span>
            </div>
          </Card>

          {/* Account Actions Card */}
          <Card variant="surface" className="p-6 space-y-4">
            <h3 className="font-display text-sm tracking-wider text-[var(--text-primary)] uppercase border-b border-[var(--border)] pb-2">
              Account Preferences
            </h3>

            <div className="flex flex-col gap-3">
              {/* Partner Connection Status */}
              <div className="space-y-2 mb-2">
                <h4 className="font-body-bold text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Partner Sync Status</h4>
                {partnerConnectionStatus === "connected" && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[11px] font-body-bold">
                    <CheckCircle size={16} weight="bold" />
                    <span>CONNECTED TO {partnerEmail}</span>
                  </div>
                )}
                {partnerConnectionStatus === "awaiting" && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[11px] font-body-bold">
                    <Warning size={16} weight="bold" />
                    <span>AWAITING PARTNER LINK</span>
                  </div>
                )}
                {partnerConnectionStatus === "none" && (
                  <div className="px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] rounded-xl text-[11px] font-body">
                    <span>Enter partner email below to connect.</span>
                  </div>
                )}
              </div>

              <Button
                variant="secondary"
                disabled={switching || partnerConnectionStatus !== "connected"}
                onClick={handleSwitchProfile}
                className="w-full flex items-center justify-center gap-2 text-xs font-display font-black py-2.5 uppercase tracking-wider"
              >
                {switching ? (
                  <CircleNotch size={16} className="animate-spin" />
                ) : partnerConnectionStatus === "connected" ? (
                  <ArrowsLeftRight size={16} />
                ) : (
                  <Lock size={16} />
                )}
                Switch to {otherProfileName}
              </Button>

              <Button
                variant="secondary"
                onClick={() => router.push("/settings")}
                className="w-full flex items-center justify-center gap-2 text-xs font-display font-black py-2.5 uppercase tracking-wider"
              >
                <GearSix size={16} />
                App Settings
              </Button>

              <Button
                variant="danger"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 text-xs font-display font-black py-2.5 uppercase tracking-wider bg-[var(--red)]/10 hover:bg-[var(--red)]/20 border border-[var(--red)]/20 text-[var(--red)]"
              >
                <SignOut size={16} />
                Sign Out Account
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Side: Form Cards (Desktop: Spans 8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Personal Info Editable Form */}
          <Card variant="surface" className="p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <User size={20} className="text-[var(--accent-text)]" />
              <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)] uppercase">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                leftIcon={<User size={18} />}
              />

              {/* Email (Read-only) */}
              <Input
                label="Email Address"
                value={user?.email || ""}
                disabled
                placeholder="Email address"
                hint="Provided by account authentication (read-only)"
              />

              {/* Phone */}
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                leftIcon={<Phone size={18} />}
              />

              {/* Gender */}
              <Select
                label="Gender"
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>

              {/* Date of Birth */}
              <DatePicker
                label="Date of Birth"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />

              {/* Height */}
              <Input
                label="Height (cm)"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Height in cm"
                hint="Your registered height (does not change)"
                leftIcon={<Ruler size={18} />}
              />

              {/* Starting Weight (Read-only) */}
              <Input
                label="Starting Weight (kg)"
                type="number"
                value={startingWeight}
                onChange={(e) => setStartingWeight(e.target.value)}
                placeholder="Starting weight"
                hint="Setup measurement at program initiation"
                leftIcon={<Scales size={18} />}
              />

              {/* Program Start Date */}
              <DatePicker
                id="program-start-date"
                label="Program Start Date"
                value={startDate}
                onChange={handleDateChange}
                hint="Locked program start date (Day 1: 30 June 2026)"
                disabled
              />

              {/* Partner Email Address */}
              <Input
                label="Partner Email Address"
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="partner@example.com"
                hint={
                  partnerConnectionStatus === "connected"
                    ? "Partner connected — you can view each other's stats."
                    : partnerConnectionStatus === "awaiting"
                    ? "Awaiting partner to add your email on their end."
                    : "Enter partner's registered email to link accounts and sync stats."
                }
                leftIcon={<Envelope size={18} />}
                rightIcon={
                  partnerConnectionStatus === "connected" ? (
                    <CheckCircle size={18} weight="fill" className="text-emerald-400" />
                  ) : partnerConnectionStatus === "awaiting" ? (
                    <Warning size={18} weight="fill" className="text-amber-400 animate-pulse" />
                  ) : null
                }
              />
            </div>

            {/* Dirty Save Button */}
            {isDirty && (
              <div className="pt-4 border-t border-[var(--border)]/40 flex justify-end">
                <Button
                  variant="primary"
                  loading={saving}
                  disabled={saving}
                  onClick={handleSaveForm}
                  className="px-6 text-xs font-display font-black uppercase tracking-widest h-11"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </Card>

          {/* Body Goals Card */}
          <Card variant="surface" className="p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Scales size={20} className="text-[var(--accent-text)]" />
              <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)] uppercase">
                Body Goals (Aspirational)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Goal Weight */}
              <Input
                label="Current Weight Goal (kg)"
                type="number"
                value={weightGoal}
                onChange={(e) => setWeightGoal(e.target.value)}
                placeholder="Target weight"
                leftIcon={<Scales size={18} />}
                hint="Personal target (no impact on logic)"
              />

              {/* Target Body Fat % */}
              <Input
                label="Target Body Fat %"
                type="number"
                step="0.1"
                value={bodyFatGoal}
                onChange={(e) => setBodyFatGoal(e.target.value)}
                placeholder="Target body fat percent"
                leftIcon={<GenderNeuter size={18} />}
                hint="Personal target (no impact on logic)"
              />
            </div>

            {/* Dirty Save Button */}
            {isDirty && (
              <div className="pt-4 border-t border-[var(--border)]/40 flex justify-end">
                <Button
                  variant="primary"
                  loading={saving}
                  disabled={saving}
                  onClick={handleSaveForm}
                  className="px-6 text-xs font-display font-black uppercase tracking-widest h-11"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </Card>

          {/* Program Progress Card */}
          <Card variant="surface" className="p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <CheckCircle size={20} className="text-[var(--accent-text)]" />
              <h2 className="font-display text-lg tracking-wider text-[var(--text-primary)] uppercase">
                Program Progress Dashboard
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="font-body-bold text-sm text-[var(--text-secondary)] uppercase">
                  Timeline Progress
                </span>
                <span className="font-display text-2xl font-black text-[var(--text-primary)]">
                  DAY {phaseStats.dayNumber} <span className="text-xs text-[var(--text-muted)]">OF 100</span>
                </span>
              </div>

              {/* Progress Bar container */}
              <div className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] h-4.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] rounded-full transition-all duration-300"
                  style={{ width: `${phaseStats.dayNumber}%` }}
                />
              </div>

              {/* Grid Statistics details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-3.5 rounded-xl space-y-1">
                  <span className="block text-[9px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Active Phase
                  </span>
                  <span className="block font-display text-base font-black text-[var(--text-primary)]">
                    PHASE {phaseStats.phaseNumber}
                  </span>
                </div>

                <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-3.5 rounded-xl space-y-1">
                  <span className="block text-[9px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Days Remaining
                  </span>
                  <span className="block font-display text-base font-black text-[var(--text-primary)]">
                    {phaseStats.daysRemaining} DAYS
                  </span>
                </div>

                <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-3.5 rounded-xl space-y-1">
                  <span className="block text-[9px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Workouts Logged
                  </span>
                  <span className="block font-display text-base font-black text-[var(--text-primary)]">
                    {phaseStats.workoutsCompleted} LOGS
                  </span>
                </div>

                <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-3.5 rounded-xl space-y-1">
                  <span className="block text-[9px] font-body-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Supp. Compliance
                  </span>
                  <span className="block font-display text-base font-black text-[var(--text-primary)]">
                    {phaseStats.supplementCompliance}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Date Warning Overlay Modal */}
      {showDateWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card
            variant="elevated"
            className="w-full max-w-md p-6 border-[var(--border)] shadow-2xl flex flex-col space-y-5"
          >
            <div className="flex items-center gap-3 text-[var(--red)] border-b border-[var(--border)] pb-3">
              <ShieldWarning size={28} weight="fill" />
              <h3 className="font-display text-lg font-black tracking-wider uppercase">
                Caution: Edit Start Date?
              </h3>
            </div>

            <p className="font-body text-xs text-[var(--text-secondary)] leading-relaxed">
              Changing your <strong>Program Start Date</strong> shifts the entire 100-day schedule. This recalculates your program day and will filter your historic logs differently in charts and trackers.
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="secondary"
                onClick={handleCancelDateChange}
                className="px-4 py-2 text-[10px] font-display uppercase tracking-wider font-black"
              >
                No, Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDateChange}
                className="px-4 py-2 text-[10px] font-display uppercase tracking-wider font-black bg-[var(--accent-start)] text-white"
              >
                Yes, Change Date
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
