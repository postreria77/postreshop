type FormInputErrorProps = {
  error: string[] | string;
  name: string;
};

export default function FormInputError({ error, name }: FormInputErrorProps) {
  return (
    <p
      id={`error-${name}`}
      className="ml-2 inline -translate-y-1 text-[8px] text-red-500"
    >
      <span className="mr-1 inline-flex size-[10px] items-center justify-center rounded-full bg-red-500 text-light">
        i
      </span>
      {error}
    </p>
  );
}
