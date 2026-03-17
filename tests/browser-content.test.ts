import { describe, expect, test } from 'bun:test';
import { extractReadableContentFromHtml } from '../lib/browser-content';

describe('extractReadableContentFromHtml', () => {
  test('converts readable article content to markdown without page chrome', () => {
    const html = `
      <!doctype html>
      <html>
        <head>
          <title>Readable Title</title>
        </head>
        <body>
          <nav>Site navigation</nav>
          <article>
            <h1>Readable Title</h1>
            <p>First paragraph.</p>
            <p>Second paragraph with <a href="https://example.com">a link</a>.</p>
          </article>
          <footer>Footer links</footer>
        </body>
      </html>
    `;

    const result = extractReadableContentFromHtml(html, 'https://example.com/post');

    expect(result.url).toBe('https://example.com/post');
    expect(result.title).toBe('Readable Title');
    expect(result.content).toContain('# Readable Title');
    expect(result.content).toContain('First paragraph.');
    expect(result.content).toContain('[a link](https://example.com)');
    expect(result.content).not.toContain('Site navigation');
    expect(result.content).not.toContain('Footer links');
  });

  test('falls back to main content when readability is weak', () => {
    const html = `
      <!doctype html>
      <html>
        <head>
          <title>Dashboard</title>
        </head>
        <body>
          <header>Global header</header>
          <main>
            <div class="content">
              <h2>Status</h2>
              <p>Build succeeded.</p>
            </div>
          </main>
          <script>window.__SECRET__ = "ignore me";</script>
        </body>
      </html>
    `;

    const result = extractReadableContentFromHtml(html, 'https://example.com/dashboard');

    expect(result.title).toBe('Dashboard');
    expect(result.content).toContain('Status');
    expect(result.content).toContain('Build succeeded.');
    expect(result.content).not.toContain('Global header');
    expect(result.content).not.toContain('__SECRET__');
  });
});
