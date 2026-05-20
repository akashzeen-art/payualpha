/**
 * Shared helpers for portal pricing payloads
 */

export type PackTypeMap = Record<string, string | number>;

export const parseMultiplePackType = (apiData: {
  multiplePackType?: PackTypeMap;
  multiplePackTypeJson?: string | PackTypeMap;
}): PackTypeMap | null => {
  if (apiData.multiplePackType && typeof apiData.multiplePackType === "object") {
    return apiData.multiplePackType;
  }

  if (!apiData.multiplePackTypeJson) {
    return null;
  }

  if (typeof apiData.multiplePackTypeJson === "object") {
    return apiData.multiplePackTypeJson;
  }

  try {
    return JSON.parse(apiData.multiplePackTypeJson) as PackTypeMap;
  } catch {
    return null;
  }
};

export const resolvePackPrice = (
  apiData: {
    multiplePackType?: PackTypeMap;
    multiplePackTypeJson?: string | PackTypeMap;
    packType?: string;
    price?: string | number;
  },
  preferredPack?: string
): { packType: string; price: number } | null => {
  const packs = parseMultiplePackType(apiData);

  if (packs) {
    const packKey = preferredPack
      ? Object.keys(packs).find(
          (key) => key.toUpperCase() === preferredPack.toUpperCase()
        )
      : Object.keys(packs)[0];

    if (packKey) {
      const value = packs[packKey];
      const numValue = Number(value);
      if (!Number.isNaN(numValue) && Number.isFinite(numValue)) {
        return { packType: packKey, price: numValue };
      }
    }
  }

  if (
    apiData.packType &&
    apiData.price !== null &&
    apiData.price !== undefined &&
    apiData.price !== ""
  ) {
    const numValue = Number(apiData.price);
    if (!Number.isNaN(numValue) && Number.isFinite(numValue)) {
      return { packType: apiData.packType, price: numValue };
    }
  }

  return null;
};
