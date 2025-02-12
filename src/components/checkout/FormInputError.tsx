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

export function FormSuccessMessage({ message }: { message: string }) {
  return (
    <p
      id="form-success"
      className="ml-2 inline -translate-y-1 text-[8px] text-green-500"
    >
      <span className="mr-1 inline-flex size-[10px] items-center justify-center rounded-full bg-green-500 text-light">
        i
      </span>
      {message}
    </p>
  );
}
