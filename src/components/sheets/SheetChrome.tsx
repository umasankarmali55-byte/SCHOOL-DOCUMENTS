import { useId } from 'react';
import { SchoolConfig } from '../../types/documents';

interface SheetChromeProps {
  school: SchoolConfig;
  showGuides?: boolean;
}

function CornerOrnament({ className }: { className: string }) {
  return (
    <svg
      className={`cert-corner ${className}`}
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 2 H22 M2 2 V22" stroke="#182b54" strokeWidth="2.2" />
      <path d="M7 7 H19 M7 7 V19" stroke="#8a7336" strokeWidth="1.2" />
      <path d="M12 12 L17 12 L12 17 Z" fill="#8a7336" />
      <circle cx="21" cy="7" r="1.4" fill="#182b54" />
      <circle cx="7" cy="21" r="1.4" fill="#182b54" />
    </svg>
  );
}

export function InstitutionalCrest() {
  return (
    <svg className="cert-crest" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {/* Outer Shield / Laurel Wreath */}
      <circle cx="32" cy="32" r="29" stroke="#182b54" strokeWidth="1.6" />
      <circle cx="32" cy="32" r="25.5" stroke="#8a7336" strokeWidth="0.9" strokeDasharray="2 1.8" />
      {/* Open Book */}
      <path
        d="M17 37.5 C21 35.5, 27 36, 32 39.5 C37 36, 43 35.5, 47 37.5 V25.5 C43 23.8, 37 24.4, 32 27.6 C27 24.4, 21 23.8, 17 25.5 Z"
        fill="#f3f6fb"
        stroke="#182b54"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M32 27.6 V39.5" stroke="#182b54" strokeWidth="1.4" />
      {/* Guiding Star / Flame above Book */}
      <path
        d="M32 13 L33.9 18.2 L39.2 18.4 L35 21.7 L36.5 26.8 L32 23.8 L27.5 26.8 L29 21.7 L24.8 18.4 L30.1 18.2 Z"
        fill="#8a7336"
      />
      {/* Bottom Ribbon Accent */}
      <path
        d="M20 45.5 Q32 50 44 45.5"
        stroke="#556b2f"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SheetChrome({ school, showGuides = false }: SheetChromeProps) {
  const uid = useId();
  const topArcId = `wm-top-${uid}`;
  const bottomArcId = `wm-bot-${uid}`;

  return (
    <>
      <div className="cert-frame-outer" />
      <div className="cert-frame-mid" />
      <div className="cert-frame-inner" />
      <CornerOrnament className="cert-corner-tl" />
      <CornerOrnament className="cert-corner-tr" />
      <CornerOrnament className="cert-corner-bl" />
      <CornerOrnament className="cert-corner-br" />
      {showGuides && <div className="a4-guides" />}

      {/* Circular Institutional Seal Watermark */}
      <svg className="cert-wm" viewBox="0 0 220 220" aria-hidden="true">
        <g fill="none" stroke="#182b54">
          <circle cx="110" cy="110" r="105" strokeWidth="2.4" />
          <circle cx="110" cy="110" r="100" strokeWidth="0.9" />
          <circle cx="110" cy="110" r="71" strokeWidth="1.8" />
          <circle cx="110" cy="110" r="66" strokeWidth="0.8" strokeDasharray="3 3" />
        </g>
        <defs>
          <path id={topArcId} d="M27,110 A83,83 0 0 1 193,110" />
          <path id={bottomArcId} d="M16,110 A94,94 0 0 0 204,110" />
        </defs>
        <g
          fill="#182b54"
          fontFamily="Georgia, Times New Roman, serif"
          fontWeight="700"
          fontSize="16"
          letterSpacing="1.6"
          textAnchor="middle"
        >
          <text>
            <textPath href={`#${topArcId}`} startOffset="50%">
              {school.watermarkTop}
            </textPath>
          </text>
          <text>
            <textPath href={`#${bottomArcId}`} startOffset="50%">
              {school.watermarkBottom}
            </textPath>
          </text>
          <text x="110" y="128" fontSize="54">
            ★
          </text>
        </g>
      </svg>
    </>
  );
}

export function SheetLetterhead({ school }: { school: SchoolConfig }) {
  return (
    <header className="cert-header">
      <div className="cert-crest-row">
        <InstitutionalCrest />
      </div>
      <div className="cert-office">{school.officeTitle}</div>
      <div className="cert-school-name">{school.schoolName}</div>
      <div className="cert-address">{school.addressLine}</div>
      <div className="cert-meta-bar">
        <span>
          Email ID : <a>{school.email}</a>
        </span>
        <span>BSE CODE : {school.bseCode}</span>
        <span>UDISE CODE : {school.udiseCode}</span>
      </div>
      <div className="cert-divider-wrap">
        <div className="cert-divider-navy" />
        <div className="cert-divider-olive" />
      </div>
    </header>
  );
}
