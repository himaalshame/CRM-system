import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { useAuth } from "../../context/AuthContext";
import { getServices, type Service } from "../../services/service.service";
import {
    approveOrder,
    cancelOrder,
    getOrderById,
    updateOrder,
    type Order,
    type OrderPaymentStatus,
    type OrderStatus,
} from "../../services/order.service";
import {
    createEmptyItem,
    formatDate,
    formatMoney,
    formatOrderNumber,
    getErrorMessage,
    toDateTimeLocal,
    toFormItem,
    toIsoDate,
    toOrderPayload,
    type OrderItemForm,
} from "../../utils/orderForm";

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

const statusBadgeColor = (status: OrderStatus) => {
    if (status === "COMPLETED" || status === "APPROVED") return "success";
    if (status === "CANCELLED") return "error";
    if (status === "IN_PROGRESS") return "info";
    return "warning";
};

const paymentBadgeColor = (status: OrderPaymentStatus) => {
    if (status === "PAID") return "success";
    if (status === "PARTIALLY_PAID") return "warning";
    return "light";
};

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const isClient = user?.role === "CLIENT";

    const [order, setOrder] = useState<Order | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editItems, setEditItems] = useState<OrderItemForm[]>([]);
    const [editNotes, setEditNotes] = useState("");
    const [editError, setEditError] = useState("");
    const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus>("UNPAID");
    const [adminStatus, setAdminStatus] = useState<OrderStatus>("PENDING");
    const [adminStartDate, setAdminStartDate] = useState("");
    const [adminEndDate, setAdminEndDate] = useState("");

    const loadOrder = async () => {
        if (!id) {
            setError("Order not found.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            const details = await getOrderById(id);
            setOrder(details);
            setPaymentStatus(details.paymentStatus);
            setAdminStatus(details.status);
            setAdminStartDate(toDateTimeLocal(details.startDate));
            setAdminEndDate(toDateTimeLocal(details.endDate));
            setEditNotes(details.notes ?? "");
            setEditItems(
                details.orderItems.map((item) =>
                    toFormItem({
                        serviceId: item.serviceId,
                        quantity: item.quantity,
                    })
                )
            );
            setIsEditing(false);
        } catch (loadError) {
            console.error(loadError);
            setError(getErrorMessage(loadError, "Failed to load order details."));
            setOrder(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOrder();
    }, [id]);

    useEffect(() => {
        if (!isClient && !isAdmin) {
            return;
        }

        const loadServices = async () => {
            try {
                setServices(await getServices());
            } catch (loadError) {
                console.error(loadError);
            }
        };

        loadServices();
    }, [isAdmin, isClient]);

    const canEdit = isClient && order?.status === "PENDING";
    const canCancel =
        (isAdmin || isClient) && order?.status === "PENDING";

    const getServiceById = (serviceId: string) =>
        services.find((service) => service.id === serviceId);

    const getItemSubtotal = (item: OrderItemForm) => {
        const service = getServiceById(item.serviceId);
        if (!service) {
            return 0;
        }

        return Number(service.price) * (Number(item.quantity) || 0);
    };

    const editPreviewTotal = editItems.reduce(
        (sum, item) => sum + getItemSubtotal(item),
        0
    );

    const assignedEmployees = (order?.projects ?? [])
        .flatMap((project) => project.projectEmployees ?? [])
        .map((assignment) => ({
            id: assignment.employee.id,
            name: `${assignment.employee.fname} ${assignment.employee.lname}`.trim(),
            jobTitle: assignment.employee.jobTitle,
            role: assignment.role,
        }))
        .filter(
            (employee, index, list) =>
                list.findIndex((item) => item.id === employee.id) === index
        );

    const handleEditItemChange = (
        index: number,
        field: "serviceId" | "quantity",
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
        setEditError("");
    };

    const handleSaveEdit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
    
        if (!order || !canEdit) {
            return;
        }
    
        const filledItems = editItems.filter((item) => item.serviceId);
    
        if (
            filledItems.length === 0 ||
            filledItems.some(
                (item) =>
                    !Number.isInteger(item.quantity) || item.quantity < 1
            )
        ) {
            setEditError("Select a service and enter a quantity of at least 1.");
            return;
        }
    
        try {
            setIsSubmitting(true);
            setEditError("");
    
            await updateOrder(order.id, {
                items: toOrderPayload(filledItems),
                notes: editNotes.trim() || null,
            });
    
            // Get the latest complete order from backend
            const latestOrder = await getOrderById(order.id);
    
            setOrder(latestOrder);
    
            setEditItems(
                latestOrder.orderItems.map((item) =>
                    toFormItem({
                        serviceId: item.serviceId,
                        quantity: item.quantity,
                    })
                )
            );
    
            setEditNotes(latestOrder.notes ?? "");
            setIsEditing(false);
            setSuccess("Order updated successfully.");
        } catch (updateError) {
            console.error(updateError);
            setEditError(
                getErrorMessage(updateError, "Failed to update order.")
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAdminUpdate = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!order || !isAdmin) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            const updated = await updateOrder(order.id, {
                status: adminStatus,
                startDate: toIsoDate(adminStartDate) || null,
                endDate: toIsoDate(adminEndDate) || null,
                paymentStatus,
            });
            setOrder(updated);
            setSuccess("Order updated successfully.");
        } catch (updateError) {
            console.error(updateError);
            setError(getErrorMessage(updateError, "Failed to update order."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprove = async () => {
        if (!order) {
            return;
        }

        if (!adminStartDate || !adminEndDate) {
            setError("Please set start date and end date before approving the order.");
            return;
        }

        if (new Date(adminEndDate) < new Date(adminStartDate)) {
            setError("End date cannot be before start date.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");
            const updated = await approveOrder(order.id, {
                startDate: toIsoDate(adminStartDate),
                endDate: toIsoDate(adminEndDate),
            });
            setOrder(updated);
            setAdminStatus(updated.status);
            setAdminStartDate(toDateTimeLocal(updated.startDate));
            setAdminEndDate(toDateTimeLocal(updated.endDate));
            setSuccess("Order approved and project created successfully.");
        } catch (approveError) {
            console.error(approveError);
            setError(getErrorMessage(approveError, "Failed to approve order."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!order || !window.confirm("Cancel this order?")) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            const updated = await cancelOrder(order.id);
            setOrder(updated);
            setIsEditing(false);
            setSuccess("Order cancelled successfully.");
        } catch (cancelError) {
            console.error(cancelError);
            setError(getErrorMessage(cancelError, "Failed to cancel order."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <PageMeta title="Order Details | CRM" description="View CRM order details" />
            <PageBreadcrumb pageTitle="Order Details" />

            <div className="mb-4">
                <Link
                    to="/orders"
                    className="text-sm font-medium text-brand-500 hover:text-brand-600"
                >
                    ← Back to Orders
                </Link>
            </div>

            {isLoading && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
                    Loading order details...
                </div>
            )}

            {!isLoading && error && !order && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                    <p className="text-sm text-red-500">{error}</p>
                    <button
                        type="button"
                        onClick={() => navigate("/orders")}
                        className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                        Back to Orders
                    </button>
                </div>
            )}

            {order && (
                <div className="space-y-6">
                    {success && <p className="text-sm text-green-600">{success}</p>}
                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Order</p>
                                <h2 className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                                    {formatOrderNumber(order.id)}
                                </h2>
                                <p className="mt-1 text-xs text-gray-400">{order.id}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge color={statusBadgeColor(order.status)}>{order.status}</Badge>
                                <Badge color={paymentBadgeColor(order.paymentStatus)}>
                                    {order.paymentStatus}
                                </Badge>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Created {formatDate(order.createdAt) || "—"}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Services
                            </h3>
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isEditing && order) {
                                            setEditItems(
                                                order.orderItems.map((item) =>
                                                    toFormItem({
                                                        serviceId: item.serviceId,
                                                        quantity: item.quantity,
                                                    })
                                                )
                                            );
                                    
                                            setEditNotes(order.notes ?? "");
                                        }
                                    
                                        setIsEditing((current) => !current);
                                        setEditError("");
                                    }}
                                    className="text-sm font-medium text-brand-500 hover:text-brand-600"
                                >
                                    {isEditing ? "Cancel Edit" : "Edit Order"}
                                </button>
                            )}
                        </div>

                        {isEditing && canEdit ? (
                            <form onSubmit={handleSaveEdit} className="space-y-4">
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditItems((currentItems) => [
                                                ...currentItems,
                                                createEmptyItem(),
                                            ])
                                        }
                                        className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400"
                                    >
                                        + Add service
                                    </button>
                                </div>

                                {editItems.map((item, index) => {
                                    const selectedService = getServiceById(item.serviceId);
                                    return (
                                        <div
                                            key={item.rowId}
                                            className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50/70 p-4 md:grid-cols-[1fr_120px_140px_auto] dark:border-gray-800 dark:bg-white/[0.02]"
                                        >
                                            <label className="block text-xs font-medium text-gray-500">
                                                Service
                                                <select
                                                    value={item.serviceId}
                                                    onChange={(event) =>
                                                        handleEditItemChange(
                                                            index,
                                                            "serviceId",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                >
                                                    <option value="">Select a service</option>
                                                    {services
                                                        .filter((service) => service.isActive)
                                                        .map((service) => (
                                                            <option
                                                                key={service.id}
                                                                value={service.id}
                                                                disabled={editItems.some(
                                                                    (other, otherIndex) =>
                                                                        otherIndex !== index &&
                                                                        other.serviceId === service.id
                                                                )}
                                                            >
                                                                {service.name} — {formatMoney(service.price)}
                                                            </option>
                                                        ))}
                                                </select>
                                            </label>
                                            <label className="block text-xs font-medium text-gray-500">
                                                Quantity
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={item.quantity}
                                                    onChange={(event) =>
                                                        handleEditItemChange(
                                                            index,
                                                            "quantity",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                />
                                            </label>
                                            <div className="flex flex-col justify-end pb-2 text-sm text-gray-700 dark:text-gray-300">
                                                <span className="text-xs text-gray-500">Subtotal</span>
                                                <span className="font-semibold">
                                                    {selectedService
                                                        ? formatMoney(getItemSubtotal(item))
                                                        : "—"}
                                                </span>
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditItems((currentItems) =>
                                                            currentItems.length === 1
                                                                ? currentItems
                                                                : currentItems.filter(
                                                                    (_, itemIndex) => itemIndex !== index
                                                                )
                                                        )
                                                    }
                                                    disabled={editItems.length === 1}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-300"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="flex justify-end rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-white/[0.03]">
                                    <span className="font-medium text-gray-800 dark:text-white/90">
                                        Order total: {formatMoney(editPreviewTotal)}
                                    </span>
                                </div>

                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Notes
                                    <textarea
                                        value={editNotes}
                                        onChange={(event) => setEditNotes(event.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        placeholder="Order notes"
                                    />
                                </label>

                                {editError && <p className="text-sm text-red-500">{editError}</p>}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : "Save Order"}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-3">
                                {order.orderItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-xl border border-gray-100 p-4 dark:border-gray-800"
                                    >
                                        <div className="font-medium text-gray-800 dark:text-white/90">
                                            {item.service.name}
                                        </div>
                                        <div className="mt-2 grid gap-2 text-sm text-gray-500 sm:grid-cols-3">
                                            <span>Qty: {item.quantity}</span>
                                            <span>Unit Price: {formatMoney(item.unitPrice)}</span>
                                            <span>
                                                Subtotal: {formatMoney(Number(item.unitPrice) * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 dark:bg-white/[0.03] dark:text-white/90">
                                    <span>Total</span>
                                    <span>{formatMoney(order.totalPrice)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                            Order Information
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Status
                                </p>
                                <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
                                    {order.status}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Payment status
                                </p>
                                <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
                                    {order.paymentStatus}
                                </p>
                            </div>
                            {order.startDate && (
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Start date
                                    </p>
                                    <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
                                        {formatDate(order.startDate)}
                                    </p>
                                </div>
                            )}
                            {order.endDate && (
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        End date
                                    </p>
                                    <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
                                        {formatDate(order.endDate)}
                                    </p>
                                </div>
                            )}
                            {assignedEmployees.length > 0 && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Assigned employee
                                    </p>
                                    <div className="mt-1 space-y-1 text-sm text-gray-800 dark:text-white/90">
                                        {assignedEmployees.map((employee) => (
                                            <p key={employee.id}>
                                                {employee.name}
                                                {employee.jobTitle ? ` — ${employee.jobTitle}` : ""}
                                                {employee.role ? ` (${employee.role})` : ""}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {order.notes && !isEditing && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Notes
                                    </p>
                                    <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
                                        {order.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {(canCancel || isAdmin) && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                                Actions
                            </h3>
                            {isAdmin && (
                                <form onSubmit={handleAdminUpdate} className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Status
                                            <select
                                                value={adminStatus}
                                                onChange={(event) =>
                                                    setAdminStatus(event.target.value as OrderStatus)
                                                }
                                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                            >
                                                {adminEditableStatuses.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Start date
                                            <input
                                                type="datetime-local"
                                                value={adminStartDate}
                                                onChange={(event) => setAdminStartDate(event.target.value)}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                            />
                                        </label>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            End date
                                            <input
                                                type="datetime-local"
                                                value={adminEndDate}
                                                onChange={(event) => setAdminEndDate(event.target.value)}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                            />
                                        </label>
                                    </div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Payment status
                                        <select
                                            value={paymentStatus}
                                            onChange={(event) =>
                                                setPaymentStatus(event.target.value as OrderPaymentStatus)
                                            }
                                            className="mt-1 block rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        >
                                            {paymentStatuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Saving..." : "Save Order"}
                                        </button>
                                        {order.status === "PENDING" && (
                                            <button
                                                type="button"
                                                onClick={handleApprove}
                                                disabled={isSubmitting}
                                                className="rounded-lg bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600 disabled:opacity-50"
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}
                            {canCancel && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                    className={`${isAdmin ? "mt-4" : ""} rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:hover:bg-red-500/10`}
                                >
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
