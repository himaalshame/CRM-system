import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Modal } from "../../components/ui/modal";
import { useAuth } from "../../context/AuthContext";
import { getEmployees, type Employee } from "../../services/employee.service";
import {
  assignEmployeeToProject,
  getProjects,
  removeEmployeeFromProject,
  updateProjectStatus,
  type Project,
  type ProjectStatus,
} from "../../services/project.service";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const canManageProjectEmployees = (status: string) => {
  return status === "PLANNING" || status === "IN_PROGRESS";
};

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isEmployee = user?.role === "EMPLOYEE";
  const isClient = user?.role === "CLIENT";

  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigningProjectId, setAssigningProjectId] = useState<string | null>(null);
  const [updatingStatusProjectId, setUpdatingStatusProjectId] = useState<string | null>(null);
  const [detailsProject, setDetailsProject] = useState<Project | null>(null);
  const [teamProject, setTeamProject] = useState<Project | null>(null);
  const [teamSearch, setTeamSearch] = useState("");
  const [teamEmployeeId, setTeamEmployeeId] = useState("");
  const [teamRole, setTeamRole] = useState("");

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError("");
      setProjects(await getProjects());
    } catch (loadError) {
      console.error(loadError);
      setError(getErrorMessage(loadError, "Failed to load projects."));
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setEmployees(await getEmployees());
    } catch (loadError) {
      console.error(loadError);
      setError(getErrorMessage(loadError, "Failed to load employees."));
    }
  };

  const teamSearchOptions = useMemo(() => {
    if (!teamProject) return [];

    const q = teamSearch.trim().toLowerCase();
    return employees.filter((employee) => {
      if (q) {
        const fullName = `${employee.fname} ${employee.lname}`.toLowerCase();
        if (!fullName.includes(q) && !employee.jobTitle.toLowerCase().includes(q)) {
          return false;
        }
      }

      return !teamProject.projectEmployees.some((assignment) => assignment.employee.id === employee.id);
    });
  }, [employees, teamProject, teamSearch]);

  const handleAssignEmployee = async () => {
    if (!teamProject) return;

    const employeeId = teamEmployeeId;
    if (!employeeId) {
      setError("Choose an employee first.");
      return;
    }

    if (!canManageProjectEmployees(teamProject.status)) {
      setError("Employee management is unavailable for completed/on-hold projects.");
      return;
    }

    if (teamProject.projectEmployees.some((assignment) => assignment.employee.id === employeeId)) {
      setError("Employee is already assigned to this project.");
      return;
    }

    try {
      setAssigningProjectId(teamProject.id);
      setError("");

      await assignEmployeeToProject(teamProject.id, {
        employeeId,
        role: teamRole.trim() || undefined,
      });

      const refreshed = await getProjects();
      setProjects(refreshed);
      const updatedProject = refreshed.find((project) => project.id === teamProject.id) ?? null;
      setTeamProject(updatedProject);
      setTeamEmployeeId("");
      setTeamRole("");
      setTeamSearch("");
    } catch (assignError) {
      console.error(assignError);
      setError(getErrorMessage(assignError, "Failed to assign employee to project."));
    } finally {
      setAssigningProjectId(null);
    }
  };

  const handleRemoveEmployee = async (projectId: string, employeeId: string) => {
    const targetProject = projects.find((project) => project.id === projectId);
    if (!targetProject || !canManageProjectEmployees(targetProject.status)) {
      setError("Employee management is unavailable for completed/on-hold projects.");
      return;
    }

    const assignee = targetProject.projectEmployees.find((assignment) => assignment.employee.id === employeeId)?.employee;
    if (!assignee) return;

    if (!window.confirm(`Remove ${assignee.fname} ${assignee.lname} from this project?`)) {
      return;
    }

    try {
      setError("");
      await removeEmployeeFromProject(projectId, employeeId);
      const refreshed = await getProjects();
      setProjects(refreshed);
      const updatedProject = refreshed.find((project) => project.id === projectId) ?? null;
      setTeamProject(updatedProject);
      setDetailsProject(updatedProject);
    } catch (removeError) {
      console.error(removeError);
      setError(getErrorMessage(removeError, "Failed to remove employee from project."));
    }
  };

  const handleStatusChange = async (projectId: string, nextStatus: ProjectStatus) => {
    if (!isAdmin) {
      setError("Only admins can update project status.");
      return;
    }

    try {
      setUpdatingStatusProjectId(projectId);
      setError("");
      await updateProjectStatus(projectId, nextStatus);
      const refreshed = await getProjects();
      setProjects(refreshed);
      const sameProject = refreshed.find((project) => project.id === projectId) ?? null;
      setDetailsProject(sameProject);
      setTeamProject(sameProject);
    } catch (changeError) {
      console.error(changeError);
      setError(getErrorMessage(changeError, "Failed to update project status."));
    } finally {
      setUpdatingStatusProjectId(null);
    }
  };

  useEffect(() => {
    loadProjects();
    if (isAdmin) {
      loadEmployees();
    }
  }, []);

  return (
    <div>
      <PageMeta title="Projects | CRM" description="Manage CRM projects" />
      <PageBreadcrumb pageTitle={isAdmin ? "Projects" : isEmployee ? "My Projects" : isClient ? "My Projects" : "Projects"} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {isAdmin ? "Projects" : "My Projects"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {projects.length} project{projects.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {error && <div className="p-5 text-sm text-red-500">{error}</div>}

        {isLoading && <div className="p-5 text-sm text-gray-500">Loading projects...</div>}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Project</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Client</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Start</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">End</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-5 text-sm text-gray-500">
                      No projects found.
                    </td>
                  </tr>
                )}

                {projects.map((project) => {
                  return (
                    <tr key={project.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{project.name}</td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        {project.order.client.fname} {project.order.client.lname}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-brand-600">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">{project.status}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{formatDate(project.startDate)}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{formatDate(project.endDate)}</td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className="rounded-lg border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800" onClick={() => setDetailsProject(project)}>Details</button>
                          {isAdmin && (
                            <button type="button" className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600" onClick={() => {
                              setTeamProject(project);
                              setTeamEmployeeId("");
                              setTeamRole("");
                              setTeamSearch("");
                            }}>Manage Team</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={Boolean(detailsProject)} onClose={() => setDetailsProject(null)} className="max-w-2xl m-4">
        {detailsProject && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">Project</div>
                <h3 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{detailsProject.name}</h3>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">{detailsProject.status}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                <div className="text-xs font-semibold text-gray-500">Client</div>
                <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{detailsProject.order.client.fname} {detailsProject.order.client.lname}</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                <div className="text-xs font-semibold text-gray-500">Order</div>
                <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{detailsProject.orderId}</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                <div className="text-xs font-semibold text-gray-500">Start</div>
                <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{formatDate(detailsProject.startDate)}</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                <div className="text-xs font-semibold text-gray-500">End</div>
                <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{formatDate(detailsProject.endDate)}</div>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <select
                  value={detailsProject.status}
                  onChange={(event) => setDetailsProject({ ...detailsProject, status: event.target.value as ProjectStatus })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="PLANNING">PLANNING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="ON_HOLD">ON_HOLD</option>
                </select>
                <button
                  type="button"
                  disabled={updatingStatusProjectId === detailsProject.id}
                  onClick={() => handleStatusChange(detailsProject.id, detailsProject.status)}
                  className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {updatingStatusProjectId === detailsProject.id ? "Updating..." : "Update Status"}
                </button>
              </div>
            )}

            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Services</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {detailsProject.order.orderItems.map((item) => (
                  <span key={item.id} className="rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">{item.service.name}</span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Team</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {detailsProject.projectEmployees.length === 0 ? (
                  <span className="text-sm text-gray-500">No employees assigned yet</span>
                ) : detailsProject.projectEmployees.map((assignment) => (
                  <span key={assignment.employee.id} className="rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">
                    {assignment.employee.fname} {assignment.employee.lname}{assignment.role ? ` · ${assignment.role}` : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={Boolean(teamProject)} onClose={() => setTeamProject(null)} className="max-w-2xl m-4">
        {teamProject && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">Manage Team</div>
                <h3 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{teamProject.name}</h3>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">{teamProject.status}</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Current Team</div>
                <div className="flex flex-wrap gap-2">
                  {teamProject.projectEmployees.length === 0 ? (
                    <span className="text-sm text-gray-500">No employees assigned</span>
                  ) : (
                    teamProject.projectEmployees.map((assignment) => (
                      <span key={assignment.employee.id} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">
                        <span>{assignment.employee.fname} {assignment.employee.lname} {assignment.role ? `(${assignment.role})` : ""}</span>
                        {canManageProjectEmployees(teamProject.status) && (
                          <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveEmployee(teamProject.id, assignment.employee.id)}>
                            ×
                          </button>
                        )}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {canManageProjectEmployees(teamProject.status) ? (
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Add Employee</div>
                  <div className="flex flex-wrap gap-2">
                    <input value={teamSearch} onChange={(event) => setTeamSearch(event.target.value)} placeholder="Search employees..." className="min-w-[220px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                    <select value={teamEmployeeId} onChange={(event) => setTeamEmployeeId(event.target.value)} className="min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                      <option value="">Choose employee</option>
                      {teamSearchOptions.map((employee) => (
                        <option key={employee.id} value={employee.id}>{employee.fname} {employee.lname} - {employee.jobTitle}</option>
                      ))}
                    </select>
                    <input value={teamRole} onChange={(event) => setTeamRole(event.target.value)} placeholder="Project role" className="min-w-[150px] rounded-lg border border-gray-300 px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                    <button type="button" disabled={assigningProjectId === teamProject.id} onClick={handleAssignEmployee} className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                      {assigningProjectId === teamProject.id ? "Assigning..." : "Assign"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-800">
                  Employee management is unavailable for this project status.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
