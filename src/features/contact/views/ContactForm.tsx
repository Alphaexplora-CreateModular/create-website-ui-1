import { useContactFormViewModel } from "../viewModels/useContactFormViewModel";

export function ContactForm() {
  const { data, state, actions } = useContactFormViewModel();
  const isLoading = state.submissionState === "loading";
  const isSuccess = state.submissionState === "success";

  return (
    <div className="text-[#4C3E39]">
      {/* Success Message */}
      {isSuccess && state.successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ✓ {state.successMessage}
        </div>
      )}

      {/* Error Message */}
      {state.errorMessage && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          ✗ {state.errorMessage}
        </div>
      )}

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
                disabled={isLoading}
                className="w-full bg-transparent pb-2 border-b border-[#4C3E39]/40 focus:outline-none focus:border-[#4C3E39] transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={state.form[field.name]}
                onChange={actions.handleChange(field.name)}
                disabled={isLoading}
                className="w-full bg-transparent pb-2 border-b border-[#4C3E39]/40 focus:outline-none focus:border-[#4C3E39] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            )}
          </div>
        ))}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-center bg-[#4C3E39] text-[#E3DACF] py-4 rounded-xl text-base font-medium hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Sending...
              </>
            ) : (
              <>
                {data.buttonLabel} &rarr;
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
