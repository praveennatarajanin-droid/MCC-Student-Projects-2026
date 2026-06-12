// This component injects a blocking <script> that runs synchronously before
// React hydrates, so the correct theme class is applied instantly on every page.
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var t = localStorage.getItem('theme');
        if (t === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch(e) {}
    })();
  `;
  // dangerouslySetInnerHTML is required for inline scripts in Next.js
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
