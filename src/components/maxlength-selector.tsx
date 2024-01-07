'use client';

import * as React from 'react';
import { SliderProps } from '@radix-ui/react-slider';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface MaxLengthSelectorProps {
  defaultValue: SliderProps['defaultValue'];
}

export function MaxLengthSelector({ defaultValue }: MaxLengthSelectorProps) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <div className="grid gap-2 pt-2">
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="maxlength">Maximum results</Label>
          <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
            {value}
          </span>
        </div>
        <Slider
          id="maxlength"
          max={100}
          defaultValue={value}
          step={1}
          onValueChange={setValue}
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          aria-label="Maximum results size"
        />
      </div>
    </div>
  );
}
