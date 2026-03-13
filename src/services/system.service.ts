import { api } from "./api";
import type { SystemVersionInfo } from "../types/models";

export const systemService = {
  async getVersion() {
    return api.get<SystemVersionInfo>("testVersion");
  },
};
