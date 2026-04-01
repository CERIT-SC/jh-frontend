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

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    formSelect(value);
  };

  useEffect(() => {
    if (defaultOption) {
      setSelectedValue(defaultOption[0]);
      formSelect(defaultOption[0]);
    }
  }, [defaultOption]);

  return (
    <>
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
    </>
  );
};

export default DropDownMenu;
