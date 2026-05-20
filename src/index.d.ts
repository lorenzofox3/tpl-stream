declare const safeHTMLBrand: unique symbol;
export type UnsafeHTML = { readonly [safeHTMLBrand]: true };
export declare function raw(value: string): UnsafeHTML;

// Single source of truth for the string error message used in SafeInterpolation and container types
type HTMLStringError = 'Error: wrap string values with raw() for safe HTML interpolation';

export type SafeInterpolation<T> = T extends string ? HTMLStringError : T;

declare const templateBrand: unique symbol;

// needs to be using interfaces to break self referencing type TS bug and force lazy evaluation
// HTMLStringError | HTMLNonString is used instead of SafeInterpolation<HTMLValue> to avoid
// expanding the conditional type through HTMLValue → HTMLNonString → interfaces → ... (infinite recursion)
interface HTMLIterableValue extends Iterable<HTMLStringError | HTMLNonString> {}
interface HTMLAsyncIterableValue
  extends AsyncIterable<HTMLStringError | HTMLNonString> {}

type HTMLNonString =
  | number
  | boolean
  | Record<string, string | boolean | number>
  | UnsafeHTML
  | HTMLTemplate
  | Promise<HTMLStringError | HTMLNonString>
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
