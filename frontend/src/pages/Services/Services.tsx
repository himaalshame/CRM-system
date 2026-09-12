import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import {
    createService,
    deactivateService,
    getServices,
    getInactiveServices,
    restoreService,
    updateService,
    type Service,
} from "../../services/service.service";
import { addDraftItem } from "../../utils/orderDraft";


export default function Services() {

    const { user } = useAuth();
    const navigate = useNavigate();


    const [services, setServices] = useState<Service[]>([]);
    const [inactiveServices, setInactiveServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [inactiveError, setInactiveError] = useState("");
    const [showInactive, setShowInactive] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setEditingService(null);
        setShowForm(false);
        setFormError("");
    };

    const handleEditService = (service: Service) => {
        setEditingService(service);
        setName(service.name);
        setDescription(service.description || "");
        setPrice(service.price);
        setFormError("");
        setShowForm(true);
    };

    const loadServices = async () => {
        try {
            setIsLoading(true);
            setError("");

            const data = await getServices();
            setServices(data);
        } catch (error) {
            console.error(error);
            setError("Failed to load services.");
        } finally {
            setIsLoading(false);
        }
    };

    const loadInactiveServices = async () => {
        if (user?.role !== "ADMIN") {
            return;
        }

        try {
            setInactiveError("");
            const data = await getInactiveServices();
            setInactiveServices(data);
        } catch (error) {
            console.error(error);
            setInactiveError("Failed to load inactive services.");
        }
    };

    useEffect(() => {
        loadServices();
        loadInactiveServices();
    }, [user?.role]);

    const handleCreateService = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setFormError("");

        if (!name.trim()) {
            setFormError("Service name is required.");
            return;
        }

        if (!price.trim()) {
            setFormError("Service price is required.");
            return;
        }

        try {
            setIsSubmitting(true);

            const serviceData = {
                name: name.trim(),
                description: description.trim() || undefined,
                price: price.trim(),
            };

            if (editingService) {
                await updateService(editingService.id, serviceData);
            } else {
                await createService(serviceData);
            }

            resetForm();

            await loadServices();
            await loadInactiveServices();
        } catch (error) {
            console.error(error);
            setFormError(
                editingService
                    ? "Failed to update service."
                    : "Failed to create service."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivateService = async (service: Service) => {
        if (!window.confirm(`Deactivate service "${service.name}"?`)) {
            return;
        }

        try {
            setError("");
            await deactivateService(service.id);
            await loadServices();
            await loadInactiveServices();
        } catch (error) {
            console.error(error);
            setError("Failed to deactivate service.");
        }
    };

    const handleRestoreService = async (service: Service) => {
        if (!window.confirm(`Restore service "${service.name}"?`)) {
            return;
        }

        try {
            setInactiveError("");
            await restoreService(service.id);
            await loadServices();
            await loadInactiveServices();
        } catch (error) {
            console.error(error);
            setInactiveError("Failed to restore service.");
        }
    };

    return (
        <div>
            <PageMeta
                title="Services | CRM"
                description="Manage CRM services"
            />

            <PageBreadcrumb pageTitle="Services" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Services
                    </h2>

                    {user?.role === "ADMIN" && (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(!showForm);
                                    setEditingService(null);
                                    setName("");
                                    setDescription("");
                                    setPrice("");
                                    setFormError("");
                                }}
                                className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600"
                            >
                                {showForm ? "Cancel" : "+ Add Service"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowInactive(!showInactive)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                                {showInactive
                                    ? "Hide Inactive"
                                    : `Inactive (${inactiveServices.length})`}
                            </button>
                        </div>
                    )}
                </div>

                {showForm && (
                    <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                        <form
                            onSubmit={handleCreateService}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Enter service name"
                                    className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Enter service description"
                                    rows={3}
                                    className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Price
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) =>
                                        setPrice(e.target.value)
                                    }
                                    placeholder="Enter service price"
                                    className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                            </div>

                            {formError && (
                                <p className="text-sm text-red-500">
                                    {formError}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? "Creating..."
                                        : editingService
                                        ? "Update Service"
                                        : "Create Service"}
                            </button>
                        </form>
                    </div>
                )}

                {isLoading && (
                    <div className="p-5 text-sm text-gray-500">
                        Loading services...
                    </div>
                )}

                {error && (
                    <div className="p-5 text-sm text-red-500">
                        {error}
                    </div>
                )}

                {!isLoading && !error && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                                        Name
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                                        Description
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                                        Price
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                                        Status
                                    </th>

                                    {user?.role === "ADMIN" && (
                                        <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {services.map((service) => (
                                    <tr
                                        key={service.id}
                                        className="border-b border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                            {service.name}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {service.description || "-"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                            {service.price}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-green-600">
                                                    Active
                                                </span>
                                                {user?.role === "CLIENT" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            addDraftItem(service.id);
                                                            navigate(`/orders?serviceId=${service.id}`);
                                                        }}
                                                        className="text-sm font-medium text-brand-500 hover:text-brand-600"
                                                    >
                                                        Request Service
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                        {user?.role === "ADMIN" && (
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditService(service)
                                                        }
                                                        className="text-sm font-medium text-brand-500 hover:text-brand-600"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeactivateService(
                                                                service
                                                            )
                                                        }
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

                        {services.length === 0 && (
                            <div className="p-5 text-sm text-gray-500">
                                No services found.
                            </div>
                        )}
                    </div>
                )}

                {user?.role === "ADMIN" && showInactive && (
                    <div className="border-t border-gray-200 dark:border-gray-800">
                        <div className="p-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Inactive Services
                            </h3>
                        </div>

                        {inactiveError && (
                            <div className="px-5 pb-5 text-sm text-red-500">
                                {inactiveError}
                            </div>
                        )}

                        {!inactiveError && inactiveServices.length === 0 && (
                            <div className="px-5 pb-5 text-sm text-gray-500">
                                No inactive services found.
                            </div>
                        )}

                        {inactiveServices.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px]">
                                    <tbody>
                                        {inactiveServices.map((service) => (
                                            <tr
                                                key={service.id}
                                                className="border-b border-gray-100 dark:border-gray-800"
                                            >
                                                <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                                    {service.name}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {service.description || "-"}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                                    {service.price}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="text-sm text-red-600">
                                                        Inactive
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRestoreService(
                                                                service
                                                            )
                                                        }
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

