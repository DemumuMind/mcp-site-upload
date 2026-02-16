import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";
type BrandLockupProps = {
    className?: string;
    markClassName?: string;
    textClassName?: string;
    subtitle?: string;
};
export function BrandLockup({ className, markClassName, textClassName, subtitle, }: BrandLockupProps) {
    return (<span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className={cn("size-7", markClassName)} decorative/>
      <span className="flex flex-col leading-none">
        <span className={cn("text-base font-semibold tracking-[0.08em] text-foreground sm:text-[1.05rem]", textClassName)}>
          <span className="text-foreground">Demumu</span>
          <span className="bg-gradient-to-r from-primary via-[#ffd766] to-[#f3b811] bg-clip-text text-transparent">
            Mind
          </span>
        </span>
        {subtitle ? (<span className="mt-1 text-[0.58rem] font-medium tracking-[0.26em] text-muted-foreground uppercase">
            {subtitle}
          </span>) : null}
      </span>
    </span>);
}

