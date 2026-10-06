export class CatalogError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'CatalogError';
  }
}

export class StreamNotFoundError extends Error {
  constructor(readonly streamId: string) {
    super('This title does not exist or is no longer available.');
    this.name = 'StreamNotFoundError';
  }
}
