import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Settings() {
  return (
    <div>
      <PageMeta title="Settings | CRM" description="Manage account and system settings" />
      <PageBreadcrumb pageTitle="Settings" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 p-5 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account preferences and system configuration.
          </p>
        </div>

        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="font-medium text-gray-800 dark:text-white/90">
                Profile
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your personal information and contact details.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="font-medium text-gray-800 dark:text-white/90">
                Security
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Change your password and manage authentication settings.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="font-medium text-gray-800 dark:text-white/90">
                Preferences
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Customize appearance, notifications, and display options.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Settings modules will be implemented in a later phase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
