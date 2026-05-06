declare const rawBrand: unique symbol;
export type UnsafeHTML = [string] & { readonly [rawBrand]: true };
export declare function raw(value: string): UnsafeHTML;

declare const templateBrand: unique symbol;

type HTMLValue =
  | string
  | number
  | boolean
  | Record<string, string | boolean | number>
  | UnsafeHTML
  | HTMLTemplate
  | Promise<string | HTMLTemplate>
  | AsyncIterable<string | HTMLTemplate>;

export interface HTMLTemplate
  extends Iterable<string | HTMLTemplate | Promise<unknown>> {
  readonly [templateBrand]: true;
}

export declare function html(
  strings: TemplateStringsArray,
  ...values: HTMLValue[]
): HTMLTemplate;

export declare function render(
  template: HTMLTemplate,
  options?: { highWaterMark?: number },
): ReadableStream<string>;

export declare function renderAsString(template: HTMLTemplate): Promise<string>;
