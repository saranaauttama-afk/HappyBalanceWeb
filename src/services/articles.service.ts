import { api } from "./api";
import type { Article } from "../types/models";

export const articlesService = {
  async listArticles(limit: number = 5) {
    return api.get<Article[]>("listArticles", { limit });
  },
};
