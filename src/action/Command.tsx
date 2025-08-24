import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import
  ChildrenBlur
from "../components/ChildrenBlur";

import {
  Input2,
} from "@/components/ui/input2";

import {
  Parser,
} from "@dice-roller/rpg-dice-roller";

import {
  Action,
} from "./types";

import {
  ScrollArea,
} from "@/components/ui/scroll-area";

import {
  cn,
} from "@/lib/utils";

import {
  COMMAND_INPUT_ID,
} from "./helpers";

type CommandType = {
  code: string;
  codeHint: () => string;
  parserHint: (string: string) => string;
};

// Create code hint commands
const commandFactory = (
  code: string,
  hintLabel: string,
  commandParser: (string: string) => string,
): [string, CommandType] => {
  return [
    code,
    {
      code: code,
      codeHint: () => hintLabel,
      parserHint: commandParser,
    },
  ];
};
const gmCommands = new Map<string, CommandType>([
  commandFactory("r", "Roll", (string: string) => {
    return validRoll(extractCommandContent(string))
      ? `Roll ${extractCommandContent(string)}`
      : "Invalid Roll";
  }),
  commandFactory("gr", "GM Roll", (string: string) => {
    return validRoll(extractCommandContent(string))
      ? `Roll ${extractCommandContent(string)} as GM secretly`
      : "Invalid Roll";
  }),

  commandFactory("pr", "Roll Privately", (string: string) => {
    return validRoll(extractCommandContent(string))
      ? `Roll ${extractCommandContent(string)} privately`
      : "Invalid Roll";
  }),

  commandFactory("d", "Roll Damage", (string: string) => {
    return validRoll(extractCommandContent(string))
      ? `Roll ${extractCommandContent(string)} damage`
      : "Invalid Roll";
  }),
  commandFactory("h", "Roll Healing", (string: string) => {
    return validRoll(extractCommandContent(string))
      ? `Roll ${extractCommandContent(string)} healing`
      : "Invalid Roll";
  }),
  // commandFactory("o", "Overwrite Multiple Token Stats", () => {
  //   return `Switch to overwrite operation`;
  // }),
]);
const playerCommands = new Map<string, CommandType>([
  commandFactory("r", "Roll", (string: string) => {
    return validRoll(extractCommandContent(string))
      ? `Roll ${extractCommandContent(string)}`
      : "Invalid Roll";
  }),
  commandFactory("gr", "Roll to GM", (string: string) => {
    return validRoll(extractCommandContent(string))
      ? `Roll ${extractCommandContent(string)} to GM secretly`
      : "Invalid Roll";
  }),
  commandFactory("pr", "Roll Privately", (string: string) => {
    return validRoll(extractCommandContent(string))
      ? `Roll ${extractCommandContent(string)} privately`
      : "Invalid Roll";
  }),
]);

// Command line text parsers
const extractCommandCode = (string: string) => {
  let code = string.substring(0, string.indexOf(" "));
  return code;
};
const extractCommandContent = (string: string) => {
  string = string.substring(string.indexOf(" ") + 1);
  string = string.replace(/\s/g, "");
  string = string.replaceAll("+", " + ");
  string = string.replaceAll("-", " - ");
  // const diceStatementRegex = new RegExp(
  //   /^((\d+|(\d+d\d)+)\+)*(\d+|(\d+d\d+))$/g,
  // );
  // let validDiceStatement = diceStatementRegex.test(string);
  return string;
};
const validRoll = (string: string) => {
  let valid = true;
  try {
    Parser.parse(string);
  } catch (error) {
    valid = false;
  }
  return valid;
};

export default function Command({
  dispatch,
  playerName,
  playerId,
  playerColor,
  playerRole,
}: {
  dispatch: React.Dispatch<Action>;
  playerName: string;
  playerId: string;
  playerColor: string;
  playerRole: "PLAYER" | "GM";
}): JSX.Element {
  const [inputContent, setInputContent] = useState("");
  const [targetIndex, setTargetIndex] = useState(0);
  const [isActive, setIsActive] = useState<boolean | "from-null" | "initial">(
    "initial",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = playerRole === "GM" ? gmCommands : playerCommands;

  const executeCommandMap = new Map<string, () => void>();
  const indexCodeMap = new Map<number, string>();
  let commandCount = 0;

  let commandItems: JSX.Element[] = [];
  const commandCode = extractCommandCode(inputContent);
  if (commands.has(commandCode)) {
    const executeCommand = () => {
      const getDiceExpression = () => {
        const diceExpression = extractCommandContent(inputContent);
        if (!validRoll(diceExpression)) return null;
        return diceExpression;
      };
      const addToRolls = (
        diceExpression: string,
        visibility: "PUBLIC" | "GM" | "PRIVATE",
      ) => {
        dispatch({
          type: "add-roll",
          diceExpression,
          playerName,
          playerId,
          playerColor,
          playerRole,
          visibility,
          dispatch,
        });
      };
      switch (commandCode) {
        case "r": {
          const diceExpression = getDiceExpression();
          if (diceExpression) {
            addToRolls(diceExpression, "PUBLIC");
          }
          break;
        }
        case "gr": {
          const diceExpression = getDiceExpression();
          if (diceExpression) {
            addToRolls(diceExpression, "GM");
          }
          break;
        }
        case "pr": {
          const diceExpression = getDiceExpression();
          if (diceExpression) {
            addToRolls(diceExpression, "PRIVATE");
          }
          break;
        }
        case "d": {
          const diceExpression = getDiceExpression();
          if (diceExpression) {
            addToRolls(diceExpression, "GM");
            dispatch({ type: "set-operation", operation: "DAMAGE" });
          }
          break;
        }
        case "h": {
          const diceExpression = getDiceExpression();
          if (diceExpression) {
            addToRolls(diceExpression, "GM");
            dispatch({ type: "set-operation", operation: "HEALING" });
          }
          break;
        }
        case "o": {
          dispatch({ type: "set-operation", operation: "OVERWRITE" });

          break;
        }
        default:
          console.log("unhandled command");
      }
      // Unfocus command line
      if (inputRef.current) inputRef.current.blur();
      setIsActive(false);
    };

    commandCount++;
    indexCodeMap.set(commandCount, "roll demo");
    executeCommandMap.set("roll demo", executeCommand);

    const command = commands.get(commandCode);

    if (command)
      commandItems.push(
        <CommandItem
          key={commandCode + "parser"}
          index={commandCount}
          targetIndex={targetIndex}
          onSelectionConfirm={executeCommand}
        >
          <div className="py-1 pl-1">{command.parserHint(inputContent)}</div>
          {commandCount === targetIndex && (
            <div className="ml-auto justify-end text-mirage-500 dark:text-mirage-500">
              enter
            </div>
          )}
        </CommandItem>,
      );
  } else {
    for (const command of commands) {
      const executeCommand = () => {
        setInputContent(`${command[0]} `);
        if (inputRef.current) inputRef.current.focus();
      };

      commandCount++;
      indexCodeMap.set(commandCount, command[0]);
      executeCommandMap.set(command[0], executeCommand);

      commandItems.push(
        <CommandItem
          key={command[0]}
          targetIndex={targetIndex}
          index={commandCount}
          onSelectionConfirm={executeCommand}
        >
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-sm drop-shadow",
              {
                "bg-mirage-50 dark:bg-mirage-800": targetIndex === commandCount,
                "bg-mirage-50 group-hover/command-item:bg-mirage-50/70 dark:bg-mirage-900 dark:group-hover/command-item:bg-mirage-800/70":
                  targetIndex !== commandCount,
              },
            )}
          >
            <div className="pb-0.5">{command[0]}</div>
          </div>
          <div>{command[1].codeHint()}</div>
          {commandCount === targetIndex && (
            <div className="ml-auto justify-end text-mirage-500 dark:text-mirage-500">
              enter
            </div>
          )}
        </CommandItem>,
      );
    }
  }

  if (targetIndex > commandItems.length || targetIndex < 1) setTargetIndex(1);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const previousItem = () => {
      if (targetIndex > 1) setTargetIndex(targetIndex - 1);
      else setTargetIndex(commandItems.length);
      event.preventDefault();
    };
    const nextItem = () => {
      if (targetIndex < commandItems.length) setTargetIndex(targetIndex + 1);
      else setTargetIndex(1);
      event.preventDefault();
    };

    switch (event.key) {
      case "Escape":
        if (inputRef.current) inputRef.current.blur();
        break;
      case "ArrowUp":
        previousItem();
        break;
      case "ArrowDown":
        nextItem();
        break;
      case "Tab":
        if (isActive === true || isActive === "initial") {
          if (event.shiftKey) previousItem();
          else nextItem();
        }
        break;
      case "Enter":
        const selectionCode = indexCodeMap.get(targetIndex);
        if (selectionCode) {
          const executeCommand = executeCommandMap.get(selectionCode);
          if (executeCommand) executeCommand();
        }
        break;
    }
    // console.log(event.key);
  };

  return (
    <div className="relative flex-grow overflow-visible">
      <ChildrenBlur
        onBlur={() => {
          setIsActive(false);
        }}
      >
        <div className="relative w-full rounded-md border border-mirage-300 bg-mirage-50 shadow-sm dark:border-mirage-800 dark:bg-mirage-950 focus-within:[&:has(:focus-visible)]:border-transparent focus-within:[&:has(:focus-visible)]:ring-2 focus-within:[&:has(:focus-visible)]:ring-primary dark:focus-within:[&:has(:focus-visible)]:ring-primary-dark">  
          <Tooltip defaultOpen={false}>
            <TooltipTrigger asChild>
              <Input2
                style={{height: "32px"}}
                ref={inputRef}
                id={COMMAND_INPUT_ID}
                placeholder="Enter a command"
                value={inputContent}
                spellCheck={false}
                onChange={(e) => {
                  setInputContent(e.target.value);
                  if (inputContent === "") setIsActive("from-null");
                  else setIsActive(true);
                }}
                onKeyDown={(e) => handleKeyDown(e)}
                onFocus={(e) => {
                  if (e.relatedTarget === null && isActive !== "initial") {
                    setIsActive("from-null");
                  } else setIsActive(true);
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
                Dice Roller
            </TooltipContent>
          </Tooltip>

          {(isActive === true || isActive === "from-null") && (
            <div
              className="absolute bottom-full w-full z-40"
              style={{
                marginBottom: "6px",
              }}
            >
              <div 
                className="rounded-md border border-primary bg-mirage-50 text-mirage-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-primary-dark dark:bg-mirage-950 dark:text-mirage-50 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
                style={{
                  marginLeft: "-3px",
                  marginRight: "-3px",
                }}
              >
              <ScrollArea type="scroll" className="p-2">
                <div className="flex max-h-[330px] flex-col gap-1">
                  {commandItems}
                </div>
              </ScrollArea>
              {/* <div className="p-2 pt-0 z-40">
                <Separator className="mt-0" />
              </div> */}
              </div>
            </div>
          )}
        </div>
      </ChildrenBlur>
    </div>
  );
}

function CommandItem({
  index,
  targetIndex,
  onSelectorFocus,
  onSelectionConfirm,
  children,
}: {
  index: number;
  targetIndex: number;
  onSelectorFocus?: () => void;
  onSelectionConfirm: () => void;
  children: any;
}): JSX.Element {
  const divRef = useRef<HTMLDivElement>(null);

  const scrollToElement = () => {
    if (divRef.current !== null) {
      divRef.current.scrollIntoView({ behavior: "instant", block: "nearest" });
    }
  };

  useEffect(() => {
    if (targetIndex === index) {
      scrollToElement();
      if (onSelectorFocus) onSelectorFocus();
    }
  }, [targetIndex]);

  return (
    <div
      ref={divRef}
      className={cn(
        "group/command-item flex w-full items-center gap-2 rounded-sm p-1 pr-4 text-sm",
        {
          "bg-mirage-100 dark:bg-mirage-900": targetIndex === index,
          "bg-transparent hover:bg-mirage-100/70 dark:bg-transparent dark:hover:bg-mirage-900/70":
            targetIndex !== index,
        },
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelectionConfirm();
      }}
    >
      {children}
    </div>
  );
}
