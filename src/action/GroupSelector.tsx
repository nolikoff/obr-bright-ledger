
import {
  Action,
} from "./types";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";


export default function GroupSelector({
  dispatch,
}: {
  dispatch: React.Dispatch<Action>;
}): JSX.Element {
  return (
    <div
      className="flex align-middle gap-2 items-center justify-center"
       style={{
        padding: "0px 15px 8px 15px",
      }}
    >
      <div className="inline-block flex-1">
        <Tabs
          defaultValue="COMPANIONS"
          className="w-full p-0"
        >
          <TabsList className="grid w-full grid-cols-2 h-[34px]">
            <TabsTrigger
              value="COMPANIONS"
              className="h-[26px]"
              onClick={() => {
                dispatch({
                  type: "set-group",
                  group: "COMPANIONS",
                })
              }}
            >
              Companions
            </TabsTrigger>
            <TabsTrigger
              value="STRANGERS"
              className="h-[26px]"
              onClick={() => {
                dispatch({
                  type: "set-group",
                  group: "STRANGERS",
                })
              }}
            >
              Strangers
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}