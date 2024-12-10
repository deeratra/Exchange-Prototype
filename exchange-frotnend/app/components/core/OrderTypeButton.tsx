export const OrderTypeButton = ({
    label,
    isActive,
    onClick,
  }: {
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => {
    return (
      <div
        className={`cursor-pointer border-b-2 py-2 text-sm font-medium transition ${
          isActive
            ? "border-blue-500 text-gray-200"
            : "border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200"
        }`}
        onClick={onClick}
      >
        {label}
      </div>
    );
  };