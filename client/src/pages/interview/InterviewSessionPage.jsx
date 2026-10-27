// src/pages/interview/InterviewSessionPage.jsx
// Integrated Claude Start Interview (InterviewSession) design with warm cream aesthetic.
// Preserves interviewService.getById, interviewService.generateQuestions, interviewService.submitAnswer,
// reportService.generate, stopwatch timers, answer evaluation, review mode, and error handling.

import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { interviewService } from '../../services/interviewService';
import { reportService } from '../../services/reportService';
import Logo from '../../components/Logo';

// Styles are included in this file, so no separate CSS file is needed.
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');

.sess{--bg:#F2EEE6;--card:#fff;--ink:#0A0A0A;--muted:#6B675F;--line:#E3DED2;--yellow:#F4CF63;--orange:#FF5A1F;
  min-height:100vh;background:var(--bg);color:var(--ink);font-family:'Space Grotesk',system-ui,sans-serif;box-sizing:border-box;
  padding:28px clamp(16px,4vw,48px) 64px}
.sess *,.sess *::before,.sess *::after{box-sizing:inherit}
.sess a{color:inherit;text-decoration:none}
.sess svg.i{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.s-wrap{max-width:1000px;margin:0 auto;display:flex;flex-direction:column;gap:20px}

.s-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.s-back{display:inline-flex;align-items:center;gap:10px;padding:8px 12px 8px 8px;margin-left:-8px;border-radius:10px;font-size:15px;font-weight:500;color:var(--muted);transition:color .15s,background .15s}
.s-back:hover{color:var(--ink);background:rgba(10,10,10,.05)}
.s-sid{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)}
.s-sid code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:8px;padding:5px 10px}

.s-card{background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
.s-head{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:26px 28px}
.s-l{display:flex;align-items:center;gap:18px;min-width:0}
.s-tile{width:52px;height:52px;border-radius:14px;background:rgba(244,207,99,.4);display:grid;place-items:center;flex:none}
.s-tile svg.i{width:24px;height:24px}
.s-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.s-pill{display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;background:var(--ink);color:var(--bg);font-size:12px;font-weight:700;letter-spacing:.05em}
.s-pill i{width:7px;height:7px;border-radius:50%;background:var(--yellow);animation:s-pulse 1.2s ease-in-out infinite}
.s-role{margin:8px 0 0;font-size:28px;line-height:1.1;letter-spacing:-.02em}
.s-prog{text-align:right}
.s-prog small{display:block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.s-prog b{display:block;margin-top:6px;font-size:20px;letter-spacing:-.01em}

.s-gen{display:flex;align-items:center;gap:22px;padding:30px 28px;background:rgba(244,207,99,.22);border-color:rgba(244,207,99,.7)}
.s-gen .s-tile{width:56px;height:56px;background:rgba(244,207,99,.6)}
.s-gen .s-tile svg.i{animation:s-spin 3.2s linear infinite}
.s-gen div.t{flex:1;min-width:0}
.s-gen h2{margin:0;font-size:19px;letter-spacing:-.01em}
.s-gen p{margin:8px 0 0;font-size:15px;line-height:1.6;color:var(--muted)}
.s-gen p b{color:var(--ink);font-weight:700}
.s-bar{margin-top:18px;height:6px;border-radius:999px;background:rgba(10,10,10,.1);overflow:hidden;position:relative}
.s-bar::after{content:"";position:absolute;inset:0 auto 0 0;width:40%;border-radius:999px;background:var(--ink);animation:s-slide 1.6s ease-in-out infinite}

/* Button & Card Utilities */
.btn{display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 18px;border-radius:999px;font:inherit;font-weight:600;font-size:14px;cursor:pointer;border:1px solid var(--line);background:#fff;color:var(--ink);transition:background .15s,border-color .15s,transform .15s}
.btn:hover{border-color:var(--ink)}
.btn.dark{background:var(--ink);color:var(--bg);border-color:var(--ink)}.btn.dark:hover{background:#262626}
.btn.yellow{background:var(--yellow);border-color:var(--yellow);color:var(--ink)}.btn.yellow:hover{background:#efc650}
.btn.sm{height:38px;padding:0 16px}
.btn:disabled{opacity:.45;cursor:not-allowed}

/* Question Workspace styles */
.s-qcard{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:26px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
.s-qhead{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px}
.s-qtopic{display:inline-block;padding:3px 10px;border-radius:8px;background:rgba(10,10,10,.06);font-size:12px;font-weight:700;color:var(--muted)}
.s-qdiff{display:inline-block;padding:3px 10px;border-radius:8px;font-size:12px;font-weight:700;margin-left:8px}
.s-qtitle{margin:10px 0 0;font-size:21px;line-height:1.4;letter-spacing:-.01em;color:var(--ink)}

/* Navigation pills row */
.s-pills{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.s-qpill{font:inherit;font-size:13px;font-weight:600;padding:6px 14px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--muted);cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s}
.s-qpill:hover{border-color:var(--ink);color:var(--ink)}
.s-qpill.on{background:var(--ink);border-color:var(--ink);color:var(--bg)}
.s-qpill.done{background:rgba(244,207,99,.3);border-color:var(--yellow);color:var(--ink)}

/* Textarea & Answer input */
.s-area{width:100%;min-height:160px;padding:16px;border:1px solid var(--line);border-radius:14px;background:#FBFAF7;font:inherit;font-size:15px;color:var(--ink);resize:vertical;transition:border-color .15s,box-shadow .15s,background .15s}
.s-area:focus{outline:none;border-color:var(--ink);background:#fff;box-shadow:0 0 0 4px rgba(244,207,99,.45)}

/* Feedback evaluation card */
.s-eval{margin-top:18px;border-top:1px solid var(--line);padding-top:22px;display:grid;gap:16px}
.s-scorebadge{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:999px;background:var(--yellow);font-size:18px;font-weight:700}
.s-evalbox{padding:16px;border-radius:14px;border:1px solid var(--line);background:#FBFAF7}
.s-evalbox h4{margin:0 0 6px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.s-evalbox p{margin:0;font-size:14px;line-height:1.6}

@keyframes s-slide{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}
@keyframes s-spin{to{transform:rotate(360deg)}}
@keyframes s-pulse{50%{opacity:.35}}

.sess :focus-visible{outline:2px solid var(--ink);outline-offset:2px}
@media(max-width:640px){.s-head{padding:20px}.s-prog{text-align:left}.s-role{font-size:24px}.s-gen{padding:22px 20px;align-items:flex-start;flex-direction:column;gap:16px}}
@media(prefers-reduced-motion:reduce){.sess *,.sess *::after{animation:none!important;transition:none!important}.s-bar::after{width:60%}}
`;

const PATHS = {
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  back: 'M19 12H5 M11 6l-6 6 6 6',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2',
  check: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 12l3 3 5-6',
  send: 'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z',
  award: 'M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M8.5 14 7 22l5-3 5 3-1.5-8',
  arrowRight: 'M5 12h14 M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5 M11 6l-6 6 6 6',
  bulb: 'M9 18h6 M10 22h4 M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14',
};

const Icon = ({ name }) => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d={PATHS[name]} /></svg>
);

const cap = (s) => (s ? String(s).toUpperCase() : '');

const formatSeconds = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function InterviewSessionPage({
  backHref = '/interview/setup',
  modelLabel = 'Google Gemini AI',
}) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [session, setSession]         = useState(location.state?.session || null);
  const [questions, setQuestions]     = useState(location.state?.session?.questions || []);
  const [loading, setLoading]         = useState(!location.state?.session);
  const [generating, setGenerating]   = useState(false);
  const [error, setError]             = useState('');
  const [genError, setGenError]       = useState('');

  const [currentIndex, setCurrentIndex]       = useState(0);
  const [answerDrafts, setAnswerDrafts]       = useState({});
  const [timers, setTimers]                   = useState({});
  const [evaluating, setEvaluating]           = useState(false);
  const [submitError, setSubmitError]         = useState('');
  const [viewMode, setViewMode]               = useState('focus'); // 'focus' | 'review'
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportError, setReportError]         = useState('');

  const currentSessionIdRef = useRef(id);
  currentSessionIdRef.current = id;
  const generatingSessionIdRef = useRef(null);
  const generationTimeoutRef = useRef(null);
  const mountTimeRef = useRef(Date.now());
  const questionAppearanceLoggedRef = useRef(false);

  const targetQuestionCount =
    location.state?.questionCount ||
    session?.questionCount ||
    session?.questions?.length ||
    5;
  const targetCountRef = useRef(targetQuestionCount);
  targetCountRef.current = targetQuestionCount;

  // ─── Log Timing for First Question Appearance ──────────────────────────────
  useEffect(() => {
    if (questions.length > 0 && !questionAppearanceLoggedRef.current) {
      questionAppearanceLoggedRef.current = true;
      const duration = Date.now() - mountTimeRef.current;
      console.log(`[Timing:Frontend] Total time until first question appeared: ${duration}ms`);
    }
  }, [questions]);

  // ─── Clear Generation Timeout on Unmount ───────────────────────────────────
  useEffect(() => {
    return () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }
    };
  }, []);

  // ─── Fetch Session Details & Auto-generate Questions if Pending ─────────────
  useEffect(() => {
    const startGenerationTimeout = () => {
      if (generationTimeoutRef.current) clearTimeout(generationTimeoutRef.current);
      generationTimeoutRef.current = setTimeout(() => {
        if (currentSessionIdRef.current === id) {
          console.warn(`[InterviewSession] Question generation timed out for session ${id}`);
          setGenerating(false);
          setGenError('Question generation took longer than expected. Please click Retry below to load or regenerate your questions.');
        }
      }, 25000);
    };

    const clearGenerationTimeout = () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }
    };

    const executeQuestionGen = async (targetSession) => {
      // Prevent duplicate generation triggers for the active session
      if (generatingSessionIdRef.current === id) return;
      generatingSessionIdRef.current = id;

      setLoading(false);
      setGenerating(true);
      setGenError('');
      startGenerationTimeout();

      try {
        const countToRequest = targetCountRef.current || 5;
        const genRes = await interviewService.generateQuestions(id, {
          questionCount: countToRequest,
        });

        // Hydrate questions if this component instance is viewing this session
        if (currentSessionIdRef.current === id) {
          const genData = genRes.data?.data || genRes.data;
          const generatedList = genData.questions || [];
          setQuestions(generatedList);

          if (genData.session) {
            setSession((prev) => ({
              ...prev,
              ...genData.session,
              status: genData.session.status || 'active',
            }));
          } else {
            setSession((prev) => ({
              ...prev,
              status: 'active',
            }));
          }
        }
      } catch (aiErr) {
        if (currentSessionIdRef.current === id) {
          const msg =
            aiErr?.response?.data?.error?.message ||
            aiErr?.response?.data?.message ||
            aiErr?.message ||
            'Could not generate interview questions via Gemini AI.';
          setGenError(msg);
        }
      } finally {
        clearGenerationTimeout();
        if (currentSessionIdRef.current === id) {
          setGenerating(false);
        }
      }
    };

    const loadSessionAndQuestions = async () => {
      if (!id) return;

      // Fast path: If session was passed in router state and is pending, generate questions directly
      const initialSession = location.state?.session;
      if (initialSession && initialSession.id === id) {
        const existingQs = initialSession.questions || [];
        if (existingQs.length > 0) {
          setQuestions(existingQs);
          const firstUnanswered = existingQs.findIndex((q) => !q.answer || !q.answer.feedback);
          setCurrentIndex(firstUnanswered !== -1 ? firstUnanswered : 0);
          setLoading(false);
          return;
        }

        if (initialSession.status === 'pending' || existingQs.length === 0) {
          await executeQuestionGen(initialSession);
          return;
        }
      }

      // Fallback path: When user refreshed or navigated directly by URL, fetch session from DB
      try {
        setLoading(true);
        setError('');

        const res = await interviewService.getById(id);
        if (currentSessionIdRef.current !== id) return;

        const fetchedSession = res.data?.data || res.data;
        setSession(fetchedSession);

        const existingQuestions = fetchedSession.questions || [];

        // If questions exist, hydrate them directly
        if (existingQuestions.length > 0) {
          setQuestions(existingQuestions);

          const firstUnansweredIdx = existingQuestions.findIndex(
            (q) => !q.answer || !q.answer.feedback
          );
          setCurrentIndex(firstUnansweredIdx !== -1 ? firstUnansweredIdx : 0);
          setLoading(false);
          return;
        }

        // If session is PENDING and no questions exist, generate questions
        if (fetchedSession.status === 'pending' || existingQuestions.length === 0) {
          await executeQuestionGen(fetchedSession);
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (currentSessionIdRef.current === id) {
          const msg =
            err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            'Could not load interview session details.';
          setError(msg);
          setLoading(false);
        }
      }
    };

    loadSessionAndQuestions();
  }, [id]);

  // ─── Question Stopwatch Timer ───────────────────────────────────────────────
  const currentQuestion = questions[currentIndex] || null;
  const isCurrentAnswered = Boolean(currentQuestion?.answer?.feedback);

  useEffect(() => {
    if (!currentQuestion || isCurrentAnswered || evaluating || loading || generating) {
      return;
    }

    const qId = currentQuestion.id;
    const interval = setInterval(() => {
      setTimers((prev) => ({
        ...prev,
        [qId]: (prev[qId] || 0) + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion, isCurrentAnswered, evaluating, loading, generating]);

  // ─── Manual Question Generation Retry ───────────────────────────────────────
  const handleManualRetryGen = async () => {
    if (!id || generating) return;
    generatingSessionIdRef.current = null; // Reset so retry can execute
    setGenerating(true);
    setGenError('');

    if (generationTimeoutRef.current) clearTimeout(generationTimeoutRef.current);
    generationTimeoutRef.current = setTimeout(() => {
      if (currentSessionIdRef.current === id) {
        setGenerating(false);
        setGenError('Question generation timed out. Please click Retry below to try again.');
      }
    }, 25000);

    try {
      const genRes = await interviewService.generateQuestions(id, {
        questionCount: targetCountRef.current || 5,
      });
      if (currentSessionIdRef.current === id) {
        const genData = genRes.data?.data || genRes.data;
        setQuestions(genData.questions || []);
        if (genData.session) {
          setSession((prev) => ({
            ...prev,
            ...genData.session,
            status: genData.session.status || 'active',
          }));
        }
      }
    } catch (err) {
      if (currentSessionIdRef.current === id) {
        const msg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Could not generate interview questions.';
        setGenError(msg);
      }
    } finally {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }
      if (currentSessionIdRef.current === id) {
        setGenerating(false);
      }
    }
  };

  // ─── Submit Answer for Gemini Evaluation ────────────────────────────────────
  const handleSubmitAnswer = async (e) => {
    if (e) e.preventDefault();
    if (!currentQuestion || evaluating) return;

    const answerText = (answerDrafts[currentQuestion.id] || '').trim();
    if (answerText.length < 10) {
      setSubmitError('Please provide a substantive answer of at least 10 characters.');
      return;
    }

    setEvaluating(true);
    setSubmitError('');

    const evalSubmitTime = Date.now();
    try {
      const timeTaken = timers[currentQuestion.id] || 0;
      const res = await interviewService.submitAnswer(id, {
        questionId: currentQuestion.id,
        answerText,
        timeTaken,
      });

      const data = res.data?.data || res.data;
      const savedAnswer = data.answer;
      const savedFeedback = data.feedback;

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === currentQuestion.id
            ? {
                ...q,
                answer: {
                  ...savedAnswer,
                  feedback: savedFeedback,
                },
              }
            : q
        )
      );

      const evalDuration = Date.now() - evalSubmitTime;
      console.log(`[Timing:Frontend] Total time until evaluation results appeared: ${evalDuration}ms`);

      if (data.allCompleted) {
        setSession((prev) => ({
          ...prev,
          completedAt: new Date().toISOString(),
        }));
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to evaluate answer via Gemini AI. Your response is saved. Please retry.';
      setSubmitError(msg);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSubmitError('');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSubmitError('');
    }
  };

  // ─── Report Generation & View ───────────────────────────────────────────────
  const handleViewOrGenerateReport = async () => {
    if (generatingReport || !id) return;
    setGeneratingReport(true);
    setReportError('');
    try {
      const res = await reportService.generate(id);
      const reportData = res.data?.data?.report || res.data?.data || res.data;
      const reportId = reportData.id || id;
      navigate(`/report/${reportId}`);
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to generate interview report. Please try again.';
      setReportError(msg);
      if (err?.response?.status === 400 && err?.response?.data?.data?.id) {
        navigate(`/report/${err.response.data.data.id}`);
      }
    } finally {
      setGeneratingReport(false);
    }
  };

  // Derived metrics
  const answeredQuestionsCount = questions.filter((q) => q.answer && q.answer.feedback).length;
  const isAllCompleted = questions.length > 0 && answeredQuestionsCount === questions.length;
  const currentElapsedSeconds = currentQuestion ? timers[currentQuestion.id] || 0 : 0;
  const currentDraft = currentQuestion ? answerDrafts[currentQuestion.id] || '' : '';

  const evaluatedScores = questions
    .filter((q) => q.answer?.feedback?.score != null)
    .map((q) => q.answer.feedback.score);
  const averageScore = evaluatedScores.length > 0
    ? (evaluatedScores.reduce((a, b) => a + b, 0) / evaluatedScores.length).toFixed(1)
    : null;

  const shortId = id && id.length > 10 ? `${id.slice(0, 10)}...` : id;

  const roleText = session?.roleTarget || 'Technical Interview';
  const typeText = session?.type || 'technical';
  const diffText = session?.difficulty || 'medium';
  const statusDisplay = generating
    ? 'GENERATING…'
    : isAllCompleted
    ? 'COMPLETED'
    : session?.status
    ? session.status.toUpperCase()
    : 'PENDING';

  return (
    <div className="sess">
      <style>{STYLES}</style>
      <div className="s-wrap">

        {/* ── Top Bar: Back to Setup, Mode toggle, and Session ID ───────────── */}
        <div className="s-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Logo to="/dashboard" />
            <Link className="s-back" to={backHref} style={{ marginLeft: 0 }}>
              <Icon name="back" />Back to Setup
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {questions.length > 0 && !generating && (
              <div style={{ display: 'flex', gap: '4px', background: '#fff', border: '1px solid var(--line)', padding: '3px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('focus')}
                  style={{
                    border: 'none',
                    background: viewMode === 'focus' ? 'var(--ink)' : 'transparent',
                    color: viewMode === 'focus' ? 'var(--bg)' : 'var(--muted)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  Interactive Interview
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('review')}
                  style={{
                    border: 'none',
                    background: viewMode === 'review' ? 'var(--ink)' : 'transparent',
                    color: viewMode === 'review' ? 'var(--bg)' : 'var(--muted)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  Review All ({answeredQuestionsCount}/{questions.length})
                </button>
              </div>
            )}
            {id && <div className="s-sid">Session: <code title={id}>{shortId}</code></div>}
          </div>
        </div>

        {/* ── Generating Report Overlay ─────────────────────────────────────── */}
        {generatingReport && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(242, 238, 230, 0.94)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 24,
            textAlign: 'center',
          }}>
            <div className="spinner" style={{ width: 48, height: 48, borderWidth: 3, marginBottom: 20 }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: 'var(--ink)' }}>
              Synthesizing Executive Performance Report…
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14.5, maxWidth: 480, margin: '0 0 20px', lineHeight: 1.55 }}>
              Gemini AI is analyzing your responses across technical accuracy, communication clarity, and skill gaps.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, padding: '5px 12px', background: '#fff', border: '1px solid var(--line)', borderRadius: 20, color: 'var(--muted)', fontWeight: 600 }}>
                ✓ Evaluations Aggregated
              </span>
              <span style={{ fontSize: 12, padding: '5px 12px', background: 'var(--yellow)', border: '1px solid #D1AF43', borderRadius: 20, color: 'var(--ink)', fontWeight: 600 }}>
                ⚡ Formulating Strengths &amp; Skill Gaps
              </span>
              <span style={{ fontSize: 12, padding: '5px 12px', background: '#fff', border: '1px solid var(--line)', borderRadius: 20, color: 'var(--muted)', fontWeight: 600 }}>
                Targeting Recommendations
              </span>
            </div>
          </div>
        )}

        {/* ── Loading Initial Session State ─────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'grid', placeItems: 'center', padding: '80px 0' }}>
            <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 14 }}>Loading interview session details…</p>
          </div>
        )}

        {/* ── Initial Load Error State ──────────────────────────────────────── */}
        {!loading && error && (
          <section className="s-card" style={{ padding: '24px 28px', borderLeft: '4px solid #B3323F' }}>
            <h2 style={{ margin: 0, fontSize: 18, color: '#B3323F' }}>Session Unavailable</h2>
            <p style={{ margin: '8px 0 16px', color: 'var(--muted)', fontSize: 14 }}>{error}</p>
            <Link to={backHref} className="btn dark sm">Return to Setup</Link>
          </section>
        )}

        {/* ── Session Header Card ───────────────────────────────────────────── */}
        {!loading && session && (
          <section className="s-card s-head">
            <div className="s-l">
              <span className="s-tile"><Icon name="spark" /></span>
              <div>
                <div className="s-meta">
                  <span className="s-pill">
                    {generating && <i />}
                    {statusDisplay}
                  </span>
                  <span>{[cap(typeText), cap(diffText)].filter(Boolean).join(' · ')}</span>
                </div>
                <h1 className="s-role">{roleText}</h1>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              {averageScore != null && (
                <div style={{ textAlign: 'right' }}>
                  <small style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                    Avg Score
                  </small>
                  <b style={{ display: 'block', marginTop: 4, fontSize: 20 }}>
                    {averageScore} <span style={{ fontSize: 13, color: 'var(--muted)' }}>/ 10</span>
                  </b>
                </div>
              )}
              <div className="s-prog">
                <small>Progress</small>
                <b>{answeredQuestionsCount} / {questions.length || targetQuestionCount} Answered</b>
              </div>
            </div>
          </section>
        )}

        {/* ── Claude Generating Card (When questions are being crafted) ─────── */}
        {generating && (
          <section className="s-card s-gen" role="status" aria-live="polite">
            <span className="s-tile"><Icon name="spark" /></span>
            <div className="t">
              <h2>Gemini AI is crafting your tailored interview questions…</h2>
              <p>{modelLabel} is analyzing your target role (<b>{roleText}</b>) and background to structure personalized mock interview questions.</p>
              <div className="s-bar" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* ── Question Generation Error Banner ─────────────────────────────── */}
        {!generating && genError && (
          <section className="s-card" style={{ padding: '24px 28px', background: '#FBEBED', border: '1px solid #B3323F' }}>
            <h3 style={{ margin: 0, fontSize: 17, color: '#B3323F' }}>Question Generation Issue</h3>
            <p style={{ margin: '8px 0 16px', color: '#B3323F', fontSize: 14, lineHeight: 1.5 }}>{genError}</p>
            <button type="button" onClick={handleManualRetryGen} className="btn dark sm">
              Retry Question Generation
            </button>
          </section>
        )}

        {/* ── Interactive Focus Mode (Question by Question) ────────────────── */}
        {!generating && questions.length > 0 && viewMode === 'focus' && currentQuestion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Question Navigation Bar */}
            <div className="s-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div className="s-pills">
                {questions.map((q, idx) => {
                  const isAns = Boolean(q.answer?.feedback);
                  const isCur = idx === currentIndex;
                  return (
                    <button
                      type="button"
                      key={q.id || idx}
                      className={`s-qpill${isCur ? ' on' : isAns ? ' done' : ''}`}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setSubmitError('');
                      }}
                      title={`Question ${idx + 1}: ${q.topic || ''}`}
                    >
                      <span>Q{idx + 1}</span>
                      {isAns && <span>✓</span>}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                {!isCurrentAnswered ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 999, background: '#FBFAF7', border: '1px solid var(--line)', fontSize: 13, fontWeight: 600 }}>
                    <Icon name="clock" /> {formatSeconds(currentElapsedSeconds)}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                    Answered in {formatSeconds(currentQuestion.answer.timeTaken || 0)}
                  </span>
                )}
              </div>
            </div>

            {/* Active Question Prompt */}
            <div className="s-qcard">
              <div className="s-qhead">
                <div>
                  <span className="s-qtopic">{currentQuestion.topic || 'General Technical'}</span>
                  <span
                    className="s-qdiff"
                    style={{
                      background: currentQuestion.difficulty === 'hard'
                        ? '#FBEBED'
                        : currentQuestion.difficulty === 'easy'
                        ? 'rgba(63,174,106,.15)'
                        : 'rgba(244,207,99,.3)',
                      color: currentQuestion.difficulty === 'hard'
                        ? '#B3323F'
                        : currentQuestion.difficulty === 'easy'
                        ? '#227845'
                        : 'var(--ink)',
                    }}
                  >
                    {(currentQuestion.difficulty || session.difficulty || 'medium').toUpperCase()}
                  </span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                  <Icon name="spark" /> Gemini 3.8 Flash
                </span>
              </div>

              <h2 className="s-qtitle">{currentQuestion.questionText}</h2>

              {/* If Question Answered: Display Candidate Answer and AI Evaluation */}
              {isCurrentAnswered ? (
                <div className="s-eval">
                  <div style={{ padding: '16px', borderRadius: 14, background: '#FBFAF7', border: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                        Your Submitted Response
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {new Date(currentQuestion.answer.submittedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {currentQuestion.answer.answerText}
                    </p>
                  </div>

                  <div className="s-card" style={{ padding: '22px', border: '1px solid var(--line)', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="s-tile" style={{ width: 42, height: 42, borderRadius: 12 }}><Icon name="award" /></span>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 16 }}>Gemini AI Evaluation</h3>
                          <small style={{ color: 'var(--muted)', fontSize: 12 }}>Calibrated against {session.roleTarget} ({currentQuestion.difficulty})</small>
                        </div>
                      </div>
                      <span className="s-scorebadge">
                        {currentQuestion.answer.feedback.score} <span style={{ fontSize: 13, color: 'var(--muted)' }}>/ 10</span>
                      </span>
                    </div>

                    <div style={{ display: 'grid', gap: 12 }}>
                      <div className="s-evalbox">
                        <h4>Correctness &amp; Technical Depth</h4>
                        <p>{currentQuestion.answer.feedback.correctness}</p>
                      </div>

                      <div className="s-evalbox">
                        <h4>Communication &amp; Structure</h4>
                        <p>{currentQuestion.answer.feedback.communication}</p>
                      </div>

                      {currentQuestion.answer.feedback.improvements?.length > 0 && (
                        <div className="s-evalbox" style={{ background: 'rgba(244,207,99,.15)', borderColor: 'rgba(244,207,99,.5)' }}>
                          <h4 style={{ color: 'var(--ink)' }}>Actionable Improvements</h4>
                          <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>
                            {currentQuestion.answer.feedback.improvements.map((item, i) => (
                              <li key={i} style={{ marginBottom: 4 }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                    >
                      <Icon name="arrowLeft" /> Previous
                    </button>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        type="button"
                        className="btn dark sm"
                        onClick={handleNext}
                      >
                        <span>Next Question</span>
                        <Icon name="arrowRight" />
                      </button>
                    ) : isAllCompleted ? (
                      <button
                        type="button"
                        className="btn yellow sm"
                        onClick={handleViewOrGenerateReport}
                        disabled={generatingReport}
                      >
                        {generatingReport ? 'Generating Report…' : 'View Performance Report →'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn dark sm"
                        onClick={() => setViewMode('review')}
                      >
                        <span>Review Full Interview</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* If Question Not Yet Answered: Answer Workspace */
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                      Your Response
                    </span>
                    <span style={{ fontSize: 12, color: currentDraft.length >= 10 ? 'var(--ink)' : 'var(--muted)', fontWeight: 600 }}>
                      {currentDraft.length} characters (min 10)
                    </span>
                  </div>

                  <textarea
                    id="interview-answer-textarea"
                    className="s-area"
                    value={currentDraft}
                    onChange={(e) =>
                      setAnswerDrafts((prev) => ({
                        ...prev,
                        [currentQuestion.id]: e.target.value,
                      }))
                    }
                    disabled={evaluating}
                    placeholder="Type your structured answer here. Include architectural considerations, trade-offs, and implementation details…"
                  />

                  {submitError && (
                    <p style={{ margin: '10px 0 0', padding: '10px 14px', borderRadius: 10, background: '#FBEBED', color: '#B3323F', fontSize: 13 }}>
                      {submitError}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 12 }}>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={handlePrev}
                      disabled={currentIndex === 0 || evaluating}
                    >
                      <Icon name="arrowLeft" /> Back
                    </button>

                    <button
                      id="submit-answer-btn"
                      type="button"
                      className="btn dark"
                      onClick={handleSubmitAnswer}
                      disabled={evaluating || currentDraft.trim().length < 10}
                    >
                      {evaluating ? (
                        <>
                          <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                          <span>Evaluating via Gemini…</span>
                        </>
                      ) : (
                        <>
                          <Icon name="send" />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </button>
                  </div>

                  {evaluating && (
                    <div style={{
                      marginTop: 14,
                      padding: '12px 16px',
                      background: '#fff',
                      border: '1px solid var(--line)',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,.03)',
                    }}>
                      <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, flexShrink: 0 }} />
                      <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
                        <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 2 }}>
                          Evaluating via Gemini AI…
                        </strong>
                        Analyzing technical correctness, communication clarity, and candidate scoring.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Review All Questions Mode ────────────────────────────────────── */}
        {!generating && questions.length > 0 && viewMode === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="s-card" style={{ padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 19 }}>Interview Summary &amp; Questions</h2>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>
                  {answeredQuestionsCount} of {questions.length} questions completed. Review evaluations and target areas below.
                </p>
              </div>
              <button
                type="button"
                className="btn sm"
                onClick={() => setViewMode('focus')}
              >
                ← Back to Interactive Mode
              </button>
            </div>

            {isAllCompleted && (
              <div className="s-card" style={{ padding: '24px 28px', background: 'rgba(244,207,99,.22)', border: '1px solid rgba(244,207,99,.7)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Mock Interview Complete!</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)' }}>
                    You have answered all {questions.length} questions. Your calibrated average score is <strong>{averageScore} / 10</strong>.
                  </p>
                  {reportError && (
                    <p style={{ margin: '8px 0 0', fontSize: 13, color: '#B3323F' }}>{reportError}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="btn dark"
                  onClick={handleViewOrGenerateReport}
                  disabled={generatingReport}
                >
                  {generatingReport ? 'Generating Report…' : 'View Performance Report →'}
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
              {questions.map((q, idx) => {
                const hasAns = Boolean(q.answer?.feedback);
                return (
                  <div key={q.id || idx} className="s-card" style={{ padding: '20px 22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>Question {idx + 1}</span>
                        <span className="s-qtopic">{q.topic || 'General'}</span>
                      </div>
                      {hasAns ? (
                        <span style={{ fontSize: 13, fontWeight: 700, background: 'var(--yellow)', padding: '3px 10px', borderRadius: 999 }}>
                          Score: {q.answer.feedback.score} / 10
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => {
                            setCurrentIndex(idx);
                            setViewMode('focus');
                          }}
                        >
                          Answer Now →
                        </button>
                      )}
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600 }}>{q.questionText}</p>
                    {hasAns && (
                      <div style={{ padding: '12px 14px', borderRadius: 10, background: '#FBFAF7', border: '1px solid var(--line)', fontSize: 13 }}>
                        <p style={{ margin: '0 0 6px' }}><strong>Your Answer:</strong> {q.answer.answerText}</p>
                        <p style={{ margin: 0, color: 'var(--muted)' }}><strong>Feedback:</strong> {q.answer.feedback.correctness}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
