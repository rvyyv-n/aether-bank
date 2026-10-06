import React from 'react';
import {
  siCapacitor,
  siCloudflarepages,
  siCplusplus,
  siCss,
  siDotnet,
  siFfmpeg,
  siFigma,
  siGithub,
  siGo,
  siHtml5,
  siJavascript,
  siJson,
  siMarkdown,
  siMpv,
  siNodedotjs,
  siOpenjdk,
  siPytest,
  siPython,
  siReact,
  siSvg,
  siTailwindcss,
  siTauri,
  siTypescript,
  siVite,
  siVulkan,
} from 'simple-icons';

type Glyph = { title: string; path: string };

// First match wins, so specific names go before general ones
const MATCHERS: [RegExp, Glyph][] = [
  [/tailwind/i, siTailwindcss],
  [/^react/i, siReact],
  [/typescript/i, siTypescript],
  [/javascript/i, siJavascript],
  [/^node/i, siNodedotjs],
  [/pytest/i, siPytest],
  [/python/i, siPython],
  [/^go$/i, siGo],
  [/\.net/i, siDotnet],
  [/^java$/i, siOpenjdk],
  [/^c\+\+/i, siCplusplus],
  [/vulkan/i, siVulkan],
  [/^vite/i, siVite],
  [/tauri/i, siTauri],
  [/capacitor/i, siCapacitor],
  [/cloudflare/i, siCloudflarepages],
  [/ffmpeg/i, siFfmpeg],
  [/libmpv/i, siMpv],
  [/figma/i, siFigma],
  [/markdown/i, siMarkdown],
  [/^json/i, siJson],
  [/^svg/i, siSvg],
  [/^html/i, siHtml5],
  [/css/i, siCss],
  [/^github/i, siGithub],
];

const glyphFor = (tech: string) => MATCHERS.find(([re]) => re.test(tech))?.[1];

const initials = (tech: string) => {
  const words = tech.replace(/[^A-Za-z0-9#+. ]/g, ' ').trim().split(/\s+/);
  return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : tech.slice(0, 2).toUpperCase();
};

/** A row of technology marks. Names without a mark get a letter tile; every one has its name as a tooltip. */
export const TechIcons: React.FC<{ techs: string[]; max?: number; className?: string }> = ({
  techs,
  max = 6,
  className = '',
}) => {
  const seen = new Set<string>();
  const items = techs.flatMap((tech) => {
    const glyph = glyphFor(tech);
    const key = glyph ? glyph.title : tech;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ tech, glyph }];
  });
  const shown = items.slice(0, max);
  const hidden = techs.length - shown.length;

  return (
    <span className={`tech-icons ${className}`} title={techs.join(', ')}>
      {shown.map(({ tech, glyph }) =>
        glyph ? (
          <span key={tech} className="tech-icon" title={tech}>
            <svg viewBox="0 0 24 24" role="img" aria-label={tech}>
              <path d={glyph.path} fill="currentColor" />
            </svg>
          </span>
        ) : (
          <span key={tech} className="tech-icon tech-tile" title={tech}>
            {initials(tech)}
          </span>
        ),
      )}
      {hidden > 0 && <span className="tech-more">+{hidden}</span>}
    </span>
  );
};
