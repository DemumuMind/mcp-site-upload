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
        <span className={cn("text-base font-semibold tracking-[0.08em] text-violet-50 sm:text-[1.05rem]", textClassName)}>
          <span className="text-violet-50">Demumu</span>
          <span className="bg-gradient-to-r from-sky-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            Mind
          </span>
        </span>
        {subtitle ? (<span className="mt-1 text-[0.58rem] font-medium tracking-[0.26em] text-violet-300 uppercase">
            {subtitle}
          </span>) : null}
      </span>
    </span>);
}
