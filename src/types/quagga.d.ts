// declare module "quagga" {
//   interface QuaggaConfig {
//     inputStream: {
//       name?: string;
//       type?: string;
//       target?: HTMLElement;
//       constraints?: {
//         width?: number;
//         height?: number;
//         facingMode?: string;
//       };
//       area?: {
//         top?: string;
//         right?: string;
//         left?: string;
//         bottom?: string;
//       };
//     };
//     decoder?: {
//       readers?: string[];
//     };
//     locate?: boolean;
//   }

//   interface CodeResult {
//     code: string;
//     format: string;
//   }

//   interface QuaggaResult {
//     codeResult: CodeResult;
//   }

//   interface Quagga {
//     init(config: QuaggaConfig, callback?: (err?: any) => void): void;
//     start(): void;
//     stop(): void;
//     onDetected(callback: (result: QuaggaResult) => void): void;
//     offDetected(callback: (result: QuaggaResult) => void): void;
//   }

//   const Quagga: Quagga;
//   export default Quagga;
// }

declare module "quagga" {
  const Quagga: any;
  export default Quagga;
}
