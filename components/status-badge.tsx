import { Badge } from "@/components/ui/badge";
import { Status } from "@/lib/api";

const map = { PENDING: "warning", APPROVED: "success", REJECTED: "destructive" } as const;
export const StatusBadge = ({ status }: { status: Status }) => (
  <Badge variant={map[status]}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>
);
