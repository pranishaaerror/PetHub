export const EmptyState = ({ eyebrow = "PetHub", title, description, action }) => (
  <div className="rounded-[30px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-8 text-center shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
    <span className="pet-chip">{eyebrow}</span>
    <h3 className="mt-4 text-3xl font-bold">{title}</h3>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#6B6B6B]">{description}</p>
    {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
  </div>
);
