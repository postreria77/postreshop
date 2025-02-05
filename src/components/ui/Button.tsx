import { Spinner } from "@heroui/react";

type ButtonProps = {
  label: string;
  isPending: boolean;
};

export default function({ isPending, label }: ButtonProps) {
  return (
    <button
      type="submit"
      className={`${isPending ? "bg-brand bg-opacity-25" : "bg-light bg-opacity-5"} relative mt-4 w-full rounded-sm border border-light border-opacity-25 py-3 text-center leading-none transition duration-75 ease-out ~px-2/4 hover:border-brand hover:border-opacity-50 hover:bg-brand hover:bg-opacity-15 hover:text-brand-2 focus:outline-brand`}
    >
      {isPending ? (
        <div className="mr-4 flex items-center justify-center gap-2">
          <Spinner size="sm" color="current" />
          <span>Procesando...</span>
        </div>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}
