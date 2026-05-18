declare const rawBrand: unique symbol;
export type UnsafeHTML = [string] & { readonly [rawBrand]: true };
export declare function raw(value: string): UnsafeHTML;

declare const templateBrand: unique symbol;

// needs to be using interfaces to break self referencing type TS bug and force lazy evaluation
interface HTMLIterableValue extends Iterable<HTMLNonString> {}
interface HTMLAsyncIterableValue extends AsyncIterable<HTMLNonString> {}

type HTMLNonString =
  | number
  | boolean
  | Record<string, string | boolean | number>
  | UnsafeHTML
  | HTMLTemplate
  | Promise<HTMLNonString>
  | (HTMLIterableValue & object) // & object to "filter out" string which is itself iterable
  | (HTMLAsyncIterableValue & object);

type HTMLValue = string | HTMLNonString;

type HTMLTemplate = Iterable<string | HTMLTemplate | Promise<unknown>> & {
  readonly [templateBrand]: true;
};

export declare function html(
  strings: TemplateStringsArray,
  ...values: HTMLValue[]
): HTMLTemplate;

export declare function render(
  template: HTMLTemplate,
  options?: { highWaterMark?: number },
): ReadableStream<string>;

export declare function renderAsString(template: HTMLTemplate): Promise<string>;
