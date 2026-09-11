import { Link } from "react-router";
import { getServices, type Service } from "../../services/service.service";
import { useEffect, useState } from "react";

export default function PublicHome() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    <div className="font-inter">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-brand-600">
              Nexa CRM
            </div>
            <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight text-gray-950 sm:text-6xl">
              Manage your clients, orders, and projects in one place.
            </h1>
            <p className="mt-6 max-w-xl text-lg font-normal leading-8 text-gray-600">
              Turn daily operations into a clear workflow with one connected business system.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/services" className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-600">
                Explore Services
              </Link>
              <Link to="/register" className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-800 transition hover:bg-gray-50">
                Get Started
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <div className="grid gap-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Monthly Growth</span>
                  <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700">+18%</span>
                </div>
                <div className="mt-8 grid grid-cols-4 gap-3">
                  {[54, 72, 65, 88].map((v) => (
                    <div key={v} className="flex h-24 items-end">
                      <div className="w-full rounded-t-xl bg-brand-500" style={{ height: `${v}%` }}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-sm font-medium uppercase tracking-[0.2em] text-brand-500">Platform Features</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950">Everything your team needs</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {[
              ["Client Management", "Create, organize, and grow your client relationships."],
              ["Order Management", "Track requests, approvals, and fulfillment workflows."],
              ["Project Management", "Coordinate teams, deadlines, and delivery progress."],
              ["Team Management", "Keep employees, assignments, and responsibilities aligned."],
              ["Payment Tracking", "Monitor orders and payment activity from one place."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-semibold">✓</div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-3 text-sm font-normal leading-6 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-8">
            <div>
              <span className="text-sm font-medium uppercase tracking-[0.2em] text-brand-500">Services</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950">Service solutions</h2>
            </div>
            <Link to="/services" className="hidden text-sm font-medium text-brand-600 hover:text-brand-700 md:block">
              View All Services →
            </Link>
          </div>

          {loading && (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <div className="h-4 w-28 rounded bg-gray-200"></div>
                  <div className="mt-4 h-20 rounded bg-gray-200"></div>
                  <div className="mt-4 h-4 w-20 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-semibold text-red-700">
              Unable to load services.
            </div>
          )}

          {!loading && !error && (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <article key={service.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand-700">Service</span>
                    <span className="text-xs font-semibold text-success-700">Active</span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">{service.name}</h3>
                  <p className="mt-3 min-h-[72px] text-sm font-normal leading-6 text-gray-600">{service.description || "Business solution service."}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-sm font-medium text-gray-700">Starting from: ${Number(service.price).toFixed(2)}</span>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Link to={`/services/${service.id}`} className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-50">
                      View Details
                    </Link>
                    <Link to="/login" className="flex-1 rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-600">
                      Request Service
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-brand-950 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Ready to manage your business more efficiently?</h2>
          <p className="mt-4 text-gray-300 font-normal">Bring your clients, services, orders, and projects into one connected workspace.</p>
          <Link to="/register" className="mt-8 inline-flex rounded-xl bg-white px-6 py-3 font-semibold text-brand-900 transition hover:bg-gray-100">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
