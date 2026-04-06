import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Clock3, PlusCircle, Sparkles, WalletCards } from "lucide-react";
import { toast } from "react-toastify";
import { useCreateServices, useServices } from "../apis/services/hooks";
import {Button} from "../components/Button";
const categoryOptions = [
  { value: "vet", label: "Vet Consultation" },
  { value: "grooming", label: "Grooming" },
  { value: "vaccination", label: "Vaccination" },
  { value: "dental", label: "Dental" },
];

export const AdminServicesPage = () => {
  const queryClient = useQueryClient();
  const { data: servicesResponse, isLoading } = useServices();
  const { mutateAsync: createService, isPending } = useCreateServices();
  const services = servicesResponse?.data ?? [];
  const [form, setForm] = useState({
    serviceName: "",
    description: "",
    price: "",
    durationMinutes: "45",
    category: "vet",
  });

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await createService({
        serviceName: form.serviceName.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes),
        category: form.category,
      });
      await queryClient.invalidateQueries({ queryKey: ["get-services"] });
      setForm({
        serviceName: "",
        description: "",
        price: "",
        durationMinutes: "45",
        category: "vet",
      });
      toast.success("Service created successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="pet-page">
      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="pet-card p-6 md:p-8">
          <span className="pet-chip">Service Creation</span>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Add premium services that appear instantly in booking.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B6B6B]">
            This replaces the older disconnected admin form with the same PetHub visual system and a
            real backend-protected service flow.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Service name</span>
              <input
                value={form.serviceName}
                onChange={handleChange("serviceName")}
                className="w-full rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                placeholder="Premium dental refresh"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Description</span>
              <textarea
                value={form.description}
                onChange={handleChange("description")}
                rows={4}
                className="w-full rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                placeholder="A gentle premium service description for pet parents."
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Price (NPR)</span>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange("price")}
                  className="w-full rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                  placeholder="1500"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Duration (min)</span>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={form.durationMinutes}
                  onChange={handleChange("durationMinutes")}
                  className="w-full rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Category</span>
                <select
                  value={form.category}
                  onChange={handleChange("category")}
                  className="w-full rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <Button type="submit" disabled={isPending} className="pet-button-primary gap-2">
              <PlusCircle className="h-4 w-4" />
              {isPending ? "Creating service..." : "Create service"}
            </Button>
          </form>
        </div>

        <div className="pet-card p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="pet-chip">Live Services</span>
              <h2 className="mt-4 text-3xl font-bold">Current booking catalog</h2>
            </div>
            <Sparkles className="h-7 w-7 text-[#F5A623]" />
          </div>

          <div className="mt-8 grid gap-4">
            {isLoading ? (
              <div className="rounded-[24px] bg-[#FFF8EE] p-5 text-sm text-[#6B6B6B] shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
                Loading services...
              </div>
            ) : services.length ? (
              services.map((service) => (
                <div
                  key={service._id}
                  className="rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-bold">{service.serviceName}</p>
                      <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">{service.description}</p>
                    </div>
                    <span className="pet-chip capitalize">{service.category}</span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                      <p className="flex items-center gap-2 text-sm text-[#8B7B66]">
                        <WalletCards className="h-4 w-4 text-[#F5A623]" />
                        Price
                      </p>
                      <p className="mt-1 text-lg font-semibold">NPR {service.price}</p>
                    </div>
                    <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                      <p className="flex items-center gap-2 text-sm text-[#8B7B66]">
                        <Clock3 className="h-4 w-4 text-[#F5A623]" />
                        Duration
                      </p>
                      <p className="mt-1 text-lg font-semibold">{service.durationMinutes} minutes</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] bg-[#FFF8EE] p-5 text-sm text-[#6B6B6B] shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
                No services are in the live catalog yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
