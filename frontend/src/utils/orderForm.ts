import axios from "axios";

export type OrderItemForm = {
    rowId: string;
    serviceId: string;
    quantity: number;
};

export const createEmptyItem = (): OrderItemForm => ({
    rowId: crypto.randomUUID(),
    serviceId: "",
    quantity: 1,
});

export const toFormItem = (item: {
    serviceId: string;
    quantity: number;
}): OrderItemForm => ({
    rowId: crypto.randomUUID(),
    serviceId: item.serviceId,
    quantity: item.quantity,
});

export const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

export const formatDate = (date?: string | null) => {
    if (!date) {
        return "";
    }

    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
};

export const formatMoney = (value: number | string) =>
    `EGP ${new Intl.NumberFormat("en-EG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(value) || 0)}`;

export const toIsoDate = (value: string) =>
    value ? new Date(value).toISOString() : undefined;

export const toDateTimeLocal = (value?: string | null) =>
    value ? value.slice(0, 16) : "";

export const formatOrderNumber = (id: string) =>
    `#${id.slice(0, 8).toUpperCase()}`;

export const mergeFormItems = (items: OrderItemForm[]): OrderItemForm[] => {
    const merged = new Map<string, number>();

    items.forEach((item) => {
        if (!item.serviceId) {
            return;
        }

        const quantity =
            Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;
        merged.set(item.serviceId, (merged.get(item.serviceId) ?? 0) + quantity);
    });

    const nextItems = Array.from(merged.entries()).map(([serviceId, quantity]) => ({
        rowId: crypto.randomUUID(),
        serviceId,
        quantity,
    }));

    return nextItems.length > 0 ? nextItems : [createEmptyItem()];
};

export const toOrderPayload = (items: OrderItemForm[]) =>
    mergeFormItems(items)
        .filter((item) => item.serviceId)
        .map((item) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
        }));
