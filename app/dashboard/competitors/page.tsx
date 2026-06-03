import { redirect } from "next/navigation";

export default function CompetitorsPageRedirect() {
  redirect("/dashboard/projects");
}
