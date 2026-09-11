import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import {
    createClient,
    deactivateClient,
    getClients,
    getInactiveClients,
    restoreClient,
    updateClient,
    type Client,
    type ClientFormData,
} from "../../services/client.service";

type ClientForm = {
    fname: string;
    lname: string;
    phone: string;
    address: string;
};

type ClientFieldErrors = Partial<Record<keyof ClientForm, string>>;

const emptyForm: ClientForm = {
    fname: "",
    lname: "",
    phone: "",
    address: "",
};

export default function Clients() {
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";

    const [clients, setClients] = useState<Client[]>([]);
    const [inactiveClients, setInactiveClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [inactiveError, setInactiveError] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [form, setForm] = useState<ClientForm>(emptyForm);
    const [fieldErrors, setFieldErrors] = useState<ClientFieldErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const loadClients = async () => {
        try {
            setIsLoading(true);
            setError("");
            setClients(await getClients());
        } catch (loadError) {
            console.error(loadError);
            setError("Failed to load clients.");
        } finally {
            setIsLoading(false);
        }
    };

    const loadInactiveClients = async () => {
        if (!isAdmin) {
            return;
        }

        try {
            setInactiveError("");
            setInactiveClients(await getInactiveClients());
        } catch (loadError) {
            console.error(loadError);
            setInactiveError("Failed to load inactive clients.");
        }
    };

    useEffect(() => {
        loadClients();
        loadInactiveClients();
    }, [user?.role]);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingClient(null);
        setShowForm(false);
        setFormError("");
        setFieldErrors({});
    };

    const openCreateForm = () => {
        setForm(emptyForm);
        setEditingClient(null);
        setFormError("");
        setFieldErrors({});
        setShowForm(true);
    };

    const openEditForm = (client: Client) => {
        setEditingClient(client);
        setForm({
            fname: client.fname,
            lname: client.lname,
            phone: client.phone,
            address: client.address || "",
        });
        setFormError("");
        setFieldErrors({});
        setShowForm(true);
    };

    const handleFormChange = (field: keyof ClientForm, value: string) => {
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

        const nextErrors: ClientFieldErrors = {};

        if (!form.fname.trim()) {
            nextErrors.fname = "First name is required.";
        }
        if (!form.lname.trim()) {
            nextErrors.lname = "Last name is required.";
        }
        if (!form.phone.trim()) {
            nextErrors.phone = "Phone is required.";
        }

        if (Object.keys(nextErrors).length > 0) {
            setFieldErrors(nextErrors);
            return;
        }

        const data: ClientFormData = {
            fname: form.fname.trim(),
            lname: form.lname.trim(),
            phone: form.phone.trim(),
            address: form.address.trim() || undefined,
        };

        try {
            setIsSubmitting(true);

            if (editingClient) {
                await updateClient(editingClient.id, data);
            } else {
                await createClient(data);
            }

            resetForm();
            await loadClients();
        } catch (submitError) {
            console.error(submitError);
            setFormError(
                editingClient
                    ? "Failed to update client."
                    : "Failed to create client."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivate = async (client: Client) => {
        if (!window.confirm(`Deactivate client "${client.fname} ${client.lname}"?`)) {
            return;
        }

        try {
            setError("");
            await deactivateClient(client.id);
            await loadClients();
            await loadInactiveClients();
        } catch (actionError) {
            console.error(actionError);
            setError("Failed to deactivate client.");
        }
    };

    const handleRestore = async (client: Client) => {
        if (!window.confirm(`Restore client "${client.fname} ${client.lname}"?`)) {
            return;
        }

        try {
            setInactiveError("");
            await restoreClient(client.id);
            await loadClients();
            await loadInactiveClients();
        } catch (actionError) {
            console.error(actionError);
            setInactiveError("Failed to restore client.");
        }
    };

    return (
        <div>
            <PageMeta title="Clients | CRM" description="Manage CRM clients" />
            <PageBreadcrumb pageTitle="Clients" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Clients
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {clients.length} active client{clients.length === 1 ? "" : "s"}
                        </p>
                    </div>

                    {isAdmin && (
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={showForm ? resetForm : openCreateForm}
                                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                            >
                                {showForm ? "Cancel" : "+ Add Client"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowInactive((current) => !current)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                {showInactive
                                    ? "Hide Inactive"
                                    : `Inactive (${inactiveClients.length})`}
                            </button>
                        </div>
                    )}
                </div>

                {showForm && isAdmin && (
                    <div className="border-b border-gray-200 p-5 dark:border-gray-800">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    First name
                                    <input
                                        value={form.fname}
                                        onChange={(event) =>
                                            handleFormChange("fname", event.target.value)
                                        }
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
                                        onChange={(event) =>
                                            handleFormChange("lname", event.target.value)
                                        }
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
                                        onChange={(event) =>
                                            handleFormChange("phone", event.target.value)
                                        }
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    />
                                    {fieldErrors.phone && (
                                        <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
                                    )}
                                </label>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Address
                                    <input
                                        value={form.address}
                                        onChange={(event) =>
                                            handleFormChange("address", event.target.value)
                                        }
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    />
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
                                    : editingClient
                                    ? "Update Client"
                                    : "Create Client"}
                            </button>
                        </form>
                    </div>
                )}

                {isLoading && <div className="p-5 text-sm text-gray-500">Loading clients...</div>}
                {error && <div className="p-5 text-sm text-red-500">{error}</div>}

                {!isLoading && !error && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px]">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Phone</th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Address</th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                                    {isAdmin && (
                                        <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id} className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                            {client.fname} {client.lname}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{client.phone}</td>
                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{client.address || "-"}</td>
                                        <td className="px-5 py-4 text-sm text-green-600">Active</td>
                                        {isAdmin && (
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditForm(client)}
                                                        className="text-sm font-medium text-brand-500 hover:text-brand-600"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeactivate(client)}
                                                        className="text-sm font-medium text-red-500 hover:text-red-600"
                                                    >
                                                        Deactivate
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {clients.length === 0 && <div className="p-5 text-sm text-gray-500">No clients found.</div>}
                    </div>
                )}

                {isAdmin && showInactive && (
                    <div className="border-t border-gray-200 dark:border-gray-800">
                        <div className="p-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Inactive Clients</h3>
                        </div>
                        {inactiveError && <div className="px-5 pb-5 text-sm text-red-500">{inactiveError}</div>}
                        {!inactiveError && inactiveClients.length === 0 && (
                            <div className="px-5 pb-5 text-sm text-gray-500">No inactive clients found.</div>
                        )}
                        {inactiveClients.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px]">
                                    <tbody>
                                        {inactiveClients.map((client) => (
                                            <tr key={client.id} className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{client.fname} {client.lname}</td>
                                                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{client.phone}</td>
                                                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{client.address || "-"}</td>
                                                <td className="px-5 py-4 text-sm text-red-600">Inactive</td>
                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRestore(client)}
                                                        className="text-sm font-medium text-green-600 hover:text-green-700"
                                                    >
                                                        Restore
                                                    </button>
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
