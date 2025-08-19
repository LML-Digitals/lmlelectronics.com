'use client';

import { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, XCircle } from 'lucide-react';
import { QuaggaConfig, QuaggaResult, QuaggaError } from './types/scanner';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onScanError?: (error: string) => void;
  isStarted: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function BarcodeScanner ({
  onScanSuccess,
  onScanError,
  isStarted,
  onStart,
  onStop,
}: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper function to properly stop the scanner
  const stopScanner = () => {
    try {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }

      if (isInitialized) {
        Quagga.offDetected();
        Quagga.stop();
        setIsInitialized(false);
        setLastResult(null);
        onStop(); // Notify parent component
      }
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }
  };

  useEffect(() => {
    if (!isStarted || !scannerRef.current || isInitialized) { return; }

    try {
      const config: QuaggaConfig = {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment',
            width: { min: 300, ideal: 600, max: 800 },
            height: { min: 200, ideal: 400, max: 600 },
            aspectRatio: { min: 1, max: 2 },
          },
          area: {
            top: '0%',
            right: '0%',
            left: '0%',
            bottom: '0%',
          },
        },
        locator: {
          patchSize: 'medium',
          halfSample: true,
        },
        numOfWorkers: 2,
        decoder: {
          readers: [
            'ean_reader',
            'ean_8_reader',
            'code_128_reader',
            'code_39_reader',
            'upc_reader',
            'upc_e_reader',
          ],
        },
        locate: true,
      };

      Quagga.init(config, (err: QuaggaError | null) => {
        if (err) {
          console.error('Scanner init error:', err);
          if (onScanError) { onScanError(err.message || 'Scanner initialization failed'); }

          return;
        }

        setIsInitialized(true);
        Quagga.start();

        // Modified detection handler that stops camera after successful scan
        Quagga.onDetected((result: QuaggaResult) => {
          const code = result.codeResult?.code;

          if (code && code !== lastResult) {
            // Update last result immediately
            setLastResult(code);

            // Stop the scanner immediately after successful scan
            stopScanner();

            // Send the result to parent
            onScanSuccess(code);
          }
        });
      });
    } catch (error) {
      console.error('Scanner setup error:', error);
      if (onScanError) { onScanError('Failed to setup scanner'); }
    }

    // Cleanup function
    return stopScanner;
  }, [isStarted, onScanSuccess, onScanError, lastResult, isInitialized]);

  // Handle manual stop
  const handleStop = () => {
    stopScanner();
  };

  // Rest of the component remains unchanged
  return (
    <Card className="p-4">
      {!isStarted ? (
        <Button onClick={onStart} className="w-full">
          <Camera className="mr-2 h-4 w-4" />
          Start Scanner
        </Button>
      ) : (
        <div className="space-y-4">
          <div
            id="interactive"
            className="viewport relative w-full h-auto overflow-hidden"
          >
            <div
              ref={scannerRef}
              className="w-full h-full aspect-video bg-black rounded-lg"
            >
              <style jsx global>{`
                #interactive.viewport {
                  position: relative;
                  max-height: 300px;
                  width: 100%;
                }
                #interactive.viewport video,
                #interactive.viewport canvas {
                  width: 100% !important;
                  height: 100% !important;
                  position: absolute;
                  top: 0;
                  left: 0;
                  max-width: 100%;
                  max-height: 100%;
                  object-fit: contain;
                }
              `}</style>
            </div>
          </div>
          <Button onClick={handleStop} variant="destructive" className="w-full">
            <XCircle className="mr-2 h-4 w-4" />
            Stop Scanner
          </Button>
        </div>
      )}
    </Card>
  );
}
