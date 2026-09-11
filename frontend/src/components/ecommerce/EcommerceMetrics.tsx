import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import type { DashboardStats } from "../../services/dashboard.service";

type Props = {
  stats: DashboardStats;
  role: "ADMIN" | "EMPLOYEE" | "CLIENT";
  loading?: boolean;
};

export default function EcommerceMetrics({ stats, role, loading = false }: Props) {
  const totalCardOneTitle = role === "ADMIN"
    ? "Customers"
    : role === "EMPLOYEE"
      ? "Clients"
      : "My Orders";

  const totalCardOneValue = role === "ADMIN"
    ? stats.customers
    : role === "EMPLOYEE"
      ? stats.customers
      : stats.orders;

  const totalCardTwoTitle = role === "ADMIN"
    ? "Orders"
    : role === "EMPLOYEE"
      ? "Assigned Orders"
      : "My Projects";

  const totalCardTwoValue = role === "ADMIN"
    ? stats.orders
    : role === "EMPLOYEE"
      ? stats.orders
      : stats.projects;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? "Loading..." : totalCardOneTitle}
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "--" : totalCardOneValue}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {role === "CLIENT" ? "Live" : "Synced"}
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {totalCardTwoTitle}
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "--" : totalCardTwoValue}
            </h4>
          </div>

          <Badge color="error">
            <ArrowDownIcon />
            {role === "CLIENT" ? "My" : "Real"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
