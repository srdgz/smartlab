export interface CatalogDataSource {
  readonly name: string;
  fetchStreams(): Promise<unknown>;
}
