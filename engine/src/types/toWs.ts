export type WsMessage =
  | {
      stream: string;
      data: {
        s: string;
        a: [string, string][];
        b: [string, string][];
        e: string;
      };
    }
  | {
      stream: string;
      data: {
        p: string;
        q: string;
        t: string;
        m: boolean;
        b: string;
        a: string;
      };
    };
