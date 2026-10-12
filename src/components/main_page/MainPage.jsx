import {
  ArrowRightIcon,
  BeakerIcon,
  CalendarDaysIcon,
  CheckIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "./MainPage.css";

const features = [
  {
    icon: UserGroupIcon,
    title: "Patient records",
    text: "Keep essential details, contact information, and follow-up status together.",
    tone: "mint",
  },
  {
    icon: CalendarDaysIcon,
    title: "Consultation history",
    text: "Record each visit, add notes, and set the next appointment in a few clicks.",
    tone: "blue",
  },
  {
    icon: BeakerIcon,
    title: "Tests & lab reports",
    text: "Recommend tests, choose a laboratory, and record results with their units.",
    tone: "peach",
  },
];

const MainPage = () => {
  const { user, token } = useSelector((state) => state.user);
  const destination = token ? "/clinic" : "/signup";

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <div className="landing-pill"><span /> SIMPLE CLINIC RECORDS</div>
          <h1>More time for care.<br /><em>Less time searching.</em></h1>
          <p className="landing-lede">
            Keep patient details, consultations, test recommendations, and lab
            results in one calm, organized workspace.
          </p>
          <div className="landing-actions">
            <Link className="landing-button landing-button-primary" to={destination}>
              {token ? "Open your clinic" : "Get started free"}<ArrowRightIcon />
            </Link>
            {!token && <Link className="landing-button landing-button-secondary" to="/login">Sign in</Link>}
          </div>
          <div className="landing-proof"><ShieldCheckIcon /><span>Private clinic workspace</span><i /> <span>Built for everyday care</span></div>
        </div>

        <div className="landing-visual" aria-label="Clinic records dashboard preview">
          <div className="landing-orbit landing-orbit-one" />
          <div className="landing-orbit landing-orbit-two" />
          <div className="preview-window">
            <div className="preview-topbar"><div className="preview-brand"><span>+</span> Clinicords</div><div className="preview-topbar-right"><span>Today</span><span className="preview-avatar">DR</span></div></div>
            <div className="preview-content">
              <div className="preview-welcome"><div><small>TODAY AT YOUR CLINIC</small><strong>Your clinic at a glance</strong></div><div className="preview-add">+</div></div>
              <div className="preview-stats"><div><span className="preview-stat-icon icon-mint"><UserGroupIcon /></span><small>Patients</small><strong>128</strong></div><div><span className="preview-stat-icon icon-blue"><CalendarDaysIcon /></span><small>Today’s visits</small><strong>06</strong></div><div><span className="preview-stat-icon icon-peach"><BeakerIcon /></span><small>Reports</small><strong>14</strong></div></div>
              <div className="preview-section-head"><strong>Recent patients</strong><small>View all&nbsp; →</small></div>
              <div className="preview-patient"><span className="preview-person person-one">AM</span><div><strong>Arjun Mehta</strong><small>Follow-up · 10:30 AM</small></div><span className="preview-status">Today</span></div>
              <div className="preview-patient"><span className="preview-person person-two">SK</span><div><strong>Shreya Kapoor</strong><small>Blood panel · City Labs</small></div><span className="preview-status status-report">Report</span></div>
              <div className="preview-patient"><span className="preview-person person-three">RV</span><div><strong>Rohan Verma</strong><small>Consultation · Yesterday</small></div><span className="preview-status status-done">Done</span></div>
              <div className="preview-report"><span><ClipboardDocumentListIcon /></span><div><small>TEST RESULT SAVED</small><strong>Glucose <b>96 mg/dL</b></strong></div><CheckIcon /></div>
            </div>
          </div>
          <div className="landing-float-card"><span><HeartIcon /></span><div><strong>Care, connected</strong><small>One record at a time</small></div><i><CheckIcon /></i></div>
          <div className="landing-sparkle sparkle-a">✳</div><div className="landing-sparkle sparkle-b">✦</div>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-section-heading"><span className="landing-eyebrow">A CLEARER VIEW OF EVERY VISIT</span><h2>Your everyday clinic tools,<br />all in one place.</h2><p>From the first patient entry to the next follow-up, the important details stay connected.</p></div>
        <div className="landing-feature-grid">{features.map(({icon:Icon,title,text,tone},index)=><article className="landing-feature-card" key={title}><div className={`landing-feature-icon ${tone}`}><Icon /></div><span className="landing-feature-number">0{index+1}</span><h3>{title}</h3><p>{text}</p><Link to={destination}>Explore workspace <ArrowRightIcon /></Link></article>)}</div>
      </section>

      <section className="landing-bottom-cta"><div className="landing-cta-icon"><HeartIcon /></div><div><span className="landing-eyebrow">MADE FOR YOUR PRACTICE</span><h2>{user?.fullname ? `Welcome back, ${user.fullname.split(" ")[0]}.` : "A little more order in every clinic day."}</h2><p>Start with a patient record. Add the rest whenever you’re ready.</p></div><Link className="landing-button landing-button-primary" to={destination}>{token ? "Go to clinic" : "Create your workspace"}<ArrowRightIcon /></Link></section>
      <footer className="landing-footer"><span><b>Clinicords</b> · Clinic records made clearer</span><span>Patient care, thoughtfully organized.</span></footer>
    </main>
  );
};

export default MainPage;
