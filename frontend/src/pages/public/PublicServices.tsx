import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { getServices, type Service } from "../../services/service.service";
import { useAuth } from "../../context/AuthContext";

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
    <div className="bg-[#F8FAFC] font-inter">
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-sm font-medium uppercase tracking-[0.2em] text-brand-500">Nexa CRM Services</span>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-gray-950 sm:text-6xl">Services</h1>
            <p className="mt-6 text-lg font-normal leading-8 text-gray-600">
              Explore our services and find the right solution for your business.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="mt-6 h-6 w-2/3 rounded bg-gray-200"></div>
                <div className="mt-4 h-20 rounded bg-gray-100"></div>
                <div className="mt-4 h-4 w-20 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
            <div className="text-lg font-semibold text-red-700">{error}</div>
            <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white hover:bg-brand-600">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center">
            <div className="text-lg font-semibold text-gray-900">No services are currently available.</div>
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article key={service.id} className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand-700">Service</span>
                  <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-success-700">Active</span>
                </div>

                <div className="mt-6">
                  <h2 className="text-2xl font-semibold text-gray-950">{service.name}</h2>
                  <p className="mt-4 min-h-[84px] text-sm font-normal leading-6 text-gray-600">
                    {service.description || "Professional service designed to accelerate your operations."}
                  </p>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-5">
                  <div className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Starting from
                  </div>
                  <div className="text-3xl font-semibold leading-tight text-gray-950">
                    {formatServicePrice(service.price)}
                  </div>
                </div>

                <div className="mt-7 flex items-center gap-3">
                  <Link to={`/services/${service.id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50">
                    <span>View Details</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <div className="mt-3">
                  <button onClick={() => requestService(service.id)} className="w-full rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-600">
                    Request Service
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
