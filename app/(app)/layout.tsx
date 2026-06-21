import { AppProvider } from "@/lib/contexts/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { AchievementCelebrator } from "@/components/achievements/AchievementCelebrator";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
      <AchievementCelebrator />
    </AppProvider>
  );
}
