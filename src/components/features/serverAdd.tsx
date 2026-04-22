import React, { useMemo } from "react";

import { Input, Button } from "@e-infra/design-system";
import { Plus, AlertCircle } from "lucide-react";

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  /** Array of existing server names to check for duplicates */
  existingNames?: string[];
}

export const ServerAdd: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder = "",
  buttonText,
  onButtonClick,
  existingNames = [],
}) => {
  const isNameDuplicate = useMemo(() => {
    if (!value.trim()) return false;
    return existingNames.some(
      (name) => name.toLowerCase() === value.trim().toLowerCase(),
    );
  }, [value, existingNames]);

  const isInvalid = value === "" || isNameDuplicate;

  return (
    <div className="flex w-full flex-col gap-2 p-4 lg:flex-row lg:flex-wrap lg:space-x-2 lg:items-center lg:justify-center lg:gap-0 lg:p-0">
      <div className="w-full lg:w-40">
        <div className="relative flex-1 items-center">
          <Input
            type="text"
            id="addServer"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full rounded-md border focus:ring focus:ring-opacity-50 py-3 px-4 lg:py-0 lg:px-0 ${
              isNameDuplicate
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
            }`}
            aria-invalid={isNameDuplicate}
            aria-describedby={isNameDuplicate ? "server-name-error" : undefined}
          />
        </div>
      </div>
      {isNameDuplicate && (
        <div
          id="server-name-error"
          className="flex items-center gap-2 text-sm text-red-600 justify-center lg:justify-start"
          role="alert"
        >
          <AlertCircle size={16} />
          <span>Server name "{value}" is already in use</span>
        </div>
      )}
      {buttonText && (
        <Button
          variant={"secondary"}
          className="w-full justify-center lg:w-40"
          onClick={onButtonClick}
          disabled={isInvalid}
        >
          <Plus size={16} strokeWidth={3} />
          {buttonText}
        </Button>
      )}
    </div>
  );
};
