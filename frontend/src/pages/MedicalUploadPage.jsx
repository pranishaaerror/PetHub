import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileUp, MailCheck, ShieldCheck, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCreateEngagementRequest } from "../apis/engagements/hooks";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";

export const MedicalUploadPage = () => {
  const { userProfile } = useAuth();
  const { mutateAsync: createRequest, isPending } = useCreateEngagementRequest();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    petName: "",
    summary: "",
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName: current.fullName || userProfile?.displayName || "",
      email: current.email || userProfile?.email || "",
      contactNumber: current.contactNumber || userProfile?.contactNumber || userProfile?.phoneNumber || "",
    }));
  }, [userProfile]);

  const fileNames = useMemo(() => selectedFiles.map((file) => file.name), [selectedFiles]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.fullName.trim() || !form.email.trim() || !form.contactNumber.trim()) {
      toast.error("Full name, email, and contact number are required.");
      return;
    }

    if (!form.petName.trim() && !fileNames.length) {
      toast.error("Add a pet name or select at least one file.");
      return;
    }

    try {
      const response = await createRequest({
        type: "medical-upload",
        fullName: form.fullName,
        email: form.email,
        contactNumber: form.contactNumber,
        petName: form.petName,
        message: form.summary,
        metadata: {
          fileNames,
          petHubId: userProfile?.petHubId ?? null,
        },
      });

      toast.success(response.data?.message || "Medical upload request sent.");
      setIsSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="pet-page">
      <section className="pet-card overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="pet-rise-in">
            <Link to="/medical-records" className="pet-button-secondary gap-2">
              <ArrowLeft className="h-4 w-4 text-[#F5A623]" />
              Back to records
            </Link>

            <span className="pet-chip mt-6">Document Upload</span>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight">
              Send your medical documents into a clean, trackable PetHub flow.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B6B6B]">
              Choose the files you plan to share, add a short summary, and PetHub will log the
              request and send a confirmation email so the care desk can follow up quickly.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Logical handoff",
                  detail: "Every upload note is saved as a request instead of disappearing into a dead button.",
                  icon: ShieldCheck,
                },
                {
                  title: "Email confirmation",
                  detail: "You receive a clear receipt after sending the document request.",
                  icon: MailCheck,
                },
                {
                  title: "Warm presentation",
                  detail: "The upload flow matches the premium PetHub look and keeps the experience soft.",
                  icon: UploadCloud,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-[#F5A623] shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-lg font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pet-rise-in [animation-delay:140ms]">
            <form
              onSubmit={handleSubmit}
              className="rounded-[32px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-6 shadow-[0_22px_45px_rgba(45,45,45,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="pet-chip">Upload Center</span>
                  <h2 className="mt-4 text-2xl font-bold">Tell us what you are sending</h2>
                </div>
                <FileUp className="h-7 w-7 text-[#F5A623]" />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Full name</span>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Contact number</span>
                  <input
                    type="tel"
                    value={form.contactNumber}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contactNumber: event.target.value }))
                    }
                    placeholder="+977 98XXXXXXXX"
                    className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Pet name</span>
                  <input
                    type="text"
                    value={form.petName}
                    onChange={(event) => setForm((current) => ({ ...current, petName: event.target.value }))}
                    placeholder="Which pet are these documents for?"
                    className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Upload summary</span>
                <textarea
                  value={form.summary}
                  onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                  placeholder="Add discharge notes, lab context, prescription details, or anything the care desk should know."
                  rows={4}
                  className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                />
              </label>

              <div className="mt-4 rounded-[24px] border border-dashed border-[#F3CA87] bg-white/80 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#2D2D2D]">Choose files for this request</p>
                    <p className="mt-1 text-sm text-[#6B6B6B]">
                      File names are included in your confirmation email and request log.
                    </p>
                  </div>
                  <label className="pet-button-secondary cursor-pointer gap-2">
                    <UploadCloud className="h-4 w-4 text-[#F5A623]" />
                    Select files
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
                    />
                  </label>
                </div>

                {fileNames.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {fileNames.map((fileName) => (
                      <span key={fileName} className="pet-chip">
                        {fileName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[#8B7B66]">No files selected yet.</p>
                )}
              </div>

              <Button type="submit" disabled={isPending} className="pet-button-primary mt-6 w-full gap-2">
                <FileUp className="h-4 w-4" />
                {isPending ? "Sending request..." : "Send to PetHub care desk"}
              </Button>

              {isSubmitted ? (
                <div className="mt-4 rounded-[24px] bg-[#FFF8EE] p-4 text-sm leading-7 text-[#5B544C] shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                  Your upload request is saved. Check your email for the PetHub confirmation receipt.
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
