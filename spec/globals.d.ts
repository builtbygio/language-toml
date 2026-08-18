// Ambient globals supplied by the Chevron Jasmine harness
// (spec/jasmine-test-runner.js sets window.atom and the jasmine 1.3 helpers).
// These specs are TypeScript as part of H3 PR 23; the editor's compile-cache
// transpiles them with transpileModule, which strips types without checking,
// so this file exists for editors and tsc rather than for the runtime.
declare const atom: any;
declare function describe(description: string, spec: () => void): void;
declare function it(description: string, spec: (done?: any) => void): void;
declare function beforeEach(fn: (done?: any) => void): void;
declare function afterEach(fn: (done?: any) => void): void;
declare function expect(actual: any): any;
declare function waitsForPromise(fn: () => any): void;
declare function waitsFor(...args: any[]): void;
declare function runs(fn: () => void): void;
