import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center gap-4 pt-28 pb-20 xl:pt-36">
      <span className="label text-fg-muted">Error</span>
      <h1 className="text-7 leading-120 text-fg md:text-[40px]">404 — Not found</h1>
      <p className="max-w-md text-sm leading-140 text-fg-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <Button href="/">Back home</Button>
    </div>
  );
}
