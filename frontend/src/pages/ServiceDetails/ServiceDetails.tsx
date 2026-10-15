import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import { getServiceById, getServices, type Service } from "../../services/service.service";

export default function ServiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isClient = user?.role === "CLIENT";

    const [service, setService] = useState<Service | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadService = async () => {
        if (!id) {
            setError("Service not found.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            const details = await getServiceById(id);
            setService(details ?? null);
        } catch (loadError) {
            console.error(loadError);
            setError("Failed to load service details.");
            setService(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadService();
    }, [id]);

    useEffect(() => {
        const loadServices = async () => {
            try {
                const allServices = await getServices();
                setServices(allServices.filter((s) => s.isActive));
            } catch (loadError) {
                console.error(loadError);
            }
        };

        loadServices();
    }, []);
    
    return (
        <div>
            <PageMeta title="Service Details | CRM" description="View CRM service details" />
            <PageBreadcrumb pageTitle="Service Details" />

            <div className="mb-4">
                <Link
                    to="/services"
                    className="text-sm font-medium text-brand-500 hover:text-brand-600"
                >
                    ← Back to Services
                </Link>
            </div>

            {isLoading && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
                    Loading service details...
                </div>
            )}

            {!isLoading && error && !service && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                    <p className="text-sm text-red-500">{error}</p>
                    <button
                        type="button"
                        onClick={() => navigate("/services")}
                        className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                        Back to Services
                    </button>
                </div>
            )}

            {service && (
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Service</p>
                                <h2 className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                                    {service.name}
                                </h2>
                            </div>
                            {isClient && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Add to cart/draft for CLIENT role
                                        navigate(`/orders?serviceId=${service.id}`);
                                    }}
                                    className="text-sm font-medium text-brand-500 hover:text-brand-600"
                                >
                                    Request Service
                                </button>
                            )}
                        </div>

                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            <strong>Price:</strong> {service.price}
                        </p>

                        {service.description && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <strong>Description:</strong> {service.description}
                            </p>
                        )}

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <strong>Status:</strong> {service.isActive ? "Active" : "Inactive"}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                            Available Services
                        </h3>

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
                                                Price
                                            </th>

                                            <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {services.map((s) => (
                                            <tr
                                                key={s.id}
                                                className="border-b border-gray-100 dark:border-gray-800"
                                            >
                                                <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                                    {s.name}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                                    {s.price}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {s.isActive ? "Active" : "Inactive"}
                                                </td>
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
                    </div>
                </div>
            )}
        </div>
    );
}
