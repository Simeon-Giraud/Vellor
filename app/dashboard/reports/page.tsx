import { redirect } from "next/navigation";

export default function ReportsPageRedirect() {
  redirect("/dashboard/projects");
}
