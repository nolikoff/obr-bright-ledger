import {
  Input,
} from "@/components/ui/input";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  cn,
} from "@/lib/utils";

import {
  ItemMetadataName,
} from "@/statInputHelpers";

import {
  InputHTMLAttributes,
} from "react";

export default function StatStyledInput({
  name,
  inputProps,
  width = "53px",
  height = "32px",
}: {
  name: ItemMetadataName;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  width?: string;
  height?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Input
          {...inputProps}
          name={name}
          style={{
            width: width,
            height: height,
            textAlign: "center",
          }}
          className={cn(
            {
              "bg-stat-red/10 dark:bg-stat-red-dark/5":
                name === "HEALTH" || name === "MAX-HEALTH",
              "bg-stat-green/10 dark:bg-stat-green-dark/5":
                name === "TEMP-HEALTH",
              "bg-stat-blue/10 dark:bg-stat-blue-dark/5":
                name === "ARMOR-CLASS",
            },
            inputProps?.className,
          )}
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>{nameToLabel(name)}</p>
      </TooltipContent>
    </Tooltip>
  );
}

const nameToLabel = (name: ItemMetadataName) => {
  switch (name) {
    case "HEALTH":
      return "Current Hit Points";
    case "MAX-HEALTH":
      return "Hit Points Maximum";
    case "TEMP-HEALTH":
      return "Temporary Hit Points";
    case "ARMOR-CLASS":
      return "Armor Class";
    default:
      return "";
  }
};
