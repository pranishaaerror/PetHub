import { ImagePlus, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { Button } from "./Button";

export const UploadPetPhotoCard = ({
  photoPreview,
  onFileSelect,
  onClear,
  helperText = "Drag in a photo or choose one from your device.",
}) => (
  <div className="rounded-[30px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-5 shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className="pet-chip">Pet Photo</span>
        <h3 className="mt-4 text-2xl font-bold">Upload your companion’s sweetest look</h3>
      </div>
      <ImagePlus className="h-7 w-7 text-[#F5A623]" />
    </div>

    <label className="mt-5 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-[#F3CA87] bg-white/80 p-6 text-center transition hover:bg-white">
      {photoPreview ? (
        <img
          src={photoPreview}
          alt="Pet preview"
          className="h-52 w-52 rounded-[26px] object-cover shadow-[0_20px_40px_rgba(45,45,45,0.12)]"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-[30px] bg-[#FFF0D6] text-[#F5A623]">
          <UploadCloud className="h-10 w-10" />
        </div>
      )}

      <p className="mt-6 text-lg font-semibold text-[#2D2D2D]">
        {photoPreview ? "Looking adorable already" : "Drop a pet photo here"}
      </p>
      <p className="mt-2 max-w-md text-sm leading-7 text-[#6B6B6B]">{helperText}</p>
      <span className="pet-button-secondary mt-5 gap-2">
        <Sparkles className="h-4 w-4 text-[#F5A623]" />
        {photoPreview ? "Replace photo" : "Choose photo"}
      </span>

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onFileSelect}
      />
    </label>

    {photoPreview ? (
      <Button type="button" onClick={onClear} className="pet-button-secondary mt-4 gap-2">
        <Trash2 className="h-4 w-4 text-[#F5A623]" />
        Remove photo
      </Button>
    ) : null}
  </div>
);
