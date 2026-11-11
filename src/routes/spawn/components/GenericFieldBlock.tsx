/**
 * @fileoverview Generic field primitive renderer (`spawn_options.fields[]`).
 *
 * checkbox → Switch + Label (+ warning Alert when checked); select →
 * design-system Select. Checkbox visuals ported from the cas StorageSection
 * delhome block. Controlled entirely by the parent: values come from
 * `formData.fields`, changes go through `onFieldChange`.
 */

import { AlertTriangle } from "lucide-react";
import {
  Alert,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@e-infra/design-system";
import type { GenericField } from "@src-types/spawnOptions";

interface GenericFieldBlockProps {
  fields: GenericField[];
  values: Record<string, string | boolean>;
  onChange: (name: string, value: string | boolean) => void;
}

export default function GenericFieldBlock({
  fields,
  values,
  onChange,
}: GenericFieldBlockProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field) => {
        if (field.type === "checkbox") {
          const checked = values[field.name] === true;
          return (
            <div key={field.name} className="space-y-2">
              <div className="flex items-center gap-3 py-2">
                <Switch
                  id={field.name}
                  checked={checked}
                  onCheckedChange={(next) => onChange(field.name, next)}
                  className="scale-125 data-[state=unchecked]:bg-surface-raised dark:data-[state=unchecked]:bg-secondary"
                />
                <Label htmlFor={field.name} className="cursor-pointer text-sm">
                  {field.label}
                </Label>
              </div>
              {field.description && (
                <p className="pl-1 text-xs text-text-muted">
                  {field.description}
                </p>
              )}
              {checked && field.warning && (
                <Alert variant="warning" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs">{field.warning}</span>
                </Alert>
              )}
            </div>
          );
        }

        // select
        const value =
          typeof values[field.name] === "string"
            ? (values[field.name] as string)
            : "";
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="pl-2">
              {field.label}
            </Label>
            <Select
              value={value}
              onValueChange={(next) => onChange(field.name, next)}
            >
              <SelectTrigger id={field.name} className="w-full bg-surface">
                <SelectValue
                  placeholder={field.description || "Select an option"}
                />
              </SelectTrigger>
              <SelectContent side="bottom" align="start">
                {(field.options ?? []).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="pl-1 text-xs text-text-muted">
                {field.description}
              </p>
            )}
            {field.warning && (
              <Alert variant="warning" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">{field.warning}</span>
              </Alert>
            )}
          </div>
        );
      })}
    </div>
  );
}
