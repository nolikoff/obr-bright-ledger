import {
  cn,
} from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

import {
  InputColor,
} from "@/colorHelpers";

import
  OBR
from "@owlbear-rodeo/sdk";

import {
  useEffect,
  useState,
} from "react";

export default function StatToolTip({
  open,
  text,
  color,
  children,
}: {
  open: boolean;
  text: string;
  color: InputColor;
  children: any;
}) {

  const [themeMode, setThemeMode] = useState<"DARK" | "LIGHT">();

  useEffect(() => {
    const getTheme = async () => {
        setThemeMode((await OBR.theme.getTheme()).mode);
    };

    getTheme();
  }, []);

  return (
    <Tooltip open={open}>
      <TooltipTrigger asChild>
        <div>{children}</div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={-8}
        align="center"
        alignOffset={0}
        className={cn(
          "min-w-6 px-1 py-0.5 text-center text-sm font-medium leading-5",
          {
            "dark:bg-stat-red-highlight-dark": color === "RED",
            "dark:bg-stat-green-highlight-dark": color === "GREEN",
            "bg-opacity-0 dark:bg-stat-blue-highlight-dark": color === "BLUE",
          },
        )}
        style={{
          backgroundColor:
            color === "RED" && themeMode === "LIGHT"
            ? "#CC5A48"
            : (
              color === "GREEN" && themeMode === "LIGHT"
              ? "#83A24A" 
              : (
                color === "BLUE" && themeMode === "LIGHT"
                ? "#5A88C4"
                : ""
              )
            ),
        }}
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
