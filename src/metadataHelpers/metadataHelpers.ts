import {
  getPluginId,
} from "@/getPluginId";

import {
  Metadata,
} from "@owlbear-rodeo/sdk";

export function getPluginMetadata(itemMetadata: Metadata, pluginId?: string) {
  const pluginMetadata = itemMetadata[
    pluginId ? pluginId : getPluginId("metadata")
  ] as Record<string, unknown>;
  return pluginMetadata;
}

export function readBooleanFromObject(
  object: unknown,
  key: string,
): boolean {
  const value = safeObjectRead(object, key);
  if (typeof value !== "boolean") return false;
  return value;
}

export function readNumberFromObject(
  object: unknown,
  key: string,
  fallback: number = 0,
): number {
  const value = safeObjectRead(object, key);
  if (typeof value !== "number") return fallback;
  if (Number.isNaN(value)) return fallback;
  return value;
}

export function readHealthVisibilityFromObject(
  object: unknown,
  key: string,
): "HIDDEN" | "BAR" | "BAR-VALUE" {
  const value = safeObjectRead(object, key);
  if (typeof value === "string" && ["HIDDEN", "BAR", "BAR-VALUE"].includes(value)) {
    if (value === "HIDDEN") return "HIDDEN";
    if (value === "BAR") return "BAR";
    if (value === "BAR-VALUE") return "BAR-VALUE";
  }
  return "HIDDEN";
}

export function readGroupFromObject(
  object: unknown,
  key: string,
): "COMPANIONS" | "STRANGERS" {
  const value = safeObjectRead(object, key);
  if (typeof value === "string" && ["COMPANIONS", "STRANGERS"].includes(value)) {
    if (value === "COMPANIONS") return "COMPANIONS";
    if (value === "STRANGERS") return "STRANGERS";
  }
  return "STRANGERS";
}

export function readAddedFromObject(
  object: unknown,
  key: string,
): boolean | "undefined" {
  const value = safeObjectRead(object, key);
  if (typeof value !== "boolean") return "undefined";
  return value;
}

export function readShowItemsFromObject(
  object: unknown,
  key: string,
): "ALL" | "SELECTED" | "ADDED" | "undefined" {
  const value = safeObjectRead(object, key);
  if (typeof value === "string" && ["ALL", "SELECTED", "ADDED"].includes(value)) {
    if (value === "ALL") return "ALL";
    if (value === "SELECTED") return "SELECTED";
    if (value === "ADDED") return "ADDED";
  }
  return "undefined";
}

export function safeObjectRead(object: unknown, key: string): unknown {
  try {
    const value = (object as Record<string, unknown>)[key];
    return value;
  } catch (error) {
    return undefined;
  }
}
