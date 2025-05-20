import {
  getComponentData,
  getAllKeyValueStoreKeys,
  fetchKeyValueStoreDataInChunks,
  type GatewayApi,
} from "../services/gateway";
import type {
  LedgerStateSelector,
  StateEntityDetailsResponseItem,
} from "@radixdlt/babylon-gateway-api-sdk";

import { DataError } from "../types/errors";

interface ComponentField {
  kind: string;
  type_name?: string;
  field_name?: string;
  value?: string;
  fields?: ComponentField[];
  variant_id?: string;
  variant_name?: string;
}

interface ComponentState {
  fields: ComponentField[];
}

interface BinData {
  amount: string;
  total_claim: string;
}

interface C9BinMapData {
  [tick: number]: BinData;
}

interface ScryptoField {
  kind: string;
  field_name?: string;
  value?: string;
}

interface ScryptoValue {
  kind: string;
  fields?: ScryptoField[];
}

interface LiquidityClaim {
  tick: number;
  claim: string;
}

interface LiquidityReceipt {
  liquidity_claims: LiquidityClaim[];
}

interface RedemptionValue {
  amount_x: string;
  amount_y: string;
}

interface NFTDataEntry {
  key: {
    kind: string;
    value: string;
  };
  value: {
    kind: string;
    value: string;
  };
}

interface NFTLiquidityClaims {
  kind: string;
  field_name: string;
  key_kind: string;
  value_kind: string;
  entries: NFTDataEntry[];
}

interface NFTData {
  kind: string;
  type_name: string;
  fields: {
    kind: string;
    field_name: string;
    key_kind: string;
    value_kind: string;
    entries: NFTDataEntry[];
  }[];
}

export async function getC9BinData(
  componentAddress: string,
  stateVersion: number,
  gatewayApi: GatewayApi
): Promise<{
  componentData: StateEntityDetailsResponseItem;
  binMapData: C9BinMapData;
  nftAddress: string;
  currentTick?: number;
  active_x: string;
  active_y: string;
  active_total_claim: string;
  binSpan: number;
} | null> {
  try {
    // Validate state version before proceeding
    const currentStateVersion = await gatewayApi.status
      .getCurrent()
      .then((response) => response.ledger_state.state_version);
    if (stateVersion > currentStateVersion) {
      throw DataError.stateVersionTooHigh(stateVersion);
    }

    const ledgerState: LedgerStateSelector = { state_version: stateVersion };

    // 1. Get component data
    const componentData = await getComponentData(
      gatewayApi,
      componentAddress,
      stateVersion
    );
    if (!componentData) {
      console.error("Component data not found");
      return null;
    }

    // 2. Extract all needed fields from component state
    const state = (componentData.details as any)?.state as ComponentState;
    if (!state?.fields) {
      console.error("Invalid component state");
      return null;
    }

    // Find required fields
    const binMapField = state.fields.find((f) => f.field_name === "bin_map");
    const tickIndexField = state.fields.find(
      (f) => f.field_name === "tick_index"
    );
    const nftManagerField = state.fields.find(
      (f) => f.field_name === "liquidity_receipt_manager"
    );
    const activeXField = state.fields.find((f) => f.field_name === "active_x");
    const activeYField = state.fields.find((f) => f.field_name === "active_y");
    const activeTotalClaimField = state.fields.find(
      (f) => f.field_name === "active_total_claim"
    );
    const binSpanField = state.fields.find((f) => f.field_name === "bin_span");

    if (
      !binMapField?.value ||
      !nftManagerField?.value ||
      !activeXField?.value ||
      !activeYField?.value ||
      !activeTotalClaimField?.value ||
      !binSpanField?.value
    ) {
      console.error("Required fields not found in component state");
      return null;
    }

    // Extract current tick if available
    const currentTickField = tickIndexField?.fields?.find(
      (f) => f.field_name === "current"
    )?.fields?.[0]?.fields?.[0]?.value;
    const currentTick = currentTickField
      ? parseInt(currentTickField)
      : undefined;

    // Extract bin span
    const binSpan = parseInt(binSpanField.value);
    if (isNaN(binSpan)) {
      console.error("Invalid bin span value");
      return null;
    }

    const kvStoreAddress = binMapField.value;

    // 3. Get all keys from the KV store
    const keys = await getAllKeyValueStoreKeys(
      gatewayApi,
      kvStoreAddress,
      ledgerState
    );

    // 4. Fetch the actual data for all keys
    const rawBinMapData = await fetchKeyValueStoreDataInChunks(
      kvStoreAddress,
      keys,
      gatewayApi,
      ledgerState
    );

    // 5. Transform the data into a dictionary
    const binMapData: C9BinMapData = {};
    for (const entry of rawBinMapData) {
      const keyJson = entry.key.programmatic_json as ScryptoValue;
      const valueJson = entry.value.programmatic_json as ScryptoValue;

      const tick = keyJson?.fields?.[0]?.value;
      if (tick && valueJson?.fields) {
        const fields = valueJson.fields;
        const amount =
          fields.find((f: ScryptoField) => f.field_name === "amount")?.value ||
          "0";
        const totalClaim =
          fields.find((f: ScryptoField) => f.field_name === "total_claim")
            ?.value || "0";

        binMapData[parseInt(tick)] = {
          amount,
          total_claim: totalClaim,
        };
      }
    }

    return {
      componentData,
      binMapData,
      nftAddress: nftManagerField.value,
      currentTick,
      active_x: activeXField.value,
      active_y: activeYField.value,
      active_total_claim: activeTotalClaimField.value,
      binSpan,
    };
  } catch (error) {
    if (error instanceof DataError) {
      throw error;
    }
    console.error("Error in getC9BinData:", error);
    throw error;
  }
}
