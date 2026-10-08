import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

export function PlaceholderImage({
  src,
  alt,
  className = "",
  imageClassName = "",
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}) {
  const [broken, setBroken] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The load/error events can fire before React attaches handlers (SSR +
  // instant failure on empty files), so verify the decoded state on mount too.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setBroken(true);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-emerald-deep texture-emerald ${className}`}>
      {!broken ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setBroken(true)}
          onLoad={(event) => {
            if (event.currentTarget.naturalWidth === 0) setBroken(true);
          }}
          className={`h-full w-full object-cover transition-transform duration-700 ${imageClassName}`}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-5 text-center text-champagne-soft">
          <Sparkles className="h-6 w-6" strokeWidth={1} />
          <span className="max-w-[14rem] text-[10px] font-semibold uppercase tracking-[0.18em]">
            Image slot<br />
            <span className="mt-1 block normal-case tracking-normal text-cream/65">{src}</span>
          </span>
        </div>
      )}
    </div>
  );
}
