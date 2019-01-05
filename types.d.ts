declare namespace squareicon {

    type Options = {
        id?: string;
        hasher: (val: string) => string;
        colors: number;
        pixels: number;
        size: number;
        padding: number;
        symmetry: 'none' | 'vertical' | 'horizontal' | 'center';
        scheme: 'raw' | 'standard' | 'bright' | 'light' | 'dark';
        background: string;
    };

    type Callback = (err: Error, buffer: Buffer | string) => void;

    interface Squareicon {
        (options: Options, callback?: Callback): Buffer | string | void;

        DEFAULT: Options;
    }

}

declare const squareicon: squareicon.Squareicon;
export = squareicon;
export as namespace squareicon;
