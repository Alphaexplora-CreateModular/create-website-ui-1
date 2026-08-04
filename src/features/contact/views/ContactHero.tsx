import { useContactHeroViewModel } from "../viewModels/useContactHeroViewModel";

export function ContactHero() {
  const { data } = useContactHeroViewModel();

  return (
    <div className="flex flex-col justify-between">
      <div>
        <h1 className="text-xl md:text-9xl font-black text-[#4C3E39] leading-none tracking-tight">
          {data.title[0]}
          <br />
          {data.title[1]}
        </h1>
      </div>

      <div className="mt-0 grid grid-cols-2 gap-x-8 gap-y-6 text-[#4C3E39]">
        {data.details.map((detail) => (
          <div key={detail.label}>
            <p className="font-semibold text-lg">{detail.label}</p>
            <p className="text-gray-700">{detail.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
