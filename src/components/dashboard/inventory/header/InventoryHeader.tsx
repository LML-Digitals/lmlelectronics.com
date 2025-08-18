import Link from 'next/link';
import { Button } from '../../../ui/button';
import {
  ChevronDown,
  Package,
  Tags,
  MapPin,
  Store,
  ClipboardEdit,
  ClipboardCheck,
  RotateCcw,
  MoveHorizontal,
  ArrowLeftRight,
  ShoppingCart,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

function InventoryHeader () {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight my-4">Inventory</h2>
    </div>
  );
}

export default InventoryHeader;
