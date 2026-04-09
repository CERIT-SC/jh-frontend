import React, { useState, useEffect } from "react";
import "./DropDownMenu.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from "@e-infra/design-system";

interface DropDownMenuProps {
  menuOptions: { [key: string]: string };
  title: string;
  formSelect: (value: string) => void;
  defaultOption?: [string, string];
}

export const DropDownMenu: React.FC<DropDownMenuProps> = ({
  menuOptions,
  title,
  formSelect,
  defaultOption,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(
    defaultOption ? defaultOption[0] : "",
  );

  // Track if we've already initialized from defaultOption
  const [initialized, setInitialized] = useState(false);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    formSelect(value);
  };

  // Initialize from defaultOption only once on mount
  useEffect(() => {
    if (defaultOption && !initialized) {
      setSelectedValue(defaultOption[0]);
      formSelect(defaultOption[0]);
      setInitialized(true);
    }
  }, [defaultOption, initialized, formSelect]);

  return (
    <div className="flex flex-col gap-2 mt-2">
      <Label>{title}</Label>
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent side="bottom" align="start">
          {Object.entries(menuOptions).map(([key, name]) => (
            <SelectItem key={key} value={key}>
              {name as string}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DropDownMenu;
