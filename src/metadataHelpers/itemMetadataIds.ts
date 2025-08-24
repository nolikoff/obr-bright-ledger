export type StatMetadataID =
  | "HEALTH"
  | "MAX-HEALTH"
  | "TEMP-HEALTH"
  | "ARMOR-CLASS"
  | "HEALTH-VISIBILITY"
  | "TEAM";

export const HEALTH_METADATA_ID: StatMetadataID = "HEALTH";
export const MAX_HEALTH_METADATA_ID: StatMetadataID = "MAX-HEALTH";
export const TEMP_HEALTH_METADATA_ID: StatMetadataID = "TEMP-HEALTH";
export const ARMOR_CLASS_METADATA_ID: StatMetadataID = "ARMOR-CLASS";
export const HEALTH_VISIBILITY_METADATA_ID: StatMetadataID = "HEALTH-VISIBILITY";
export const TEAM_METADATA_ID: StatMetadataID = "TEAM";

export type TokenSortingMetadataID = "GROUP" | "INDEX";

export const GROUP_METADATA_ID: TokenSortingMetadataID = "GROUP";
export const INDEX_METADATA_ID: TokenSortingMetadataID = "INDEX";
