//depraceted

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "../../utils/utils";

import React from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  Separator,
  Switch,
  Badge,
} from "@e-infra/design-system";
interface SelectableCardProps {
  id: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  children?: React.ReactNode;
}

export function SelectableCard({
  id,
  title,
  icon,
  description,
  isSelected,
  onSelect = () => {},
  children,
}: SelectableCardProps) {
  function handleClick() {
    onSelect();
  }
  return (
    <Card
      onClick={handleClick}
      className={cn(
        "group relative cursor-pointer overflow-hidden",
        "transform transition-all duration-300 ease-in-out",
        "border-2 transition-colors",
        isSelected
          ? "border-primary shadow-primary/20 bg-linear-45 shadow-md"
          : "border hover:border-primary/30",
      )}
    >
      {icon && (
        <div className="flex items-center justify-center p-4">{icon}</div>
      )}
      <Check
        className={cn(
          "size-7 transition-all duration-200 ease-in-out absolute top-2 right-2",
          isSelected
            ? "text-primary"
            : "text-transparent group-hover:text-primary/50",
        )}
      />
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}

interface SelectableCardsProps {
  cards: {
    id: string;
    title: React.ReactNode;
    icon?: React.ReactNode;
    description?: string;
  }[];
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
}

export function SelectableCards({
  cards,
  selectedCardId,
  onSelectCard,
}: SelectableCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <SelectableCard
          key={card.id}
          id={card.id}
          title={card.title}
          icon={card.icon}
          description={card.description}
          isSelected={selectedCardId === card.id}
          onSelect={() =>
            onSelectCard(selectedCardId === card.id ? null : card.id)
          }
        />
      ))}
    </div>
  );
}

export default SelectableCards;
