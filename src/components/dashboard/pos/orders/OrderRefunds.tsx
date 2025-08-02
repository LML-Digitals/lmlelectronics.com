import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import type { Refund } from "@prisma/client";

interface OrderRefundsProps {
  refunds: Refund[];
}

export function OrderRefunds({ refunds }: OrderRefundsProps) {
  if (refunds.length === 0) {
    return null;
  }

  const totalRefunded = refunds.reduce((sum, refund) => sum + refund.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refunds
        </CardTitle>
        <CardDescription>
          {refunds.length} refund{refunds.length !== 1 ? "s" : ""} totaling $
          {totalRefunded.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {refunds.map((refund) => (
            <div
              key={refund.id}
              className="flex items-center justify-between py-3 border-b last:border-b-0"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    Refunded
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(
                      new Date(refund.createdAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
                {refund.reason && (
                  <p className="text-sm text-muted-foreground">
                    Reason: {refund.reason}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium text-destructive">
                  -$
                  {refund.amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
