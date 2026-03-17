import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

export interface ReadableContentResult {
  title?: string;
  content?: string;
  url: string;
}

const MAX_CONTENT_LENGTH = 8000;
const MAIN_CONTENT_SELECTOR = 'main, article, [role="main"], .content, #content';

export function extractReadableContentFromHtml(html: string, url: string, fallbackTitle?: string): ReadableContentResult {
  const turndown = createTurndownService();
  const focusedDom = new JSDOM(html, { url });
  const readabilityDom = new JSDOM(html, { url });
  const fallbackDom = new JSDOM(html, { url });

  const documentTitle = fallbackDom.window.document.title.trim() || undefined;
  let title = fallbackTitle ?? documentTitle;
  let content = extractFocusedContent(focusedDom.window.document, turndown);

  if (!content) {
    try {
      const article = new Readability(readabilityDom.window.document).parse();
      title = article?.title || title;
      content = toMarkdown(article?.content, turndown) || cleanupText(article?.textContent);
    } catch {
      // Fall back to best-effort extraction below.
    }
  }

  if (!content) {
    content = extractFallbackContent(fallbackDom.window.document, turndown);
  }

  const trimmed = content.slice(0, MAX_CONTENT_LENGTH).trim() || undefined;
  return { title, content: trimmed, url };
}

function createTurndownService(): TurndownService {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });
  turndown.use(gfm);
  turndown.addRule('removeEmptyLinks', {
    filter: (node) => node.nodeName === 'A' && !node.textContent?.trim(),
    replacement: () => '',
  });
  return turndown;
}

function extractFocusedContent(document: Document, turndown: TurndownService): string {
  removeNoise(document);
  const main = document.querySelector(MAIN_CONTENT_SELECTOR);
  return toMarkdown(main?.innerHTML, turndown) || cleanupText(main?.textContent);
}

function extractFallbackContent(document: Document, turndown: TurndownService): string {
  removeNoise(document);
  const main = document.querySelector(MAIN_CONTENT_SELECTOR) || document.body || document.documentElement;
  return toMarkdown(main?.innerHTML, turndown) || cleanupText(main?.textContent);
}

function removeNoise(document: Document): void {
  document
    .querySelectorAll('script, style, noscript, template, iframe, nav, header, footer, aside')
    .forEach((element) => element.remove());
}

function toMarkdown(html: string | null | undefined, turndown: TurndownService): string {
  if (!html?.trim()) {
    return '';
  }
  try {
    return cleanupMarkdown(turndown.turndown(html));
  } catch {
    return '';
  }
}

function cleanupMarkdown(markdown: string | null | undefined): string {
  if (!markdown) {
    return '';
  }
  return markdown
    .replace(/\[\s*\]\([^)]*\)/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanupText(text: string | null | undefined): string {
  if (!text) {
    return '';
  }
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
