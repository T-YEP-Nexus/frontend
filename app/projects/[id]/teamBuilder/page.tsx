import { getProjectById } from "@/lib/projectsData";
import { notFound } from "next/navigation";
import TeamBuilderClient from "./TeamBuilderClient";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const project = getProjectById(Number(resolvedParams.id));

  if (!project) return notFound();

  return <TeamBuilderClient project={project} />;
}
