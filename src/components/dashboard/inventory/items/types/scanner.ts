export interface QuaggaConfig {
  inputStream: {
    name: string;
    type: string;
    target: HTMLDivElement; // More specific type than HTMLElement
    constraints: {
      facingMode: 'user' | 'environment'; // Specific values only
      width: { min: number; ideal: number; max: number };
      height: { min: number; ideal: number; max: number };
      aspectRatio: { min: number; max: number };
    };
    area: {
      top: string;
      right: string;
      left: string;
      bottom: string;
    };
  };
  locator: {
    patchSize: 'x-small' | 'small' | 'medium' | 'large' | 'x-large';
    halfSample: boolean;
  };
  numOfWorkers: number;
  decoder: {
    readers: Array<QuaggaReaderType>; // Use Array type for better type checking
  };
  locate: boolean;
  frequency?: number;
  debug?: boolean;
}

export type QuaggaReaderType =
  | 'ean_reader'
  | 'ean_8_reader'
  | 'code_128_reader'
  | 'code_39_reader'
  | 'upc_reader'
  | 'upc_e_reader'
  | 'codabar_reader'
  | 'i2of5_reader';

export interface QuaggaError {
  name: string;
  message: string;
  stack?: string;
}

export interface BarcodeLocation {
  x: number;
  y: number;
}

export interface QuaggaResult {
  codeResult: {
    code: string;
    format: string;
    start: number;
    end: number;
    codeset?: number;
    startInfo?: {
      error: number;
      start: number;
      end: number;
    };
    decodedCodes?: Array<{
      code: number;
      start: number;
      end: number;
    }>;
  };
  line: BarcodeLocation[];
  angle: number;
  pattern: number[];
  boxes: number[][];
  box?: number[];
}

export interface QuaggaProcessedResult {
  boxes?: number[][];
  line?: BarcodeLocation[];
  codeResult?: {
    code: string;
    format: string;
  };
}
