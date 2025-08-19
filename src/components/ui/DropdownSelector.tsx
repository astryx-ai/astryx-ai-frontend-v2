import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownOption {
  id: number | string;
  name: string;
  description?: string;
}

interface DropdownSelectorProps {
  options: DropdownOption[];
  selected: DropdownOption;
  onSelect: (option: DropdownOption) => void;
  className?: string;
  dropdownClassName?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

const DropdownSelector = ({
  options,
  selected,
  onSelect,
  className = "",
  dropdownClassName = "",
  buttonClassName = "",
  disabled = false,
}: DropdownSelectorProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  // (Optional: can be added if needed)

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={e => {
          e.preventDefault();
          setOpen(!open);
        }}
        className={`flex items-center gap-1 px-3 py-1.5 whitespace-nowrap rounded-full border bg-white dark:bg-black-80 hover:bg-gray-50 dark:hover:bg-black-90 transition-all duration-200 text-sm font-medium ${open ? "bg-gray-50 dark:bg-black-90" : ""} ${buttonClassName}`}
        disabled={disabled}
      >
        {selected.name}{" "}
        <ChevronDown className={`w-4 h-4 duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className={`absolute z-50 left-0 mt-1 w-64 bg-white dark:bg-black-80 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg ${dropdownClassName}`}
        >
          {options.map(option => (
            <button
              key={option.id}
              onClick={e => {
                e.preventDefault();
                onSelect(option);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white-100">{option.name}</div>
              {option.description && (
                <div className="text-sm text-gray-500 dark:text-white-50">{option.description}</div>
              )}
            </button>
          ))}
        </div>
      )}
      {/* Click outside handler */}
      {open && <div className="fixed inset-0 z-[5]" onClick={() => setOpen(false)} />}
    </div>
  );
};

export type { DropdownOption };
export default DropdownSelector;
