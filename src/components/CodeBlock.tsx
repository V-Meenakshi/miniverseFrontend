import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, filename }) => {
  return (
    <div className="my-6 rounded-xl overflow-hidden border border-[#1f2335] bg-[#1e1e1e]">
      {filename && (
        <div className="px-4 py-2 bg-[#2d2d30] border-b border-[#1f2335] text-[#b0b3c5] text-sm font-mono">
          {filename}
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1.5rem',
          background: '#1e1e1e',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
        showLineNumbers={true}
        lineNumberStyle={{
          color: '#6e7681',
          paddingRight: '1rem',
          minWidth: '3rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;