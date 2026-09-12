import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { getServices, type Service } from "../../services/service.service";
import { useAuth } from "../../context/AuthContext";
import { addDraftItem } from "../../utils/orderDraft";

export default function PublicServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getServices();
        setServices(data.filter((service) => service.isActive));
      } catch {
        setError("Unable to load services.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const requestService = (serviceId: string) => {
    addDraftItem(serviceId);

    if (!isAuthenticated) {
      navigate(`/login?service=${serviceId}`);
      return;
    }

    navigate(`/orders?serviceId=${serviceId}`);
  };

  const formatServicePrice = (price: string) => {
    const amount = Number(price);
    return `EGP ${new Intl.NumberFormat("en-EG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  return (
    <div className="bg-gray-50 font-inter">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 0%, rgba(70, 95, 255, 0.14), transparent 45%), radial-gradient(circle at 10% 100%, rgba(122, 90, 248, 0.10), transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 shadow-sm backdrop-blur">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              Nexa CRM Services
            </div>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-gray-950 sm:text-6xl">
              Services{" "}
              <span className="bg-gradient-to-r from-brand-600 via-theme-purple-500 to-brand-400 bg-clip-text text-transparent">
                that scale your business
              </span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-normal leading-8 text-gray-600">
              Explore our handcrafted professional service solutions. Each
              service is delivered by our expert team with a clear scope,
              timeline, and measurable outcomes tailored to your business.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Services Available", value: services.length ? services.length : "—" },
                { label: "Avg. Delivery", value: "2-4 Weeks" },
                { label: "Client Satisfaction", value: "98%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    {stat.label}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-950">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES GRID ===== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="h-2 w-full rounded-full bg-gray-200 opacity-0 sm:opacity-100" />
                <div className="mt-6 flex justify-between">
                  <div className="h-4 w-20 rounded-full bg-gray-200" />
                  <div className="h-4 w-16 rounded-full bg-gray-200" />
                </div>
                <div className="mt-6 h-7 w-2/3 rounded bg-gray-200" />
                <div className="mt-4 h-20 rounded-2xl bg-gray-100" />
                <div className="mt-6 h-4 w-24 rounded bg-gray-200" />
                <div className="mt-2 h-8 w-40 rounded bg-gray-200" />
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <div className="h-11 flex-1 rounded-xl bg-gray-200" />
                  <div className="h-11 flex-1 rounded-xl bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-8 py-12 text-center shadow-sm">
            <div className="text-xl font-semibold text-red-700">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-md"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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
              Retry Loading
            </button>
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="rounded-3xl border border-gray-200 bg-white px-8 py-20 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 11V8C19 6.89543 18.1046 6 17 6H12.5858C12.051 6 11.5375 5.78929 11.1716 5.41421L9.58579 3.82843C9.21982 3.46345 8.70644 3.25 8.17157 3.25H5C3.89543 3.25 3 4.14543 3 5.25V18C3 19.1046 3.89543 20 5 20H19"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 15H22M19 12V18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-xl font-semibold text-gray-900">
              No services are currently available.
            </div>
            <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
              Please check back soon — new service offerings are added on a
              regular basis.
            </p>
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-gray-200/80 hover:shadow-2xl hover:shadow-gray-900/[0.06]"
              >
                {/* Top accent bar on hover */}
                <div
                  className="relative h-1.5 bg-gradient-to-r from-brand-500 via-theme-purple-500 to-brand-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    opacity: 0,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.opacity = "1")
                  }
                />

                <div className="flex flex-1 flex-col p-7">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-inset ring-brand-100">
                      Service
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700 ring-1 ring-inset ring-success-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                      Active
                    </span>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold leading-8 tracking-tight text-gray-950 transition-colors duration-300 group-hover:text-brand-600">
                      {service.name}
                    </h2>
                    <p className="mt-4 min-h-[84px] text-sm font-normal leading-6 text-gray-600">
                      {service.description ||
                        "A professional end-to-end service tailored to accelerate your operations and deliver measurable impact within a predictable timeline."}
                    </p>
                  </div>

                  {/* Feature bullets */}
                  <div className="mt-6 space-y-2 border-t border-gray-100 pt-5">
                    {[
                      "Dedicated project manager",
                      "Timeline & milestones",
                      "Progress dashboard access",
                    ].map((feat, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-gray-500"
                      >
                        <svg
                          className="text-success-500"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M5 12.5L9.5 17L19 7.5"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {feat}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Starting from
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold tracking-tight text-gray-950">
                        {formatServicePrice(service.price)}
                      </div>
                      <div className="text-xs font-medium text-gray-500">
                        per project
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to={`/explore/services/${service.id}`}
                      className="group/btn inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md"
                    >
                      <span>View Details</span>
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover/btn:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </div>

                  <div className="mt-0 sm:mt-3">
                    <button
                      onClick={() => requestService(service.id)}
                      className="group/btn w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm shadow-brand-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/25 active:translate-y-0"
                    >
                      <span>Request Service</span>
                      <svg
                        className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 12H19M19 12L13 6M19 12L13 18"
                          stroke="currentColor"
                          strokeWidth="2.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="relative overflow-hidden pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950 p-10 shadow-xl sm:p-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 15% 20%, rgba(70, 95, 255, 0.45), transparent 45%), radial-gradient(circle at 85% 80%, rgba(122, 90, 248, 0.35), transparent 45%)",
              }}
            />
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200 backdrop-blur">
                  Custom Project
                </span>
                <h3 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Need something tailored exactly to your workflow?
                </h3>
                <p className="mt-4 text-base leading-7 text-brand-100/90 sm:text-lg">
                  Don't see a perfect match? Let us design a custom service
                  package built around your team's specific requirements,
                  integrations, and delivery timelines.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-brand-900 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0"
                >
                  Talk to Sales
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 active:translate-y-0"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
