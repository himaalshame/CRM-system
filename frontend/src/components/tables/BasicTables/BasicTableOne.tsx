import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Modal } from "../../ui/modal";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";

interface Client {
  id: string;
  fname: string;
  lname: string;
  phone: string;
  address: string | null;
  isActive: boolean;
}

interface ClientForm {
  fname: string;
  lname: string;
  phone: string;
  address: string;
}

const emptyForm: ClientForm = {
  fname: "",
  lname: "",
  phone: "",
  address: "",
};

export default function BasicTableOne() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");

    const endpoint = showInactive
      ? "http://localhost:5000/clients/inactive"
      : "http://localhost:5000/clients";

    fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch clients");
        }

        return response.json();
      })
      .then((data: Client[]) => {
        setClients(data);
      })
      .catch(() => {
        setError("حدث خطأ أثناء تحميل العملاء");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [showInactive]);

  async function deleteClient(id: string) {
    const confirmed = window.confirm("هل تريد حذف هذا العميل؟");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/clients/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete client");
      }

      setClients((currentClients) =>
        currentClients.filter((client) => client.id !== id)
      );
    } catch {
      setError("حدث خطأ أثناء حذف العميل");
    }
  }

  async function restoreClient(id: string) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/clients/${id}/restore`,
        { method: "PATCH" }
      );

      if (!response.ok) {
        throw new Error("Failed to restore client");
      }

      setClients((currentClients) =>
        currentClients.filter((client) => client.id !== id)
      );
    } catch {
      setError("حدث خطأ أثناء استرجاع العميل");
    }
  }

  function openCreateForm() {
    setEditingClient(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEditForm(client: Client) {
    setEditingClient(client);
    setForm({
      fname: client.fname,
      lname: client.lname,
      phone: client.phone,
      address: client.address || "",
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    if (!saving) {
      setIsFormOpen(false);
    }
  }

  function updateForm(field: keyof ClientForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function saveClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.fname.trim() || !form.lname.trim() || !form.phone.trim()) {
      setError("الاسم الأول واسم العائلة ورقم الهاتف مطلوبة");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = editingClient
        ? `http://localhost:5000/api/clients/${editingClient.id}`
        : "http://localhost:5000/api/clients";
      const response = await fetch(url, {
        method: editingClient ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to save client");
      }

      const savedClient: Client = await response.json();

      setClients((currentClients) =>
        editingClient
          ? currentClients.map((client) =>
              client.id === savedClient.id ? savedClient : client
            )
          : [...currentClients, savedClient]
      );
      setIsFormOpen(false);
    } catch {
      setError("حدث خطأ أثناء حفظ بيانات العميل");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-gray-400">
        جاري تحميل العملاء...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]">
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
            {showInactive ? "العملاء غير النشطين" : "العملاء المسجلون"}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            إجمالي العملاء: {clients.length}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          hidden={showInactive}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          إضافة عميل
        </button>
        <button
          type="button"
          onClick={() => setShowInactive((current) => !current)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
        >
          {showInactive ? "العودة للعملاء النشطين" : "عرض المحذوفين"}
        </button>
      </div>

      <div className="overflow-x-auto">
      <Table>
        <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <TableRow>
            <TableCell isHeader className="px-5 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
              الاسم
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
              رقم الهاتف
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
              العنوان
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
              الحالة
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">
              الإجراءات
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {clients.length === 0 ? (
            <TableRow>
              <TableCell className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                لا يوجد عملاء حاليًا
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                {client.fname} {client.lname}
                </TableCell>

                <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {client.phone}
                </TableCell>

                <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {client.address || "-"}
                </TableCell>

                <TableCell className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      client.isActive
                        ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                        : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"
                    }`}
                  >
                    {client.isActive ? "نشط" : "غير نشط"}
                  </span>
                </TableCell>

                <TableCell className="px-5 py-4">
                  {showInactive ? (
                    <button
                      type="button"
                      onClick={() => restoreClient(client.id)}
                      className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                    >
                      استرجاع
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditForm(client)}
                        className="mr-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteClient(client.id)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                      >
                        حذف
                      </button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>

      <Modal isOpen={isFormOpen} onClose={closeForm} className="m-4 max-w-[600px]">
        <div className="rounded-3xl bg-white p-6 dark:bg-gray-900 sm:p-8">
          <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
            {editingClient ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
          </h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            أدخل بيانات العميل ثم اضغط حفظ.
          </p>

          <form onSubmit={saveClient} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>الاسم الأول</Label>
                <Input
                  value={form.fname}
                  onChange={(event) => updateForm("fname", event.target.value)}
                />
              </div>
              <div>
                <Label>اسم العائلة</Label>
                <Input
                  value={form.lname}
                  onChange={(event) => updateForm("lname", event.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>رقم الهاتف</Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
              />
            </div>

            <div>
              <Label>العنوان</Label>
              <Input
                value={form.address}
                onChange={(event) => updateForm("address", event.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}