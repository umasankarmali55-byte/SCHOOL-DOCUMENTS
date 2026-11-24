import {
  ConductCertData,
  SchoolConfig,
  formatSlashDate,
} from '../../types/documents';
import { SheetChrome, SheetLetterhead } from './SheetChrome';

interface ConductCertificateSheetProps {
  data: ConductCertData;
  school: SchoolConfig;
  blankMode?: boolean;
  showGuides?: boolean;
  compact?: boolean;
}

function CertField({ value, emptyClass }: { value: string; emptyClass: string }) {
  const trimmed = value.trim();
  if (trimmed) {
    return <span className="cert-val-filled">{trimmed}</span>;
  }
  return <span className={`cert-val-empty ${emptyClass}`} />;
}

export function ConductCertificateSheet({
  data,
  school,
  blankMode = false,
  showGuides = false,
  compact = false,
}: ConductCertificateSheetProps) {
  const val = (v: string) => (blankMode ? '' : v);
  const relText = blankMode ? 'S/o / D/o' : data.rel || 'S/o / D/o';

  const possessivePro = blankMode
    ? 'His/Her'
    : data.pro === 'His'
      ? 'His'
      : data.pro === 'Her'
        ? 'Her'
        : 'His/Her';

  const subjectPro = blankMode
    ? 'He/She'
    : data.pro === 'His'
      ? 'He'
      : data.pro === 'Her'
        ? 'She'
        : 'He/She';

  const formattedDate = val(formatSlashDate(data.dated));
  const examBasisText = data.examBasis.trim() || 'Passed in AHSC Exam. - 2024';
  const charText = blankMode ? '' : data.characterRating.trim() || 'good';
  const isLandscape = !compact && data.orientation === 'landscape';

  const nameText = val(data.name.toUpperCase());
  const fatherText = val(data.father.toUpperCase());
  const fromText = val(data.sessionFrom);
  const toText = val(data.sessionTo);

  const hasEmptyCoreFields =
    blankMode || !nameText.trim() || !fatherText.trim() || !fromText.trim() || !toText.trim();

  const sizeClass = compact
    ? 'a4-half'
    : isLandscape
      ? 'a4-landscape'
      : 'a4-portrait';

  return (
    <div className={`a4-sheet ${sizeClass}`}>
      <SheetChrome school={school} showGuides={showGuides} />

      <div className="cert-content">
        <SheetLetterhead school={school} />

        {/* Authentic Crimson Serial No. & Dated Row */}
        <div className="cert-ref-row cert-ref-crimson">
          <div>
            Serial No. :-{' '}
            <span className="cert-ref-blank">{val(data.serialNo)}</span>
          </div>
          <div>
            Dated :-{' '}
            <span className="cert-ref-blank cert-ref-date-blank">
              {formattedDate || (blankMode ? '      /      /          ' : '')}
            </span>
          </div>
        </div>

        {/* Engraved Certificate Title & Exam Basis */}
        <div className="cert-banner-wrap">
          <div className="cert-banner-title">CONDUCT-CUM-CHARACTER CERTIFICATE</div>
          <div className="cert-banner-sub">
            (Certificate to be issued to the student who has {examBasisText})
          </div>
        </div>

        {/* Optically Centered Certification Body */}
        <div className="cert-main">
          <div className={`cert-prose ${hasEmptyCoreFields ? 'cert-prose-blank' : ''}`}>
            <p className="cert-indent">
              This is to certify that{' '}
              <CertField
                value={nameText}
                emptyClass={isLandscape ? 'cert-val-wide' : 'cert-val-name'}
              />
              , <span>{relText}</span> of Sri{' '}
              <CertField
                value={fatherText}
                emptyClass={isLandscape ? 'cert-val-wide' : 'cert-val-parent'}
              />
              , who studied in this institution during the academic session from{' '}
              <CertField value={fromText} emptyClass="cert-val-ses" /> to{' '}
              <CertField value={toText} emptyClass="cert-val-ses" />, bears a{' '}
              <CertField value={charText} emptyClass="cert-val-char" /> moral character.{' '}
              {possessivePro} behaviour towards teachers and fellow students was courteous,
              disciplined, and encouraging. {subjectPro} has neither displayed persistent violence
              or aggressive behaviour nor any inclination to harm others.
            </p>

            {!blankMode && data.closingWish.trim() && (
              <p className="cert-indent">{data.closingWish.trim()}</p>
            )}
          </div>
        </div>

        {/* Formal Footer & Headmaster Signature */}
        <footer className="cert-footer">
          <div className="cert-footer-left">
            <div>
              <strong>Place :</strong> {school.placeLabel}
            </div>
            <div>
              <strong>Dated :</strong>{' '}
              <span className="cert-footer-line">{formattedDate}</span>
            </div>
          </div>

          <div className="cert-footer-seal" aria-hidden="true">
            Official
            <br />
            School Seal
          </div>

          <div className="cert-footer-sign">
            <div className="cert-sign-space" aria-hidden="true" />
            <div className="cert-sign-rule" />
            <div className="cert-sign-title">Headmaster</div>
            <div className="cert-sign-sub">(Seal with Signature of Headmaster)</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

interface ConductTwoUpPageProps {
  topData: ConductCertData;
  bottomData: ConductCertData | null;
  school: SchoolConfig;
  showCutLine?: boolean;
  blankMode?: boolean;
  showGuides?: boolean;
}

export function ConductTwoUpPage({
  topData,
  bottomData,
  school,
  showCutLine = true,
  blankMode = false,
  showGuides = false,
}: ConductTwoUpPageProps) {
  return (
    <div className="a4-two-up-page">
      <div className="a4-half-slot">
        <ConductCertificateSheet
          data={topData}
          school={school}
          blankMode={blankMode}
          showGuides={showGuides}
          compact
        />
      </div>

      <div className="a4-cut-line" aria-hidden="true">
        {showCutLine && <span className="a4-cut-line-mark">✂ Cut Along Line</span>}
      </div>

      <div className="a4-half-slot">
        {bottomData ? (
          <ConductCertificateSheet
            data={bottomData}
            school={school}
            blankMode={blankMode}
            showGuides={showGuides}
            compact
          />
        ) : null}
      </div>
    </div>
  );
}
