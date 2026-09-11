import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getServices, type Service } from "../../services/service.service";
import { useAuth } from "../../context/AuthContext";

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
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="animate-pulse rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="h-5 w-28 rounded bg-gray-200"></div>
          <div className="mt-5 h-10 w-2/3 rounded bg-gray-200"></div>
          <div className="mt-6 h-28 rounded bg-gray-100"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
          <h1 className="text-2xl font-bold text-red-700">Unable to load services.</h1>
          <button onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-brand-500 px-6 py-3 font-bold text-white">
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!service) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-gray-950">Service not available</h1>
          <p className="mt-4 text-gray-600 font-normal">No services are currently available.</p>
          <Link to="/services" className="mt-6 inline-flex rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white">
            Back to Services
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#F8FAFC] font-inter">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <span className="rounded-full bg-brand-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-brand-700">Nexa CRM</span>
            <div className="mt-8">
              <div className="text-sm font-medium uppercase tracking-wide text-gray-500">Service</div>
              <div className="mt-2 text-4xl font-bold text-gray-950">{service.name}</div>
            </div>
            <div className="mt-8 border-t border-gray-100 pt-8">
              <div className="text-sm font-medium uppercase tracking-wide text-gray-500">Starting from</div>
              <div className="mt-2 text-4xl font-semibold text-gray-950">{formatServicePrice(service.price)}</div>
            </div>
            <button onClick={handleRequest} className="mt-8 w-full rounded-xl bg-brand-500 px-6 py-4 text-center font-semibold text-white transition hover:bg-brand-600">
              Request Service
            </button>
          </aside>

          <article className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-sm font-medium uppercase tracking-[0.2em] text-brand-500">Service Overview</span>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">{service.name}</h1>
              </div>
              <span className="rounded-full bg-success-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-success-700">Active</span>
            </div>

            <div className="mt-8 rounded-2xl bg-gray-50 p-6">
              <div className="text-lg font-semibold text-gray-900">Description</div>
              <p className="mt-4 leading-7 font-normal text-gray-600">
                {service.description || "Our team will help configure and deliver an end-to-end service experience for your organization."}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-5">
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Service Type</div>
                <div className="mt-2 font-semibold text-gray-900">Business Solution</div>
              </div>
              <div className="rounded-2xl border border-gray-200 p-5">
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Delivery Model</div>
                <div className="mt-2 font-semibold text-gray-900">Guided Implementation</div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={handleRequest} className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600">
                Request Service
              </button>
              <Link to="/services" className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-800 transition hover:bg-gray-50">
                Back to Services
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
