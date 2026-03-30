import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { compressImage } from "../utils/compressImage";
import { useInternetIdentity } from "./useInternetIdentity";

export function useUploadPhoto() {
  const { identity } = useInternetIdentity();

  /**
   * Compress + upload a File to blob-storage.
   * Returns the direct URL for the uploaded file.
   * Falls back to a local object URL if storage is unavailable.
   */
  const uploadFile = useCallback(
    async (file: File, maxPx = 1200, quality = 0.8): Promise<string> => {
      let config: Awaited<ReturnType<typeof loadConfig>>;
      try {
        config = await loadConfig();
      } catch {
        // No config — return a local object URL as fallback
        const compressed = await compressImage(file, maxPx, quality).catch(
          () => file,
        );
        return URL.createObjectURL(compressed);
      }

      // If no real gateway, fall back to a data URI
      if (
        !config.storage_gateway_url ||
        config.storage_gateway_url === "nogateway"
      ) {
        const compressed = await compressImage(file, maxPx, quality).catch(
          () => file,
        );
        return URL.createObjectURL(compressed);
      }

      const compressed = await compressImage(file, maxPx, quality);

      const agent = new HttpAgent({
        host: config.backend_host,
        identity: identity ?? undefined,
      });

      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(console.error);
      }

      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );

      const bytes = new Uint8Array(await compressed.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      return storageClient.getDirectURL(hash);
    },
    [identity],
  );

  return { uploadFile };
}
