import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import { getClients, type Client } from "../../services/client.service";
import { getServices, type Service } from "../../services/service.service";
import {
    approveOrder,
    cancelOrder,
    createOrder,
    getOrderById,
    getOrders,
    updateOrder,
    type Order,
    type OrderPaymentStatus,
    type OrderStatus,
} from "../../services/order.service";

type OrderItemForm = {
    serviceId: string;
    quantity: number;
};

const paymentStatuses: OrderPaymentStatus[] = [
    "UNPAID",
    "PARTIALLY_PAID",
    "PAID",
];

const adminEditableStatuses: OrderStatus[] = [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
];

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));

const toIsoDate = (value: string) =>
    value ? new Date(value).toISOString() : undefined;

export default function Orders() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const isAdmin = user?.role === "ADMIN";
    const canCreate = user?.role === "ADMIN" || user?.role === "CLIENT";

    const [orders, setOrders] = useState<Order[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [clientId, setClientId] = useState("");
    const [items, setItems] = useState<OrderItemForm[]>([
        { serviceId: "", quantity: 1 },
    ]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus>("UNPAID");
    const [isEditingPendingOrder, setIsEditingPendingOrder] = useState(false);
    const [editItems, setEditItems] = useState<OrderItemForm[]>([]);
    const [editStartDate, setEditStartDate] = useState("");
    const [editNotes, setEditNotes] = useState("");
    const [adminStatus, setAdminStatus] = useState<OrderStatus>("PENDING");
    const [adminStartDate, setAdminStartDate] = useState("");
    const [adminEndDate, setAdminEndDate] = useState("");

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
                setItems([{ serviceId: requestedServiceId, quantity: 1 }]);
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

    const resetForm = () => {
        setShowForm(false);
        setClientId("");
        setItems([{ serviceId: "", quantity: 1 }]);
        setStartDate("");
        setEndDate("");
        setNotes("");
        setFormError("");
    };

    const handleItemChange = (
        index: number,
        field: keyof OrderItemForm,
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

    const addItem = () => {
        setItems((currentItems) => [
            ...currentItems,
            { serviceId: "", quantity: 1 },
        ]);
    };

    const removeItem = (index: number) => {
        setItems((currentItems) =>
            currentItems.length === 1
                ? currentItems
                : currentItems.filter((_, itemIndex) => itemIndex !== index)
        );
    };

    const handleCreateOrder = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setFormError("");
        setSuccess("");

        if (isAdmin && !clientId) {
            setFormError("Please select a client.");
            return;
        }

        if (
            items.length === 0 ||
            items.some((item) => !item.serviceId || !Number.isInteger(item.quantity) || item.quantity < 1)
        ) {
            setFormError("Select a service and enter a quantity of at least 1 for every item.");
            return;
        }

        const serviceIds = items.map((item) => item.serviceId);
        if (new Set(serviceIds).size !== serviceIds.length) {
            setFormError("Each service can only be selected once per order.");
            return;
        }

        try {
            setIsSubmitting(true);
            await createOrder({
                ...(isAdmin ? { clientId } : {}),
                items,
                ...(isAdmin ? { startDate: toIsoDate(startDate) } : {}),
                ...(isAdmin ? { endDate: toIsoDate(endDate) } : {}),
                ...(notes.trim() ? { notes: notes.trim() } : {}),
            });
            resetForm();
            setSuccess("Order created successfully.");
            await loadOrders();
        } catch (createError) {
            console.error(createError);
            setFormError(getErrorMessage(createError, "Failed to create order."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewDetails = async (order: Order) => {
        try {
            setIsLoadingDetails(true);
            setError("");
            const details = await getOrderById(order.id);
            setSelectedOrder(details);
            setPaymentStatus(details.paymentStatus);
            setEditItems(
                details.orderItems.map((item) => ({
                    serviceId: item.serviceId,
                    quantity: item.quantity,
                }))
            );
            setEditStartDate(details.startDate ? details.startDate.slice(0, 16) : "");
            setEditNotes(details.notes ?? "");
            setAdminStatus(details.status);
            setAdminStartDate(details.startDate ? details.startDate.slice(0, 16) : "");
            setAdminEndDate(details.endDate ? details.endDate.slice(0, 16) : "");
            setIsEditingPendingOrder(false);
        } catch (detailsError) {
            console.error(detailsError);
            setError(getErrorMessage(detailsError, "Failed to load order details."));
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleEditItemChange = (
        index: number,
        field: keyof OrderItemForm,
        value: string
    ) => {
        setEditItems((currentItems) =>
            currentItems.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: field === "quantity" ? Number(value) : value,
                    }
                    : item
            )
        );
    };

    const handleUpdatePendingOrder = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!selectedOrder || user?.role !== "CLIENT") {
            return;
        }

        if (
            editItems.some(
                (item) =>
                    !item.serviceId ||
                    !Number.isInteger(item.quantity) ||
                    item.quantity < 1
            )
        ) {
            setError("Select a service and use a quantity of at least 1.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            await updateOrder(selectedOrder.id, {
                items: editItems,
                startDate: toIsoDate(editStartDate) || null,
                notes: editNotes.trim() || null,
            });
            setIsEditingPendingOrder(false);
            setSuccess("Order updated successfully.");
            const refreshedOrder = await getOrderById(selectedOrder.id);
            setSelectedOrder(refreshedOrder);
            await loadOrders();
        } catch (updateError) {
            console.error(updateError);
            setError(getErrorMessage(updateError, "Failed to update order."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAdminUpdate = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!selectedOrder || !isAdmin) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            await updateOrder(selectedOrder.id, {
                status: adminStatus,
                startDate: toIsoDate(adminStartDate) || null,
                endDate: toIsoDate(adminEndDate) || null,
                paymentStatus,
            });
            setSuccess("Order updated successfully.");
            const refreshedOrder = await getOrderById(selectedOrder.id);
            setSelectedOrder(refreshedOrder);
            await loadOrders();
        } catch (updateError) {
            console.error(updateError);
            setError(getErrorMessage(updateError, "Failed to update order."));
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleApprove = async (order: Order) => {
        const currentStartDate =
            adminStartDate ||
            (order.startDate
                ? order.startDate.slice(0, 16)
                : "");

        const currentEndDate =
            adminEndDate ||
            (order.endDate
                ? order.endDate.slice(0, 16)
                : "");

        if (!currentStartDate || !currentEndDate) {
            setError(
                "Please set start date and end date before approving the order."
            );
            return;
        }

        if (
            new Date(currentEndDate) <
            new Date(currentStartDate)
        ) {
            setError(
                "End date cannot be before start date."
            );
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            await approveOrder(order.id, {
                startDate: toIsoDate(currentStartDate),
                endDate: toIsoDate(currentEndDate),
            });

            setSuccess(
                "Order approved and project created successfully."
            );

            const refreshedOrder =
                await getOrderById(order.id);

            setSelectedOrder(refreshedOrder);
            setAdminStatus(refreshedOrder.status);
            setAdminStartDate(
                refreshedOrder.startDate
                    ? refreshedOrder.startDate.slice(0, 16)
                    : ""
            );
            setAdminEndDate(
                refreshedOrder.endDate
                    ? refreshedOrder.endDate.slice(0, 16)
                    : ""
            );

            await loadOrders();
        } catch (approveError) {
            console.error(approveError);

            setError(
                getErrorMessage(
                    approveError,
                    "Failed to approve order."
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    };



    const handleCancel = async (order: Order) => {
        if (!window.confirm("Cancel this order?")) {
            return;
        }

        try {
            setError("");
            setSuccess("");
            await cancelOrder(order.id);
            setSuccess("Order cancelled successfully.");
            await loadOrders();
        } catch (cancelError) {
            console.error(cancelError);
            setError(getErrorMessage(cancelError, "Failed to cancel order."));
        }
    };

    return (
        <div>
            <PageMeta title="Orders | CRM" description="Manage CRM orders" />
            <PageBreadcrumb pageTitle="Orders" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Orders</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{orders.length} order{orders.length === 1 ? "" : "s"}</p>
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

                {success && <div className="p-5 text-sm text-green-600">{success}</div>}
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
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Services</h3>
                                    <button type="button" onClick={addItem} className="text-sm font-medium text-brand-500 hover:text-brand-600">+ Add service</button>
                                </div>
                                {items.map((item, index) => (
                                    <div key={`${index}-${item.serviceId}`} className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
                                        <select
                                            value={item.serviceId}
                                            onChange={(event) => handleItemChange(index, "serviceId", event.target.value)}
                                            className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        >
                                            <option value="">Select a service</option>
                                            {services.map((service) => (
                                                <option key={service.id} value={service.id}>{service.name}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={item.quantity}
                                            onChange={(event) => handleItemChange(index, "quantity", event.target.value)}
                                            className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                        <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300">Remove</button>
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {isAdmin && (
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Start date
                                        <input type="datetime-local" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                                    </label>
                                )}
                                {isAdmin && (
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        End date
                                        <input type="datetime-local" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                                    </label>
                                )}
                            </div>

                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Notes
                                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white" placeholder="Add notes for this service request" />
                            </label>

                            {formError && <p className="text-sm text-red-500">{formError}</p>}
                            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
                                {isSubmitting ? "Creating..." : "Create Order"}
                            </button>
                        </form>
                    </div>
                )}

                {isLoading && <div className="p-5 text-sm text-gray-500">Loading orders...</div>}

                {!isLoading && !error && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Order ID</th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Client</th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Total Price</th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Payment</th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Created</th>
                                    <th className="px-5 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="px-5 py-4 text-xs text-gray-500">{order.id}</td>
                                        <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">{order.client.fname} {order.client.lname}</td>
                                        <td className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">{order.totalPrice}</td>
                                        <td className="px-5 py-4 text-sm font-medium text-brand-600">{order.status}</td>
                                        <td className="px-5 py-4 text-sm text-gray-500">{order.paymentStatus}</td>
                                        <td className="px-5 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <button type="button" onClick={() => handleViewDetails(order)} className="text-sm font-medium text-brand-500 hover:text-brand-600">Details</button>
                                                {isAdmin && order.status === "PENDING" && <button type="button" onClick={() => handleApprove(order)} className="text-sm font-medium text-green-600 hover:text-green-700">Approve</button>}
                                                {(isAdmin || user?.role === "CLIENT") && order.status === "PENDING" && <button type="button" onClick={() => handleCancel(order)} className="text-sm font-medium text-red-500 hover:text-red-600">Cancel</button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && <div className="p-5 text-sm text-gray-500">No orders found.</div>}
                    </div>
                )}
            </div>

            {(selectedOrder || isLoadingDetails) && (
                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                    {isLoadingDetails && <p className="text-sm text-gray-500">Loading order details...</p>}
                    {selectedOrder && !isLoadingDetails && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Order Details</h3>
                                <div className="flex items-center gap-3">
                                    {user?.role === "CLIENT" && selectedOrder.status === "PENDING" && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingPendingOrder((current) => !current)}
                                            className="text-sm font-medium text-brand-500 hover:text-brand-600"
                                        >
                                            {isEditingPendingOrder ? "Cancel Edit" : "Edit Order"}
                                        </button>
                                    )}
                                    <button type="button" onClick={() => setSelectedOrder(null)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">Order ID: {selectedOrder.id}</p>
                            {isEditingPendingOrder && user?.role === "CLIENT" ? (
                                <form onSubmit={handleUpdatePendingOrder} className="space-y-4">
                                    {editItems.map((item, index) => (
                                        <div key={`${item.serviceId}-${index}`} className="grid gap-3 md:grid-cols-[1fr_140px]">
                                            <select value={item.serviceId} onChange={(event) => handleEditItemChange(index, "serviceId", event.target.value)} className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                                {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
                                            </select>
                                            <input type="number" min="1" step="1" value={item.quantity} onChange={(event) => handleEditItemChange(index, "quantity", event.target.value)} className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes<textarea value={editNotes} onChange={(event) => setEditNotes(event.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white" placeholder="Order notes" /></label>
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{isSubmitting ? "Saving..." : "Save Order"}</button>
                                </form>
                            ) : (
                                <div className="space-y-2">
                                    {selectedOrder.orderItems.map((item) => (
                                        <div key={item.id} className="flex justify-between border-b border-gray-100 py-2 text-sm dark:border-gray-800">
                                            <span>{item.service.name} x {item.quantity}</span>
                                            <span>{item.unitPrice}</span>
                                        </div>
                                    ))}
                                    <div className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                                        <span className="ml-2 text-gray-500 dark:text-gray-400">{selectedOrder.notes || "No notes"}</span>
                                    </div>
                                </div>
                            )}
                            {isAdmin && (
                                <form onSubmit={handleAdminUpdate} className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Status
                                            <select value={adminStatus} onChange={(event) => setAdminStatus(event.target.value as OrderStatus)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                                {adminEditableStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                                            </select>
                                        </label>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Start date
                                            <input type="datetime-local" value={adminStartDate} onChange={(event) => setAdminStartDate(event.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                                        </label>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            End date
                                            <input type="datetime-local" value={adminEndDate} onChange={(event) => setAdminEndDate(event.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                                        </label>
                                    </div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Payment status
                                        <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as OrderPaymentStatus)} className="mt-1 block rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                            {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                                        </select>
                                    </label>
                                    <button type="submit" disabled={isSubmitting} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{isSubmitting ? "Saving..." : "Save Order"}</button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
