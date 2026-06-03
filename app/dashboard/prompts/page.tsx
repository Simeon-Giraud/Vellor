import { redirect } from "next/navigation";

export default function PromptsPageRedirect() {
  redirect("/dashboard/projects");
}
