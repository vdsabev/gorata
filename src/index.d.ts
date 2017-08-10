/// <reference path="../node_modules/@types/googlemaps/index.d.ts" />
/// <reference path="../node_modules/@types/mithril/index.d.ts" />
/// <reference path="../node_modules/compote/components/index.d.ts" />

interface Process {
  VERSION: string;
  env: Record<string, any>;
}

interface Action<ActionType> {
  type?: ActionType;
}

// TODO: Move to compote
interface Constructor<T> {
  new(...args: any[]): T;
}

declare var process: Process;
