export type OrderDraftItem = {
    serviceId: string;
    quantity: number;
};

const STORAGE_KEY = "crm_order_draft_items";

const normalizeQuantity = (quantity: number) =>
    Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

export const getDraftItems = (): OrderDraftItem[] => {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) {
            return [];
        }

        const merged = new Map<string, number>();

        parsed.forEach((item) => {
            if (
                !item ||
                typeof item !== "object" ||
                typeof (item as OrderDraftItem).serviceId !== "string" ||
                !(item as OrderDraftItem).serviceId
            ) {
                return;
            }

            const serviceId = (item as OrderDraftItem).serviceId;
            const quantity = normalizeQuantity(Number((item as OrderDraftItem).quantity));
            merged.set(serviceId, (merged.get(serviceId) ?? 0) + quantity);
        });

        return Array.from(merged.entries()).map(([serviceId, quantity]) => ({
            serviceId,
            quantity,
        }));
    } catch {
        return [];
    }
};

export const setDraftItems = (items: OrderDraftItem[]) => {
    const merged = new Map<string, number>();

    items.forEach((item) => {
        if (!item.serviceId) {
            return;
        }

        const quantity = normalizeQuantity(Number(item.quantity));
        merged.set(item.serviceId, (merged.get(item.serviceId) ?? 0) + quantity);
    });

    const nextItems = Array.from(merged.entries()).map(([serviceId, quantity]) => ({
        serviceId,
        quantity,
    }));

    if (nextItems.length === 0) {
        sessionStorage.removeItem(STORAGE_KEY);
        return nextItems;
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    return nextItems;
};

export const addDraftItem = (serviceId: string, quantity = 1) => {
    if (!serviceId) {
        return getDraftItems();
    }

    return setDraftItems([...getDraftItems(), { serviceId, quantity: normalizeQuantity(quantity) }]);
};

export const ensureDraftItem = (serviceId: string) => {
    const items = getDraftItems();
    if (items.some((item) => item.serviceId === serviceId)) {
        return items;
    }

    return addDraftItem(serviceId, 1);
};

export const clearDraftItems = () => {
    sessionStorage.removeItem(STORAGE_KEY);
};
