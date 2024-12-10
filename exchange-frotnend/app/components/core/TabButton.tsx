export const TabButton = ({
    label,
    isActive,
    activeStyles,
    onClick,
  }: {
    label: string;
    isActive: boolean;
    activeStyles: string;
    onClick: () => void;
  }) => {
    return (
      <div
        className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border-b-2 p-4 text-sm font-semibold transition ${
          isActive
            ? `${activeStyles} text-gray-200`
            : "border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200"
        }`}
        onClick={onClick}
      >
        {label}
      </div>
    );
  };