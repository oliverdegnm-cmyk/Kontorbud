export function statusInfo(task) {
  if (task.status === "completed") return { tone: "completed", label: "Udført" };
  if (task.status === "cancelled") return { tone: "cancelled", label: "Annulleret" };
  if (task.status === "matched") return { tone: "matched", label: "Tildelt" };
  if (task.bids.length === 0) return { tone: "open", label: "Ledig" };
  return { tone: "bids", label: `${task.bids.length} bud` };
}
