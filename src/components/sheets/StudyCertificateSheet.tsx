import {
  SchoolConfig,
  StudyCertData,
  formatSlashDate,
} from '../../types/documents';
import { SheetChrome, SheetLetterhead } from './SheetChrome';

interface StudyCertificateSheetProps {
  data: StudyCertData;
  school: SchoolConfig;
  blankMode?: boolean;
  showGuides?: boolean;
}

function CertField({ value, emptyClass }: { value: string; emptyClass: string }) {
  const trimmed = value.trim();
  if (trimmed) {
    return <span className="cert-val-filled">{trimmed}</span>;
  }
  return <span className={`cert-val-empty ${emptyClass}`} />;
}

export function StudyCertificateSheet({
  data,
  school,
  blankMode = false,
  showGuides = false,
}: StudyCertificateSheetProps) {
  const val = (v: string) => (blankMode ? '' : v);
  const relText = blankMode ? 'Son/Daughter' : data.rel || 'Son/Daughter';
  const pro1 = blankMode ? 'His/Her' : data.pro || 'His/Her';
  const pro2 = blankMode ? 'His/Her' : data.pro || 'His/Her';
  const sessionText = val(data.ses);
  const formattedDob = val(formatSlashDate(data.dob));
  const formattedAdm = val(formatSlashDate(data.adm));
  const formattedIssue = val(formatSlashDate(data.issue));

  const nameText = val(data.name.toUpperCase());
  const fatherText = val(data.father.toUpperCase());
  const motherText = val(data.mother.toUpperCase());
  const clsText = val(data.cls);
  const enoText = val(data.eno);

  const hasEmptyCoreFields =
    blankMode || !nameText.trim() || !fatherText.trim() || !motherText.trim();

  return (
    <div className="a4-sheet a4-portrait">
      <SheetChrome school={school} showGuides={showGuides} />

      <div className="cert-content">
        <SheetLetterhead school={school} />

        {/* Reference & Issue Date Row */}
        <div className="cert-ref-row cert-ref-navy">
          <div>
            Ref. / Sl. No. :{' '}
            <span className="cert-ref-blank">{val(data.serialNo)}</span>
          </div>
          <div>
            Date :{' '}
            <span className="cert-ref-blank cert-ref-date-blank">{formattedIssue}</span>
          </div>
        </div>

        {/* Title Banner + Passport Photo Box */}
        <div className="study-top-grid">
          <div className="study-title-center">
            <svg className="study-cap" viewBox="0 0 60 40" aria-hidden="true">
              <path d="M30 3 L57 14.5 L30 26 L3 14.5 Z" fill="#182b54" />
              <path
                d="M15 21.5 V31 C15 35.5 45 35.5 45 31 V21.5 L30 28 Z"
                fill="#182b54"
              />
              <path d="M51 17 V29" stroke="#8a7336" strokeWidth="2.2" />
              <circle cx="51" cy="30" r="2.2" fill="#8a7336" />
            </svg>
            <div className="cert-banner-title">STUDY CERTIFICATE</div>
            <div className="cert-banner-sub">
              (Issued as per entries recorded in the School Admission Register)
            </div>
          </div>

          <div className="study-photo-box">
            {!blankMode && data.photoDataUrl ? (
              <img
                src={data.photoDataUrl}
                alt={data.name ? `${data.name} passport photo` : 'Student photo'}
                style={{
                  transform: `scale(${data.photoZoom || 1})`,
                  objectPosition: `50% ${data.photoPosY ?? 50}%`,
                }}
              />
            ) : (
              <>
                <span className="study-photo-label">
                  AFFIX
                  <br />
                  PASSPORT
                  <br />
                  PHOTO
                </span>
                <span className="study-photo-rule" />
              </>
            )}
          </div>
        </div>

        {/* Optically Centered Body + Admission Register Summary */}
        <div className="cert-main">
          <div className={`cert-prose ${hasEmptyCoreFields ? 'cert-prose-blank' : ''}`}>
            <p className="cert-indent">
              This is to certify that{' '}
              <CertField value={nameText} emptyClass="cert-val-name" />,{' '}
              <span>{relText}</span> of Sri{' '}
              <CertField value={fatherText} emptyClass="cert-val-parent" /> and Smt.{' '}
              <CertField value={motherText} emptyClass="cert-val-parent" />, whose Date of Birth as
              recorded in the School Admission Register is{' '}
              <CertField value={formattedDob} emptyClass="cert-val-date" />, was a bona fide
              student studying in Class <CertField value={clsText} emptyClass="cert-val-cls" />{' '}
              during the Education Session{' '}
              <CertField value={sessionText} emptyClass="cert-val-ses" /> at{' '}
              <strong>{school.bodySchoolName}</strong>. {pro1} Enrolment / Identification Number is{' '}
              <CertField value={enoText} emptyClass="cert-val-id" /> and Date of Admission is{' '}
              <CertField value={formattedAdm} emptyClass="cert-val-date" />, respectively, as
              verified from the official School Admission Register of this school.
            </p>

            <p className="cert-indent">
              All the particulars stated above in this certificate are true and correct to the best
              of my knowledge and official school records. {pro2} conduct during the period of study
              was satisfactory.
            </p>
          </div>

          {/* Crisp Admission Register Key Details Box */}
          <div className="cert-summary-box">
            <div className="cert-summary-item">
              <span className="cert-summary-label">Enrolment / ID No. :</span>
              <span className="cert-summary-val">{enoText}</span>
            </div>
            <div className="cert-summary-item">
              <span className="cert-summary-label">Date of Admission :</span>
              <span className="cert-summary-val">{formattedAdm}</span>
            </div>
            <div className="cert-summary-item">
              <span className="cert-summary-label">Date of Birth :</span>
              <span className="cert-summary-val">{formattedDob}</span>
            </div>
            <div className="cert-summary-item">
              <span className="cert-summary-label">Class &amp; Session :</span>
              <span className="cert-summary-val">
                {[clsText ? `Class ${clsText}` : '', sessionText].filter(Boolean).join(' · ')}
              </span>
            </div>
          </div>
        </div>

        {/* Formal Footer & Signature Block */}
        <footer className="cert-footer">
          <div className="cert-footer-left">
            <div>
              <strong>Place :</strong> {school.placeLabel}
            </div>
            <div>
              <strong>Date of Issue :</strong>{' '}
              <span className="cert-footer-line">{formattedIssue}</span>
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
            <div className="cert-sign-sub">(Seal &amp; Signature of Headmaster)</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
