import {
  getPluginMetadata,
  safeObjectRead,
} from "@/metadataHelpers/metadataHelpers";

import {
  SaveLocation,
} from "@/metadataHelpers/settingMetadataHelpers";

import {
  OFFSET_METADATA_ID,
  BAR_AT_TOP_METADATA_ID,
  COMPANIONS_SEGMENTS_METADATA_ID,
  STRANGERS_SEGMENTS_METADATA_ID,
  NAME_TAGS_METADATA_ID,
} from "@/metadataHelpers/settingMetadataIds";

import
  OBR, {
  Metadata,
} from "@owlbear-rodeo/sdk";

import {
  useEffect,
  useState,
} from "react";

export default function useSettings(saveLocation: SaveLocation) {
  const [initializationDone, setInitializationDone] = useState<boolean>();
  const [offset, setOffset] = useState<string>();
  const [justification, setJustification] = useState<"TOP" | "BOTTOM">();
  const [companionsSegments, setCompanionsSegments] = useState<string>();
  const [strangersSegments, setStrangersSegments] = useState<string>();
  const [nameTags, setNameTags] = useState<boolean>();

  useEffect(() => {
    const handleSettingsMetadataChange = (metadata: Metadata) => {
      const settings = getPluginMetadata(metadata);
      
      // Offset
      const offset = safeObjectRead(settings, OFFSET_METADATA_ID);
      if (saveLocation === "SCENE" && offset === undefined)
        setOffset(undefined);
      else if (typeof offset === "number" && !Number.isNaN(offset))
        setOffset(offset.toString());
      else setOffset("0");

      // Justification
      const justification = safeObjectRead(settings, BAR_AT_TOP_METADATA_ID);
      if (saveLocation === "SCENE" && justification === undefined)
        setJustification(undefined);
      else if (typeof justification === "boolean")
        setJustification(justification ? "TOP" : "BOTTOM");
      else setJustification("TOP");

      // Companions Segments
      const companionsSegments = safeObjectRead(settings, COMPANIONS_SEGMENTS_METADATA_ID);
      if (saveLocation === "SCENE" && companionsSegments === undefined)
        setCompanionsSegments(undefined);
      else if (typeof companionsSegments === "number" && !Number.isNaN(companionsSegments))
        setCompanionsSegments(companionsSegments.toString());
      else setCompanionsSegments("0");

      // Strangers Segments
      const strangersSegments = safeObjectRead(settings, STRANGERS_SEGMENTS_METADATA_ID);
      if (saveLocation === "SCENE" && strangersSegments === undefined)
        setStrangersSegments(undefined);
      else if (typeof strangersSegments === "number" && !Number.isNaN(strangersSegments))
        setStrangersSegments(strangersSegments.toString());
      else setStrangersSegments("0");

      // Name Tags
      const nameTags = safeObjectRead(settings, NAME_TAGS_METADATA_ID);
      if (saveLocation === "SCENE" && nameTags === undefined)
        setNameTags(undefined);
      else if (typeof nameTags === "boolean") setNameTags(nameTags);
      else setNameTags(false);

      setInitializationDone(true);
    };
    if (saveLocation === "SCENE") {
      OBR.scene.getMetadata().then(handleSettingsMetadataChange);
      return OBR.scene.onMetadataChange(handleSettingsMetadataChange);
    }
    OBR.room.getMetadata().then(handleSettingsMetadataChange);
    return OBR.room.onMetadataChange(handleSettingsMetadataChange);
  }, []);

  return {
    initializationDone,
    offset,
    setOffset,
    justification,
    setJustification,
    companionsSegments,
    setCompanionsSegments,
    strangersSegments,
    setStrangersSegments,
    nameTags,
    setNameTags,
  };
}
