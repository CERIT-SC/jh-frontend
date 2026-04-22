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
  Button,
} from "@e-infra/design-system";
interface CardProps {
  /** Main title of the card */
  title: string;
}

export const ImageCard: React.FC<CardProps> = ({ title }) => {
  return (
    <Card className="w-[320px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{/* Input selection */}</CardContent>
    </Card>
  );
};
export default ImageCard;
