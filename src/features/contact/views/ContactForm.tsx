import { useContactFormViewModel } from "../viewModels/useContactFormViewModel";

export function ContactForm() {
  const { data, state, actions } = useContactFormViewModel();

  return (
    <div className="text-[#4C3E39]">
      <form onSubmit={actions.handleSubmit} className="flex flex-col space-y-6">
        {data.fields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label htmlFor={field.name} className="text-sm font-medium mb-1">
              {field.label}
            </label>

            {field.name === "message" ? (
              <textarea
                id={field.name}
                name={field.name}
                rows={field.rows ?? 2}
                value={state.form[field.name]}
                onChange={actions.handleChange(field.name)}
                className="w-full bg-transparent pb-2 border-b border-[#4C3E39]/40 focus:outline-none focus:border-[#4C3E39] transition-colors resize-none"
              />
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={state.form[field.name]}
                onChange={actions.handleChange(field.name)}
                className="w-full bg-transparent pb-2 border-b border-[#4C3E39]/40 focus:outline-none focus:border-[#4C3E39] transition-colors"
              />
            )}
          </div>
        ))}

        <div className="pt-4">
          <button
            type="submit"
            className="w-full text-center bg-[#4C3E39] text-[#E3DACF] py-4 rounded-xl text-base font-medium hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
          >
            {data.buttonLabel} &rarr;
          </button>
        </div>
      </form>
    </div>
  );
}
