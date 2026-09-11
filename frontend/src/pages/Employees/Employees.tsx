import { useEffect, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import {
    createEmployee,
    deactivateEmployee,
    getEmployees,
    getInactiveEmployees,
    restoreEmployee,
    updateEmployee,
    type CreateEmployeeData,
    type Employee,
    type UpdateEmployeeData,
} from "../../services/employee.service";

type EmployeeForm = {
    email: string;
    password: string;
    fname: string;
    lname: string;
    phone: string;
    jobTitle: string;
};

type EmployeeFieldErrors = Partial<Record<keyof EmployeeForm, string>>;

const emptyForm: EmployeeForm = {
    email: "",
    password: "",
    fname: "",
    lname: "",
    phone: "",
    jobTitle: "",
};

export default function Employees() {
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [inactiveEmployees, setInactiveEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [inactiveError, setInactiveError] = useState("");
    const [success, setSuccess] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [form, setForm] = useState<EmployeeForm>(emptyForm);
    const [fieldErrors, setFieldErrors] = useState<EmployeeFieldErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const loadEmployees = async () => {
        try {
            setIsLoading(true);
            setError("");
            setEmployees(await getEmployees());
        } catch (loadError) {
            console.error(loadError);
            setError("Failed to load employees.");
        } finally {
            setIsLoading(false);
        }
    };

    const loadInactiveEmployees = async () => {
        if (!isAdmin) {
            return;
        }

        try {
            setInactiveError("");
            setInactiveEmployees(await getInactiveEmployees());
        } catch (loadError) {
            console.error(loadError);
            setInactiveError("Failed to load inactive employees.");
        }
    };

    useEffect(() => {
        loadEmployees();
        loadInactiveEmployees();
    }, [user?.role]);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingEmployee(null);
        setShowForm(false);
        setFormError("");
        setFieldErrors({});
    };

    const openCreateForm = () => {
        setForm(emptyForm);
        setEditingEmployee(null);
        setFormError("");
        setFieldErrors({});
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (employee: Employee) => {
        setEditingEmployee(employee);
        setForm({
            email: employee.user.email,
            password: "",
            fname: employee.fname,
            lname: employee.lname,
            phone: employee.phone,
            jobTitle: employee.jobTitle,
        });
        setFormError("");
        setFieldErrors({});
        setSuccess("");
        setShowForm(true);
    };

    const handleFormChange = (field: keyof EmployeeForm, value: string) => {
        setForm((currentForm) => ({ ...currentForm, [field]: value }));
        setFieldErrors((currentErrors) => ({
            ...currentErrors,
            [field]: undefined,
        }));
        setFormError("");
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError("");
        setFieldErrors({});
        setSuccess("");

        const nextErrors: EmployeeFieldErrors = {};

        if (!form.fname.trim()) {
            nextErrors.fname = "First name is required.";
        }
        if (!form.lname.trim()) {
            nextErrors.lname = "Last name is required.";
        }
        if (!form.phone.trim()) {
            nextErrors.phone = "Phone is required.";
        }
        if (!form.jobTitle.trim()) {
            nextErrors.jobTitle = "Job title is required.";
        }
        if (!editingEmployee && !form.email.trim()) {
            nextErrors.email = "Email is required.";
        }
        if (!editingEmployee && !form.password.trim()) {
            nextErrors.password = "Password is required.";
        }

        if (Object.keys(nextErrors).length > 0) {
            setFieldErrors(nextErrors);
            return;
        }

        if (!editingEmployee && form.password.length < 8) {
            setFieldErrors({ password: "Password must be at least 8 characters." });
            return;
        }

        if (form.phone.trim().length < 10) {
            setFieldErrors({ phone: "Phone must be at least 10 characters." });
            return;
        }

        if (!editingEmployee && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            setFieldErrors({ email: "Please enter a valid email address." });
            return;
        }

        try {
            setIsSubmitting(true);

            if (editingEmployee) {
                const data: UpdateEmployeeData = {
                    fname: form.fname.trim(),
                    lname: form.lname.trim(),
                    phone: form.phone.trim(),
                    jobTitle: form.jobTitle.trim(),
                };
                await updateEmployee(editingEmployee.id, data);
                setSuccess("Employee updated successfully.");
            } else {
                const data: CreateEmployeeData = {
                    email: form.email.trim(),
                    password: form.password,
                    fname: form.fname.trim(),
                    lname: form.lname.trim(),
                    phone: form.phone.trim(),
                    jobTitle: form.jobTitle.trim(),
                };
                await createEmployee(data);
                setSuccess("Employee created successfully.");
            }

            resetForm();
            await loadEmployees();
        } catch (submitError) {
            console.error(submitError);

            if (axios.isAxiosError(submitError)) {
                const responseMessage = submitError.response?.data?.message;
                const validationErrors = submitError.response?.data?.errors;
                const firstValidationError = validationErrors
                    ? Object.values(validationErrors).flat()[0]
                    : undefined;

                if (validationErrors) {
                    setFieldErrors(validationErrors as EmployeeFieldErrors);
                }

                setFormError(
                    firstValidationError ||
                        responseMessage ||
                        (editingEmployee
                            ? "Failed to update employee."
                            : "Failed to create employee.")
                );
            } else {
                setFormError(
                    editingEmployee
                        ? "Failed to update employee."
                        : "Failed to create employee."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivate = async (employee: Employee) => {
        if (!window.confirm(`Deactivate employee "${employee.fname} ${employee.lname}"?`)) {
            return;
        }

        try {
            setError("");
            setSuccess("");
            await deactivateEmployee(employee.id);
            setSuccess("Employee deactivated successfully.");
            await loadEmployees();
            await loadInactiveEmployees();
        } catch (actionError) {
            console.error(actionError);
            setError("Failed to deactivate employee.");
        }
    };

    const handleRestore = async (employee: Employee) => {
        if (!window.confirm(`Restore employee "${employee.fname} ${employee.lname}"?`)) {
            return;
        }

        try {
            setInactiveError("");
            setSuccess("");
            await restoreEmployee(employee.id);
            setSuccess("Employee restored successfully.");
            await loadEmployees();
            await loadInactiveEmployees();
        } catch (actionError) {
            console.error(actionError);
            setInactiveError("Failed to restore employee.");
        }
    };

    return (
        <div>
            <PageMeta title="Employees | CRM" description="Manage CRM employees" />
            <PageBreadcrumb pageTitle="Employees" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Employees
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {employees.length} active employee{employees.length === 1 ? "" : "s"}
                        </p>
                    </div>

                    {isAdmin && (
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={showForm ? resetForm : openCreateForm}
                                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                            >
                                {showForm ? "Cancel" : "+ Add Employee"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowInactive((current) => !current)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                {showInactive
                                    ? "Hide Inactive"
                                    : `Inactive (${inactiveEmployees.length})`}
                            </button>
                        </div>
                    )}
                </div>

                {success && <div className="p-5 text-sm text-green-600">{success}</div>}

                {showForm && isAdmin && (
                    <div className="border-b border-gray-200 p-5 dark:border-gray-800">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                    <input
                                        type="email"
                                        value={form.email}
                                        disabled={!!editingEmployee}
                                        onChange={(event) => handleFormChange("email", event.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-800"
                                    />
                                    {fieldErrors.email && (
                                        <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                                    )}
                                </label>
                                {!editingEmployee && (
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Password
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={(event) => handleFormChange("password", event.target.value)}
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                        {fieldErrors.password && (
                                            <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
                                        )}
                                    </label>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    First name
                                    <input
                                        value={form.fname}
                                        onChange={(event) => handleFormChange("fname", event.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    />
                                    {fieldErrors.fname && (
                                        <p className="mt-1 text-xs text-red-500">{fieldErrors.fname}</p>
                                    )}
                                </label>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Last name
                                    <input
                                        value={form.lname}
                                        onChange={(event) => handleFormChange("lname", event.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    />
                                    {fieldErrors.lname && (
                                        <p className="mt-1 text-xs text-red-500">{fieldErrors.lname}</p>
                                    )}
                                </label>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Phone
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(event) => handleFormChange("phone", event.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    />
                                    {fieldErrors.phone && (
                                        <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
                                    )}
                                </label>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Job title
                                    <input
                                        value={form.jobTitle}
                                        onChange={(event) => handleFormChange("jobTitle", event.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    />
                                    {fieldErrors.jobTitle && (
                                        <p className="mt-1 text-xs text-red-500">{fieldErrors.jobTitle}</p>
                                    )}
                                </label>
                            </div>

                            {formError && <p className="text-sm text-red-500">{formError}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? "Saving..."
                                    : editingEmployee
                                    ? "Update Employee"
                                    : "Create Employee"}
                            </button>
                        </form>
                    </div>
                )}

                {isLoading && <div className="p-5 text-sm text-gray-500">Loading employees...</div>}
                {error && <div className="p-5 text-sm text-red-500">{error}</div>}

                {!isLoading && !error && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Phone</th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Job title</th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                                    {isAdmin && <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee) => (
                                    <tr key={employee.id} className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{employee.fname} {employee.lname}</td>
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{employee.user.email}</td>
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{employee.phone}</td>
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{employee.jobTitle}</td>
                                        <td className="px-5 py-4 text-sm text-green-600">Active</td>
                                        {isAdmin && (
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button type="button" onClick={() => openEditForm(employee)} className="text-sm font-medium text-brand-500 hover:text-brand-600">Edit</button>
                                                    <button type="button" onClick={() => handleDeactivate(employee)} className="text-sm font-medium text-red-500 hover:text-red-600">Deactivate</button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {employees.length === 0 && <div className="p-5 text-sm text-gray-500">No employees found.</div>}
                    </div>
                )}

                {isAdmin && showInactive && (
                    <div className="border-t border-gray-200 dark:border-gray-800">
                        <div className="p-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Inactive Employees</h3>
                        </div>
                        {inactiveError && <div className="px-5 pb-5 text-sm text-red-500">{inactiveError}</div>}
                        {!inactiveError && inactiveEmployees.length === 0 && <div className="px-5 pb-5 text-sm text-gray-500">No inactive employees found.</div>}
                        {inactiveEmployees.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px]">
                                    <tbody>
                                        {inactiveEmployees.map((employee) => (
                                            <tr key={employee.id} className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{employee.fname} {employee.lname}</td>
                                                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{employee.user.email}</td>
                                                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{employee.phone}</td>
                                                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{employee.jobTitle}</td>
                                                <td className="px-5 py-4 text-sm text-red-600">Inactive</td>
                                                <td className="px-5 py-4">
                                                    <button type="button" onClick={() => handleRestore(employee)} className="text-sm font-medium text-green-600 hover:text-green-700">Restore</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
