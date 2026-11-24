import {
  MarkSheetData,
  SchoolConfig,
  formatDashDate,
  getActiveMarkRows,
  isLegacyMarkSheet,
  sumMarksColumn,
} from '../../types/documents';
import { SheetChrome, SheetLetterhead } from './SheetChrome';

interface MarkSheetSheetProps {
  data: MarkSheetData;
  school: SchoolConfig;
  blankMode?: boolean;
  showGuides?: boolean;
}

export function MarkSheetSheet({
  data,
  school,
  blankMode = false,
  showGuides = false,
}: MarkSheetSheetProps) {
  const kind = data.type;
  const isUpper = kind === 'u';
  const isSecondary = kind === 's';
  const isLegacy = isLegacyMarkSheet(data);
  const hasRegRoll = kind !== 'p';

  const val = (v: string) => (blankMode ? '' : v);

  const heading = isSecondary
    ? 'STATEMENT OF MARKS (SECONDARY)'
    : `MARK SHEET FOR ${isUpper ? 'UPPER PRIMARY' : 'PRIMARY'} CLASS`;

  const subHeading = isLegacy
    ? '(Mark Sheet issued on the basis of Annual Examination of the Particular Class)'
    : `(Mark Sheet issued on the basis of ${
        isUpper ? 'TERM-1 & TERM-2 Examination' : 'Annual Examination'
      } of the Particular Class)`;

  const formattedIssue = val(formatDashDate(data.issue));

  const rows = getActiveMarkRows(data);
  const totalFull = blankMode ? '' : sumMarksColumn(rows, 'fullMarks');
  const totalCol1 = blankMode ? '' : sumMarksColumn(rows, 'col1');
  const totalCol2 = blankMode ? '' : sumMarksColumn(rows, 'col2');
  const compactClass = rows.length > 9 ? 'ms-table-compact' : '';

  return (
    <div className="a4-sheet a4-portrait">
      <SheetChrome school={school} showGuides={showGuides} />

      <div className="cert-content cert-content-ms">
        <SheetLetterhead school={school} />

        <div className="ms-title-wrap">
          <div className="ms-title">{heading}</div>
          <div className="ms-subtitle">{subHeading}</div>
        </div>

        {/* Clean Aligned 2-Column Student Particulars Box */}
        <div className="ms-info-grid">
          <div className="ms-info-item ms-info-full">
            <span className="ms-info-diamond">❖</span>
            <span className="ms-info-label">Name of the Student :</span>
            <span className="ms-info-val">{val(data.name.toUpperCase())}</span>
          </div>
          <div className="ms-info-item ms-info-full">
            <span className="ms-info-diamond">❖</span>
            <span className="ms-info-label">Father&apos;s Name :</span>
            <span className="ms-info-val">{val(data.father.toUpperCase())}</span>
          </div>
          <div className="ms-info-item ms-info-full">
            <span className="ms-info-diamond">❖</span>
            <span className="ms-info-label">Mother&apos;s Name :</span>
            <span className="ms-info-val">{val(data.mother.toUpperCase())}</span>
          </div>
          <div className="ms-info-item">
            <span className="ms-info-diamond">❖</span>
            <span className="ms-info-label">Date of Birth :</span>
            <span className="ms-info-val">{val(formatDashDate(data.dob))}</span>
          </div>
          <div className="ms-info-item">
            <span className="ms-info-diamond">❖</span>
            <span className="ms-info-label ms-info-label-right">Education Session :</span>
            <span className="ms-info-val">{val(data.ses)}</span>
          </div>
          {hasRegRoll && (
            <>
              <div className="ms-info-item">
                <span className="ms-info-diamond">❖</span>
                <span className="ms-info-label">Registration No. :</span>
                <span className="ms-info-val">{val(data.reg)}</span>
              </div>
              <div className="ms-info-item">
                <span className="ms-info-diamond">❖</span>
                <span className="ms-info-label ms-info-label-right">Roll No. :</span>
                <span className="ms-info-val">{val(data.roll)}</span>
              </div>
            </>
          )}
          <div className="ms-info-item ms-info-full">
            <span className="ms-info-diamond">❖</span>
            <span className="ms-info-label">Class Issued For :</span>
            <span className="ms-info-val">{val(data.cls)}</span>
          </div>
        </div>

        {/* Marks Table: Dynamic Subjects & Editable Full Marks across all formats */}
        {isLegacy ? (
          <table className={`ms-table ms-table-legacy ${compactClass}`}>
            <thead>
              <tr className="ms-legacy-banner">
                <th colSpan={5}>
                  {isUpper
                    ? 'UPPER PRIMARY MARKS OF ANNUAL EXAM'
                    : 'PRIMARY MARK SHEET OF ANNUAL EXAM'}
                </th>
              </tr>
              <tr className="ms-legacy-cols">
                <th style={{ width: '15mm' }}>SL NO</th>
                <th>SUBJECT</th>
                <th style={{ width: '30mm' }}>FULL MARKS</th>
                <th style={{ width: '34mm' }}>SECURED MARK</th>
                <th style={{ width: '36mm' }}>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td>{idx + 1}</td>
                  <td className="ms-l">{(row.subject || '').toUpperCase()}</td>
                  <td>{val(row.fullMarks || '')}</td>
                  <td>{val(row.col1 || '')}</td>
                  <td>{val(row.col2 || '')}</td>
                </tr>
              ))}
              <tr className="ms-total-row">
                <td colSpan={2} className="ms-r">
                  TOTAL MARKS
                </td>
                <td>{totalFull}</td>
                <td>{totalCol1}</td>
                <td />
              </tr>
            </tbody>
          </table>
        ) : isSecondary ? (
          <table className={`ms-table ${compactClass}`}>
            <thead>
              <tr>
                <th style={{ width: '14mm' }}>SL NO</th>
                <th>SUBJECT</th>
                <th style={{ width: '30mm' }}>FULL MARKS</th>
                <th style={{ width: '32mm' }}>SECURED MARKS</th>
                <th style={{ width: '38mm' }}>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td>{idx + 1}</td>
                  <td className="ms-l">{(row.subject || '').toUpperCase()}</td>
                  <td>{row.fullMarks ?? '100'}</td>
                  <td>{val(row.col1 || '')}</td>
                  <td>{val(row.col2 || '')}</td>
                </tr>
              ))}
              <tr className="ms-total-row">
                <td />
                <td className="ms-l">TOTAL MARKS</td>
                <td>{blankMode ? sumMarksColumn(rows, 'fullMarks') : totalFull}</td>
                <td>{totalCol1}</td>
                <td />
              </tr>
            </tbody>
          </table>
        ) : (
          <table className={`ms-table ${compactClass}`}>
            <thead>
              <tr>
                <th rowSpan={2} style={{ width: '12mm' }}>
                  SL
                  <br />
                  No.
                </th>
                <th rowSpan={2}>SUBJECT</th>
                <th colSpan={2}>TERM-1 EXAM (FA1 + T.O + SA-1)</th>
                <th colSpan={2}>TERM-2 EXAM (FA-2 + T.O + SA-2)</th>
              </tr>
              <tr>
                <th style={{ width: '23mm' }}>FULL</th>
                <th style={{ width: '28mm' }}>SECURED</th>
                <th style={{ width: '23mm' }}>FULL</th>
                <th style={{ width: '28mm' }}>SECURED</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td>{idx + 1}</td>
                  <td className="ms-l">{(row.subject || '').toUpperCase()}</td>
                  <td>{row.fullMarks ?? '100'}</td>
                  <td>{val(row.col1 || '')}</td>
                  <td>{row.fullMarks ?? '100'}</td>
                  <td>{val(row.col2 || '')}</td>
                </tr>
              ))}
              <tr className="ms-total-row">
                <td />
                <td className="ms-r">TOTAL MARKS</td>
                <td>{blankMode ? sumMarksColumn(rows, 'fullMarks') : totalFull}</td>
                <td>{totalCol1}</td>
                <td>{blankMode ? sumMarksColumn(rows, 'fullMarks') : totalFull}</td>
                <td>{totalCol2}</td>
              </tr>
            </tbody>
          </table>
        )}

        <div className="ms-decl">
          All the particulars regarding the mark sheet of the above student are true and verified to
          the best of my knowledge and official examination records.
        </div>

        <footer className="ms-footer">
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
