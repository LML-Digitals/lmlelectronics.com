"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, RotateCw, Download } from "lucide-react";
import JsBarcode from "jsbarcode";
import { generateUniqueBarcode } from "./services/barcodeService";

interface BarcodeGeneratorProps {
  barcode?: string;
  variationId?: string;
  variationName?: string;
  price?: number;
  onGenerateBarcode?: (barcode: string) => void;
  onUpdateBarcode?: (variationId: string, barcode: string) => Promise<string>;
}

export function BarcodeGenerator({
  barcode,
  variationId,
  variationName,
  price,
  onGenerateBarcode,
  onUpdateBarcode,
}: BarcodeGeneratorProps) {
  const [currentBarcode, setCurrentBarcode] = useState<string>(barcode || "");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Initialize with provided barcode if available
    if (barcode) {
      setCurrentBarcode(barcode);
    }
  }, [barcode]);

  useEffect(() => {
    // Generate barcode visualization when barcode value changes
    if (currentBarcode && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, currentBarcode, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 16,
          margin: 10,
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [currentBarcode]);

  const handleGenerateBarcode = async () => {
    setIsGenerating(true);
    try {
      // Client-side generation (will be replaced by server response)
      const newBarcode = await generateUniqueBarcode();

      // Update state with new barcode
      setCurrentBarcode(newBarcode);

      // Notify parent component
      if (onGenerateBarcode) {
        onGenerateBarcode(newBarcode);
      }

      // If we have a variation ID, update it in the database
      if (variationId && onUpdateBarcode) {
        const updatedBarcode = await onUpdateBarcode(variationId, newBarcode);
        setCurrentBarcode(updatedBarcode);
      }
    } catch (error) {
      console.error("Error generating barcode:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintBarcode = () => {
    if (!barcodeRef.current) return;

    const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Create an image from the SVG
    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height + 40; // Add space for the product name

      if (ctx) {
        // Draw white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the barcode
        ctx.drawImage(img, 0, 0);

        // Add product name and price if available
        if (variationName || price) {
          ctx.font = "14px Arial";
          ctx.fillStyle = "black";
          ctx.textAlign = "center";

          const text = [
            variationName,
            price !== undefined ? `$${price.toFixed(2)}` : "",
          ]
            .filter(Boolean)
            .join(" - ");

          ctx.fillText(text, canvas.width / 2, img.height + 25);
        }

        // Create a print window
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Barcode</title>
                <style>
                  body { margin: 0; padding: 20px; text-align: center; }
                  button { padding: 10px 20px; margin: 20px; }
                  @media print {
                    button { display: none; }
                  }
                </style>
              </head>
              <body>
                <img src="${canvas.toDataURL("image/png")}" />
                <br />
                <button onclick="window.print()">Print</button>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }

      // Clean up
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const handleDownloadBarcode = () => {
    if (!barcodeRef.current) return;

    const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Create an image from the SVG
    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height + 40; // Add space for the product name

      if (ctx) {
        // Draw white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the barcode
        ctx.drawImage(img, 0, 0);

        // Add product name and price if available
        if (variationName || price) {
          ctx.font = "14px Arial";
          ctx.fillStyle = "black";
          ctx.textAlign = "center";

          const text = [
            variationName,
            price !== undefined ? `$${price.toFixed(2)}` : "",
          ]
            .filter(Boolean)
            .join(" - ");

          ctx.fillText(text, canvas.width / 2, img.height + 25);
        }

        // Create download link
        const downloadLink = document.createElement("a");
        downloadLink.download = `barcode-${
          variationName || currentBarcode
        }.png`;
        downloadLink.href = canvas.toDataURL("image/png");
        downloadLink.click();
      }

      // Clean up
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <Card className="p-4 flex flex-col items-center space-y-4">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold">Product Barcode</h3>
        {!currentBarcode && (
          <p className="text-sm text-gray-500">No barcode assigned yet</p>
        )}
      </div>

      {currentBarcode ? (
        <div className="w-full flex flex-col items-center">
          <svg ref={barcodeRef} className="w-full max-w-xs"></svg>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button onClick={handlePrintBarcode} size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleDownloadBarcode} size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              onClick={handleGenerateBarcode}
              size="sm"
              variant="secondary"
              disabled={isGenerating}
            >
              <RotateCw
                className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
              />
              Regenerate
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={handleGenerateBarcode}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RotateCw className="mr-2 h-4 w-4" />
              Generate Barcode
            </>
          )}
        </Button>
      )}
    </Card>
  );
}
