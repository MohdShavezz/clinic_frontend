import { BeakerIcon, CalendarDaysIcon, PlusIcon } from "@heroicons/react/24/outline";
import "./PatientHistory.css";

const dateLabel = (value) => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "P";
const normalize = (value) => String(value || "").trim().toLowerCase();
const numeric = (value) => {
  if (value == null || String(value).trim() === "") return null;
  const parsed = Number(String(value).replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
};
const formatNumber = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 }).format(value);

function LoadingLine() {
  return <div className="clinic-loading"><span /> Loading clinic records…</div>;
}

function EmptyState({ title, text, action }) {
  return <div className="clinic-empty"><strong>{title}</strong><p>{text}</p>{action}</div>;
}

export default function PatientHistory({ patient, consultations, reports, loading, onBack, onEdit, onConsult, onReport }) {
  const comparisonReports = [...reports].sort((a, b) => String(a.dateOfTest).localeCompare(String(b.dateOfTest)) || Number(a.reportId) - Number(b.reportId));
  const parameterNames = [...new Set(comparisonReports.flatMap((report) => (report.parameters || []).map((item) => item.parameter)))].sort((a, b) => a.localeCompare(b));
  const events = [
    ...consultations.map((item) => ({ type: "consultation", date: item.dateOfConsultation, id: item.consultationId, item })),
    ...reports.map((item) => ({ type: "report", date: item.dateOfTest, id: item.reportId, item })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)) || Number(b.id) - Number(a.id));
  const address = [patient.patientAddress, patient.patientCity, patient.patientState, patient.patientPincode, patient.patientCountry].filter(Boolean).join(", ");

  const parameterFor = (report, parameterName) => (report.parameters || []).find((item) => normalize(item.parameter) === normalize(parameterName));
  const changeFromPrevious = (reportIndex, parameterName, currentParameter) => {
    if (!currentParameter || reportIndex === 0) return null;
    const currentValue = numeric(currentParameter.resultValue);
    if (currentValue === null) return null;
    for (let index = reportIndex - 1; index >= 0; index -= 1) {
      const previousReport = comparisonReports[index];
      if (String(previousReport.testId ?? "") !== String(comparisonReports[reportIndex].testId ?? "")) continue;
      const previousParameter = parameterFor(previousReport, parameterName);
      if (!previousParameter || normalize(previousParameter.unit) !== normalize(currentParameter.unit)) continue;
      const previousValue = numeric(previousParameter.resultValue);
      if (previousValue !== null) return currentValue - previousValue;
    }
    return null;
  };

  return <div className="patient-record-page">
    <button className="clinic-text-button patient-record-back" onClick={onBack}>← Back to patients</button>
    <header className="patient-record-heading">
      <div className="patient-record-identity">
        <div className="clinic-avatar clinic-avatar-patient patient-record-avatar">{initials(patient.patientName)}</div>
        <div><span className="clinic-eyebrow">PATIENT HEALTH RECORD</span><h1>{patient.patientName}</h1><p>Patient #{patient.patientId} · {patient.patientAge ? `${patient.patientAge} years` : "Age not recorded"}</p></div>
      </div>
      <div className="patient-record-actions">
        <button className="clinic-button clinic-button-quiet" onClick={onEdit}>Edit patient</button>
        <button className="clinic-button clinic-button-quiet" onClick={onReport}><PlusIcon /> Add report</button>
        <button className="clinic-button clinic-button-primary" onClick={onConsult}><PlusIcon /> Record visit</button>
      </div>
    </header>

    <section className="patient-record-summary">
      <div><span>Phone</span><strong>{patient.patientPhone || "Not recorded"}</strong></div>
      <div><span>Email</span><strong>{patient.patientEmail || "Not recorded"}</strong></div>
      <div><span>Address</span><strong>{address || "Not recorded"}</strong></div>
      <div><span>Status</span><strong>{patient.patientMarker || "Active"}</strong></div>
      <div className="patient-record-remark"><span>Remark</span><p>{patient.patientRemark || "No remark recorded"}</p></div>
    </section>

    <section className="clinic-panel patient-comparison-panel">
      <div className="clinic-panel-heading"><div><h2>Test parameter comparison</h2><p>Reports are ordered oldest to newest. Numeric changes are compared only with the previous report for the same test and unit.</p></div></div>
      {comparisonReports.length && parameterNames.length ? <div className="patient-comparison-scroll"><table className="patient-comparison-table"><thead><tr><th>Parameter</th>{comparisonReports.map((report) => <th key={report.reportId}><strong>{report.testName || "Medical test"}</strong><span>{dateLabel(report.dateOfTest)}</span><small>{report.labName || "Lab not recorded"}</small></th>)}</tr></thead><tbody>{parameterNames.map((parameterName) => <tr key={parameterName}><th>{parameterName}</th>{comparisonReports.map((report, reportIndex) => {
        const result = parameterFor(report, parameterName);
        const delta = result ? changeFromPrevious(reportIndex, parameterName, result) : null;
        return <td key={report.reportId}>{result ? <><strong>{result.resultValue} <small>{result.unit}</small></strong>{result.referenceRange && <span className="patient-result-reference">Ref. {result.referenceRange}</span>}{delta !== null && <span className="patient-result-delta">Δ {delta > 0 ? "+" : ""}{formatNumber(delta)} {result.unit} vs previous</span>}</> : <span className="patient-result-empty">—</span>}</td>;
      })}</tr>)}</tbody></table></div> : <div className="patient-comparison-empty">No test reports with parameters are recorded for this patient yet.</div>}
    </section>

    <section className="patient-history-section">
      <div className="clinic-panel-heading patient-history-heading"><div><span className="clinic-eyebrow">CARE HISTORY</span><h2>Consultations and reports</h2><p>{consultations.length} consultation{consultations.length === 1 ? "" : "s"} · {reports.length} report{reports.length === 1 ? "" : "s"}</p></div></div>
      {loading ? <section className="clinic-panel"><LoadingLine /></section> : events.length ? <div className="patient-history-timeline">{events.map(({ type, date, id, item }) => <article className="clinic-panel patient-history-event" key={`${type}-${id}`}>
        <div className={`patient-history-icon ${type}`}>{type === "report" ? <BeakerIcon /> : <CalendarDaysIcon />}</div>
        <div className="patient-history-event-body">
          <div className="patient-history-event-title"><div><span className="clinic-eyebrow">{type === "report" ? "LAB REPORT" : "CONSULTATION"}</span><h3>{type === "report" ? item.testName || "Medical test" : "Doctor visit"}</h3>{type === "report" && <p>{item.labName || "Laboratory not recorded"}</p>}</div><time>{dateLabel(date)}</time></div>
          {type === "consultation" ? <>
            {item.notes && <p className="clinic-notes">{item.notes}</p>}
            {item.nextConsultationDate && <p className="patient-history-followup">Next consultation: <strong>{dateLabel(item.nextConsultationDate)}</strong></p>}
            <div className="patient-history-tests"><strong>Suggested tests</strong>{item.tests?.length ? <div className="clinic-chip-row">{item.tests.map((test) => <span className="clinic-chip" key={test.consultationTestId}>{test.testName} <i>·</i> {test.labName} <i>·</i> {test.status}</span>)}</div> : <span className="patient-history-muted">No tests suggested for this visit.</span>}</div>
            {item.scannedDocId && <a className="patient-history-link" href={item.scannedDocId} target="_blank" rel="noreferrer">Open consultation document ↗</a>}
          </> : <>
            <div className="clinic-results-grid">{(item.parameters || []).map((parameter, index) => <div key={`${parameter.parameter}-${index}`}><span>{parameter.parameter}</span><strong>{parameter.resultValue} <small>{parameter.unit}</small></strong>{parameter.referenceRange && <em>Ref. {parameter.referenceRange}</em>}</div>)}</div>
            {item.notes && <p className="clinic-notes">{item.notes}</p>}
            {item.scannedDocId && <a className="patient-history-link" href={item.scannedDocId} target="_blank" rel="noreferrer">Open scanned report ↗</a>}
          </>}
        </div>
      </article>)}</div> : <section className="clinic-panel"><EmptyState title="No health history yet" text="Consultations and lab reports recorded for this patient will appear here." action={<button className="clinic-button clinic-button-primary" onClick={onConsult}><PlusIcon /> Record first visit</button>} /></section>}
    </section>
  </div>;
}
