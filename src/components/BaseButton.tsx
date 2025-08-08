// interface IBaseButtonProps {
//   label?: string;
//   className?: string;
//   onClick?: () => void;
//   children?: React.ReactNode;
// }

// const BaseButton: React.FC<IBaseButtonProps> = ({
//   label,
//   className,
//   onClick,
//   children,
// }) => {
//   return (
//     <button
//       className={`p-3 text-white font-bold text-xl bg-primaryColorLogoOrange rounded-full ${className}`}
//       onClick={onClick}
//     >
//       {label || children}
//     </button>
//   );
// };

// export default BaseButton;

interface IBaseButtonProps {
  label?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

const BaseButton: React.FC<IBaseButtonProps> = ({
  label,
  className,
  onClick,
  children,
  disabled,
}) => {
  return (
    <button
      className={`py-2 px-6 cursor-pointer inline-flex justify-center items-center border transition-colors duration-150 rounded-xl shadow-lg dark:shadow-[0_4px_6px_rgba(255,255,255,0.2)] hover:bg-secondary ${
        disabled ? "cursor-not-allowed opacity-30" : ""
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {/* {label || children} */}
      {children ?? label}
    </button>
  );
};

export default BaseButton;
