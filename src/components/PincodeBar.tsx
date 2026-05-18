import { useState } from "react";
import { MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePincode } from "@/lib/local-storage-hooks";

export function PincodeBar() {
  const [pincode, setPincode] = usePincode();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(pincode);

  const save = () => {
    if (/^\d{6}$/.test(draft)) {
      setPincode(draft);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">Deliver to</span>
          <span className="font-semibold">{pincode}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold">Enter delivery pincode</h4>
            <p className="text-xs text-muted-foreground">Prices and availability vary by area.</p>
          </div>
          <div className="flex gap-2">
            <Input
              value={draft}
              maxLength={6}
              inputMode="numeric"
              onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
              placeholder="560001"
            />
            <Button onClick={save} size="sm">
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}