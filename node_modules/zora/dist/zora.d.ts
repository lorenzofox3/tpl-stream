interface IAssertionResult<T> {
  pass: boolean;
  actual: unknown;
  expected: T;
  description: string;
  operator: string;
  at?: string;
}

interface ComparatorAssertionFunction {
  <T>(actual: unknown, expected: T, description?: string): IAssertionResult<T>;
}

interface BooleanAssertionFunction {
  (actual: unknown, description?: string): IAssertionResult<boolean>;
}

type ErrorAssertionFunction = {
  (
    fn: Function,
    expected: RegExp | Function,
    description?: string
  ): IAssertionResult<string | Function>;
  (fn: Function, description?: string): IAssertionResult<string>;
};

interface MessageAssertionFunction {
  (message?: string): IAssertionResult<string>;
}

interface IAssert$1 {
  equal: ComparatorAssertionFunction;

  equals: ComparatorAssertionFunction;

  eq: ComparatorAssertionFunction;

  deepEqual: ComparatorAssertionFunction;

  notEqual: ComparatorAssertionFunction;

  notEquals: ComparatorAssertionFunction;

  notEq: ComparatorAssertionFunction;

  notDeepEqual: ComparatorAssertionFunction;

  is: ComparatorAssertionFunction;

  same: ComparatorAssertionFunction;

  isNot: ComparatorAssertionFunction;

  notSame: ComparatorAssertionFunction;

  ok: BooleanAssertionFunction;

  truthy: BooleanAssertionFunction;

  notOk: BooleanAssertionFunction;

  falsy: BooleanAssertionFunction;

  fail: MessageAssertionFunction;

  throws: ErrorAssertionFunction;
}

interface INewTestMessageInput {
  description: string;
  skip: boolean;
}

interface ITestEndMessageInput {
  description: string;
  executionTime: number;
}

interface IMessage<T> {
  type: string;
  data: T;
}

interface INewTestMessage extends IMessage<INewTestMessageInput> {
  type: 'TEST_START';
}

interface IAssertionMessage extends IMessage<IAssertionResult<unknown>> {
  type: 'ASSERTION';
}

interface ITestEndMessage extends IMessage<ITestEndMessageInput> {
  type: 'TEST_END';
}

interface IErrorMessage extends IMessage<{ error: unknown }> {
  type: 'ERROR';
}

type Message =
  | IAssertionMessage
  | IErrorMessage
  | ITestEndMessage
  | INewTestMessage;

interface IReporter {
  (messageStream: AsyncIterable<Message>): Promise<void>;
}

interface ILogOptions {
  log?: (message: any) => void;
  serialize?: (value: any) => string;
}

declare function createJSONReporter(opts?: ILogOptions): IReporter;

declare function createTAPReporter(opts?: ILogOptions): IReporter;

interface IReportOptions {
  reporter: IReporter;
}

interface IHarnessOptions {
  onlyMode?: boolean;
}

interface ITester {
  test: ITestFunction;
  skip: ITestFunction;
  only: ITestFunction;
}

interface IAssert extends IAssert$1, ITester {}

interface ISpecFunction {
  (assert: IAssert): any;
}

interface ITestOptions {
  skip?: boolean;
  timeout?: number;
}

interface ITestFunction {
  (
    description: string,
    spec: ISpecFunction,
    opts?: ITestOptions
  ): Promise<any> & AsyncIterable<Message>;
}

interface ITestHarness extends ITester {
  report(opts: IReportOptions): ReturnType<IReporter>;
}


declare let Assert: IAssert;
declare function hold(): void;
declare function report(opts: IReportOptions): ReturnType<IReporter>;
declare function createHarness(opts: IHarnessOptions): ITestHarness;
declare const test: ITestFunction;
declare const only: ITestFunction;
declare const skip: ITestFunction;

export { Assert, IAssert, IHarnessOptions, ILogOptions, IReportOptions, ISpecFunction, ITestFunction, ITestHarness, ITestOptions, ITester, createHarness, createJSONReporter, createTAPReporter, hold, only, report, skip, test };
