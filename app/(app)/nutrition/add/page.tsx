import { redirect } from "next/navigation";

// /nutrition/add redirects back to the home page where
// the add-food bottom sheet is triggered via the FAB.
export default function AddFoodPage() {
  redirect("/nutrition");
}
