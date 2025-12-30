import { LRUCache } from "lru-cache";

export class SessionMemory {
  private _client: LRUCache<string, any>;

  constructor() {
    this._client = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 60 * 24,
    });
  }

  get(key: string) {
    const result = this._client.get(key);
    return result;
  }

  set(key: string, result: any) {
    this._client.set(key, result);
  }
}
