import { Link, useNavigate } from "react-router";
import { getServices, type Service } from "../../services/service.service";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { addDraftItem } from "../../utils/orderDraft";

export default function PublicHome() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const requestService = (serviceId: string) => {
    addDraftItem(serviceId);

    if (!isAuthenticated) {
      navigate(`/login?service=${serviceId}`);
      return;
    }

    navigate(`/orders?serviceId=${serviceId}`);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await getServices();
        setServices(data.filter((service) => service.isActive).slice(0, 3));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="font-inter bg-gray-50">
      {/* ===== HERO / TOP SECTION ===== */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(70, 95, 255, 0.12), transparent 45%), radial-gradient(circle at 85% 0%, rgba(122, 90, 248, 0.10), transparent 40%)",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-32">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 shadow-sm backdrop-blur">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              Nexa CRM
            </div>

            <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight text-gray-950 sm:text-6xl">
              Manage your{" "}
              <span className="relative inline-block bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                clients, orders, and projects
              </span>{" "}
              in one place.
            </h1>

            <p className="mt-6 max-w-2xl text-lg font-normal leading-8 text-gray-600">
              Turn daily operations into a clear workflow with one connected
              business system — built for teams who need clarity, visibility,
              and speed.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/explore/services"
                className="group inline-flex items-center gap-2 rounded-xl bg-brand-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/25 active:translate-y-0"
              >
                Explore Services
                <svg
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12H19M19 12L13 6M19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 font-semibold text-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md active:translate-y-0"
              >
                Get Started Free
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-8">
              {[
                { label: "Happy Clients", value: "500+" },
                { label: "Projects Delivered", value: "1.2k" },
                { label: "Years of Trust", value: "5+" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold tracking-tight text-gray-950">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero preview card */}
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-brand-200/50 blur-3xl" />
            <div className="absolute -bottom-8 -right-6 h-40 w-40 rounded-full bg-theme-purple-500/20 blur-3xl" />

            <div className="relative rounded-[2rem] border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50 p-6 shadow-xl shadow-gray-900/5 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-sm">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M3 12L6 6H18L21 12M3 12L6 18H18L21 12M3 12H21"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Dashboard Overview
                    </div>
                    <div className="text-xs text-gray-500">
                      Live workspace snapshot
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700 ring-1 ring-inset ring-success-100">
                  +18% ↑
                </span>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      title: "Revenue",
                      value: "EGP 84.5k",
                      accent: "from-brand-500/10 to-brand-500/0",
                      textColor: "text-brand-600",
                    },
                    {
                      title: "New Orders",
                      value: "142",
                      accent: "from-success-500/10 to-success-500/0",
                      textColor: "text-success-700",
                    },
                  ].map((metric) => (
                    <div
                      key={metric.title}
                      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {metric.title}
                      </div>
                      <div
                        className={`mt-2 text-2xl font-bold ${metric.textColor}`}
                      >
                        {metric.value}
                      </div>
                      <div
                        className={`absolute inset-0 -z-10 bg-gradient-to-br ${metric.accent} rounded-2xl`}
                      />
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        Monthly Growth
                      </div>
                      <div className="text-xs text-gray-500">
                        Last 4 months performance
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {["Jan", "Feb", "Mar", "Apr"].map((m, i) => (
                        <span
                          key={m}
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            i === 3
                              ? "bg-brand-50 text-brand-600"
                              : "text-gray-400"
                          }`}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[42, 58, 65, 88].map((v, i) => (
                      <div
                        key={v}
                        className="flex h-28 items-end gap-1"
                      >
                        <div
                          className="w-full rounded-t-xl bg-gradient-to-t from-brand-500 to-brand-400 transition-all duration-500 hover:from-brand-600 hover:to-brand-500"
                          style={{
                            height: `${v}%`,
                            opacity: 0.55 + i * 0.15,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gradient-to-r from-brand-50/70 via-white to-white p-4 shadow-sm">
                  <div className="flex -space-x-2">
                    {[
                      "bg-brand-500",
                      "bg-theme-purple-500",
                      "bg-success-500",
                      "bg-warning-500",
                    ].map((c, i) => (
                      <div
                        key={i}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm ${c}`}
                      >
                        {["A", "M", "S", "K"][i]}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      4 team members online
                    </div>
                    <div className="text-xs text-gray-500">
                      Collaborating right now
                    </div>
                  </div>
                  <div className="flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-success-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
              Platform Features
            </span>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              One integrated workspace covering every core part of your service
              business — no more scattered tools and missing context.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {[
              {
                title: "Client Management",
                text: "Create, organize, and grow your client relationships with full visibility into history and communications.",
                iconBg: "bg-brand-50",
                iconColor: "text-brand-600",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21M23 21V19C22.9993 17.1082 21.8344 15.4568 20.0655 14.636M16 3.13187C17.7252 3.55411 19 5.13196 19 7C19 9.20914 17.2091 11 15 11C12.7909 11 11 9.20914 11 7C11 5.13196 12.2748 3.55411 14 3.13187M9 7C9 9.20914 7.20914 11 5 11C2.79086 11 1 9.20914 1 7C1 4.79086 2.79086 3 5 3C7.20914 3 9 4.79086 9 7Z"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
              },
              {
                title: "Order Management",
                text: "Track requests, approvals, and fulfillment workflows with statuses, payments, and audit trail.",
                iconBg: "bg-blue-light-50",
                iconColor: "text-blue-light-600",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M9 12H15M9 16H13"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
              },
              {
                title: "Project Management",
                text: "Coordinate teams, deadlines, and delivery progress — assign roles, track status, keep clients in the loop.",
                iconBg: "bg-success-50",
                iconColor: "text-success-700",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M3 7C3 5.89543 3.89543 5 5 5H11C12.1046 5 13 5.89543 13 7V13C13 14.1046 12.1046 15 11 15H5C3.89543 15 3 14.1046 3 13V7ZM11 19V17M11 21V19M19 11H17M21 11H19M19 19C17.8954 19 17 18.1046 17 17V11C17 9.89543 17.8954 9 19 9H21C22.1046 9 23 9.89543 23 11V17C23 18.1046 22.1046 19 21 19H19ZM5 19H5.01M7 19H7.01"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
              },
              {
                title: "Team Management",
                text: "Keep employees, assignments, and responsibilities aligned with role-based access and clear permissions.",
                iconBg: "bg-orange-50",
                iconColor: "text-orange-600",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 17.8339 22.5267 16.7151 21.6999 15.8893C20.8731 15.0635 19.7624 14.5913 18.6 14.5913M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
              },
              {
                title: "Payment Tracking",
                text: "Monitor orders and payment activity from one place — from unpaid to paid, with partial payment support.",
                iconBg: "bg-success-50",
                iconColor: "text-theme-pink-500",
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 1V23M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-200/80 hover:shadow-xl hover:shadow-gray-900/[0.04]"
              >
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-110 ${feature.iconBg} ${feature.iconColor}`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm font-normal leading-6 text-gray-600">
                  {feature.text}
                </p>
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES SHOWCASE SECTION ===== */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                Services
              </span>
              <h2 className="mt-5 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
                Service solutions
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Browse the most requested professional services our clients
                love. Custom scoping available on request.
              </p>
            </div>
            <Link
              to="/explore/services"
              className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-brand-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:shadow-md"
            >
              View All Services
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {loading && (
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-3xl border border-gray-200 bg-gray-50 p-6"
                >
                  <div className="h-4 w-28 rounded-full bg-gray-200" />
                  <div className="mt-6 h-24 rounded-2xl bg-gray-200" />
                  <div className="mt-6 h-4 w-1/3 rounded bg-gray-200" />
                  <div className="mt-10 flex gap-3">
                    <div className="h-11 flex-1 rounded-xl bg-gray-200" />
                    <div className="h-11 flex-1 rounded-xl bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="mt-12 rounded-3xl border border-red-200 bg-red-50 px-8 py-10 text-center">
              <div className="text-lg font-semibold text-red-700">
                Unable to load services.
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 rounded-xl bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-gray-900/[0.06]"
                >
                  <div className="relative h-2 bg-gradient-to-r from-brand-500 via-theme-purple-500 to-brand-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="flex flex-1 flex-col p-7">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-inset ring-brand-100">
                        Service
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700 ring-1 ring-inset ring-success-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                        Active
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold leading-7 text-gray-900 group-hover:text-brand-600 transition-colors duration-300">
                      {service.name}
                    </h3>
                    <p className="mt-3 min-h-[72px] flex-1 text-sm font-normal leading-6 text-gray-600">
                      {service.description ||
                        "A professional business service tailored to accelerate your operations and deliver measurable impact."}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
                      <div>
                        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          Starting from
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          ${Number(service.price).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Link
                        to={`/explore/services/${service.id}`}
                        className="flex-1 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-800 transition-all duration-300 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                      >
                        View Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => requestService(service.id)}
                        className="flex-1 inline-flex items-center justify-center rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-brand-600 hover:shadow-md"
                      >
                        Request Service
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA / BOTTOM SECTION ===== */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(70, 95, 255, 0.4), transparent 45%), radial-gradient(circle at 85% 80%, rgba(122, 90, 248, 0.35), transparent 45%)",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200 backdrop-blur">
            Get Started Today
          </span>
          <h2 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to manage your business more efficiently?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-normal leading-8 text-brand-100/90">
            Bring your clients, services, orders, and projects into one
            connected workspace. Setup takes minutes, support is always human.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-brand-900 shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0"
            >
              Get Started Free
              <svg
                className="transition-transform duration-300 group-hover:translate-x-1"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              to="/explore/services"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 active:translate-y-0"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
