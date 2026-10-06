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
    super('Este contenido no existe o ya no está disponible.');
    this.name = 'StreamNotFoundError';
  }
}
