type ButtonProps = {
  label: string;
  onClick: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
};

export function Button(props: ButtonProps) {
  return (
    <>
      <button type={props.type} onClick={props.onClick} disabled={props.disabled} className={`inline-flex rounded-3xl h-12 items-center justify-center gap-2 whitespace-nowrap border px-6 text-sm font-medium tracking-wide text-emerald-500 transition duration-300 hover:border-emerald-600 hover:text-emerald-600 focus:border-emerald-700 focus:text-emerald-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-emerald-300 disabled:text-emerald-300 disabled:shadow-none ${props.hidden ? 'hidden md:block md:invisible': 'md:visible'} ${props.className}`}>
        <span>{props.label}</span>
      </button>
    </>
  );
}