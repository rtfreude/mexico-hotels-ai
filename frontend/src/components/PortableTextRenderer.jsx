import React from 'react';
import { PortableText } from '@portabletext/react';
import { srcFor } from '../lib/sanityImage';

// Enhanced serializers for common block types
const components = {
  types: {
    image: ({ value }) => {
      // value is the image object from Sanity
      const src = srcFor(value || (value && value.asset) ? value : null, 1200) || (value && value.asset && value.asset.url) || null;
      const alt = (value && value.alt) || (value && value.caption) || '';
      if (!src) return null;
      return (
        <div className="my-6">
          <img src={src} alt={alt} className="w-full h-auto rounded-md object-cover" />
          {value && value.caption ? <div className="text-sm text-gray-400 mt-2">{value.caption}</div> : null}
        </div>
      );
    }
  },
  block: {
    h1: ({ children }) => <h1 className="text-3xl font-semibold my-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-semibold my-3">{children}</h2>,
    normal: ({ children }) => <p className="my-2 text-gray-300">{children}</p>,
    blockquote: ({ children }) => <blockquote className="pl-4 border-l-4 border-amber-400 italic my-4">{children}</blockquote>
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc ml-6 my-2">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal ml-6 my-2">{children}</ol>
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code className="bg-gray-800 px-1 rounded">{children}</code>,
    link: ({ children, value }) => (
      <a href={value?.href} className="text-amber-400 hover:underline" target="_blank" rel="noreferrer">{children}</a>
    )
  }
};

export default function PortableTextRenderer({ value }) {
  if (!value) return null;
  return <PortableText value={value} components={components} />;
}
