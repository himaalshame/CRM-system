import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getServices, type Service } from "../../services/service.service";
import { useAuth } from "../../context/AuthContext";
import { addDraftItem } from "../../utils/orderDraft";

export default function PublicServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getServices();
        const found = data.find((item) => item.id === id && item.isActive);
        setService(found || null);
      } catch {
        setError("Unable to load services.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleRequest = () => {
    if (!id) {
      return;
    }

    addDraftItem(id);

    if (!isAuthenticated) {
      navigate(`/login?service=${id}`);
      return;
    }

    navigate(`/orders?serviceId=${id}`);
  };

  const formatServicePrice = (price: string) => {
    const amount = Number(price);
    return `EGP ${new Intl.NumberFormat("en-EG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 h-4 w-72 animate-pulse rounded bg-gray-200" />

          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
            <aside className="animate-pulse rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="h-4 w-28 rounded-full bg-gray-200" />
              <div className="mt-8 h-10 w-10/12 rounded bg-gray-200" />
              <div className="mt-8 h-1 w-full rounded-full bg-gray-100" />
              <div className="mt-8 h-4 w-24 rounded bg-gray-200" />
              <div className="mt-2 h-10 w-36 rounded bg-gray-200" />
              <div className="mt-10 h-12 w-full rounded-xl bg-gray-200" />
            </aside>

            <article className="animate-pulse space-y-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm lg:p-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-4">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-10 w-2/3 rounded bg-gray-200" />
                </div>
                <div className="h-7 w-20 rounded-full bg-gray-200" />
              </div>
              <div className="h-40 rounded-2xl bg-gray-100" />
              <div className="h-28 rounded-2xl bg-gray-100" />
            </article>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.63252 18.3282 1.53212 18.715 1.5377 19.11C1.54329 19.505 1.65461 19.8877 1.85958 20.2101C2.06454 20.5325 2.35581 20.7818 2.69914 20.9318C3.04247 21.0818 3.4228 21.1268 3.795 21.06L20.21 21.06C20.5822 21.1268 20.9625 21.0818 21.3059 20.9318C21.6492 20.7818 21.9404 20.5325 22.1454 20.2101C22.3504 19.8877 22.4617 19.505 22.4673 19.11C22.4729 18.715 22.3725 18.3282 22.185 18L13.71 3.86C13.5216 3.53486 13.2509 3.25489 12.9149 3.04398C12.5789 2.83306 12.1969 2.7 11.8 2.7C11.4031 2.7 11.0211 2.83306 10.6851 3.04398C10.3491 3.25489 10.0784 3.53486 9.89 3.86Z"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-700 sm:text-3xl">
              {error}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-red-600/80">
              We couldn't load this service at the moment. Please check your
              connection and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-500 px-7 py-3.5 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-md active:translate-y-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.4853 3 20.2286 6.25022 20.8759 10.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 4V10H15"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Try Again
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 11V8C19 6.89543 18.1046 6 17 6H12.5858C12.051 6 11.5375 5.78929 11.1716 5.41421L9.58579 3.82843C9.21982 3.46345 8.70644 3.25 8.17157 3.25H5C3.89543 3.25 3 4.14543 3 5.25V18C3 19.1046 3.89543 20 5 20H19"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Service not available
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg leading-7 text-gray-600">
              This service is currently inactive or doesn't exist. Browse our
              active offerings to continue.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/explore/services"
                className="group inline-flex items-center gap-2 rounded-xl bg-brand-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/25 active:translate-y-0"
              >
                <span>Back to All Services</span>
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
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* ===== BREADCRUMB / BACK ===== */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium transition hover:bg-gray-100 hover:text-gray-900"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12L12 3L21 12M5 10V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20V10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            to="/explore/services"
            className="rounded-lg px-2 py-1 font-medium transition hover:bg-gray-100 hover:text-gray-900"
          >
            Services
          </Link>
          <span className="text-gray-300">/</span>
          <span className="rounded-lg px-2 py-1 font-semibold text-gray-900 line-clamp-1">
            {service.name}
          </span>
        </nav>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          {/* ===== SIDEBAR / PRICING CARD ===== */}
          <aside className="sticky top-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="h-2 bg-gradient-to-r from-brand-500 via-theme-purple-500 to-brand-400" />
            <div className="p-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                Nexa CRM Service
              </span>

              <div className="mt-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                  You are viewing
                </div>
                <div className="mt-2 text-3xl font-bold tracking-tight leading-tight text-gray-950">
                  {service.name}
                </div>
              </div>

              <div className="mt-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-success-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-success-700 ring-1 ring-inset ring-success-100">
                  <span className="relative inline-flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
                  </span>
                  Available
                </span>
              </div>

              <div className="mt-8 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 via-white to-white p-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Price
                </div>
                <div className="mt-2 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
                  {formatServicePrice(service.price)}
                </div>
              </div>

              <button
                onClick={handleRequest}
                className="group/btn mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/25 active:translate-y-0"
              >
                <span>Request Service</span>
                <svg
                  className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
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
              </button>

              <Link
                to="/explore/services"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md active:translate-y-0"
              >
                ← Back to All Services
              </Link>
            </div>
          </aside>

          {/* ===== MAIN CONTENT ===== */}
          <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="relative border-b border-gray-100 p-8 lg:p-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 100% 0%, rgba(70, 95, 255, 0.10), transparent 45%)",
                }}
              />
              <div className="relative flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
                    Service Overview
                  </div>
                  <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-gray-950 sm:text-5xl">
                    {service.name}
                  </h1>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-success-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-success-700 ring-1 ring-inset ring-success-100">
                  <span className="relative inline-flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
                  </span>
                  Accepting Requests
                </span>
              </div>
            </div>

            <div className="space-y-8 p-8 lg:p-10">
              {/* ===== DESCRIPTION ===== */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 8H17M7 12H13M7 16H17M4 4H20C20.5304 4 21 4.46957 21 5V19C21 19.5304 20.5304 20 20 20H4C3.46957 20 3 19.5304 3 19V5C3 4.46957 3.46957 4 4 4Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-950">
                    About this service
                  </h2>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 via-white to-white p-6 sm:p-7">
                  <p className="leading-8 text-base font-normal text-gray-700 sm:text-lg sm:leading-9">
                    {service.description?.trim()
                      ? service.description
                      : "No description has been provided for this service yet."}
                  </p>
                </div>
              </div>

              {/* ===== KEY DETAILS (real fields only) ===== */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-theme-purple-50 text-theme-purple-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-950">
                    Service details
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Price
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                      {formatServicePrice(service.price)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Availability
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                      {service.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== CTA ACTIONS ===== */}
              <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-brand-50/60 via-white to-white p-8 sm:p-10">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 90% 100%, rgba(70, 95, 255, 0.10), transparent 45%)",
                  }}
                />
                <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                  <div className="max-w-xl">
                    <h3 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                      Ready to request {service.name}?
                    </h3>
                    <p className="mt-3 text-base leading-7 text-gray-600 sm:text-lg">
                      Submit a request to proceed with this service.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleRequest}
                      className="group/btn inline-flex items-center gap-2 rounded-xl bg-brand-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/25 active:translate-y-0"
                    >
                      <span>Request Service</span>
                      <svg
                        className="transition-transform duration-300 group-hover/btn:translate-x-1"
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
                    </button>
                    <Link
                      to="/explore/services"
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 font-semibold text-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md active:translate-y-0"
                    >
                      ← Back to All Services
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
