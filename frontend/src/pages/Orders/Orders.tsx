import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { useAuth } from "../../context/AuthContext";
import { getClients, type Client } from "../../services/client.service";
import { getServices, type Service } from "../../services/service.service";
import {
    clearDraftItems,
    ensureDraftItem,
    getDraftItems,
    setDraftItems,
} from "../../utils/orderDraft";
import {
    createEmptyItem,
    formatDate,
    formatMoney,
    formatOrderNumber,
    getErrorMessage,
    toFormItem,
    toIsoDate,
    toOrderPayload,
    type OrderItemForm,
} from "../../utils/orderForm";
import { createOrder, getOrders, type Order } from "../../services/order.service";

export default function Orders() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isAdmin = user?.role === "ADMIN";
    const isClient = user?.role === "CLIENT";
    const canCreate = isAdmin || isClient;

    const [orders, setOrders] = useState<Order[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [clientId, setClientId] = useState("");
    const [items, setItems] = useState<OrderItemForm[]>([createEmptyItem()]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            setError("");
            setOrders(await getOrders());
        } catch (loadError) {
            console.error(loadError);
            setError(getErrorMessage(loadError, "Failed to load orders."));
        } finally {
            setIsLoading(false);
        }
    };

    const loadFormOptions = async () => {
        if (!canCreate) {
            return;
        }

        try {
            const serviceData = await getServices();
            setServices(serviceData);

            const requestedServiceId = searchParams.get("serviceId");
            if (requestedServiceId) {
                ensureDraftItem(requestedServiceId);
            }

            const draftItems = getDraftItems();
            if (draftItems.length > 0) {
                setItems(draftItems.map(toFormItem));
                setShowForm(true);
            }

            if (isAdmin) {
                setClients(await getClients());
            }
        } catch (optionsError) {
            console.error(optionsError);
            setFormError(getErrorMessage(optionsError, "Failed to load order options."));
        }
    };

    useEffect(() => {
        loadOrders();
        loadFormOptions();
    }, [user?.role, searchParams]);

    useEffect(() => {
        const validItems = items.filter((item) => item.serviceId);
        if (validItems.length > 0) {
            setDraftItems(validItems);
        }
    }, [items]);

    const resetForm = () => {
        clearDraftItems();
        setShowForm(false);
        setClientId("");
        setItems([createEmptyItem()]);
        setStartDate("");
        setEndDate("");
        setNotes("");
        setFormError("");
    };

    const getServiceById = (serviceId: string) =>
        services.find((service) => service.id === serviceId);

    const getItemSubtotal = (item: OrderItemForm) => {
        const service = getServiceById(item.serviceId);
        if (!service) {
            return 0;
        }

        return Number(service.price) * (Number(item.quantity) || 0);
    };

    const orderPreviewTotal = items.reduce(
        (sum, item) => sum + getItemSubtotal(item),
        0
    );

    const handleItemChange = (
        index: number,
        field: "serviceId" | "quantity",
        value: string
    ) => {
        setItems((currentItems) =>
            currentItems.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: field === "quantity" ? Number(value) : value,
                    }
                    : item
            )
        );
        setFormError("");
    };

    const handleCreateOrder = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setFormError("");

        if (isAdmin && !clientId) {
            setFormError("Please select a client.");
            return;
        }

        const filledItems = items.filter((item) => item.serviceId);
        if (
            filledItems.length === 0 ||
            filledItems.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)
        ) {
            setFormError("Select a service and enter a quantity of at least 1.");
            return;
        }

        try {
            setIsSubmitting(true);
            const created = await createOrder({
                ...(isAdmin ? { clientId } : {}),
                items: toOrderPayload(filledItems),
                ...(isAdmin ? { startDate: toIsoDate(startDate) } : {}),
                ...(isAdmin ? { endDate: toIsoDate(endDate) } : {}),
                ...(notes.trim() ? { notes: notes.trim() } : {}),
            });
            resetForm();
            navigate(`/orders/${created.id}`);
        } catch (createError) {
            console.error(createError);
            setFormError(getErrorMessage(createError, "Failed to create order."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const pageTitle = isClient ? "My Orders" : "Orders";

    return (
        <div>
            <PageMeta title={`${pageTitle} | CRM`} description="Manage CRM orders" />
            <PageBreadcrumb pageTitle={pageTitle} />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            {pageTitle}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {orders.length} order{orders.length === 1 ? "" : "s"}
                        </p>
                    </div>
                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm((current) => !current);
                                setFormError("");
                            }}
                            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                        >
                            {showForm ? "Cancel" : "+ Create Order"}
                        </button>
                    )}
                </div>

                {error && <div className="p-5 text-sm text-red-500">{error}</div>}

                {showForm && canCreate && (
                    <div className="border-b border-gray-200 p-5 dark:border-gray-800">
                        <form onSubmit={handleCreateOrder} className="space-y-4">
                            {isAdmin && (
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Client
                                    <select
                                        value={clientId}
                                        onChange={(event) => setClientId(event.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    >
                                        <option value="">Select a client</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.fname} {client.lname}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            )}

                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Services
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Link
                                            to="/explore/services"
                                            className="text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400"
                                        >
                                            + Add another service
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setItems((currentItems) => [
                                                    ...currentItems,
                                                    createEmptyItem(),
                                                ])
                                            }
                                            className="text-sm font-medium text-brand-500 hover:text-brand-600"
                                        >
                                            + Add from list
                                        </button>
                                    </div>
                                </div>
                                {items.map((item, index) => {
                                    const selectedService = getServiceById(item.serviceId);
                                    return (
                                        <div
                                            key={item.rowId}
                                            className="grid gap-3 rounded-xl border border-gray-100 p-3 md:grid-cols-[1fr_120px_140px_auto] dark:border-gray-800"
                                        >
                                            <select
                                                value={item.serviceId}
                                                onChange={(event) =>
                                                    handleItemChange(index, "serviceId", event.target.value)
                                                }
                                                className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                            >
                                                <option value="">Select a service</option>
                                                {services
                                                    .filter((service) => service.isActive)
                                                    .map((service) => (
                                                        <option
                                                            key={service.id}
                                                            value={service.id}
                                                            disabled={items.some(
                                                                (other, otherIndex) =>
                                                                    otherIndex !== index &&
                                                                    other.serviceId === service.id
                                                            )}
                                                        >
                                                            {service.name}
                                                        </option>
                                                    ))}
                                            </select>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={item.quantity}
                                                onChange={(event) =>
                                                    handleItemChange(index, "quantity", event.target.value)
                                                }
                                                className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                            />
                                            <div className="flex flex-col justify-center text-sm text-gray-700 dark:text-gray-300">
                                                <span className="text-xs text-gray-500">Subtotal</span>
                                                <span className="font-medium">
                                                    {selectedService
                                                        ? formatMoney(getItemSubtotal(item))
                                                        : "—"}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setItems((currentItems) =>
                                                        currentItems.length === 1
                                                            ? currentItems
                                                            : currentItems.filter(
                                                                (_, itemIndex) => itemIndex !== index
                                                            )
                                                    )
                                                }
                                                disabled={items.length === 1}
                                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    );
                                })}
                                <div className="flex justify-end rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-white/[0.03]">
                                    <span className="font-medium text-gray-800 dark:text-white/90">
                                        Order total: {formatMoney(orderPreviewTotal)}
                                    </span>
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Start date
                                        <input
                                            type="datetime-local"
                                            value={startDate}
                                            onChange={(event) => setStartDate(event.target.value)}
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                    </label>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        End date
                                        <input
                                            type="datetime-local"
                                            value={endDate}
                                            onChange={(event) => setEndDate(event.target.value)}
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                    </label>
                                </div>
                            )}

                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Notes
                                <textarea
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    rows={3}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    placeholder="Add notes for this service request"
                                />
                            </label>

                            {formError && <p className="text-sm text-red-500">{formError}</p>}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                            >
                                {isSubmitting ? "Creating..." : "Create Order"}
                            </button>
                        </form>
                    </div>
                )}

                {isLoading && <div className="p-5 text-sm text-gray-500">Loading orders...</div>}

                {!isLoading && !error && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px]">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                                        Order
                                    </th>
                                    {!isClient && (
                                        <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                                            Client
                                        </th>
                                    )}
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                                        Status
                                    </th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                                        Total
                                    </th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                                        Items
                                    </th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                                        Created
                                    </th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-gray-100 dark:border-gray-800"
                                    >
                                        <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formatOrderNumber(order.id)}
                                        </td>
                                        {!isClient && (
                                            <td className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                                {order.client.fname} {order.client.lname}
                                            </td>
                                        )}
                                        <td className="px-5 py-4">
                                            <Badge
                                                color={
                                                    order.status === "CANCELLED"
                                                        ? "error"
                                                        : order.status === "COMPLETED" ||
                                                          order.status === "APPROVED"
                                                            ? "success"
                                                            : order.status === "IN_PROGRESS"
                                                                ? "info"
                                                                : "warning"
                                                }
                                            >
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                                            {formatMoney(order.totalPrice)}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500">
                                            {order.orderItems.length} service
                                            {order.orderItems.length === 1 ? "" : "s"}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500">
                                            {formatDate(order.createdAt) || "—"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <Link
                                                to={`/orders/${order.id}`}
                                                className="text-sm font-medium text-brand-500 hover:text-brand-600"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && (
                            <div className="p-5 text-sm text-gray-500">No orders found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
