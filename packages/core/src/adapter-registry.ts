import type { SiteId } from './types/product';
import type { SiteAdapter } from './types/adapter';

export class AdapterRegistry {
  private adapters: Map<SiteId, SiteAdapter> = new Map();

  register(adapter: SiteAdapter): void {
    if (this.adapters.has(adapter.siteId)) {
      throw new Error(`Adapter already registered: ${adapter.siteId}`);
    }
    this.adapters.set(adapter.siteId, adapter);
  }

  unregister(siteId: SiteId): boolean {
    return this.adapters.delete(siteId);
  }

  get(siteId: SiteId): SiteAdapter | undefined {
    return this.adapters.get(siteId);
  }

  getRequired(siteId: SiteId): SiteAdapter {
    const adapter = this.adapters.get(siteId);
    if (!adapter) {
      throw new Error(`Adapter not found: ${siteId}`);
    }
    return adapter;
  }

  getAll(): SiteAdapter[] {
    return Array.from(this.adapters.values());
  }

  getByIds(siteIds: SiteId[]): SiteAdapter[] {
    return siteIds
      .map((id) => this.adapters.get(id))
      .filter((adapter): adapter is SiteAdapter => adapter !== undefined);
  }

  listSiteIds(): SiteId[] {
    return Array.from(this.adapters.keys());
  }

  has(siteId: SiteId): boolean {
    return this.adapters.has(siteId);
  }

  get size(): number {
    return this.adapters.size;
  }
}
