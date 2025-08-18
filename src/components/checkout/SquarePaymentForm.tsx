'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SquarePaymentFormProps {
  applicationId: string;
  locationId: string;
  total: number;
  onPaymentSuccess: (token: string) => void;
  disabled?: boolean;
  environment?: 'sandbox' | 'production';
}

export interface SquarePaymentFormRef {
  handlePayment: () => Promise<void>;
}

declare global {
  interface Window {
    Square: any;
  }
}

const SquarePaymentForm = forwardRef<SquarePaymentFormRef, SquarePaymentFormProps>(({
  applicationId,
  locationId,
  total,
  onPaymentSuccess,
  disabled = false,
  environment = 'sandbox',
}, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInstance = useRef<any>(null);
  const paymentsInstance = useRef<any>(null);

  // Load Square SDK
  useEffect(() => {
    const loadSquareSDK = async () => {
      // Check if already loaded
      if (window.Square) {
        // console.log("Square SDK already loaded");
        setIsSDKLoaded(true);

        return;
      }

      // Validate required props
      if (!applicationId || !locationId) {
        const error = 'Missing required Square credentials';

        console.error(error, {
          applicationId: !!applicationId,
          locationId: !!locationId,
        });
        setSdkError(error);
        toast.error(error);

        return;
      }

      try {
        // Determine SDK URL based on environment
        const sdkUrl
          = environment === 'production'
            ? 'https://web.squarecdn.com/v1/square.js'
            : 'https://sandbox-web.squarecdn.com/v1/square.js';

        // console.log(`Loading Square SDK from: ${sdkUrl}`);
        // console.log(`Environment: ${environment}`);
        // console.log(`Application ID: ${applicationId}`);
        // console.log(`Location ID: ${locationId}`);

        const script = document.createElement('script');

        script.src = sdkUrl;
        script.async = true;

        script.onload = () => {
          // console.log("Square SDK loaded successfully");
          setIsSDKLoaded(true);
        };

        script.onerror = (error) => {
          console.error('Failed to load Square SDK:', error);
          const errorMsg
            = 'Failed to load Square payment SDK. Please check your internet connection.';

          setSdkError(errorMsg);
          toast.error(errorMsg);
        };

        // Add timeout for loading
        const timeout = setTimeout(() => {
          if (!window.Square) {
            console.error('Square SDK loading timeout');
            const errorMsg
              = 'Square SDK loading timeout. Please refresh the page.';

            setSdkError(errorMsg);
            toast.error(errorMsg);
          }
        }, 10000); // 10 second timeout

        script.onload = () => {
          clearTimeout(timeout);
          // console.log("Square SDK loaded successfully");
          setIsSDKLoaded(true);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Square SDK:', error);
        const errorMsg = 'Failed to initialize Square payment system';

        setSdkError(errorMsg);
        toast.error(errorMsg);
      }
    };

    loadSquareSDK();
  }, [applicationId, locationId, environment]);

  // Initialize Square payment form
  useEffect(() => {
    const initializeSquarePayments = async () => {
      if (!isSDKLoaded || !window.Square || !cardRef.current) {
        // console.log("Waiting for Square SDK or card container...", {
        //   isSDKLoaded,
        //   hasSquare: !!window.Square,
        //   hasCardRef: !!cardRef.current,
        // });
        return;
      }

      try {
        // console.log("Initializing Square payments...");

        // Initialize Square payments
        const payments = window.Square.payments(applicationId, locationId);

        paymentsInstance.current = payments;

        // Initialize card payment method
        const card = await payments.card({
          style: {
            input: {
              fontSize: '16px',
              color: '#374151',
            },
            '.input-container': {
              borderRadius: '8px',
              borderColor: '#D1D5DB',
              borderWidth: '1px',
            },
            '.input-container.is-focus': {
              borderColor: '#3B82F6',
            },
            '.input-container.is-error': {
              borderColor: '#EF4444',
            },
            '.message-text': {
              color: '#EF4444',
            },
          },
        });

        cardInstance.current = card;

        // Attach card to DOM
        await card.attach(cardRef.current);

        // console.log("Square payment form initialized successfully");
      } catch (error) {
        console.error('Failed to initialize Square payments:', error);
        const errorMsg = `Failed to initialize payment form: ${
          error instanceof Error ? error.message : String(error)
        }`;

        setSdkError(errorMsg);
        toast.error(errorMsg);
      }
    };

    initializeSquarePayments();

    // Cleanup function
    return () => {
      if (cardInstance.current) {
        try {
          cardInstance.current.destroy();
        } catch (error) {
          console.warn('Error destroying card instance:', error);
        }
      }
    };
  }, [isSDKLoaded, applicationId, locationId]);

  // Expose handlePayment function to parent component
  const handlePayment = async () => {
    if (!cardInstance.current || disabled) { return; }

    setIsLoading(true);

    try {
      // console.log("Tokenizing payment...");

      // Tokenize the card
      const result = await cardInstance.current.tokenize();

      // console.log("Tokenization result:", result);

      if (result.status === 'OK') {
        const token = result.token;

        setPaymentToken(token);
        onPaymentSuccess(token);
        toast.success('Payment method verified successfully');
      } else {
        // Handle tokenization errors
        let errorMessage = 'Payment verification failed';

        if (result.errors && result.errors.length > 0) {
          errorMessage = result.errors
            .map((error: any) => error.detail || error.message)
            .join(', ');
        }

        console.error('Tokenization failed:', result);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Payment tokenization error:', error);
      toast.error('Failed to process payment method');
    } finally {
      setIsLoading(false);
    }
  };

  // Expose handlePayment function to parent component
  useImperativeHandle(ref, () => ({
    handlePayment,
  }), [handlePayment]);

  // Show error state
  if (sdkError) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="text-red-800 font-medium mb-2">
          Payment System Error
        </div>
        <div className="text-red-600 text-sm mb-4">{sdkError}</div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  // Show loading state
  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading payment form...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Debug info in development */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          Environment: {environment} | App ID: {applicationId?.slice(0, 8)}... |
          Location: {locationId?.slice(0, 8)}...
        </div>
      )} */}

      {/* Card input container */}
      <div
        ref={cardRef}
        className="min-h-[200px] p-4 border border-gray-300 rounded-lg bg-white"
        style={{
          minHeight: '200px',
        }}
      />

      {/* Payment status */}
      {paymentToken && (
        <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Payment method verified</span>
        </div>
      )}

      {/* Tokenize button - HIDDEN */}
      {/* {!paymentToken && (
        <Button
          onClick={handlePayment}
          disabled={isLoading || disabled}
          className="w-full"
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Payment Method"
          )}
        </Button>
      )} */}
    </div>
  );
});

export default SquarePaymentForm;
