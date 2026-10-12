import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowPathIcon, BeakerIcon, CalendarDaysIcon, ChartBarIcon, ChevronDownIcon,
  ClipboardDocumentListIcon, DocumentTextIcon, MagnifyingGlassIcon, PlusIcon,
  UserGroupIcon, XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { clinicApi } from "../../services/clinicApi";
import PatientHistory from "./PatientHistory";
import "./ClinicDashboard.css";

const today = () => new Date().toISOString().slice(0, 10);
const blankPatient = { patientName: "", patientAge: "", patientPhone: "", patientEmail: "", patientAddress: "", patientCity: "", patientState: "", patientPincode: "", patientCountry: "India", patientMarker: "Active", patientRemark: "" };
const blankLab = { labName: "", contactName: "", phone: "", email: "", address: "", city: "", state: "", pincode: "", country: "India" };
const dateLabel = (value) => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "P";

function Modal({ title, subtitle, onClose, children, wide = false }) {
  return <div className="clinic-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className={`clinic-modal ${wide ? "clinic-modal-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
      <header className="clinic-modal-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="clinic-icon-button" onClick={onClose} aria-label="Close"><XMarkIcon /></button></header>
      {children}
    </section>
  </div>;
}

function FormField({ label, children, className = "" }) {
  return <label className={`clinic-field ${className}`}><span>{label}</span>{children}</label>;
}

function PatientForm({ initial, onClose, onSave, saving }) {
  const [form, setForm] = useState(initial || blankPatient);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event) => { event.preventDefault(); onSave({ ...form, patientAge: form.patientAge === "" ? null : Number(form.patientAge) }); };
  return <Modal title={initial?.patientId ? "Edit patient" : "Add patient"} subtitle="Patient details are private to your clinic." onClose={onClose}>
    <form onSubmit={submit} className="clinic-form">
      <div className="clinic-form-grid">
        <FormField label="Patient name *" className="clinic-span-2"><input autoFocus required value={form.patientName || ""} onChange={(e) => set("patientName", e.target.value)} placeholder="Full name" /></FormField>
        <FormField label="Age"><input type="number" min="0" max="125" value={form.patientAge ?? ""} onChange={(e) => set("patientAge", e.target.value)} placeholder="Years" /></FormField>
        <FormField label="Phone"><input value={form.patientPhone || ""} onChange={(e) => set("patientPhone", e.target.value)} placeholder="Phone number" /></FormField>
        <FormField label="Email"><input type="email" value={form.patientEmail || ""} onChange={(e) => set("patientEmail", e.target.value)} placeholder="patient@email.com" /></FormField>
        <FormField label="Status"><select value={form.patientMarker || "Active"} onChange={(e) => set("patientMarker", e.target.value)}><option>Active</option><option>Follow-up</option><option>Inactive</option></select></FormField>
        <FormField label="Address" className="clinic-span-2"><input value={form.patientAddress || ""} onChange={(e) => set("patientAddress", e.target.value)} placeholder="Street and building" /></FormField>
        <FormField label="City"><input value={form.patientCity || ""} onChange={(e) => set("patientCity", e.target.value)} /></FormField>
        <FormField label="State"><input value={form.patientState || ""} onChange={(e) => set("patientState", e.target.value)} /></FormField>
        <FormField label="PIN code"><input value={form.patientPincode || ""} onChange={(e) => set("patientPincode", e.target.value)} /></FormField>
        <FormField label="Country"><input value={form.patientCountry || ""} onChange={(e) => set("patientCountry", e.target.value)} /></FormField>
        <FormField label="Remark" className="clinic-span-2"><textarea rows="3" value={form.patientRemark || ""} onChange={(e) => set("patientRemark", e.target.value)} placeholder="e.g. heart problem" /></FormField>
      </div>
      <div className="clinic-form-actions"><button type="button" className="clinic-button clinic-button-quiet" onClick={onClose}>Cancel</button><button className="clinic-button clinic-button-primary" disabled={saving}>{saving ? "Saving…" : "Save patient"}</button></div>
    </form>
  </Modal>;
}

function LabForm({ initial, onClose, onSave, saving }) {
  const [form, setForm] = useState(initial || blankLab);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <Modal title={initial?.labId ? "Edit laboratory" : "Add laboratory"} subtitle="Choose this lab when assigning a test." onClose={onClose}>
    <form className="clinic-form" onSubmit={(e) => { e.preventDefault(); onSave(form); }}><div className="clinic-form-grid">
      <FormField label="Laboratory name *" className="clinic-span-2"><input autoFocus required value={form.labName} onChange={(e) => set("labName", e.target.value)} /></FormField>
      {[ ["contactName","Contact person"],["phone","Phone"],["email","Email"],["address","Address"],["city","City"],["state","State"],["pincode","PIN code"],["country","Country"] ].map(([key,label]) => <FormField key={key} label={label} className={key === "address" ? "clinic-span-2" : ""}><input value={form[key] || ""} onChange={(e) => set(key,e.target.value)} /></FormField>)}
    </div><div className="clinic-form-actions"><button type="button" className="clinic-button clinic-button-quiet" onClick={onClose}>Cancel</button><button className="clinic-button clinic-button-primary" disabled={saving}>{saving ? "Saving…" : "Save laboratory"}</button></div></form>
  </Modal>;
}

function ClinicDashboard() {
  const { token, user } = useSelector((state) => state.user);
  const [active, setActive] = useState("Overview");
  const [data, setData] = useState({ stats: {}, patients: [], labs: [], tests: [], parameters: [], consultations: [], reports: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [modal, setModal] = useState(null);
  const [subtab, setSubtab] = useState("Tests");

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [stats, patients, labs, tests, parameters, consultations, reports] = await Promise.all([
        clinicApi.dashboard(token), clinicApi.patients(token), clinicApi.labs(token), clinicApi.tests(token),
        clinicApi.parameters(token), clinicApi.consultations(token), clinicApi.reports(token),
      ]);
      setData({ stats, patients, labs, tests, parameters, consultations, reports });
    } catch (error) {
      toast.error(error.message || "Could not load clinic records.");
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const patients = useMemo(() => data.patients.filter((patient) => `${patient.patientName} ${patient.patientPhone || ""} ${patient.patientEmail || ""} ${patient.patientRemark || ""}`.toLowerCase().includes(search.toLowerCase())), [data.patients, search]);
  const selectedPatient = data.patients.find((patient) => String(patient.patientId) === String(selectedPatientId));
  const save = async (action, message) => {
    setSaving(true);
    try { await action(); toast.success(message); setModal(null); await loadData(); }
    catch (error) { toast.error(error.message || "Could not save changes."); }
    finally { setSaving(false); }
  };

  const nav = [
    { label: "Overview", icon: ChartBarIcon }, { label: "Patients", icon: UserGroupIcon },
    { label: "Consultations", icon: CalendarDaysIcon }, { label: "Tests & labs", icon: BeakerIcon },
    { label: "Reports", icon: DocumentTextIcon },
  ];
  const upcoming = data.consultations.filter((item) => item.nextConsultationDate && String(item.nextConsultationDate).slice(0,10) >= today()).sort((a,b) => String(a.nextConsultationDate).localeCompare(String(b.nextConsultationDate))).slice(0,4);

  return <main className="clinic-shell">
    <aside className="clinic-sidebar">
      <Link to="/" className="clinic-brand"><span className="clinic-brand-mark">+</span><span>Care<span className="clinic-brand-light">Desk</span><small>CLINIC WORKSPACE</small></span></Link>
      <div className="clinic-sidebar-label">WORKSPACE</div>
      <nav>{nav.map(({label,icon:Icon}) => <button key={label} onClick={() => setActive(label)} className={`clinic-side-link ${active === label ? "active" : ""}`}><Icon /><span>{label}</span>{label === "Patients" && <b>{data.stats.patientCount ?? 0}</b>}</button>)}</nav>
      <div className="clinic-sidebar-bottom"><div className="clinic-user-card"><div className="clinic-avatar clinic-avatar-small">{initials(user?.fullname)}</div><div><strong>{user?.fullname || "Doctor"}</strong><span>Doctor account</span></div><ChevronDownIcon /></div><Link to="/profile" className="clinic-profile-link">Account settings</Link></div>
    </aside>

    <section className="clinic-main">
      <header className="clinic-topbar"><div className="clinic-breadcrumb">Clinic <span>/</span> <strong>{active === "Patients" && selectedPatient ? `Patients / ${selectedPatient.patientName}` : active}</strong></div><div className="clinic-top-actions"><span className="clinic-today">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span><button className="clinic-icon-button" onClick={loadData} title="Refresh records"><ArrowPathIcon /></button><div className="clinic-avatar">{initials(user?.fullname)}</div></div></header>
      <div className="clinic-content">
        {active === "Overview" && <>
          <div className="clinic-page-heading"><div><span className="clinic-eyebrow">YOUR PRACTICE</span><h1>Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, Dr. {user?.fullname?.split(" ")[0] || "Doctor"}</h1><p>Here’s what’s happening at your clinic today.</p></div><button className="clinic-button clinic-button-primary" onClick={() => setModal({type:"patient"})}><PlusIcon /> Add patient</button></div>
          <div className="clinic-stat-grid">
            <StatCard label="Total patients" value={data.stats.patientCount ?? 0} icon={UserGroupIcon} hint="In your clinic" color="blue" />
            <StatCard label="Consultations today" value={data.stats.todayConsultations ?? 0} icon={CalendarDaysIcon} hint="Scheduled for today" color="violet" />
            <StatCard label="Tests to follow up" value={data.stats.pendingTests ?? 0} icon={BeakerIcon} hint="Suggested by you" color="amber" />
            <StatCard label="Medical reports" value={data.stats.reportCount ?? 0} icon={DocumentTextIcon} hint="Results recorded" color="green" />
          </div>
          <div className="clinic-overview-grid"><section className="clinic-panel"><div className="clinic-panel-heading"><div><h2>Upcoming follow-ups</h2><p>Next consultation dates</p></div><button className="clinic-text-button" onClick={() => setActive("Consultations")}>View consultations <span>→</span></button></div>
            {loading ? <LoadingLine /> : upcoming.length ? <div className="clinic-follow-list">{upcoming.map((item) => <div className="clinic-follow-row" key={item.consultationId}><div className="clinic-avatar clinic-avatar-patient">{initials(item.patientName)}</div><div className="clinic-follow-name"><strong>{item.patientName}</strong><span>Follow-up appointment</span></div><time>{dateLabel(item.nextConsultationDate)}</time></div>)}</div> : <EmptyState title="No follow-ups scheduled" text="Next consultation dates you add will show here." />}
          </section><section className="clinic-panel clinic-quick-panel"><div className="clinic-panel-heading"><div><h2>Quick actions</h2><p>Common tasks, one click away</p></div></div><QuickAction icon={UserGroupIcon} title="Register a patient" text="Add a patient record" onClick={() => setModal({type:"patient"})} /><QuickAction icon={CalendarDaysIcon} title="Record consultation" text="Add notes and suggest tests" onClick={() => setModal({type:"consultation"})} /><QuickAction icon={DocumentTextIcon} title="Enter test results" text="Create a medical report" onClick={() => setModal({type:"report"})} /></section></div>
          <section className="clinic-panel clinic-recent-panel"><div className="clinic-panel-heading"><div><h2>Recently added patients</h2><p>Your latest patient records</p></div><button className="clinic-text-button" onClick={() => setActive("Patients")}>All patients <span>→</span></button></div><PatientTable patients={data.patients.slice(0,5)} onSelect={(patient) => { setSelectedPatientId(patient.patientId); setActive("Patients"); }} onEdit={(patient) => setModal({type:"patient",patient})} onConsult={(patient) => setModal({type:"consultation",patientId:patient.patientId})} empty={!loading} /></section>
        </>}

        {active === "Patients" && (selectedPatient ? <PatientHistory
          patient={selectedPatient}
          consultations={data.consultations.filter((item) => String(item.patientId) === String(selectedPatient.patientId))}
          reports={data.reports.filter((item) => String(item.patientId) === String(selectedPatient.patientId))}
          loading={loading}
          onBack={() => setSelectedPatientId(null)}
          onEdit={() => setModal({ type: "patient", patient: selectedPatient })}
          onConsult={() => setModal({ type: "consultation", patientId: selectedPatient.patientId })}
          onReport={() => setModal({ type: "report", patientId: selectedPatient.patientId })}
        /> : <><PageHeading eyebrow="PATIENT RECORDS" title="Patients" text="Select a patient to review their visits, test recommendations, and results." action={<button className="clinic-button clinic-button-primary" onClick={() => setModal({type:"patient"})}><PlusIcon /> Add patient</button>} /><div className="clinic-toolbar"><label className="clinic-search"><MagnifyingGlassIcon /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, email or remark" /></label><span>{patients.length} patient{patients.length === 1 ? "" : "s"}</span></div><section className="clinic-panel clinic-table-panel"><PatientTable patients={patients} onSelect={(patient) => setSelectedPatientId(patient.patientId)} onEdit={(patient) => setModal({type:"patient",patient})} onConsult={(patient) => setModal({type:"consultation",patientId:patient.patientId})} onArchive={(patient) => window.confirm(`Archive ${patient.patientName}?`) && save(() => clinicApi.archivePatient(token, patient.patientId), "Patient archived.")} empty={!loading} /></section></>)}

        {active === "Consultations" && <><PageHeading eyebrow="CARE HISTORY" title="Consultations" text="Record visits, notes, follow-ups, and suggested tests." action={<button className="clinic-button clinic-button-primary" onClick={() => setModal({type:"consultation"})}><PlusIcon /> New consultation</button>} /><section className="clinic-panel clinic-list-panel">{loading ? <LoadingLine /> : data.consultations.length ? <div className="clinic-consultation-list">{data.consultations.map((item) => <article className="clinic-consultation-card" key={item.consultationId}><div className="clinic-consultation-date"><strong>{new Date(`${String(item.dateOfConsultation).slice(0,10)}T00:00:00`).getDate()}</strong><span>{new Date(`${String(item.dateOfConsultation).slice(0,10)}T00:00:00`).toLocaleDateString("en-IN",{month:"short"})}</span></div><div className="clinic-consultation-body"><div className="clinic-consultation-top"><div><h3>{item.patientName}</h3><span>Consultation #{item.consultationId}</span></div>{item.nextConsultationDate && <span className="clinic-pill clinic-pill-blue">Follow-up {dateLabel(item.nextConsultationDate)}</span>}</div>{item.notes && <p className="clinic-notes">{item.notes}</p>}{item.tests?.length > 0 && <div className="clinic-chip-row">{item.tests.map((test) => <span className="clinic-chip" key={test.consultationTestId}>{test.testName} <i>·</i> {test.labName}</span>)}</div>}</div></article>)}</div> : <EmptyState title="No consultations yet" text="Add a patient visit and any tests you want to recommend." action={<button className="clinic-button clinic-button-primary" onClick={() => setModal({type:"consultation"})}><PlusIcon /> New consultation</button>} />}</section></>}

        {active === "Tests & labs" && <><PageHeading eyebrow="DIAGNOSTICS" title="Tests & laboratories" text="Build your test catalog and keep laboratory contacts in one place." action={subtab === "Tests" ? <button className="clinic-button clinic-button-primary" onClick={() => setModal({type:"test"})}><PlusIcon /> Add test</button> : subtab === "Labs" ? <button className="clinic-button clinic-button-primary" onClick={() => setModal({type:"lab"})}><PlusIcon /> Add laboratory</button> : <button className="clinic-button clinic-button-primary" onClick={() => setModal({type:"parameter"})}><PlusIcon /> Add parameter</button>} /><div className="clinic-subtabs">{["Tests","Labs","Parameters"].map((tab) => <button key={tab} className={subtab === tab ? "active" : ""} onClick={() => setSubtab(tab)}>{tab}{tab === "Tests" ? ` (${data.tests.length})` : tab === "Labs" ? ` (${data.labs.length})` : ` (${data.parameters.length})`}</button>)}</div>
          {subtab === "Tests" && <div className="clinic-test-grid">{data.tests.map((test) => <article className="clinic-test-card" key={test.testId}><div className="clinic-test-icon"><BeakerIcon /></div><div className="clinic-test-card-head"><span className="clinic-eyebrow">TEST CATALOG</span><h3>{test.testName}</h3>{test.description && <p>{test.description}</p>}</div><div className="clinic-test-parameters"><span>REPORT PARAMETERS</span>{test.parameters.map((parameter) => <div key={parameter.parameterId}><strong>{parameter.parameter}</strong><small>{parameter.unit || "No unit"}</small></div>)}</div></article>)}{!data.tests.length && <EmptyState title="Your test catalog is empty" text="Create reusable test definitions with their report parameters and units." action={<button className="clinic-button clinic-button-primary" onClick={() => setModal({type:"test"})}><PlusIcon /> Add test</button>} />}</div>}
          {subtab === "Labs" && <div className="clinic-lab-grid">{data.labs.map((lab) => <article className="clinic-lab-card" key={lab.labId}><div className="clinic-lab-card-top"><div className="clinic-test-icon clinic-lab-icon"><BeakerIcon /></div><button className="clinic-text-button" onClick={() => setModal({type:"lab",lab})}>Edit</button></div><h3>{lab.labName}</h3><p>{[lab.city,lab.state].filter(Boolean).join(", ") || "Location not added"}</p><div className="clinic-lab-contact">{lab.contactName && <span>{lab.contactName}</span>}{lab.phone && <span>{lab.phone}</span>}{lab.email && <span>{lab.email}</span>}</div><button className="clinic-button clinic-button-quiet clinic-lab-archive" onClick={() => window.confirm(`Archive ${lab.labName}?`) && save(() => clinicApi.archiveLab(token,lab.labId), "Laboratory archived.")}>Archive</button></article>)}{!data.labs.length && <EmptyState title="No laboratories added" text="Add a lab so you can assign it when recommending tests." action={<button className="clinic-button clinic-button-primary" onClick={() => setModal({type:"lab"})}><PlusIcon /> Add laboratory</button>} />}</div>}
          {subtab === "Parameters" && <section className="clinic-panel clinic-table-panel"><div className="clinic-panel-heading"><div><h2>Report parameters</h2><p>Reusable measurements and units for test reports.</p></div></div>{data.parameters.length ? <div className="clinic-parameter-list">{data.parameters.map((p) => <div key={p.parameterId}><span>{p.parameter}</span><strong>{p.unit || "—"}</strong></div>)}</div> : <EmptyState title="No parameters yet" text="Parameters are also added while you create a test." />}</section>}
        </>}

        {active === "Reports" && <><PageHeading eyebrow="LAB RESULTS" title="Medical reports" text="Capture test results and keep a timeline for each patient." action={<button className="clinic-button clinic-button-primary" onClick={() => setModal({type:"report"})}><PlusIcon /> Add report</button>} /><section className="clinic-panel clinic-list-panel">{loading ? <LoadingLine /> : data.reports.length ? <div className="clinic-report-list">{data.reports.map((report) => <article className="clinic-report-card" key={report.reportId}><div className="clinic-report-mark"><ClipboardDocumentListIcon /></div><div className="clinic-report-main"><div className="clinic-report-heading"><div><h3>{report.testName || "Medical test"}</h3><p>{report.patientName} <span>·</span> {report.labName}</p></div><time>{dateLabel(report.dateOfTest)}</time></div><div className="clinic-results-grid">{report.parameters.map((item) => <div key={item.parameter}><span>{item.parameter}</span><strong>{item.resultValue} <small>{item.unit}</small></strong>{item.referenceRange && <em>Ref. {item.referenceRange}</em>}</div>)}</div>{report.notes && <p className="clinic-notes">{report.notes}</p>}</div></article>)}</div> : <EmptyState title="No results recorded" text="Record a lab report to start building each patient’s medical history." action={<button className="clinic-button clinic-button-primary" onClick={() => setModal({type:"report"})}><PlusIcon /> Add report</button>} />}</section></>}
      </div>
    </section>

    {modal?.type === "patient" && <PatientForm initial={modal.patient} onClose={() => setModal(null)} saving={saving} onSave={(form) => save(() => modal.patient ? clinicApi.updatePatient(token,modal.patient.patientId,form) : clinicApi.createPatient(token,form), modal.patient ? "Patient updated." : "Patient added.")} />}
    {modal?.type === "lab" && <LabForm initial={modal.lab} onClose={() => setModal(null)} saving={saving} onSave={(form) => save(() => modal.lab ? clinicApi.updateLab(token,modal.lab.labId,form) : clinicApi.createLab(token,form), modal.lab ? "Laboratory updated." : "Laboratory added.")} />}
    {modal?.type === "consultation" && <ConsultationForm patients={data.patients} labs={data.labs} tests={data.tests} initialPatientId={modal.patientId} onClose={() => setModal(null)} saving={saving} onSave={(form) => save(() => clinicApi.createConsultation(token,form), "Consultation recorded.")} />}
    {modal?.type === "test" && <TestForm onClose={() => setModal(null)} saving={saving} onSave={(form) => save(() => clinicApi.createTest(token,form), "Test added to catalog.")} />}
    {modal?.type === "parameter" && <ParameterForm onClose={() => setModal(null)} saving={saving} onSave={(form) => save(() => clinicApi.createParameter(token,form), "Parameter added.")} />}
    {modal?.type === "report" && <ReportForm patients={data.patients} labs={data.labs} tests={data.tests} initialPatientId={modal.patientId} onClose={() => setModal(null)} saving={saving} onSave={(form) => save(() => clinicApi.createReport(token,form), "Medical report saved.")} />}
  </main>;
}

function StatCard({ label,value,icon:Icon,hint,color }) { return <article className={`clinic-stat-card tone-${color}`}><div className="clinic-stat-top"><span>{label}</span><span className="clinic-stat-icon"><Icon /></span></div><strong>{value}</strong><small>{hint}</small></article>; }
function PageHeading({ eyebrow,title,text,action }) { return <div className="clinic-page-heading"><div><span className="clinic-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{action}</div>; }
function EmptyState({ title,text,action }) { return <div className="clinic-empty"><span className="clinic-empty-icon"><DocumentTextIcon /></span><strong>{title}</strong><p>{text}</p>{action}</div>; }
function LoadingLine() { return <div className="clinic-loading"><span /> Loading clinic records…</div>; }
function QuickAction({ icon:Icon,title,text,onClick }) { return <button className="clinic-quick-action" onClick={onClick}><span><Icon /></span><span><strong>{title}</strong><small>{text}</small></span><b>→</b></button>; }

function PatientTable({ patients, onSelect, onEdit, onConsult, onArchive, empty }) {
  if (!patients.length) return empty ? <EmptyState title="No patients found" text="Add a patient to begin building your clinic records." /> : <LoadingLine />;
  return <div className="clinic-table-scroll"><table className="clinic-table"><thead><tr><th>Patient</th><th>Remark</th><th>Contact</th><th>Age</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{patients.map((patient) => <tr key={patient.patientId}><td><div className="clinic-patient-cell"><div className="clinic-avatar clinic-avatar-patient">{initials(patient.patientName)}</div><div><button className="clinic-patient-name-button" onClick={() => onSelect?.(patient)}>{patient.patientName}</button><span>Patient #{patient.patientId} · View history</span></div></div></td><td><span className="clinic-patient-remark-preview" title={patient.patientRemark || "No remark"}>{patient.patientRemark || "—"}</span></td><td><div className="clinic-contact-cell">{patient.patientPhone && <span>{patient.patientPhone}</span>}{patient.patientEmail && <span>{patient.patientEmail}</span>}{!patient.patientPhone && !patient.patientEmail && <span>—</span>}</div></td><td>{patient.patientAge ? `${patient.patientAge} yrs` : "—"}</td><td><span className={`clinic-status ${String(patient.patientMarker).toLowerCase() === "active" ? "status-active" : "status-follow"}`}><i />{patient.patientMarker || "Active"}</span></td><td><div className="clinic-row-actions"><button onClick={() => onConsult(patient)} title="Record consultation">Visit</button><button onClick={() => onEdit(patient)} title="Edit patient">Edit</button>{onArchive && <button onClick={() => onArchive(patient)} title="Archive patient">Archive</button>}</div></td></tr>)}</tbody></table></div>;
}

function ConsultationForm({ patients,labs,tests,initialPatientId,onClose,onSave,saving }) {
  const [form,setForm] = useState({patientId:initialPatientId || "",dateOfConsultation:today(),nextConsultationDate:"",notes:"",tests:[]});
  const addTest = () => setForm((f) => ({...f,tests:[...f.tests,{testId:"",labId:""}]}));
  const updateTest = (index,key,value) => setForm((f) => ({...f,tests:f.tests.map((item,i) => i === index ? {...item,[key]:value} : item)}));
  return <Modal title="Record consultation" subtitle="Add the visit and any diagnostic tests you recommend." onClose={onClose} wide><form className="clinic-form" onSubmit={(e) => {e.preventDefault(); onSave(form);}}><div className="clinic-form-grid"><FormField label="Patient *" className="clinic-span-2"><select required value={form.patientId} onChange={(e) => setForm({...form,patientId:e.target.value})}><option value="">Select a patient</option>{patients.map((p) => <option key={p.patientId} value={p.patientId}>{p.patientName}</option>)}</select></FormField><FormField label="Consultation date *"><input type="date" required value={form.dateOfConsultation} onChange={(e) => setForm({...form,dateOfConsultation:e.target.value})} /></FormField><FormField label="Next consultation"><input type="date" min={form.dateOfConsultation} value={form.nextConsultationDate} onChange={(e) => setForm({...form,nextConsultationDate:e.target.value})} /></FormField><FormField label="Scanned document link" className="clinic-span-2"><input value={form.scannedDocId} onChange={(e) => setForm({...form,scannedDocId:e.target.value})} placeholder="Optional file URL or document ID" /></FormField><FormField label="Consultation notes" className="clinic-span-2"><textarea rows="3" value={form.notes} onChange={(e) => setForm({...form,notes:e.target.value})} placeholder="Symptoms, diagnosis, treatment plan…" /></FormField></div><div className="clinic-section-divider"><div><strong>Suggested tests</strong><span>Assign each test to a laboratory.</span></div><button type="button" className="clinic-text-button" onClick={addTest}>+ Add test</button></div>{form.tests.map((item,index) => <div className="clinic-inline-row" key={index}><select required value={item.testId} onChange={(e) => updateTest(index,"testId",e.target.value)}><option value="">Select a test</option>{tests.map((t) => <option key={t.testId} value={t.testId}>{t.testName}</option>)}</select><select required value={item.labId} onChange={(e) => updateTest(index,"labId",e.target.value)}><option value="">Select a lab</option>{labs.map((l) => <option key={l.labId} value={l.labId}>{l.labName}</option>)}</select><button type="button" className="clinic-icon-button" onClick={() => setForm((f) => ({...f,tests:f.tests.filter((_,i) => i !== index)}))}><XMarkIcon /></button></div>)}{!tests.length || !labs.length ? <p className="clinic-form-hint">Add at least one test and laboratory in Tests &amp; labs before suggesting diagnostics.</p> : null}<div className="clinic-form-actions"><button type="button" className="clinic-button clinic-button-quiet" onClick={onClose}>Cancel</button><button className="clinic-button clinic-button-primary" disabled={saving || !patients.length}>{saving ? "Saving…" : "Save consultation"}</button></div></form></Modal>;
}

function TestForm({onClose,onSave,saving}) {
  const [name,setName] = useState(""); const [description,setDescription] = useState(""); const [parameters,setParameters] = useState([{parameter:"",unit:""}]);
  const change = (index,key,value) => setParameters((list) => list.map((item,i) => i === index ? {...item,[key]:value} : item));
  return <Modal title="Add test to catalog" subtitle="Define the measurements a lab should report for this test." onClose={onClose} wide><form className="clinic-form" onSubmit={(e) => {e.preventDefault(); onSave({testName:name,description,parameters:parameters.filter((p) => p.parameter.trim())});}}><div className="clinic-form-grid"><FormField label="Test name *" className="clinic-span-2"><input autoFocus required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Complete blood count" /></FormField><FormField label="Description" className="clinic-span-2"><textarea rows="2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" /></FormField></div><div className="clinic-section-divider"><div><strong>Report parameters</strong><span>Name each result and its unit.</span></div><button type="button" className="clinic-text-button" onClick={() => setParameters((p) => [...p,{parameter:"",unit:""}])}>+ Add parameter</button></div>{parameters.map((item,index) => <div className="clinic-inline-row" key={index}><input required value={item.parameter} onChange={(e) => change(index,"parameter",e.target.value)} placeholder="Parameter (e.g. Glucose)" /><input required value={item.unit} onChange={(e) => change(index,"unit",e.target.value)} placeholder="Unit (e.g. mg/dL)" />{parameters.length > 1 && <button type="button" className="clinic-icon-button" onClick={() => setParameters((p) => p.filter((_,i) => i !== index))}><XMarkIcon /></button>}</div>)}<div className="clinic-form-actions"><button type="button" className="clinic-button clinic-button-quiet" onClick={onClose}>Cancel</button><button className="clinic-button clinic-button-primary" disabled={saving}>{saving ? "Saving…" : "Save test"}</button></div></form></Modal>;
}

function ParameterForm({onClose,onSave,saving}) { const [parameter,setParameter]=useState(""); const [unit,setUnit]=useState(""); return <Modal title="Add report parameter" subtitle="Save a reusable parameter and its default unit." onClose={onClose}><form className="clinic-form" onSubmit={(e)=>{e.preventDefault();onSave({parameter,unit});}}><div className="clinic-form-grid"><FormField label="Parameter *" className="clinic-span-2"><input autoFocus required value={parameter} onChange={(e)=>setParameter(e.target.value)} placeholder="e.g. Sodium" /></FormField><FormField label="Unit" className="clinic-span-2"><input value={unit} onChange={(e)=>setUnit(e.target.value)} placeholder="e.g. mmol/L" /></FormField></div><div className="clinic-form-actions"><button type="button" className="clinic-button clinic-button-quiet" onClick={onClose}>Cancel</button><button className="clinic-button clinic-button-primary" disabled={saving}>{saving ? "Saving…" : "Save parameter"}</button></div></form></Modal>; }

function ReportForm({patients,labs,tests,initialPatientId,onClose,onSave,saving}) {
  const [form,setForm]=useState({patientId:initialPatientId || "",labId:"",testId:"",dateOfTest:today(),notes:"",parameters:[{parameter:"",unit:"",resultValue:"",referenceRange:""}]});
  const set=(key,value)=>setForm((f)=>({...f,[key]:value}));
  const chooseTest=(id)=>{const test=tests.find((t)=>String(t.testId)===id);setForm((f)=>({...f,testId:id,parameters:test?.parameters?.length ? test.parameters.map((p)=>({parameter:p.parameter,unit:p.unit,resultValue:"",referenceRange:"",parameterId:p.parameterId})) : f.parameters}));};
  const change=(index,key,value)=>setForm((f)=>({...f,parameters:f.parameters.map((p,i)=>i===index?{...p,[key]:value}:p)}));
  return <Modal title="Add medical report" subtitle="Enter the results returned by the laboratory." onClose={onClose} wide><form className="clinic-form" onSubmit={(e)=>{e.preventDefault();onSave({...form,parameters:form.parameters.filter((p)=>p.parameter.trim()).map((p)=>({...p,parameterId:p.parameterId||null}))});}}><div className="clinic-form-grid"><FormField label="Patient *"><select required value={form.patientId} onChange={(e)=>set("patientId",e.target.value)}><option value="">Select patient</option>{patients.map((p)=><option key={p.patientId} value={p.patientId}>{p.patientName}</option>)}</select></FormField><FormField label="Laboratory *"><select required value={form.labId} onChange={(e)=>set("labId",e.target.value)}><option value="">Select lab</option>{labs.map((l)=><option key={l.labId} value={l.labId}>{l.labName}</option>)}</select></FormField><FormField label="Test"><select value={form.testId} onChange={(e)=>chooseTest(e.target.value)}><option value="">Select test (optional)</option>{tests.map((t)=><option key={t.testId} value={t.testId}>{t.testName}</option>)}</select></FormField><FormField label="Test date *"><input type="date" required value={form.dateOfTest} onChange={(e)=>set("dateOfTest",e.target.value)} /></FormField><FormField label="Scanned report link" className="clinic-span-2"><input value={form.scannedDocId||""} onChange={(e)=>set("scannedDocId",e.target.value)} placeholder="Optional report URL or document ID" /></FormField></div><div className="clinic-section-divider"><div><strong>Results</strong><span>Record each measured value with its unit.</span></div><button type="button" className="clinic-text-button" onClick={()=>setForm((f)=>({...f,parameters:[...f.parameters,{parameter:"",unit:"",resultValue:"",referenceRange:""}]}))}>+ Add result</button></div>{form.parameters.map((item,index)=><div className="clinic-result-input-row" key={index}><input required value={item.parameter} onChange={(e)=>change(index,"parameter",e.target.value)} placeholder="Parameter" /><input required value={item.resultValue} onChange={(e)=>change(index,"resultValue",e.target.value)} placeholder="Result" /><input value={item.unit} onChange={(e)=>change(index,"unit",e.target.value)} placeholder="Unit" /><input value={item.referenceRange} onChange={(e)=>change(index,"referenceRange",e.target.value)} placeholder="Reference range" />{form.parameters.length>1&&<button type="button" className="clinic-icon-button" onClick={()=>setForm((f)=>({...f,parameters:f.parameters.filter((_,i)=>i!==index)}))}><XMarkIcon /></button>}</div>)}<FormField label="Report notes" className="clinic-report-notes"><textarea rows="2" value={form.notes} onChange={(e)=>set("notes",e.target.value)} placeholder="Optional notes" /></FormField><div className="clinic-form-actions"><button type="button" className="clinic-button clinic-button-quiet" onClick={onClose}>Cancel</button><button className="clinic-button clinic-button-primary" disabled={saving||!patients.length||!labs.length}>{saving?"Saving…":"Save report"}</button></div></form></Modal>;
}

export default ClinicDashboard;
