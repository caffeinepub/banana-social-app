export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'banana-social-app');

  return (
    <footer className="w-full border-t border-nav-border bg-nav py-6 mt-8">
      <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span>🍌</span>
          <span>BananaSocial © {year}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Built with</span>
          <span className="text-banana-dark">🍌</span>
          <span>using</span>
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-banana-dark hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
