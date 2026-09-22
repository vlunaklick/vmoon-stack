export class KixError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {Record<string, unknown> | null} [details]
   */
  constructor(code, message, details = null) {
    super(message);
    this.name = 'KixError';
    this.code = code;
    this.details = details;
  }
}
