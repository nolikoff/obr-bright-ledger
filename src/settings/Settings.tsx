import "../index.css";

import
  Switch
from "@/components/Switch";

import {
  Input,
} from "@/components/ui/input";

import {
  Button,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils";

import
  React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ScrollArea,
} from "@/components/ui/scroll-area";

import {
  SettingsSaveLocation,
  updateSettingMetadata,
} from "@/metadataHelpers/settingMetadataHelpers";

import {
  VerticalOffset,
} from "../components/icons/VerticalOffset";

import {
  VerticalAlignBottom,
} from "../components/icons/VerticalAlignBottom";

import {
  VerticalAlignTop,
} from "../components/icons/VerticalAlignTop";

import {
  Companions,
} from "../components/icons/Companions";

import {
  Strangers,
} from "../components/icons/Strangers";

import {
  NameTag,
} from "../components/icons/NameTag";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  SETTINGS_OFFSET_METADATA_ID,
  SETTINGS_BAR_AT_TOP_METADATA_ID,
  SETTINGS_COMPANIONS_SEGMENTS_METADATA_ID,
  SETTINGS_STRANGERS_SEGMENTS_METADATA_ID,
  SETTINGS_NAME_TAGS_METADATA_ID,
} from "@/metadataHelpers/settingMetadataIds";

import
  useSettings
from "./useSettings";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import 
  Asterisk
from "@/components/icons/Asterisk";

import
  Selection
from "@/components/icons/Selection";

import
  ManuallyAdded
from "@/components/icons/ManuallyAdded";

import {
  TableCell,
} from "@/components/ui/table";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import 
  OBR
from "@owlbear-rodeo/sdk";

import {
  ITEM_SHOW_ITEMS_METADATA_ID,
} from "@/metadataHelpers/itemMetadataIds";

import {
  getPluginId,
} from "@/getPluginId";

import {
  getShowItemsFromScene,
  setSceneShowItems,
} from "@/metadataHelpers/sceneMetadataHelpers";

import {
  itemFilter,
} from "@/metadataHelpers/itemMetadataHelpers";


export default function Settings(): JSX.Element {
  const roomSettings = useSettings("ROOM");
  const sceneSettings = useSettings("SCENE");

  const sceneOverridesCount =
    (sceneSettings.offset === undefined ? 0 : 1) +
    (sceneSettings.justification === undefined ? 0 : 1) +
    (sceneSettings.companionsSegments === undefined ? 0 : 1) +
    (sceneSettings.strangersSegments === undefined ? 0 : 1) +
    (sceneSettings.nameTags === undefined ? 0 : 1);

  return (
    <div className="h-full">
      <div className="flex h-full flex-col rounded-2xl border bg-mirage-100 text-mirage-900 outline outline-2 -outline-offset-1 outline-primary dark:bg-mirage-950 dark:text-mirage-50 dark:outline-primary-dark">
        <ScrollArea className="h-full 2xs:px-3 xs:px-4" type="scroll">
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4">
            <div>
              <h1 className="text-l font-light">Settings</h1>
              <p className="text-xs text-mirage-400">
                <i>Bright Ledger</i>
              </p>
            </div>
            <div className="flex gap-2 pr-0.5">
              <ShowItemsMenu/>
            </div>
          </div>

          <Tabs defaultValue="room" className="w-full py-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="room">Room</TabsTrigger>
              <TabsTrigger value="scene">
                {"Scene" +
                  (sceneOverridesCount === 0
                    ? ""
                    : ` (${sceneOverridesCount})`)}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="room">
              {roomSettings.initializationDone &&
                roomSettings.offset !== undefined &&
                roomSettings.justification !== undefined &&
                roomSettings.companionsSegments !== undefined &&
                roomSettings.strangersSegments !== undefined &&
                roomSettings.nameTags !== undefined && (
                  <div className="flex h-max flex-col justify-start gap-2 text-sm">
                    <VerticalOffsetSettings
                      offset={roomSettings.offset}
                      setOffset={roomSettings.setOffset}
                      saveLocation="ROOM"
                    />
                    <JustificationSettings
                      justification={roomSettings.justification}
                      setJustification={roomSettings.setJustification}
                      saveLocation="ROOM"
                    />
                    <CompanionsSegmentsSettings
                      companionsSegments={roomSettings.companionsSegments}
                      setCompanionsSegments={roomSettings.setCompanionsSegments}
                      saveLocation="ROOM"
                    />
                    <StrangersSegmentsSettings
                      strangersSegments={roomSettings.strangersSegments}
                      setStrangersSegments={roomSettings.setStrangersSegments}
                      saveLocation="ROOM"
                    />
                    <NameTagSettings
                      nameTags={roomSettings.nameTags}
                      setNameTags={roomSettings.setNameTags}
                      saveLocation="ROOM"
                    />
                  </div>
                )}
            </TabsContent>

            <TabsContent value="scene">
              {sceneSettings.initializationDone && (
                <div className="space-y-4">
                  <div className="text-sm pl-1">
                    Override the active room's settings for this scene.
                  </div>

                  {sceneOverridesCount > 0 && (
                    <div
                      className={cn(
                        "flex h-max flex-col justify-start gap-2 text-sm",
                      )}
                    >
                      {sceneSettings.offset !== undefined && (
                        <VerticalOffsetSettings
                          offset={sceneSettings.offset}
                          setOffset={sceneSettings.setOffset}
                          saveLocation="SCENE"
                          removeHandler={() => {
                            sceneSettings.setOffset(undefined);
                            updateSettingMetadata(
                              SETTINGS_OFFSET_METADATA_ID,
                              undefined,
                              "SCENE",
                            );
                          }}
                        />
                      )}
                      {sceneSettings.justification !== undefined && (
                        <JustificationSettings
                          justification={sceneSettings.justification}
                          setJustification={sceneSettings.setJustification}
                          saveLocation="SCENE"
                          removeHandler={() => {
                            sceneSettings.setJustification(undefined);
                            updateSettingMetadata(
                              SETTINGS_BAR_AT_TOP_METADATA_ID,
                              undefined,
                              "SCENE",
                            );
                          }}
                        />
                      )}
                      {sceneSettings.companionsSegments !== undefined && (
                        <CompanionsSegmentsSettings
                          companionsSegments={sceneSettings.companionsSegments}
                          setCompanionsSegments={sceneSettings.setCompanionsSegments}
                          saveLocation="SCENE"
                          removeHandler={() => {
                            sceneSettings.setCompanionsSegments(undefined);
                            updateSettingMetadata(
                              SETTINGS_COMPANIONS_SEGMENTS_METADATA_ID,
                              undefined,
                              "SCENE",
                            );
                          }}
                        />
                      )}
                      {sceneSettings.strangersSegments !== undefined && (
                        <StrangersSegmentsSettings
                          strangersSegments={sceneSettings.strangersSegments}
                          setStrangersSegments={sceneSettings.setStrangersSegments}
                          saveLocation="SCENE"
                          removeHandler={() => {
                            sceneSettings.setStrangersSegments(undefined);
                            updateSettingMetadata(
                              SETTINGS_STRANGERS_SEGMENTS_METADATA_ID,
                              undefined,
                              "SCENE",
                            );
                          }}
                        />
                      )}
                      {sceneSettings.nameTags !== undefined && (
                        <NameTagSettings
                          nameTags={sceneSettings.nameTags}
                          setNameTags={sceneSettings.setNameTags}
                          saveLocation="SCENE"
                          removeHandler={() => {
                            sceneSettings.setNameTags(undefined);
                            updateSettingMetadata(
                              SETTINGS_NAME_TAGS_METADATA_ID,
                              undefined,
                              "SCENE",
                            );
                          }}
                        />
                      )}
                    </div>
                  )}

                  {sceneOverridesCount < 5 && (
                    <div className="flex flex-wrap gap-2 pl-0.5 pr-8">
                      <AddSceneSettingButton
                        visible={sceneSettings.offset === undefined}
                        initializeSettings={() => {
                          sceneSettings.setOffset(roomSettings.offset);
                          updateSettingMetadata(
                            SETTINGS_OFFSET_METADATA_ID,
                            parseFloat(roomSettings.offset as string),
                            "SCENE",
                          );
                        }}
                      >
                        + Offset
                      </AddSceneSettingButton>
                      <AddSceneSettingButton
                        visible={sceneSettings.justification === undefined}
                        initializeSettings={() => {
                          sceneSettings.setJustification(roomSettings.justification);
                          updateSettingMetadata(
                            SETTINGS_BAR_AT_TOP_METADATA_ID,
                            roomSettings.justification === "TOP" ? true : false,
                            "SCENE",
                          );
                        }}
                      >
                        + Justification
                      </AddSceneSettingButton>
                      <AddSceneSettingButton
                        visible={sceneSettings.companionsSegments === undefined}
                        initializeSettings={() => {
                          sceneSettings.setCompanionsSegments(roomSettings.companionsSegments);
                          updateSettingMetadata(
                            SETTINGS_COMPANIONS_SEGMENTS_METADATA_ID,
                            parseFloat(roomSettings.companionsSegments as string),
                            "SCENE",
                          );
                        }}
                      >
                        + Companions Segments
                      </AddSceneSettingButton>
                      <AddSceneSettingButton
                        visible={sceneSettings.strangersSegments === undefined}
                        initializeSettings={() => {
                          sceneSettings.setStrangersSegments(roomSettings.strangersSegments);
                          updateSettingMetadata(
                            SETTINGS_STRANGERS_SEGMENTS_METADATA_ID,
                            parseFloat(roomSettings.strangersSegments as string),
                            "SCENE",
                          );
                        }}
                      >
                        + Strangers Segments
                      </AddSceneSettingButton>
                      <AddSceneSettingButton
                        visible={sceneSettings.nameTags === undefined}
                        initializeSettings={() => {
                          sceneSettings.setNameTags(roomSettings.nameTags);
                          updateSettingMetadata(
                            SETTINGS_NAME_TAGS_METADATA_ID,
                            roomSettings.nameTags,
                            "SCENE",
                          );
                        }}
                      >
                        + Name Tags
                      </AddSceneSettingButton>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>
    </div>
  );
}

function AddSceneSettingButton({
  visible,
  initializeSettings,
  children,
}: {
  visible: boolean;
  initializeSettings: () => void;
  children: any;
}) {
  if (!visible) return <></>;
  return (
    <Button
      className="h-[28px] rounded-full px-3"
      variant={"outline"}
      onClick={initializeSettings}
    >
      {children}
    </Button>
  );
}

function VerticalOffsetSettings({
  offset,
  setOffset,
  saveLocation,
  removeHandler,
}: {
  offset: string;
  setOffset: React.Dispatch<React.SetStateAction<string | undefined>>;
  saveLocation: SettingsSaveLocation;
  removeHandler?: () => void;
}) {
  return (
    <SettingsRow
      icon={<VerticalOffset />}
      label="Vertical Offset (px)"
      description="Move stat bubbles up or down"
      action={
        <Input
          className="w-20 bg-mirage-50/30 text-center focus:bg-mirage-50/40 dark:bg-mirage-950/40 dark:focus:bg-mirage-950/80"
          value={offset}
          onChange={(e) => setOffset(e.target.value)}
          onBlur={(e) => {
            let value = Math.trunc(parseFloat(e.target.value));
            if (Number.isNaN(value)) value = 0;
            setOffset(value.toString());
            updateSettingMetadata(SETTINGS_OFFSET_METADATA_ID, value, saveLocation);
          }}
        />
      }
      last={removeHandler === undefined}
    >
      {removeHandler === undefined ? (
        <></>
      ) : (
        <RemoveSetting removeHandler={removeHandler} />
      )}
    </SettingsRow>
  );
}

function JustificationSettings({
  justification,
  setJustification,
  saveLocation,
  removeHandler,
}: {
  justification: "TOP" | "BOTTOM";
  setJustification: React.Dispatch<
    React.SetStateAction<"TOP" | "BOTTOM" | undefined>
  >;
  saveLocation: SettingsSaveLocation;
  removeHandler?: () => void;
}) {
  return (
    <SettingsRow
      icon={
        justification === "TOP" ? (
          <VerticalAlignTop />
        ) : (
          <VerticalAlignBottom />
        )
      }
      label="Justification"
      description="Snap stat bubbles to the top or bottom of tokens"
      action={
        <Button
          variant={"outline"}
          className="w-20 capitalize"
          onClick={() => {
            setJustification(justification);
            updateSettingMetadata(
              SETTINGS_BAR_AT_TOP_METADATA_ID,
              justification === "TOP" ? false : true,
              saveLocation,
            );
          }}
        >
          {justification.toLowerCase()}
        </Button>
      }
      last={removeHandler === undefined}
    >
      {removeHandler === undefined ? (
        <></>
      ) : (
        <RemoveSetting removeHandler={removeHandler} />
      )}
    </SettingsRow>
  );
}

function CompanionsSegmentsSettings({
  companionsSegments,
  setCompanionsSegments,
  saveLocation,
  removeHandler,
}: {
  companionsSegments: string;
  setCompanionsSegments: React.Dispatch<React.SetStateAction<string | undefined>>;
  saveLocation: SettingsSaveLocation;
  removeHandler?: () => void;
}) {
  return (
    <SettingsRow
      icon={<Companions />}
      label="Companions Segments"
      description="Only show when tokens drop to certain fractions of their health"
      action={
        <Input
          className="w-20 bg-mirage-50/30 text-center focus:bg-mirage-50/40 dark:bg-mirage-950/40 dark:focus:bg-mirage-950/80"
          value={companionsSegments}
          onChange={(e) => setCompanionsSegments(e.target.value)}
          onBlur={(e) => {
            let value = Math.trunc(parseFloat(e.target.value));
            if (Number.isNaN(value)) value = 0;
            setCompanionsSegments(value.toString());
            updateSettingMetadata(SETTINGS_COMPANIONS_SEGMENTS_METADATA_ID, value, saveLocation);
          }}
        />
      }
      last={removeHandler === undefined}
    >
      {removeHandler === undefined ? (
        <></>
      ) : (
        <RemoveSetting removeHandler={removeHandler} />
      )}
    </SettingsRow>
  );
}

function StrangersSegmentsSettings({
  strangersSegments,
  setStrangersSegments,
  saveLocation,
  removeHandler,
}: {
  strangersSegments: string;
  setStrangersSegments: React.Dispatch<React.SetStateAction<string | undefined>>;
  saveLocation: SettingsSaveLocation;
  removeHandler?: () => void;
}) {
  return (
    <SettingsRow
      icon={<Strangers />}
      label="Strangers Segments"
      description="Only show when tokens drop to certain fractions of their health"
      action={
        <Input
          className="w-20 bg-mirage-50/30 text-center focus:bg-mirage-50/40 dark:bg-mirage-950/40 dark:focus:bg-mirage-950/80"
          value={strangersSegments}
          onChange={(e) => setStrangersSegments(e.target.value)}
          onBlur={(e) => {
            let value = Math.trunc(parseFloat(e.target.value));
            if (Number.isNaN(value)) value = 0;
            setStrangersSegments(value.toString());
            updateSettingMetadata(SETTINGS_STRANGERS_SEGMENTS_METADATA_ID, value, saveLocation);
          }}
        />
      }
      last={removeHandler === undefined}
    >
      {removeHandler === undefined ? (
        <></>
      ) : (
        <RemoveSetting removeHandler={removeHandler} />
      )}
    </SettingsRow>
  );
}

function NameTagSettings({
  nameTags,
  setNameTags,
  saveLocation,
  removeHandler,
}: {
  nameTags: boolean;
  setNameTags: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  saveLocation: SettingsSaveLocation;
  removeHandler?: () => void;
}) {
  return (
    <SettingsRow
      icon={<NameTag />}
      label="Name Tags"
      description="Custom name tags that never overlap with stat bubbles"
      action={
        <Switch
          inputProps={{
            checked: nameTags,
            onChange: (e) => {
              setNameTags(e.target.checked);
              updateSettingMetadata(
                SETTINGS_NAME_TAGS_METADATA_ID,
                e.target.checked,
                saveLocation,
              );
            },
          }}
        />
      }
      last={removeHandler === undefined}
    >
      {removeHandler === undefined ? (
        <></>
      ) : (
        <RemoveSetting removeHandler={removeHandler} />
      )}
    </SettingsRow>
  );
}

function SettingsRow({
  icon,
  label,
  description,
  action,
  children,
  last,
}: {
  icon: JSX.Element;
  label: string;
  description: string;
  action: JSX.Element;
  children?: JSX.Element | JSX.Element[];
  last?: boolean;
}): JSX.Element {
  return (
    <div>
      <div
        className={cn(
          "flex min-h-16 items-center justify-start gap-2 rounded bg-mirage-200 p-2 dark:bg-mirage-900",
          { "rounded-b-none": last === false },
        )}
      >
        <div className="p-1" style={{display: "inline-block"}}>
          {icon}
        </div>
        <div style={{display: "inline-block", flex: 1}}>
          <label htmlFor="vertical offset">{label}</label>
          <div className="text-xs text-mirage-400">{description}</div>
        </div>
        <div style={{display: "inline-block"}}>{action}</div>
      </div>
      {children}
    </div>
  );
}

function RemoveSetting({
  removeHandler,
}: {
  removeHandler: () => void;
}): JSX.Element {
  return (
    <div className="pt-0.5">
      <div
        className={cn(
          "flex items-center justify-start gap-4 rounded-none bg-mirage-200 dark:bg-mirage-900",
          { "rounded-b": true },
        )}
      >
        <Button
          className="w-full p-1 rounded-t-none hover:bg-red-500/10 hover:text-red-800 dark:hover:bg-red-500/10 dark:hover:text-red-500"
          style={{height: "auto"}}
          variant={"ghost"}
          onClick={removeHandler}
        >
          Restore Room Default
        </Button>
      </div>
    </div>
  );
}

function ShowItemsMenu(): JSX.Element {

  const [open, setOpen] = useState(false);

  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const leaveTimer = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    hoverTimer.current = setTimeout(() => setOpen(true), 250);
  };

  const handleLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    leaveTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const [showItems, setShowItems] = useState<"ALL" | "SELECTED" | "ADDED">("ALL");

  useEffect(() => {
    const initialShowItems = async () => {
      setShowItems(await getShowItemsFromScene(await OBR.scene.getMetadata()));
    };
    
    initialShowItems();

    OBR.scene.onMetadataChange(async (sceneMetadata) => {
      getShowItemsFromScene(sceneMetadata).then((showItems) => setShowItems(showItems));
    });
  });

  const renderMainIcon = () => {
    switch (showItems) {
      case "ALL":
        return (
          <Asterisk />
        );
      case "SELECTED":
        return (
          <Selection />
        );
      case "ADDED":
        return (
          <ManuallyAdded />
        );
    }
  };
  
  return (
    <TableCell
      className="align-top"
      style={{
        padding: "0px",
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            style={{
              width: "32px",
              height: "32px",
              
              outline: "none",
              boxShadow: "none",
            }}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            variant={"ghost"}
            size={"icon"}
          >
            {renderMainIcon()}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onMouseEnter={handleEnter}  // keep open if mouse enters popup
          onMouseLeave={handleLeave}  // close only when leaving popup too
          align="end"
          sideOffset={-37}
          alignOffset={-5}
          style={{ 
            height: "42px",
            width: "114px",
          }}
        >
          <TableCell
            className="items-center justify-center gap-1 p-1"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
            }}
          >
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => {
                    // dispatch({
                    //   type: "set-show-items",
                    //   showItems: "ALL",
                    // });
                    updateTokensShowItems("ALL");
                    setSceneShowItems("ALL");
                    setOpen(false);
                  }}
                >
                  {showItems === "ALL" ? (
                    <div className="text-primary-500 dark:text-primary-dark">
                      <Asterisk />
                    </div>
                  ) : (
                    <Asterisk />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Use All Tokens
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => {
                    // dispatch({
                    //   type: "set-show-items",
                    //   showItems: "SELECTED",
                    // });
                    updateTokensShowItems("SELECTED");
                    setSceneShowItems("SELECTED");
                    setOpen(false);
                  }}
                >
                  {showItems === "SELECTED" ? (
                    <div className="text-primary-500 dark:text-primary-dark">
                      <Selection />
                    </div>
                  ) : (
                    <Selection />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Use Selected Tokens
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => {
                    // dispatch({
                    //   type: "set-show-items",
                    //   showItems: "ADDED",
                    // });
                    updateTokensShowItems("ADDED");
                    setSceneShowItems("ADDED");
                    setOpen(false);
                  }}
                >
                  {showItems === "ADDED" ? (
                    <div className="text-primary-500 dark:text-primary-dark">
                      <ManuallyAdded />
                    </div>
                  ) : (
                    <ManuallyAdded />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Use Manually Added Tokens
              </TooltipContent>
            </Tooltip>
          </TableCell>
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}

export async function updateTokensShowItems(
  newShowItems: "ALL" | "SELECTED" | "ADDED",
) {
  await OBR.scene.items.updateItems(
    await OBR.scene.items.getItems(itemFilter),
    (items) => {
      for (let i = 0; i < items.length; i++) {
        
        const newMetadata = {
          [ITEM_SHOW_ITEMS_METADATA_ID]: newShowItems,
        };

        let retrievedMetadata: any;
        if (items[i].metadata[getPluginId("metadata")]) {
          retrievedMetadata = JSON.parse(
            JSON.stringify(items[i].metadata[getPluginId("metadata")]),
          );
        }

        const combinedMetadata = { ...retrievedMetadata, ...newMetadata }; //overwrite only the modified value
        items[i].metadata[getPluginId("metadata")] = combinedMetadata;
      }
    },
  );
}