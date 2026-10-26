import { useState, useEffect, useRef } from 'react';
import './LandingPage.css';
import Logo from '../components/Logo';

/**
 * InterviewPilot AI landing page.
 * Props: loginHref / registerHref -> where Login and Get Started / Start Your Interview should go.
 * Fonts (Anton, Instrument Serif, Space Grotesk) are loaded from LandingPage.css.
 */
export default function LandingPage({ loginHref = '/login', registerHref = '/register' }) {
  const heroRef = useRef(null);
  const [robotReaction, setRobotReaction] = useState(false);

  const handleRobotClick = () => {
    setRobotReaction(true);
    setTimeout(() => setRobotReaction(false), 900);
  };

  useEffect(() => {
    // 2. Bidirectional scroll observer: responds when scrolling DOWN and UP
    const sections = document.querySelectorAll('.ip section');
    
    // Immediately mark hero as visible
    const heroSection = document.querySelector('.ip .hero');
    if (heroSection) heroSection.classList.add('is-visible');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            // Unmark sections when scrolled away so they re-animate smoothly in BOTH directions
            if (!entry.target.classList.contains('hero')) {
              entry.target.classList.remove('is-visible');
            }
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );

    sections.forEach((sec) => observer.observe(sec));

    // 3. Scroll direction tracker
    let lastScrollY = window.pageYOffset;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.pageYOffset;
          const dir = currentY > lastScrollY ? 'down' : 'up';
          document.documentElement.setAttribute('data-scroll-dir', dir);
          lastScrollY = currentY <= 0 ? 0 : currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 4. Subtle robot eye tracking + tilt
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.72;
      const centerY = rect.top + rect.height * 0.5;
      const deltaX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width * 0.45)));
      const deltaY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height * 0.45)));
      
      const eyeX = deltaX * 5.5;
      const eyeY = deltaY * 4.0;
      const tilt = deltaX * 1.5;
      document.documentElement.style.setProperty('--robot-eye-x', `${eyeX.toFixed(1)}px`);
      document.documentElement.style.setProperty('--robot-eye-y', `${eyeY.toFixed(1)}px`);
      document.documentElement.style.setProperty('--robot-tilt', `${tilt.toFixed(1)}deg`);
    };

    const handleMouseLeave = () => {
      document.documentElement.style.setProperty('--robot-eye-x', '0px');
      document.documentElement.style.setProperty('--robot-eye-y', '0px');
      document.documentElement.style.setProperty('--robot-tilt', '0deg');
    };

    const heroElem = heroRef.current;
    if (heroElem) {
      heroElem.addEventListener('mousemove', handleMouseMove, { passive: true });
      heroElem.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (heroElem) {
        heroElem.removeEventListener('mousemove', handleMouseMove);
        heroElem.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className="ip">

<nav>
  <Logo href="#top" className="logo" />
  <div className="links"><a href="#features">Features</a><a href="#how">How It Works</a><a href="#faq">FAQ</a></div>
  <div className="navr"><a className="lg" href={loginHref}>Login</a><a className="pill" href={registerHref}>Get Started ↗</a></div>
</nav>

<main id="top">

<section ref={heroRef} className="hero in is-visible">
  <div className="stack">
    <div className="card c1"><h1>Got an interview <span>coming up?</span></h1></div>
    <div className="card c2"><h2>Let’s practice for it..</h2></div>
    <div className="card c3"><p>Your resume already tells your story. Practice how to tell it with confidence, answer the questions that matter, and walk into your interview ready to show them why you’re the right fit.</p></div>
    <div className="cta"><a className="btn" href={registerHref}>Start Your Interview <em>→</em></a><a className="sec" href="#how">See How It Works</a></div>
  </div>
  <div 
    className={`robot-wrap ${robotReaction ? 'is-excited' : ''}`}
    onClick={handleRobotClick}
    role="button"
    tabIndex={0}
    aria-label="Friendly AI interviewer robot waving hello. Click to interact."
  >
    <div className="bubble">
      Hi, Ready for your interview?
    </div>
    <svg className="bot" viewBox="0 0 400 450">
      <ellipse className="shadow" cx="200" cy="428" rx="105" ry="12" fill="#0A0A0A" opacity=".18"/>
      <g className="float">
        <line x1="200" y1="62" x2="200" y2="92" stroke="#0A0A0A" strokeWidth="6"/>
        <circle cx="200" cy="54" r="12" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="5"/>
        <rect x="62" y="150" width="30" height="64" rx="15" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="5"/>
        <rect x="308" y="150" width="30" height="64" rx="15" fill="#FF5A1F" stroke="#0A0A0A" strokeWidth="5"/>
        <rect x="132" y="268" width="136" height="120" rx="34" fill="#0A0A0A"/>
        <circle cx="200" cy="318" r="14" fill="none" stroke="#F2EEE6" strokeWidth="4"/>
        <rect x="150" y="360" width="100" height="10" rx="5" fill="#EC4F5F"/>
        <path d="M138 296 Q96 320 104 368" fill="none" stroke="#0A0A0A" strokeWidth="22" strokeLinecap="round"/>
        <circle cx="104" cy="372" r="22" fill="#F2EEE6" stroke="#0A0A0A" strokeWidth="5"/><circle cx="104" cy="372" r="8" fill="#FF5A1F"/>
        <g className="wave"><path d="M262 292 Q316 270 322 214" fill="none" stroke="#0A0A0A" strokeWidth="22" strokeLinecap="round"/>
        <circle cx="322" cy="204" r="24" fill="#F2EEE6" stroke="#0A0A0A" strokeWidth="5"/><circle cx="322" cy="204" r="9" fill="#FF5A1F"/></g>
        <rect x="82" y="92" width="236" height="186" rx="80" fill="#F2EEE6" stroke="#0A0A0A" strokeWidth="6"/>
        <rect x="108" y="120" width="184" height="130" rx="56" fill="#0A0A0A"/>
        <path d="M130 134 Q170 124 210 130" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".35"/>
        <g className="eye-track">
          <g className="blink" fill="none" stroke="#F2EEE6" strokeWidth="9" strokeLinecap="round"><path d="M150 186 Q166 166 182 186"/><path d="M218 186 Q234 166 250 186"/></g>
        </g>
        <circle className="cheek-left" cx="146" cy="212" r="9" fill="#FF5A1F"/><circle className="cheek-right" cx="254" cy="212" r="9" fill="#FF5A1F"/>
        <path d="M184 214 Q200 230 216 214" fill="none" stroke="#F2EEE6" strokeWidth="6" strokeLinecap="round"/>
      </g>
    </svg>
  </div>
</section>


<section id="features"><div className="in what">
  <h2>What is<br />InterviewPilot?</h2>
  <div>
    <p className="big">InterviewPilot AI is an AI-powered mock interview platform that helps candidates practice realistic, personalized interviews and understand exactly where they need to improve.</p>
    <p><b>It uses</b></p>
    <div className="tags" style={{marginTop: '12px'}}><span className="tag">Resume</span><span className="tag y">Target role</span><span className="tag">Interview type</span><span className="tag k">Difficulty level</span></div>
    <p style={{marginTop: '16px'}}>to create a personalized interview experience.</p>
  </div>
</div></section>


<section className="dark"><div className="in">
  <h2>Meet your AI interviewer</h2>
  <div className="five">
    <div><b>01</b><span>Understands your resume</span></div><div><b>02</b><span>Asks relevant questions</span></div><div><b>03</b><span>Adapts to your performance</span></div><div><b>04</b><span>Asks follow-up questions</span></div><div><b>05</b><span>Evaluates your answers</span></div>
  </div>
</div></section>


<section id="how"><div className="in">
  <h2>How it works</h2>
  <div className="five l">
    <div><b>01</b><h3>Upload Your Resume</h3><p>Give InterviewPilot your resume and let it understand your experience.</p></div>
    <div><b>02</b><h3>Set Up Your Interview</h3><p>Choose your target role, interview type and difficulty.</p></div>
    <div><b>03</b><h3>Start the Interview</h3><p>Answer personalized questions and adaptive follow-ups.</p></div>
    <div><b>04</b><h3>Get Evaluated</h3><p>Receive AI-powered feedback on every answer.</p></div>
    <div><b>05</b><h3>Improve</h3><p>Discover your weaknesses and get a personalized roadmap.</p></div>
  </div>
</div></section>


<section className="red"><div className="in two">
  <div>
    <h2>Personalized interview questions</h2>
    <p style={{marginTop: '18px', fontSize: '16px'}}>Questions aren't generic. InterviewPilot generates questions based on:</p>
    <div className="tags"><span className="tag">Your resume</span><span className="tag">Target role</span><span className="tag">Interview type</span><span className="tag">Difficulty</span><span className="tag">Your previous answers</span></div>
  </div>
  <div className="adapt"><h3>Adaptive follow-up questions</h3><p>Answer something shallow and it digs deeper. Answer well and it moves on to a tougher angle, just like a real interviewer.</p></div>
</div></section>


<section><div className="in two" style={{gridTemplateColumns: '1.05fr 0.95fr'}}>
  <div className="score" aria-label="Sample feedback scorecard">
    <div className="bar"><label>Technical correctness <b>80%</b></label><div><span style={{'--pct': '80%'}}></span></div></div>
    <div className="bar"><label>Relevance <b>90%</b></label><div><span style={{'--pct': '90%'}}></span></div></div>
    <div className="bar"><label>Completeness <b>60%</b></label><div><span style={{'--pct': '60%'}}></span></div></div>
    <div className="bar"><label>Communication <b>75%</b></label><div><span style={{'--pct': '75%'}}></span></div></div>
    <div className="bar t"><label><b>Overall score</b> <b>76 / 100</b></label><div><span style={{'--pct': '76%'}}></span></div></div>
    <h4>What you did well</h4><p>Clear structure and a relevant project example.</p>
    <h4>What was missing</h4><p>Trade-offs and edge cases were not covered.</p>
    <h4>How you can improve</h4><p>Add one measurable result to each answer.</p>
  </div>
  <div><h2>AI-powered answer feedback</h2><p style={{marginTop: '18px', fontSize: '16px', maxWidth: '440px'}}>After every answer you see exactly how it scored and what to fix, not just a number.</p></div>
</div></section>


<section className="dark"><div className="in">
  <h2>Discover your skill gaps</h2>
  <p style={{margin: '16px 0 4px', fontSize: '16px'}}>Know what is holding you back.</p>
  <p>InterviewPilot identifies:</p>
  <div style={{marginTop: '22px'}}><span className="gap r" style={{transform: 'rotate(-2deg)'}}>Weak concepts</span><span className="gap" style={{background: 'var(--bg)', transform: 'rotate(1.5deg)'}}>Missing skills</span><span className="gap y" style={{transform: 'rotate(-1deg)'}}>Topics that need improvement</span><span className="gap o" style={{transform: 'rotate(1deg)'}}>Areas where your interview performance is lacking</span></div>
</div></section>


<section><div className="in">
  <h2>Personalized learning roadmap</h2>
  <p style={{margin: '16px 0 4px', fontSize: '16px'}}>Know what to improve next.</p>
  <p>The platform creates a roadmap based on your interview performance.</p>
  <div className="tbl"><table>
    <thead>
      <tr><th>Topics</th><th>Priority</th><th>Progress / status</th><th>Learning resources</th></tr>
    </thead>
    <tbody>
      <tr><td>Database indexing</td><td><span className="tag r" style={{boxShadow: 'none'}}>High</span></td><td><span className="pb"><i style={{'--pct': '70%'}}></i></span><span className="pb-pct">70%</span></td><td>Practice set + notes</td></tr>
      <tr><td>Explaining projects clearly</td><td><span className="tag y" style={{boxShadow: 'none'}}>Medium</span></td><td><span className="pb"><i style={{'--pct': '40%'}}></i></span><span className="pb-pct">40%</span></td><td>Answer frameworks</td></tr>
      <tr><td>System design basics</td><td><span className="tag" style={{boxShadow: 'none'}}>Low</span></td><td><span className="pb"><i style={{'--pct': '10%'}}></i></span><span className="pb-pct">10%</span></td><td>Guided lessons</td></tr>
    </tbody>
  </table></div>
</div></section>


<section className="hist"><div className="in">
  <h2>Performance &amp; interview history</h2>
  <p style={{marginTop: '14px', fontSize: '16px'}}>Track your progress from your first mock to your last.</p>
  <div className="tags"><span className="tag">Previous interviews</span><span className="tag">Scores</span><span className="tag">Strengths</span><span className="tag">Weaknesses</span><span className="tag">Performance</span><span className="tag">Completed interviews</span><span className="tag r">Improvement over time ↗</span></div>
</div></section>


<section><div className="in why">
  <div><h2>Why InterviewPilot?</h2>
    <div className="no">Not generic questions.</div><div className="no">Not one-size-fits-all practice.</div><div className="no">Not just a score.</div></div>
  <div><p style={{fontWeight: '700'}}>Instead:</p>
    <div className="yes">Resume-aware.<br />Adaptive.<br />Personalized.<br />Feedback-driven.<br /><span className="p">Improvement-focused.</span></div></div>
</div></section>


<section className="dark"><div className="in">
  <h2>The complete journey</h2>
  <div className="flow">
    <span className="tag node">Your Resume</span><s className="arr">→</s><span className="tag node">Your Interview</span><s className="arr">→</s><span className="tag node">Your Answers</span><s className="arr">→</s><span className="tag node">AI Feedback</span><s className="arr">→</s><span className="tag node">Skill Gaps</span><s className="arr">→</s><span className="tag node">Learning Roadmap</span><s className="arr">→</s><span className="ready node">Interview ready</span>
  </div>
</div></section>


<section className="final" id="start"><div className="in">
  <h2>
    <span className="final-line-1">Your next interview</span>
    <span className="final-line-2">starts here.</span>
  </h2>
  <p className="final-desc">Practice smarter. Understand your gaps. Walk into your interview prepared.</p>
  <a className="btn final-btn" href={registerHref}>Start Your Interview <em>→</em></a>
</div></section>


<section id="faq"><div className="in">
  <h2>FAQ</h2>
  <div className="faq">
    <details><summary>What is InterviewPilot AI?</summary><p>An AI-powered mock interview platform that helps you practice realistic, personalized interviews and see exactly where to improve.</p></details>
    <details><summary>How does the AI generate interview questions?</summary><p>It uses your resume, target role, interview type, difficulty and your previous answers, so every question fits you.</p></details>
    <details><summary>Can I use my own resume?</summary><p>Yes. Upload your own resume and the AI builds the interview around your experience and skills.</p></details>
    <details><summary>Which interview types are supported?</summary><p>You choose the interview type during setup, such as technical or HR, along with your target role.</p></details>
    <details><summary>Can I choose difficulty?</summary><p>Yes. Pick the difficulty level when you set up the interview and change it for the next one.</p></details>
    <details><summary>How does AI evaluate my answers?</summary><p>Each answer is scored on technical correctness, relevance, completeness and communication, with notes on what went well and what to fix.</p></details>
    <details><summary>Does InterviewPilot provide a learning roadmap?</summary><p>Yes. Based on your performance it lists topics to work on, with priority, progress and learning resources.</p></details>
    <details><summary>Do I need an account to use InterviewPilot?</summary><p>Yes. An account saves your interviews, scores and roadmap so you can track improvement. New here? Click Get Started. Already registered? Login.</p></details>
  </div>
</div></section>
</main>

<footer>
  <div className="in">
    <div><h3>InterviewPilot AI</h3><p>An AI-powered mock interview platform that helps candidates practice realistic, personalized interviews.</p></div>
    <div className="fl"><a href="#features">Features</a><a href="#how">How It Works</a><a href="#faq">FAQ</a><a href={loginHref}>Login</a><a href={registerHref}>Get Started</a></div>
  </div>
  <small>© InterviewPilot AI. All rights reserved.</small>
</footer>

    </div>
  );
}
