interface Process {
  VERSION: string;
  env: Record<string, any>;
}

type Action<ActionType> = {
  type?: ActionType
};

declare var process: Process;
declare var require: any;
