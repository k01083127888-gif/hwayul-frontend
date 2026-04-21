import { useState, useEffect, useRef } from "react";
import C from "../tokens/colors.js";
import { _store, _members, _contents, addSubmission, useStore, setMembers, setContents, loadContentsFromDB, saveContentsToDB, updateSubmissionStatus, loadSubmissionsFromDB, syncSubmissionsToDB } from "../utils/store.js";
import { saveMembers, saveContents, saveDetails, saveToStorage } from "../utils/storage.js";
import { contentDetails } from "../data/contentDetails.js";
import { mockNews } from "../data/mockNews.js";
import { _defaultMembers } from "../data/memberData.js";
import { isValidEmail } from "../utils/validators.js";
import { StatCard, BarChart, MiniTrend, StatusPie, getMonthly, StatSection, NlHistoryCard, hashPw, checkAdminPw, ADMIN_MAX_ATTEMPTS, LOCKOUT_KEY } from "../components/AdminStats.jsx";
import { AdminEmailComposer } from "../components/AdminEmailComposer.jsx";
import { ReportWriter } from "../components/ReportWriter.jsx";
import { SectionTag } from "../components/common/FormElements.jsx";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Quill } from "react-quill-new";

// ── Quill 이미지 포맷 확장 — width, height, style 속성 보존 ──
const BaseImageFormat = Quill.import("formats/image");
const ImageFormatAttributesList = ["alt", "height", "width", "style"];
class ImageFormat extends BaseImageFormat {
  static formats(domNode) {
    return ImageFormatAttributesList.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}
Quill.register(ImageFormat, true);

// ── 관리자 섹션 ─────────────────────────────────────────────────────────────
export function AdminSection({ setActive, authed, setAuthed }) {
  const [pw, setPw] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(() => {
    try { const v = localStorage.getItem(LOCKOUT_KEY); return v ? parseInt(v) : 0; } catch { return 0; }
  });

  const isLocked = lockedUntil > Date.now();
  const lockRemain = Math.ceil((lockedUntil - Date.now()) / 1000);
  const attemptsLeft = ADMIN_MAX_ATTEMPTS - attempts;

  const handleLogin = () => {
    if (isLocked) return;
    if (checkAdminPw(pw)) {
      setAuthed(true);
      setAttempts(0);
      try { localStorage.removeItem(LOCKOUT_KEY); } catch {}
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setPw("");
      if (next >= ADMIN_MAX_ATTEMPTS) {
        const lockMinutes = 5 * Math.pow(2, Math.floor(next / ADMIN_MAX_ATTEMPTS) - 1);
        const until = Date.now() + lockMinutes * 60 * 1000;
        setLockedUntil(until);
        try { localStorage.setItem(LOCKOUT_KEY, String(until)); } catch {}
      }
    }
  };
  const [tab, setTab] = useState("dashboard");
  const store = useStore();
  const [membersState, setMembersState] = useState([..._members]);
  const [contentsState, setContentsState] = useState([..._contents]);
  const [editMember, setEditMember] = useState(null);
  const [editContent, setEditContent] = useState(null);
  const [contentPreview, setContentPreview] = useState(null);
  const [viewDetail, setViewDetail] = useState(null);
  const [emailCompose, setEmailCompose] = useState(null);
  const [viewResultHtml, setViewResultHtml] = useState(null);
  const [reportWrite, setReportWrite] = useState(null);
  const resultIframeRef = useRef(null);
  const [nlMode, setNlMode] = useState("list"); // list | compose | preview | history
  const [nlForm, setNlForm] = useState({ title:"", greeting:"안녕하세요, 화율인사이드입니다.", body:"", closing:"감사합니다.\n\n화율인사이드\n대표 노무사 김재정\nhwayulinside@gmail.com" });
  const [nlSent, setNlSent] = useState(false);
  const nlPreviewRef = useRef(null);
  // AI 자동 작성 상태
  const [nlAiLoading, setNlAiLoading] = useState(false);
  const [nlAiError, setNlAiError] = useState("");
  const [nlAiTopic, setNlAiTopic] = useState("판례");      // 판례|노동부뉴스|지침변경|종합
  const [nlAiKeyword, setNlAiKeyword] = useState("");       // 추가 키워드
  const [nlAiMonth, setNlAiMonth] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  });
  // 발송 이메일 이력 상태
  const [emailHistory, setEmailHistory] = useState(null); // { submissionId, emails:[] }
  const fetchEmailHistory = async (submissionId) => {
    try {
      const res = await fetch(`https://hwayul-backend-production-96cf.up.railway.app/api/sent-emails?submission_id=${submissionId}`);
      if (res.ok) {
        const emails = await res.json();
        setEmailHistory({ submissionId, emails });
      }
    } catch(e) { console.error("이메일 이력 조회 실패:", e); }
  };

  // 결과지 iframe 로딩
  useEffect(() => {
    if (viewResultHtml && resultIframeRef.current) {
      const doc = resultIframeRef.current.contentDocument || resultIframeRef.current.contentWindow.document;
      const html = viewResultHtml.replace(/<script>window\.onload.*?<\/script>/g, '');
      doc.open(); doc.write(html); doc.close();
    }
  }, [viewResultHtml]);

  // 동기화
  useEffect(() => { setMembers(membersState); saveMembers(membersState); }, [membersState]);
  const isFirstLoad = useRef(true);
  const isFromDB = useRef(false);
  useEffect(() => { if (isFirstLoad.current || isFromDB.current) { isFromDB.current = false; return; } setContents(contentsState); saveContents(contentsState); saveContentsToDB(contentsState); }, [contentsState]);
  useEffect(() => {
    loadContentsFromDB().then(data => {
      if (data && data.length > 0) { isFromDB.current = true; setContentsState(data); }
      isFirstLoad.current = false;
    });
  }, []);

  // 접수 데이터 DB 동기화 및 로드
  useEffect(() => {
    syncSubmissionsToDB().then(() => loadSubmissionsFromDB());
  }, []);

  if (!authed) return (
    <section style={{ minHeight:"100vh", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", padding:32 }}>
      <div style={{ maxWidth:400, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:20 }}>{isLocked ? "🔒" : "🔐"}</div>
        <h2 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:22, fontWeight:800, color:C.cream, marginBottom:8 }}>관리자 로그인</h2>
        <p style={{ fontSize:13, color:"rgba(244,241,235,0.4)", marginBottom:12 }}>화율인사이드 관리자 전용 페이지입니다.</p>
        <div style={{ fontSize:10, color:"rgba(244,241,235,0.25)", marginBottom:28, lineHeight:1.6 }}>
          🔒 암호화 적용 · 5회 실패 시 자동 잠금 · 30분 비활동 시 자동 로그아웃
        </div>
        {isLocked ? (
          <div style={{ padding:"20px", background:"rgba(192,57,43,0.12)", border:"1px solid rgba(192,57,43,0.3)", borderRadius:12, marginBottom:16 }}>
            <div style={{ fontSize:14, color:C.red, fontWeight:700, marginBottom:6 }}>🚫 로그인이 일시적으로 잠겼습니다</div>
            <div style={{ fontSize:12, color:"rgba(244,241,235,0.5)", marginBottom:10 }}>비밀번호 오류 {ADMIN_MAX_ATTEMPTS}회 초과. {lockRemain}초 후 다시 시도하세요.</div>
            <button onClick={() => { try { localStorage.removeItem(LOCKOUT_KEY); } catch {} setLockedUntil(0); setAttempts(0); }} style={{ padding:"8px 16px", borderRadius:6, border:"1px solid rgba(244,241,235,0.15)", background:"rgba(255,255,255,0.05)", color:"rgba(244,241,235,0.5)", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>잠금 해제</button>
          </div>
        ) : (
          <>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => { if(e.key==="Enter") handleLogin(); }} placeholder="관리자 비밀번호" style={{ width:"100%", padding:"14px 18px", borderRadius:10, border:`2px solid ${attempts>0?"rgba(192,57,43,0.4)":"rgba(255,255,255,0.1)"}`, background:"rgba(255,255,255,0.05)", color:C.cream, fontSize:15, fontFamily:"inherit", outline:"none", textAlign:"center", boxSizing:"border-box", marginBottom:14 }} />
            <button onClick={handleLogin} style={{ width:"100%", padding:"14px", borderRadius:10, background:C.gold, border:"none", color:C.navy, fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>로그인</button>
            {attempts > 0 && attempts < ADMIN_MAX_ATTEMPTS && (
              <div style={{ marginTop:12, fontSize:12, color:C.red }}>
                비밀번호가 올바르지 않습니다. (남은 시도: {attemptsLeft}회)
              </div>
            )}
          </>
        )}
        <div style={{ marginTop:24 }}><button onClick={() => setActive("home")} style={{ fontSize:12, color:"rgba(244,241,235,0.3)", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>← 홈으로 돌아가기</button></div>
      </div>
    </section>
  );

  const tabs = [
    { id:"dashboard", icon:"📊", label:"대시보드" },
    { id:"members", icon:"👥", label:"전문가 관리" },
    { id:"contents", icon:"📰", label:"콘텐츠 관리" },
    { id:"reports", icon:"📩", label:"익명 제보" },
    { id:"biz", icon:"🏢", label:"심층상담" },
    { id:"relief", icon:"🛡️", label:"해결 의뢰" },
    { id:"resultEmails", icon:"📧", label:"결과지 발송" },
    { id:"reviewRequests", icon:"📋", label:"리포트 검토" },
    { id:"services", icon:"📞", label:"강의 등 요청" },
    { id:"newsletter", icon:"📬", label:"뉴스레터" },
  ];

  const subs = store.submissions;

  // ── 공통 스타일 ──
  const cardStyle = { background:"white", borderRadius:14, padding:24, border:"1px solid rgba(10,22,40,0.08)", boxShadow:"0 2px 12px rgba(10,22,40,0.05)" };
  const thStyle = { padding:"10px 14px", fontSize:11, fontWeight:700, color:C.gray, textAlign:"left", borderBottom:"2px solid rgba(10,22,40,0.08)", textTransform:"uppercase", letterSpacing:"0.5px" };
  const tdStyle = { padding:"10px 14px", fontSize:13, color:C.navy, borderBottom:"1px solid rgba(10,22,40,0.05)" };
  const btnPrimary = { padding:"8px 18px", borderRadius:6, background:C.teal, border:"none", color:"white", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" };
  const btnDanger = { padding:"8px 14px", borderRadius:6, background:"rgba(192,57,43,0.1)", border:`1px solid rgba(192,57,43,0.2)`, color:C.red, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" };
  const inputStyle = { width:"100%", padding:"10px 12px", borderRadius:6, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };

  // ── 전문가 편집 폼 ──
  const MemberForm = ({ member, onSave, onCancel }) => {
    const [f, setF] = useState(member || { name:"", title:"", exp:"", spec:"", icon:"⚖️", bio:"", fullBio:"", career:[], expertise:[], message:"" });
    const U = k => e => setF(v => ({ ...v, [k]: e.target.value }));
    return (
      <div style={{ ...cardStyle, marginBottom:20 }}>
        <h4 style={{ fontSize:15, fontWeight:800, color:C.navy, marginBottom:16 }}>{member ? "전문가 수정" : "새 전문가 추가"}</h4>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
          <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>성명</label><input value={f.name} onChange={U("name")} style={inputStyle} /></div>
          <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>직함</label><input value={f.title} onChange={U("title")} style={inputStyle} /></div>
          <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>아이콘</label><input value={f.icon} onChange={U("icon")} style={inputStyle} placeholder="⚖️" /></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>경력</label><input value={f.exp} onChange={U("exp")} style={inputStyle} placeholder="경력 15년" /></div>
          <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>전문분야</label><input value={f.spec} onChange={U("spec")} style={inputStyle} /></div>
        </div>
        <div style={{ marginBottom:12 }}><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>소개 (카드용)</label><textarea value={f.bio} onChange={U("bio")} rows={2} style={{ ...inputStyle, resize:"vertical" }} /></div>
        <div style={{ marginBottom:12 }}><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>상세 소개</label><textarea value={f.fullBio} onChange={U("fullBio")} rows={3} style={{ ...inputStyle, resize:"vertical" }} /></div>
        <div style={{ marginBottom:12 }}><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>한마디 메시지</label><textarea value={f.message} onChange={U("message")} rows={2} style={{ ...inputStyle, resize:"vertical" }} /></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>주요 경력 (줄바꿈으로 구분)</label><textarea value={(f.career||[]).join("\n")} onChange={e => setF(v => ({ ...v, career: e.target.value.split("\n") }))} rows={4} style={{ ...inputStyle, resize:"vertical" }} /></div>
          <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>전문 분야 (줄바꿈으로 구분)</label><textarea value={(f.expertise||[]).join("\n")} onChange={e => setF(v => ({ ...v, expertise: e.target.value.split("\n") }))} rows={4} style={{ ...inputStyle, resize:"vertical" }} /></div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => { if(f.name && f.title) onSave(f); }} style={btnPrimary}>💾 저장</button>
          <button onClick={onCancel} style={{ ...btnDanger, background:"transparent" }}>취소</button>
        </div>
      </div>
    );
  };

  // ── 유튜브 URL → 임베드 ID 변환 헬퍼 ──
  const getYoutubeId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  };
  const getFileType = (url) => {
    if (!url) return "link";
    if (getYoutubeId(url)) return "youtube";
    if (/\.(mp4|webm|mov|avi)(\?|$)/i.test(url)) return "video";
    if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url)) return "image";
    if (/\.(pdf)(\?|$)/i.test(url)) return "pdf";
    if (/\.(doc|docx|hwp|hwpx|ppt|pptx|xls|xlsx)(\?|$)/i.test(url)) return "document";
    return "link";
  };
  const fileTypeLabel = { youtube:"▶ 유튜브", video:"🎬 동영상", image:"🖼️ 이미지", pdf:"📎 PDF", document:"📄 문서", link:"🔗 링크" };

  // ── 콘텐츠 편집 폼 ──
  const ContentForm = ({ item, onSave, onCancel }) => {
    const existingDetail = item?.id ? contentDetails[item.id] : null;
    const [f, setF] = useState(item || { type:"news", tag:"", title:"", date:new Date().toISOString().slice(0,10).replace(/-/g,"."), summary:"", views:0 });
    const [body, setBody] = useState(existingDetail?.content || item?.body || "");
    const [attachments, setAttachments] = useState(existingDetail?.attachments || item?.attachments || []);
    const [newUrl, setNewUrl] = useState("");
    const [newLabel, setNewLabel] = useState("");
    const U = k => e => setF(v => ({ ...v, [k]: e.target.value }));
    const [aiLoading, setAiLoading] = useState(false);
    const [aiGenerated, setAiGenerated] = useState(false);
    const [aiTopic, setAiTopic] = useState("판례");
    const [aiKeyword, setAiKeyword] = useState("");

    const addAttachment = () => {
      if (!newUrl.trim()) return;
      const type = getFileType(newUrl);
      setAttachments(a => [...a, { url: newUrl.trim(), label: newLabel.trim() || newUrl.trim().split("/").pop()?.slice(0,40) || "첨부파일", type, id: Date.now() }]);
      setNewUrl(""); setNewLabel("");
    };
    const removeAttachment = (id) => setAttachments(a => a.filter(x => x.id !== id));

    const AI_TOPICS = {
      "판례":     { tag:"판례",     type:"news",     prompt:"최신 직장내 괴롭힘 관련 판례 1건을 선정하여 콘텐츠를 작성하세요. 판례명, 사건번호, 판결 요지, 실무적 시사점을 포함하세요." },
      "산재사례": { tag:"산재사례", type:"news",     prompt:"직장내 괴롭힘으로 인한 산재 승인 사례 1건을 선정하여 콘텐츠를 작성하세요. 피해 상황, 승인 근거, 실무 팁을 포함하세요." },
      "정책":     { tag:"정책",     type:"news",     prompt:"직장내 괴롭힘 관련 최신 법령·정책 변경 사항 1건을 선정하여 콘텐츠를 작성하세요. 개정 내용, 시행일, 기업 대응 방안을 포함하세요." },
      "산재통계": { tag:"산재통계", type:"news",     prompt:"직장내 괴롭힘 산재 승인 통계를 분석하는 콘텐츠를 작성하세요. 연도별 추이, 주요 유형별 분석, 시사점을 포함하세요." },
      "교육영상": { tag:"교육영상", type:"video",    prompt:"직장내 괴롭힘 예방교육 영상 콘텐츠의 제목과 설명을 작성하세요. 교육 대상, 주요 내용, 학습 목표를 포함하세요." },
      "자료":     { tag:"자료",     type:"resource", prompt:"직장내 괴롭힘 관련 실무 자료의 제목과 설명을 작성하세요. 활용 대상, 포함 내용, 활용 방법을 포함하세요." },
      "칼럼":     { tag:"칼럼",     type:"resource", prompt:"직장내 괴롭힘 관련 전문 칼럼을 작성하세요. 현장 경험과 실무적 시사점을 포함하세요." },
    };

    const handleAiGenerate = async () => {
      setAiLoading(true);
      try {
        const topicInfo = AI_TOPICS[aiTopic];
        const keywordHint = aiKeyword.trim() ? "\n추가 키워드/주제: " + aiKeyword : "";
        const sysPrompt = [
          "당신은 직장내 괴롭힘 전문 노무사 사무소의 콘텐츠 작성자입니다.",
          "",
          "[최우선 원칙] 정확성 보장:",
          "- 확실하지 않은 판례번호·통계 수치는 절대 만들어내지 않는다",
          "- 존재하지 않는 판례·법률·기관을 언급하지 않는다",
          "",
          "반드시 JSON 형식으로만 응답하세요. 마크다운 코드블록(```)을 사용하지 마세요.",
          '응답 형식: {"title":"제목 50자 이내","summary":"요약 100~200자","content":"본문 500~1000자","attachments":[{"url":"관련 공공기관 URL","label":"출처명"}]}',
          "",
          "attachments에는 고용노동부(https://www.moel.go.kr), 근로복지공단(https://www.comwel.or.kr), 국가법령정보센터(https://www.law.go.kr) 등 관련 공공기관 URL을 1~3개 포함하세요."
        ].join("\n");
        const userMsg = topicInfo.prompt + keywordHint + "\n\n오늘 날짜: " + new Date().toISOString().slice(0,10);
        const res = await fetch("https://hwayul-backend-production-96cf.up.railway.app/api/claude", {
          method: "POST",
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1500,
            system: sysPrompt,
            messages: [{ role: "user", content: userMsg }],
          }),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        const rawText = (data.content || []).map(function(c) { return c.text || ""; }).join("");
        const clean = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(clean);
        setF(function(v) { return { ...v, type: topicInfo.type, tag: topicInfo.tag, title: parsed.title || v.title, summary: parsed.summary || v.summary, date: new Date().toISOString().slice(0,10).replace(/-/g, ".") }; });
        if (parsed.content) setBody(parsed.content);
        if (parsed.attachments && parsed.attachments.length > 0) {
          const newAtts = parsed.attachments.filter(function(a) { return a.url; }).map(function(a) { return { url: a.url, label: a.label || "참고 링크", type: getFileType(a.url), id: Date.now() + Math.random() }; });
          setAttachments(function(prev) { return [...prev, ...newAtts]; });
        }
      } catch (err) {
        console.error("AI 생성 실패:", err);
        alert("AI 생성 중 오류가 발생했습니다: " + (err.message || "알 수 없는 오류"));
      }
      setAiLoading(false);
      setAiGenerated(true);
    };

    // ── Cloudinary 이미지 업로드 + Quill 에디터 설정 ──
    const quillRef = useRef(null);
    const CLOUDINARY_CLOUD = "drx8qy9ck";
    const CLOUDINARY_PRESET = "hwayul_unsigned";

    const imageHandler = () => {
      const quill = quillRef.current?.getEditor?.() || quillRef.current;
      if (!quill || !quill.clipboard) {
        alert("에디터를 찾을 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.");
        return;
      }
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();
      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", CLOUDINARY_PRESET);
          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (!data.secure_url) {
            console.error("Cloudinary 응답:", data);
            alert("이미지 업로드 실패: " + (data.error?.message || "알 수 없는 오류"));
            return;
          }
          const currentHtml = quill.root.innerHTML;
          const imgTag = `<p><img src="${data.secure_url}" alt="uploaded"/></p><p><br/></p>`;
          quill.root.innerHTML = currentHtml + imgTag;
          setBody(quill.root.innerHTML);
        } catch (err) {
          console.error("업로드 오류:", err);
          alert("이미지 업로드 오류: " + err.message);
        }
      };
    };

    const quillModules = {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote"],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
    };

    // 이미지 클릭 → 크기 조절 + 정렬
    useEffect(() => {
      const handleImageClick = (e) => {
        const target = e.target;
        if (target?.tagName !== "IMG") return;
        const editor = target.closest(".ql-editor");
        if (!editor) return;
        e.preventDefault();
        e.stopPropagation();
        const currentWidth = target.style.width || "100%";
        const input = window.prompt(
          "이미지 크기와 정렬을 입력하세요.\n\n" +
          "✔ 크기: 50% / 70% / 100% / 300px\n" +
          "✔ 정렬: left / center / right\n" +
          "✔ 크기+정렬 동시: 50% center\n" +
          "✔ 원래대로: reset",
          currentWidth
        );
        if (!input || !input.trim()) return;
        const tokens = input.trim().toLowerCase().split(/\s+/);
        if (tokens.includes("reset")) {
          target.removeAttribute("style");
          target.removeAttribute("width");
          target.removeAttribute("height");
        } else {
          tokens.forEach(tok => {
            if (tok === "left") {
              target.style.float = "left";
              target.style.display = "";
              target.style.margin = "0 16px 8px 0";
            } else if (tok === "right") {
              target.style.float = "right";
              target.style.display = "";
              target.style.margin = "0 0 8px 16px";
            } else if (tok === "center") {
              target.style.float = "";
              target.style.display = "block";
              target.style.margin = "16px auto";
            } else if (/^\d+(%|px)$/.test(tok)) {
              target.style.width = tok;
              target.style.height = "auto";
              target.style.maxWidth = "100%";
            }
          });
        }
        const quill = quillRef.current?.getEditor?.() || quillRef.current;
        if (quill?.root) setBody(quill.root.innerHTML);
      };
      document.addEventListener("click", handleImageClick, true);
      return () => document.removeEventListener("click", handleImageClick, true);
    }, []);

    const handleSave = () => {
      if (!f.title) return;
      // Quill 에디터의 최신 HTML을 직접 읽어온다 (onBlur 비동기 지연 회피)
      const quill = quillRef.current?.getEditor?.() || quillRef.current;
      const latestBody = quill?.root?.innerHTML ?? body ?? "";
      if (latestBody !== body) setBody(latestBody);

      const savedItem = { ...f, id: item?.id || Date.now(), views: Number(f.views)||0, body: latestBody, attachments: attachments.length > 0 ? attachments : [] };
      contentDetails[savedItem.id] = { ...(contentDetails[savedItem.id] || {}), content: latestBody, attachments: attachments.length > 0 ? attachments : undefined };
      saveDetails();
      onSave(savedItem);
    };

    return (
      <div style={{ ...cardStyle, marginBottom:20 }}>
        <h4 style={{ fontSize:15, fontWeight:800, color:C.navy, marginBottom:16 }}>{item ? "콘텐츠 수정" : "새 콘텐츠 추가"}</h4>
        {/* AI 자동 작성 */}
        <div style={{ padding:"16px 18px", background:"linear-gradient(135deg, rgba(201,168,76,0.06), rgba(13,115,119,0.06))", border:"1px solid rgba(201,168,76,0.2)", borderRadius:10, marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ fontSize:16 }}>✨</span>
            <span style={{ fontSize:12, fontWeight:700, color:C.navy }}>AI 자동 작성</span>
            <span style={{ fontSize:10, color:C.gray }}> — 제목·요약·본문·참고링크까지 자동 생성</span>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
            {Object.keys(AI_TOPICS).map(t => (
              <button key={t} onClick={() => setAiTopic(t)} style={{ padding:"6px 14px", borderRadius:100, fontSize:11, fontWeight:aiTopic===t?700:400, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s", background:aiTopic===t?"rgba(201,168,76,0.15)":"rgba(10,22,40,0.04)", border:`1.5px solid ${aiTopic===t?C.gold:"rgba(10,22,40,0.1)"}`, color:aiTopic===t?C.gold:"#5A5550" }}>{t}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={aiKeyword} onChange={e=>setAiKeyword(e.target.value)} placeholder="추가 키워드 (선택)" style={{ flex:1, padding:"9px 12px", borderRadius:6, border:"1.5px solid rgba(10,22,40,0.1)", fontSize:12, fontFamily:"inherit", outline:"none" }} />
            <button onClick={handleAiGenerate} disabled={aiLoading} style={{ padding:"9px 20px", borderRadius:8, border:"none", fontWeight:700, fontSize:12, cursor:aiLoading?"wait":"pointer", fontFamily:"inherit", whiteSpace:"nowrap", background:aiLoading?"rgba(201,168,76,0.3)":C.gold, color:aiLoading?"#8B7A40":C.navy }}>
              {aiLoading ? <><span style={{ display:"inline-block", animation:"spin 1s linear infinite", fontSize:13 }}>⟳</span> 작성 중…</> : "✨ AI 자동 작성"}
            </button>
          </div>
          {aiLoading && <div style={{ marginTop:10, padding:"10px 14px", background:"rgba(13,115,119,0.06)", borderRadius:8, fontSize:11, color:C.teal, lineHeight:1.7 }}>🤖 「{aiTopic}」 유형으로 작성 중… 완료 후 제목·요약·본문·참고링크에 자동 반영됩니다.</div>}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12, marginBottom:12 }}>
          <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>유형</label><select value={f.type} onChange={U("type")} style={inputStyle}><option value="news">뉴스·판례</option><option value="video">교육영상</option><option value="resource">자료</option><option value="column">칼럼</option></select></div>
          <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>태그</label><input value={f.tag} onChange={U("tag")} style={inputStyle} placeholder="판례, 정책, 서식 등" /></div>
          <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>판례번호 <span style={{ fontWeight:400, color:"rgba(10,22,40,0.35)" }}>(선택)</span></label><input value={f.case_number || ""} onChange={U("case_number")} style={inputStyle} placeholder="2023다12345" /></div>
          <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>날짜</label><input value={f.date} onChange={U("date")} style={inputStyle} placeholder="2025.01.01" /></div>
        </div>
        <div style={{ marginBottom:12 }}><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>제목</label><input value={f.title} onChange={U("title")} style={inputStyle} /></div>
        <div style={{ marginBottom:12 }}><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>요약</label><textarea value={f.summary} onChange={U("summary")} rows={3} style={{ ...inputStyle, resize:"vertical", lineHeight:1.7 }} /></div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>본문 내용 {body ? <span style={{ marginLeft:8, fontSize:10, fontWeight:400, color:C.teal }}>({body.length}자)</span> : <span style={{ marginLeft:8, fontSize:10, fontWeight:400, color:C.orange }}>(미입력)</span>}</label>
          {aiGenerated && (
            <div style={{ padding:"10px 14px", background:"rgba(230,126,34,0.08)", border:"1px solid rgba(230,126,34,0.25)", borderRadius:8, marginBottom:8, display:"flex", alignItems:"flex-start", gap:8 }}>
              <span style={{ fontSize:14, flexShrink:0, marginTop:1 }}>⚠️</span>
              <div style={{ fontSize:11, color:"#8B5A00", lineHeight:1.7 }}>
                <strong>AI 생성 초안입니다.</strong> 판례번호·통계 수치·법조문·출처 링크가 부정확할 수 있습니다.
                <strong style={{ color:C.red }}> 반드시 사실 확인 후 발행하세요.</strong>
              </div>
            </div>
          )}
          <div style={{ background:"white", borderRadius:6, border:"2px solid rgba(10,22,40,0.1)" }}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              defaultValue={body}
              onBlur={() => {
                const quill = quillRef.current?.getEditor?.() || quillRef.current;
                if (quill?.root) setBody(quill.root.innerHTML);
              }}
              modules={quillModules}
              placeholder="콘텐츠 본문을 입력하세요. 이미지와 유튜브 영상을 바로 삽입할 수 있어요."
              style={{ minHeight: 300, fontSize: 13 }}
            />
          </div>
        </div>
        {/* ── 첨부파일 관리 ── */}
        <div style={{ marginBottom:16, padding:"16px 18px", background:"rgba(10,22,40,0.02)", border:"1px solid rgba(10,22,40,0.08)", borderRadius:10 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:10 }}>📎 첨부파일 ({attachments.length}개) <span style={{ fontSize:10, fontWeight:400, color:C.teal, marginLeft:8 }}>유튜브·이미지·PDF·문서 URL을 입력하세요</span></label>
          {attachments.length > 0 && <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
            {attachments.map(att => (
              <div key={att.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"white", borderRadius:8, border:"1px solid rgba(10,22,40,0.08)" }}>
                <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:att.type==="youtube"?"rgba(192,57,43,0.1)":att.type==="image"?"rgba(13,115,119,0.1)":"rgba(10,22,40,0.06)", color:att.type==="youtube"?C.red:att.type==="image"?C.teal:C.navy, fontWeight:700, whiteSpace:"nowrap" }}>{fileTypeLabel[att.type]||"🔗 링크"}</span>
                <div style={{ flex:1, minWidth:0, cursor:"pointer" }} onClick={() => window.open(att.url, "_blank", "noopener,noreferrer")}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.teal, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textDecoration:"underline" }}>{att.label}</div>
                  <div style={{ fontSize:10, color:C.gray, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{att.url}</div>
                </div>
                {att.type==="youtube" && getYoutubeId(att.url) && <img src={`https://img.youtube.com/vi/${getYoutubeId(att.url)}/mqdefault.jpg`} alt="" style={{ width:80, height:45, borderRadius:4, objectFit:"cover", cursor:"pointer" }} onClick={() => window.open(att.url, "_blank", "noopener,noreferrer")} />}
                {att.type==="image" && <img src={att.url} alt="" style={{ width:60, height:40, borderRadius:4, objectFit:"cover", cursor:"pointer" }} onClick={() => window.open(att.url, "_blank", "noopener,noreferrer")} onError={e=>{e.target.style.display="none";}} />}
                <button onClick={() => window.open(att.url, "_blank", "noopener,noreferrer")} style={{ padding:"4px 10px", borderRadius:6, border:"1px solid rgba(13,115,119,0.3)", background:"rgba(13,115,119,0.06)", color:C.teal, fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>열기</button>
                <button onClick={() => removeAttachment(att.id)} style={{ padding:"4px 10px", borderRadius:6, border:"1px solid rgba(192,57,43,0.2)", background:"rgba(192,57,43,0.06)", color:C.red, fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>삭제</button>
              </div>
            ))}
          </div>}
          <div style={{ display:"flex", gap:8 }}>
            <input value={newUrl} onChange={e=>setNewUrl(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") addAttachment();}} placeholder="URL 입력 (유튜브, 이미지, PDF, 문서 링크)" style={{ flex:2, padding:"9px 12px", borderRadius:6, border:"1.5px solid rgba(10,22,40,0.12)", fontSize:12, fontFamily:"inherit", outline:"none" }} />
            <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") addAttachment();}} placeholder="파일명 (선택)" style={{ flex:1, padding:"9px 12px", borderRadius:6, border:"1.5px solid rgba(10,22,40,0.12)", fontSize:12, fontFamily:"inherit", outline:"none" }} />
            <button onClick={addAttachment} style={{ padding:"9px 16px", borderRadius:6, background:C.teal, border:"none", color:"white", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>+ 추가</button>
          </div>
          <div style={{ fontSize:10, color:"rgba(10,22,40,0.35)", marginTop:6, lineHeight:1.6 }}>유튜브 → 동영상 재생 | 이미지 URL → 미리보기 | PDF·문서 → 다운로드 링크 | AI가 생성한 링크는 확인 후 사용하세요</div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={handleSave} style={btnPrimary}>💾 저장</button>
          <button onClick={onCancel} style={{ ...btnDanger, background:"transparent" }}>취소</button>
        </div>
      </div>
    );
  };

  // ── 접수 테이블 ──
  const SubmissionTable = ({ data, columns }) => (
    <div style={{ overflowX:"auto" }}>
      {data.length === 0 ? (
        <div style={{ textAlign:"center", padding:48, color:C.gray, fontSize:14 }}>📭 접수된 내역이 없습니다.</div>
      ) : (
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{columns.map(c => <th key={c.key} style={thStyle}>{c.label}</th>)}<th style={thStyle}>상태</th></tr></thead>
          <tbody>{data.map((row, i) => (
            <tr key={row.id || i} style={{ background:i%2===0 ? "transparent" : "rgba(10,22,40,0.015)" }}>
              {columns.map(c => <td key={c.key} style={{ ...tdStyle, maxWidth:c.maxW||"auto", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:c.wrap ? "normal" : "nowrap" }}>{c.render ? c.render(row) : (row[c.key]||"-")}</td>)}
              <td style={tdStyle}>
                <select value={row.status||"신규"} onChange={e => { row.status = e.target.value; _store.listeners.forEach(fn=>fn()); saveToStorage(_store.submissions); }} style={{ padding:"4px 8px", borderRadius:4, border:"1px solid rgba(10,22,40,0.15)", fontSize:11, fontFamily:"inherit", color:row.status==="완료" ? C.green : row.status==="진행중" ? C.orange : C.navy }}>
                  <option value="신규">신규</option><option value="진행중">진행중</option><option value="완료">완료</option>
                </select>
              </td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );

  return (
    <section style={{ padding:"80px 32px 40px", background:"#F5F6FA", minHeight:"100vh" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        {/* 헤더 */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:"3px", color:C.teal, fontWeight:700, textTransform:"uppercase" }}>ADMIN PANEL</div>
            <h2 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:24, fontWeight:900, color:C.navy, marginTop:4 }}>화율인사이드 관리자</h2>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setActive("home")} style={{ padding:"8px 18px", borderRadius:6, border:`1px solid rgba(10,22,40,0.12)`, background:"white", color:C.navy, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>🏠 사이트 보기</button>
            <button onClick={() => setAuthed(false)} style={{ ...btnDanger }}>로그아웃</button>
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display:"flex", gap:4, marginBottom:24, background:"white", borderRadius:10, padding:4, boxShadow:"0 1px 6px rgba(10,22,40,0.06)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:"10px 8px", borderRadius:7, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:tab===t.id?700:400, background:tab===t.id?C.navy:"transparent", color:tab===t.id?"white":C.gray, transition:"all 0.2s" }}>
              {t.icon} {t.label}
              {t.id!=="dashboard" && t.id!=="members" && t.id!=="contents" && (() => { const cnt = t.id==="services" ? subs.lectures.length+subs.advisory.length+subs.consulting.length : t.id==="newsletter" ? (subs.newsletters||[]).length : t.id==="resultEmails" ? subs.resultEmails.filter(r=>r.source!=="newsletter").length : subs[t.id]?.length||0; return cnt > 0 ? <span style={{ marginLeft:4, padding:"1px 6px", borderRadius:100, background:tab===t.id?"rgba(255,255,255,0.2)":C.red, color:"white", fontSize:9, fontWeight:700 }}>{cnt}</span> : null; })()}
            </button>
          ))}
        </div>

        {/* 대시보드 */}
        {tab === "dashboard" && (() => {
          const allSubs = subs;
          const services = [...allSubs.lectures, ...allSubs.advisory, ...allSubs.consulting];
          const resultOnly = allSubs.resultEmails.filter(r=>r.source!=="newsletter");
          const total = allSubs.reports.length + allSubs.biz.length + allSubs.relief.length + resultOnly.length + allSubs.reviewRequests.length + services.length;
          const allItems = [...allSubs.reports,...allSubs.biz,...allSubs.relief,...resultOnly,...allSubs.reviewRequests,...services];
          const thisMonth = new Date().toISOString().slice(0,7);
          const thisMonthCount = allItems.filter(r=>r.submittedAt?.startsWith(thisMonth)).length;
          const prevMonth = (() => { const d=new Date(); d.setMonth(d.getMonth()-1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; })();
          const prevMonthCount = allItems.filter(r=>r.submittedAt?.startsWith(prevMonth)).length;
          const growth = prevMonthCount ? Math.round((thisMonthCount-prevMonthCount)/prevMonthCount*100) : null;
          const pending = allItems.filter(r=>r.status==="신규"||r.status==="대기").length;

          return (
          <div>
            {/* ── 데이터 내보내기 / 가져오기 ── */}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:12, flexWrap:"wrap" }}>
              <button onClick={() => {
                const a = document.createElement("a");
                a.href = "https://hwayul-backend-production-96cf.up.railway.app/api/export-excel";
                a.download = "hwayul_data.xlsx";
                a.click();
              }} style={{ padding:"10px 20px", borderRadius:8, background:"linear-gradient(135deg,#0D7377,#4ECDC4)", border:"none", color:"white", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8 }}>
                📥 전체 데이터 엑셀 다운로드
              </button>
              <button onClick={() => {
                const a = document.createElement("a");
                a.href = "https://hwayul-backend-production-96cf.up.railway.app/api/export-contents-excel";
                a.download = "hwayul_contents.xlsx";
                a.click();
              }} style={{ padding:"10px 20px", borderRadius:8, background:"linear-gradient(135deg,#C9A84C,#E5C56A)", border:"none", color:"#0A1628", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8 }}>
                📄 콘텐츠 엑셀 다운로드
              </button>
              <label style={{ padding:"10px 20px", borderRadius:8, background:"rgba(201,168,76,0.12)", border:"1.5px solid rgba(201,168,76,0.4)", color:"#8B7A40", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8 }}>
                📤 콘텐츠 엑셀 업로드
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display:"none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!confirm("엑셀 내용으로 콘텐츠를 일괄 업데이트합니다.\nID가 있는 행은 수정, 없는 행은 신규 추가됩니다.\n계속하시겠습니까?")) { e.target.value = ""; return; }
                    try {
                      const buf = await file.arrayBuffer();
                      const res = await fetch("https://hwayul-backend-production-96cf.up.railway.app/api/import-contents-excel", {
                        method: "POST",
                        headers: { "Content-Type": "application/octet-stream" },
                        body: buf,
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert(`업로드 완료!\n수정: ${data.updated}건\n신규 추가: ${data.inserted}건\n오류: ${data.errors}건${data.errorDetails?.length ? "\n\n" + data.errorDetails.map(er => `· ${er.row}: ${er.error}`).join("\n") : ""}`);
                        loadContentsFromDB();
                      } else {
                        alert("업로드 실패: " + (data.error || "알 수 없는 오류"));
                      }
                    } catch (err) {
                      alert("업로드 실패: " + err.message);
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            {/* ── 핵심 KPI ── */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
              {[
                { icon:"📊", label:"총 누적 접수", value:total+"건", color:C.navy, sub:"전체 채널 합산" },
                { icon:"📅", label:"이번 달 신규", value:thisMonthCount+"건", color:C.teal, sub: growth!==null ? `전월 대비 ${growth>=0?"+":""}${growth}%` : "비교 데이터 없음" },
                { icon:"🔴", label:"처리 대기", value:pending+"건", color:C.red, sub:"신규·대기 상태" },
                { icon:"📬", label:"뉴스레터 구독자", value:(allSubs.newsletters||[]).length+"명", color:C.gold, sub:`발송 이력 ${(allSubs.sentNewsletters||[]).length}건` },
              ].map(s=>(
                <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} sub={s.sub} color={s.color} />
              ))}
            </div>

            {/* ── 채널별 현황 (클릭 → 해당 탭) ── */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
              {[
                { icon:"📩", label:"익명 제보", count:allSubs.reports.length, color:C.teal, newCount:allSubs.reports.filter(r=>r.status==="신규").length, tab:"reports" },
                { icon:"🏢", label:"심층상담", count:allSubs.biz.length, color:C.gold, newCount:allSubs.biz.filter(r=>r.status==="신규").length, tab:"biz" },
                { icon:"🛡️", label:"해결 의뢰", count:allSubs.relief.length, color:C.red, newCount:allSubs.relief.filter(r=>r.status==="신규").length, tab:"relief" },
                { icon:"📧", label:"결과지 발송", count:resultOnly.length, color:C.blue, newCount:resultOnly.filter(r=>r.status==="신규").length, tab:"resultEmails" },
                { icon:"📋", label:"노무사 검토", count:allSubs.reviewRequests.length, color:C.purple, newCount:allSubs.reviewRequests.filter(r=>r.status==="신규").length, tab:"reviewRequests" },
                { icon:"📞", label:"강의 등 요청", count:services.length, color:"#D35400", newCount:services.filter(r=>r.status==="신규").length, tab:"services" },
              ].map(s=>(
                <div key={s.label} onClick={()=>setTab(s.tab)} style={{ ...cardStyle, position:"relative", cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(10,22,40,0.1)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}
                >
                  {s.newCount>0 && <div style={{ position:"absolute", top:10, right:10, padding:"1px 7px", borderRadius:100, background:C.red, color:"white", fontSize:9, fontWeight:700 }}>NEW {s.newCount}</div>}
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:`${s.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize:22, fontWeight:900, color:s.color, lineHeight:1 }}>{s.count}</div>
                      <div style={{ fontSize:11, color:"#8B8680", marginTop:2 }}>{s.label}</div>
                    </div>
                  </div>
                  {/* 미니 월별 바 */}
                  <div style={{ marginTop:12 }}>
                    <MiniTrend data={getMonthly({reports:allSubs.reports,biz:allSubs.biz,relief:allSubs.relief,resultEmails:resultOnly,reviewRequests:allSubs.reviewRequests,services}[s.tab]||services, 4)} color={s.color} />
                  </div>
                </div>
              ))}
            </div>

            {/* ── 전체 월별 추이 ── */}
            <StatSection title="📈 전체 접수 월별 추이 (6개월)">
              <MiniTrend data={getMonthly(allItems, 6)} color={C.teal} />
            </StatSection>

            {/* ── 채널 비중 ── */}
            <StatSection title="📊 채널별 비중">
              <BarChart total={total} items={[
                { label:"📩 익명 제보", count:allSubs.reports.length, color:C.teal },
                { label:"💼 심층상담", count:allSubs.biz.length, color:C.gold },
                { label:"⚖️ 해결 의뢰", count:allSubs.relief.length, color:C.red },
                { label:"📧 결과지 발송", count:resultOnly.length, color:C.blue },
                { label:"📋 리포트 검토", count:allSubs.reviewRequests.length, color:C.purple },
                { label:"📞 강의 등 요청", count:services.length, color:"#D35400" },
              ]} />
            </StatSection>

            {/* ── 전문가·콘텐츠 ── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={cardStyle}>
                <h4 style={{ fontSize:13, fontWeight:800, color:C.navy, marginBottom:10 }}>👥 등록 전문가</h4>
                <div style={{ fontSize:26, fontWeight:900, color:C.teal, marginBottom:6 }}>{membersState.length}명</div>
                <button onClick={()=>setTab("members")} style={{ fontSize:11, color:C.teal, fontWeight:700, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>관리하기 →</button>
              </div>
              <div style={cardStyle}>
                <h4 style={{ fontSize:13, fontWeight:800, color:C.navy, marginBottom:10 }}>📰 등록 콘텐츠</h4>
                <div style={{ fontSize:26, fontWeight:900, color:C.gold, marginBottom:6 }}>{contentsState.length}건</div>
                <button onClick={()=>setTab("contents")} style={{ fontSize:11, color:C.gold, fontWeight:700, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>관리하기 →</button>
              </div>
            </div>
          </div>
          );
        })()}

        {/* 전문가 관리 */}
        {tab === "members" && (
          <div>
            {editMember !== null ? (
              <MemberForm member={editMember === "new" ? null : editMember} onSave={m => { if(editMember==="new") setMembersState(v=>[...v,m]); else setMembersState(v=>v.map(x=>x.name===editMember.name?m:x)); setEditMember(null); }} onCancel={() => setEditMember(null)} />
            ) : (
              <div style={{ marginBottom:16, display:"flex", justifyContent:"flex-end" }}><button onClick={() => setEditMember("new")} style={btnPrimary}>+ 전문가 추가</button></div>
            )}
            <div style={cardStyle}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["아이콘","성명","직함","경력","전문분야",""].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>{membersState.map((m,i) => (
                  <tr key={m.name+i}>
                    <td style={tdStyle}>{m.icon}</td>
                    <td style={{ ...tdStyle, fontWeight:700 }}>{m.name}</td>
                    <td style={tdStyle}>{m.title}</td>
                    <td style={tdStyle}>{m.exp}</td>
                    <td style={tdStyle}>{m.spec}</td>
                    <td style={{ ...tdStyle, textAlign:"right" }}>
                      <button onClick={() => setEditMember(m)} style={{ ...btnPrimary, padding:"5px 12px", marginRight:6 }}>수정</button>
                      <button onClick={() => { if(window.confirm(`${m.name} 전문가를 삭제하시겠습니까?`)) setMembersState(v=>v.filter(x=>x.name!==m.name)); }} style={{ ...btnDanger, padding:"5px 12px" }}>삭제</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* 콘텐츠 관리 */}
        {tab === "contents" && (
          <div>
            {editContent !== null ? (
              <ContentForm item={editContent === "new" ? null : editContent} onSave={c => { if(editContent==="new") { setContentsState(v=>[c,...v]); } else { setContentsState(v=>v.map(x=>x.id===editContent.id?c:x)); } setEditContent(null); }} onCancel={() => setEditContent(null)} />
            ) : (
              <div style={{ marginBottom:14, display:"flex", justifyContent:"flex-end" }}><button onClick={() => setEditContent("new")} style={btnPrimary}>+ 콘텐츠 추가</button></div>
            )}

            {/* ── 통계 ── */}
            {contentsState.length > 0 && (() => {
              const typeGroups = [
                { label:"📰 뉴스", count:contentsState.filter(c=>c.type==="news").length, color:C.teal },
                { label:"▶ 영상", count:contentsState.filter(c=>c.type==="video").length, color:C.red },
                { label:"📎 자료", count:contentsState.filter(c=>c.type==="resource").length, color:C.gold },
              ].filter(t=>t.count>0);
              const totalViews = contentsState.reduce((s,c)=>s+(c.views||0),0);
              const topByViews = [...contentsState].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,3);
              const tagGroups = (() => {
                const map = {};
                contentsState.forEach(c => { if(c.tag) map[c.tag]=(map[c.tag]||0)+1; });
                return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([label,count])=>({ label, count, color:C.teal }));
              })();
              return (
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:12 }}>
                  <StatCard icon="📰" label="총 콘텐츠" value={contentsState.length+"건"} color={C.navy} />
                  <StatCard icon="✅" label="공개 중" value={contentsState.filter(c=>!c.hidden).length+"건"} color={C.green} />
                  <StatCard icon="🙈" label="숨김" value={contentsState.filter(c=>c.hidden).length+"건"} color={C.orange} />
                  <StatCard icon="👁" label="총 조회수" value={totalViews.toLocaleString()} color={C.teal} />
                  <StatCard icon="🏷" label="태그 종류" value={tagGroups.length+"종"} color={C.gold} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                  <StatSection title="📊 콘텐츠 유형 분포">
                    <BarChart items={typeGroups} total={contentsState.length} />
                  </StatSection>
                  <StatSection title="🏆 조회수 TOP 3">
                    {topByViews.map((c,i)=>(
                      <div key={c.id||i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                        <span style={{ fontSize:13, fontWeight:900, color:["#C9A84C","#8B8680","#A0522D"][i], minWidth:18 }}>{i+1}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:C.navy, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</div>
                          <div style={{ fontSize:10, color:"#8B8680" }}>{(c.views||0).toLocaleString()} 조회</div>
                        </div>
                      </div>
                    ))}
                  </StatSection>
                </div>
                {tagGroups.length > 0 && (
                  <StatSection title="🏷 태그별 콘텐츠 수 (TOP 5)">
                    <BarChart items={tagGroups} total={contentsState.length} />
                  </StatSection>
                )}
              </div>
              );
            })()}

            <div style={cardStyle}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>{["유형","태그","제목","날짜","조회","상태",""].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>{contentsState.map((c,i) => {
                  const typeL = {news:"📰 뉴스",video:"▶ 영상",resource:"📎 자료",column:"✏️ 칼럼"};
                  const isHidden = !!c.hidden;
                  return [
                    <tr key={c.id||i} style={{ background:isHidden ? "rgba(192,57,43,0.04)" : (i%2===0?"transparent":"rgba(10,22,40,0.015)"), opacity:isHidden?0.6:1 }}>
                      <td style={tdStyle}>{typeL[c.type]||c.type}</td>
                      <td style={tdStyle}>{c.tag}</td>
                      <td style={{ ...tdStyle, maxWidth:300, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{isHidden && <span style={{ fontSize:9, color:C.red, fontWeight:700, marginRight:4 }}>숨김</span>}{c.title}</td>
                      <td style={tdStyle}>{c.date}</td>
                      <td style={tdStyle}>{c.views?.toLocaleString()}</td>
                      <td style={tdStyle}>
                        <span style={{ padding:"2px 8px", borderRadius:100, fontSize:10, fontWeight:700, background:isHidden?"rgba(192,57,43,0.1)":"rgba(26,122,74,0.1)", color:isHidden?C.red:C.green, border:`1px solid ${isHidden?"rgba(192,57,43,0.2)":"rgba(26,122,74,0.2)"}` }}>
                          {isHidden?"숨김":"공개"}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign:"right", whiteSpace:"nowrap" }}>
                        <button onClick={() => setContentPreview(contentPreview?.id===c.id ? null : c)} style={{ padding:"5px 12px", borderRadius:6, border:"1px solid rgba(13,115,119,0.3)", background:contentPreview?.id===c.id?"rgba(13,115,119,0.12)":"rgba(13,115,119,0.05)", color:C.teal, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit", marginRight:6 }}>{contentPreview?.id===c.id?"접기":"상세"}</button>
                        <button onClick={() => { setEditContent(c); setTimeout(() => window.scrollTo({top:0, behavior:"smooth"}), 300); }} style={{ ...btnPrimary, padding:"5px 12px", marginRight:6 }}>수정</button>
                        <button onClick={() => {
                          const updated = { ...c, hidden: !c.hidden };
                          setContentsState(v => v.map(x => x.id === c.id ? updated : x));
                        }} style={{ padding:"5px 12px", borderRadius:6, border:`1px solid ${isHidden?"rgba(26,122,74,0.3)":"rgba(230,126,34,0.3)"}`, background:isHidden?"rgba(26,122,74,0.08)":"rgba(230,126,34,0.08)", color:isHidden?C.green:C.orange, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit", marginRight:6 }}>{isHidden?"보이기":"숨기기"}</button>
                        <button onClick={() => { if(window.confirm("이 콘텐츠를 삭제하시겠습니까?")) { setContentsState(v=>v.filter(x=>x.id!==c.id)); if(contentPreview?.id===c.id) setContentPreview(null); } }} style={{ ...btnDanger, padding:"5px 12px" }}>삭제</button>
                      </td>
                    </tr>,
                    contentPreview?.id===c.id && (
                      <tr key={`preview-${c.id}`}>
                        <td colSpan={7} style={{ padding:0, border:"none" }}>
                          <div style={{ margin:"0 12px 12px", padding:"18px 22px", background:"linear-gradient(135deg, rgba(13,115,119,0.04), rgba(201,168,76,0.04))", border:"1px solid rgba(13,115,119,0.15)", borderRadius:10 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                              <div style={{ flex:1 }}>
                                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                                  <span style={{ padding:"3px 10px", borderRadius:100, fontSize:10, fontWeight:700, background:isHidden?"rgba(192,57,43,0.1)":"rgba(26,122,74,0.1)", color:isHidden?C.red:C.green }}>{isHidden?"숨김":"공개"}</span>
                                  <span style={{ fontSize:10, color:C.gray }}>{typeL[c.type]||c.type} · {c.tag} · {c.date} · 조회 {(c.views||0).toLocaleString()}</span>
                                </div>
                                <h4 style={{ fontSize:15, fontWeight:800, color:C.navy, marginBottom:10, lineHeight:1.5 }}>{c.title}</h4>
                                <div style={{ padding:"10px 14px", background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.15)", borderRadius:8, marginBottom:12 }}>
                                  <div style={{ fontSize:10, fontWeight:700, color:C.gold, marginBottom:4 }}>요약</div>
                                  <div style={{ fontSize:12, color:"#5A5550", lineHeight:1.7 }}>{c.summary || "(요약 없음)"}</div>
                                </div>
                                {(contentDetails[c.id] || c.body) ? (
                                  <div style={{ padding:"14px 16px", background:"white", border:"1px solid rgba(10,22,40,0.08)", borderRadius:8 }}>
                                    <div style={{ fontSize:10, fontWeight:700, color:C.teal, marginBottom:6 }}>본문 내용</div>
                                    {(() => {
                                      const txt = contentDetails[c.id]?.content || c.body || "";
                                      if (txt.includes("<") && txt.includes(">")) {
                                        return <div style={{ fontSize:12.5, color:"#3A3530", lineHeight:1.9 }} dangerouslySetInnerHTML={{ __html: txt }} />;
                                      }
                                      return <div style={{ fontSize:12.5, color:"#3A3530", lineHeight:1.9, whiteSpace:"pre-wrap" }}>{txt}</div>;
                                    })()}
                                    {contentDetails[c.id]?.related?.length > 0 && (
                                      <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid rgba(10,22,40,0.06)" }}>
                                        <div style={{ fontSize:10, fontWeight:700, color:C.gray, marginBottom:4 }}>관련 콘텐츠 ID</div>
                                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                          {contentDetails[c.id].related.map(rid => {
                                            const rel = _contents.find(n => n.id === rid);
                                            return rel ? <span key={rid} style={{ padding:"2px 8px", borderRadius:100, fontSize:10, background:"rgba(10,22,40,0.05)", color:C.navy }}>{rel.title?.slice(0,25)}…</span> : null;
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div style={{ padding:"14px 16px", background:"rgba(10,22,40,0.02)", border:"1px dashed rgba(10,22,40,0.12)", borderRadius:8, textAlign:"center" }}>
                                    <div style={{ fontSize:12, color:C.gray }}>📝 본문 내용이 아직 등록되지 않았습니다.</div>
                                    <div style={{ fontSize:11, color:"rgba(10,22,40,0.3)", marginTop:4 }}>수정 버튼을 눌러 요약을 편집하거나, 상세 본문을 추가해 주세요.</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ display:"flex", gap:8, paddingTop:12, borderTop:"1px solid rgba(10,22,40,0.06)" }}>
                              <button onClick={() => setEditContent(c)} style={{ ...btnPrimary, padding:"7px 16px", fontSize:11 }}>✏️ 수정</button>
                              <button onClick={() => {
                                const updated = { ...c, hidden: !c.hidden };
                                setContentsState(v => v.map(x => x.id === c.id ? updated : x));
                                setContentPreview(updated);
                              }} style={{ padding:"7px 16px", borderRadius:6, border:`1px solid ${isHidden?"rgba(26,122,74,0.3)":"rgba(230,126,34,0.3)"}`, background:isHidden?"rgba(26,122,74,0.08)":"rgba(230,126,34,0.08)", color:isHidden?C.green:C.orange, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>{isHidden?"👁 공개로 전환":"🙈 숨기기"}</button>
                              <button onClick={() => setContentPreview(null)} style={{ padding:"7px 16px", borderRadius:6, border:"1px solid rgba(10,22,40,0.1)", background:"rgba(10,22,40,0.03)", color:C.gray, fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit", marginLeft:"auto" }}>접기 ↑</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  ];
                })}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 결과지 뷰어 오버레이 ── */}
        {viewResultHtml && (
          <div style={{ position:"fixed", inset:0, zIndex:10000, background:"rgba(10,22,40,0.9)", backdropFilter:"blur(8px)", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 24px", background:C.navy, borderBottom:"1px solid rgba(201,168,76,0.2)" }}>
              <span style={{ fontSize:14, fontWeight:700, color:C.cream }}>📄 진단 결과지 미리보기</span>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => {
                  if (resultIframeRef.current) {
                    try {
                      resultIframeRef.current.contentWindow.focus();
                      resultIframeRef.current.contentWindow.print();
                    } catch(e) { window.print(); }
                  }
                }} style={{ padding:"6px 16px", borderRadius:6, background:C.gold, border:"none", color:C.navy, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>🖨️ 인쇄 / PDF 저장</button>
                <button onClick={() => setViewResultHtml(null)} style={{ padding:"6px 16px", borderRadius:6, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", color:C.cream, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>✕ 닫기</button>
              </div>
            </div>
            <div style={{ flex:1, display:"flex", justifyContent:"center", padding:20, overflow:"auto" }}>
              <div style={{ width:"100%", maxWidth:860, background:"white", borderRadius:12, overflow:"hidden", boxShadow:"0 8px 40px rgba(0,0,0,0.3)" }}>
                <iframe ref={resultIframeRef} style={{ width:"100%", height:"100%", border:"none", minHeight:"80vh" }} title="결과지" />
              </div>
            </div>
          </div>
        )}

        {/* ── 이메일 작성 오버레이 ── */}
        {emailCompose && (
          <AdminEmailComposer data={{...emailCompose, onEmailSaved: () => { if(emailCompose.data?.id) fetchEmailHistory(emailCompose.data.id); }}} onClose={() => setEmailCompose(null)} onViewResult={html => setViewResultHtml(html)} />
        )}

        {/* ── 리포트 작성기 오버레이 ── */}
        {reportWrite && (
          <ReportWriter request={reportWrite} onClose={() => setReportWrite(null)} />
        )}

        {/* ── 발송 이메일 이력 오버레이 ── */}
        {emailHistory && (
          <div style={{ position:"fixed", inset:0, zIndex:9998, background:"rgba(10,22,40,0.7)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:32 }} onClick={() => setEmailHistory(null)}>
            <div onClick={e => e.stopPropagation()} style={{ background:"white", borderRadius:16, padding:32, maxWidth:720, width:"100%", maxHeight:"85vh", overflow:"auto", boxShadow:"0 24px 80px rgba(10,22,40,0.25)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <h3 style={{ fontSize:17, fontWeight:800, color:C.navy }}>📬 발송 이메일 이력 ({emailHistory.emails.length}건)</h3>
                <button onClick={() => setEmailHistory(null)} style={{ background:"none", border:"none", fontSize:20, color:C.gray, cursor:"pointer" }}>✕</button>
              </div>
              {emailHistory.emails.length === 0
                ? <div style={{ textAlign:"center", padding:48, color:C.gray }}>📭 발송된 이메일이 없습니다.</div>
                : emailHistory.emails.map((em, idx) => (
                  <div key={em.id||idx} style={{ marginBottom:16, border:"1px solid rgba(10,22,40,0.08)", borderRadius:12, overflow:"hidden" }}>
                    <div style={{ padding:"14px 18px", background:"rgba(13,115,119,0.04)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:"rgba(13,115,119,0.12)", color:C.teal, fontWeight:700, marginRight:8 }}>{em.email_type_label||em.submission_type||"이메일"}</span>
                        <span style={{ fontSize:11, color:C.gray }}>수신: {em.recipient_name} ({em.recipient_email})</span>
                      </div>
                      <span style={{ fontSize:11, color:C.gray }}>{new Date(em.sent_at).toLocaleString("ko-KR")}</span>
                    </div>
                    <div style={{ padding:"16px 18px" }}>
                      {em.greeting && <div style={{ fontSize:13, color:"#5A4A30", lineHeight:1.75, marginBottom:12, paddingBottom:12, borderBottom:"1px solid rgba(10,22,40,0.06)", whiteSpace:"pre-wrap" }}>{em.greeting}</div>}
                      <div style={{ fontSize:13, color:C.navy, lineHeight:1.85, whiteSpace:"pre-wrap", marginBottom:em.closing?12:0 }}>{em.body}</div>
                      {em.closing && <div style={{ fontSize:12, color:C.gray, lineHeight:1.75, paddingTop:12, borderTop:"1px solid rgba(10,22,40,0.06)", whiteSpace:"pre-wrap" }}>{em.closing}</div>}
                      {em.report_html && <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(10,22,40,0.06)" }}>
                        <button onClick={() => setViewResultHtml(em.report_html)} style={{ padding:"6px 14px", borderRadius:6, background:C.gold, border:"none", color:C.navy, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>📋 검토 리포트 보기</button>
                      </div>}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ── 상세보기 오버레이 ── */}
        {viewDetail && (
          <div style={{ position:"fixed", inset:0, zIndex:9998, background:"rgba(10,22,40,0.7)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:32 }} onClick={() => setViewDetail(null)}>
            <div onClick={e => e.stopPropagation()} style={{ background:"white", borderRadius:16, padding:32, maxWidth:640, width:"100%", maxHeight:"80vh", overflow:"auto", boxShadow:"0 24px 80px rgba(10,22,40,0.25)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <h3 style={{ fontSize:16, fontWeight:800, color:C.navy }}>📋 상세 내용</h3>
                <button onClick={() => setViewDetail(null)} style={{ background:"none", border:"none", fontSize:18, color:C.gray, cursor:"pointer" }}>✕</button>
              </div>
              {Object.entries(viewDetail).filter(([k]) => !["id","submittedAt","status","resultHtml","resultData"].includes(k)).map(([k,v]) => v ? (
                <div key={k} style={{ marginBottom:12, paddingBottom:12, borderBottom:"1px solid rgba(10,22,40,0.06)" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.gray, textTransform:"uppercase", marginBottom:3 }}>{k}</div>
                  <div style={{ fontSize:13, color:C.navy, whiteSpace:"pre-wrap", lineHeight:1.7 }}>{typeof v === "boolean" ? (v ? "✅ 예" : "아니오") : String(v)}</div>
                </div>
              ) : null)}
              {viewDetail.resultHtml && (
                <button onClick={() => { setViewDetail(null); setViewResultHtml(viewDetail.resultHtml); }} style={{ ...btnPrimary, marginTop:8 }}>📄 진단결과지 보기</button>
              )}
            </div>
          </div>
        )}

        {/* ── 접수 내역 탭들 ── */}
        {tab === "reports" && (() => {
          const d = subs.reports;
          const statusCounts = [
            { label:"신규", count:d.filter(r=>r.status==="신규").length, color:C.red },
            { label:"진행중", count:d.filter(r=>r.status==="진행중").length, color:C.orange },
            { label:"완료", count:d.filter(r=>r.status==="완료").length, color:C.green },
          ];
          const typeGroups = [...new Set(d.map(r=>r.type).filter(Boolean))].map(t=>({ label:t, count:d.filter(r=>r.type===t).length, color:C.teal }));
          return (
          <div>
            {/* ── 통계 ── */}
            {d.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:12 }}>
                  <StatCard icon="📩" label="총 접수" value={d.length+"건"} color={C.teal} />
                  <StatCard icon="🔴" label="신규 대기" value={statusCounts[0].count+"건"} color={C.red} />
                  <StatCard icon="🟡" label="진행중" value={statusCounts[1].count+"건"} color={C.orange} />
                  <StatCard icon="✅" label="처리 완료" value={statusCounts[2].count+"건"} color={C.green} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                  <StatSection title="📊 처리 상태 현황">
                    <StatusPie items={statusCounts} total={d.length} />
                  </StatSection>
                  <StatSection title="📈 월별 접수 추이 (6개월)">
                    <MiniTrend data={getMonthly(d,6)} color={C.teal} />
                  </StatSection>
                </div>
                {typeGroups.length > 0 && (
                  <StatSection title="📂 제보 유형 분포">
                    <BarChart items={typeGroups} total={d.length} color={C.teal} />
                  </StatSection>
                )}
              </div>
            )}
            <div style={cardStyle}>
              <h3 style={{ fontSize:15, fontWeight:800, color:C.navy, marginBottom:14 }}>📩 익명 제보 접수 내역 ({d.length}건)</h3>
              {d.length === 0 ? <div style={{ textAlign:"center", padding:48, color:C.gray }}>📭 접수된 내역이 없습니다.</div> : (
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr>{["접수일시","유형","소속","내용(요약)","이메일","상태",""].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>{d.map((r,i)=>(
                    <tr key={r.id} style={{ background:i%2===0?"transparent":"rgba(10,22,40,0.015)" }}>
                      <td style={tdStyle}>{new Date(r.submittedAt).toLocaleString("ko-KR")}</td>
                      <td style={tdStyle}>{r.type||"-"}</td>
                      <td style={tdStyle}>{r.org||"-"}</td>
                      <td style={{ ...tdStyle, maxWidth:250, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.content?.slice(0,50)||"-"}</td>
                      <td style={{ ...tdStyle, fontSize:11 }}>{r.email ? <span style={{ color:C.teal }}>📧 {r.email}</span> : <span style={{ color:C.gray }}>익명</span>}</td>
                      <td style={tdStyle}><select value={r.status||"신규"} onChange={e=>{r.status=e.target.value;updateSubmissionStatus(r.id,e.target.value);_store.listeners.forEach(fn=>fn());saveToStorage(_store.submissions);}} style={{ padding:"4px 8px", borderRadius:4, border:"1px solid rgba(10,22,40,0.15)", fontSize:11, fontFamily:"inherit" }}><option>신규</option><option>진행중</option><option>완료</option></select></td>
                      <td style={{ ...tdStyle, textAlign:"right" }}>
                        <button onClick={()=>setViewDetail(r)} style={{ ...btnPrimary, padding:"5px 12px", marginRight:6 }}>상세보기</button>
                        <button onClick={()=>r.email && setEmailCompose({ to:r.email||"", name:"제보자", type:"report", data:r, greeting:`안녕하세요, 화율인사이드입니다.\n\n접수하신 제보 건에 대한 검토 결과를 안내드립니다.`, body:"" })} disabled={!r.email} title={r.email ? "이메일 회신" : "이메일 미등록 (회신 불가)"} style={{ padding:"5px 12px", borderRadius:6, background:r.email ? C.gold : "rgba(10,22,40,0.08)", border:"none", color:r.email ? C.navy : C.gray, fontWeight:700, fontSize:11, cursor:r.email ? "pointer" : "not-allowed", fontFamily:"inherit" }}>📧 이메일</button>
                        <button onClick={()=>fetchEmailHistory(r.id)} style={{ padding:"5px 10px", borderRadius:6, background:"rgba(13,115,119,0.08)", border:"1px solid rgba(13,115,119,0.2)", color:C.teal, fontWeight:700, fontSize:10, cursor:"pointer", fontFamily:"inherit", marginLeft:4 }}>📬 이력</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          </div>
          );
        })()}

        {tab === "biz" && (() => {
          const d = subs.biz;
          const statusCounts = [
            { label:"신규", count:d.filter(r=>r.status==="신규").length, color:C.red },
            { label:"진행중", count:d.filter(r=>r.status==="진행중").length, color:C.orange },
            { label:"완료", count:d.filter(r=>r.status==="완료").length, color:C.green },
          ];
          const consultTypes = [...new Set(d.map(r=>r.consultType).filter(Boolean))].map(t=>({ label:t, count:d.filter(r=>r.consultType===t).length, color:C.gold }));
          const avgResponseDays = (() => {
            const done = d.filter(r=>r.status==="완료");
            if (!done.length) return null;
            return Math.round(done.reduce((s,r)=>{
              const diff = (Date.now()-new Date(r.submittedAt))/(1000*60*60*24);
              return s+diff;
            },0)/done.length);
          })();
          return (
          <div>
            {d.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:12 }}>
                  <StatCard icon="🏢" label="총 접수" value={d.length+"건"} color={C.gold} />
                  <StatCard icon="🔴" label="신규 대기" value={statusCounts[0].count+"건"} color={C.red} />
                  <StatCard icon="🟡" label="진행중" value={statusCounts[1].count+"건"} color={C.orange} />
                  <StatCard icon="✅" label="처리 완료" value={statusCounts[2].count+"건"} color={C.green} sub={avgResponseDays!=null?`평균 ${avgResponseDays}일 소요`:undefined} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                  <StatSection title="📊 처리 상태 현황">
                    <StatusPie items={statusCounts} total={d.length} />
                  </StatSection>
                  <StatSection title="📈 월별 접수 추이 (6개월)">
                    <MiniTrend data={getMonthly(d,6)} color={C.gold} />
                  </StatSection>
                </div>
                {consultTypes.length > 0 && (
                  <StatSection title="📂 상담 유형 분포">
                    <BarChart items={consultTypes} total={d.length} color={C.gold} />
                  </StatSection>
                )}
              </div>
            )}
            <div style={cardStyle}>
              <h3 style={{ fontSize:15, fontWeight:800, color:C.navy, marginBottom:14 }}>💼 심층상담 접수 내역 ({d.length}건)</h3>
              {d.length === 0 ? <div style={{ textAlign:"center", padding:48, color:C.gray }}>📭 접수된 내역이 없습니다.</div> : (
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr>{["접수일시","담당자","기업명","연락처","이메일","진단결과","상태",""].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>{d.map((r,i)=>(
                    <tr key={r.id} style={{ background:i%2===0?"transparent":"rgba(10,22,40,0.015)" }}>
                      <td style={tdStyle}>{new Date(r.submittedAt).toLocaleString("ko-KR")}</td>
                      <td style={{ ...tdStyle, fontWeight:700 }}>{r.name||"-"}</td>
                      <td style={tdStyle}>{r.company||"-"}</td>
                      <td style={tdStyle}>{r.phone||"-"}</td>
                      <td style={tdStyle}>{r.email||"-"}</td>
                      <td style={tdStyle}>{r.diagResult ? <button onClick={()=>{const w=window.open("","_blank","width=900,height=700");if(w){const isHtml=r.diagResult.trim().startsWith("<");w.document.write(isHtml?r.diagResult:`<html><body style="font-family:sans-serif;padding:24px;"><h3>진단 결과 데이터</h3><pre style="white-space:pre-wrap;line-height:1.8;">${typeof r.diagResult==="string"?r.diagResult:JSON.stringify(JSON.parse(r.diagResult),null,2)}</pre></body></html>`);w.document.close();}}} style={{ padding:"4px 10px", borderRadius:4, background:"rgba(13,115,119,0.1)", border:"1px solid rgba(13,115,119,0.25)", color:C.teal, fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>📄 결과보기</button> : <span style={{ fontSize:10, color:C.gray }}>없음</span>}</td>
                      <td style={tdStyle}><select value={r.status||"신규"} onChange={e=>{r.status=e.target.value;updateSubmissionStatus(r.id,e.target.value);_store.listeners.forEach(fn=>fn());saveToStorage(_store.submissions);}} style={{ padding:"4px 8px", borderRadius:4, border:"1px solid rgba(10,22,40,0.15)", fontSize:11, fontFamily:"inherit" }}><option>신규</option><option>진행중</option><option>완료</option></select></td>
                      <td style={{ ...tdStyle, textAlign:"right" }}>
                        <button onClick={()=>setViewDetail(r)} style={{ ...btnPrimary, padding:"5px 12px", marginRight:6 }}>상세보기</button>
                        <button onClick={()=>setEmailCompose({ to:r.email||"", name:r.name||"", type:"biz", data:r, greeting:`${r.name||""} 님${r.company?` (${r.company})`:""} 안녕하세요,\n화율인사이드입니다.\n\n요청하신 심층 상담 건에 대해 안내드립니다.`, body:"" })} style={{ padding:"5px 12px", borderRadius:6, background:C.gold, border:"none", color:C.navy, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>📧 이메일</button>
                        <button onClick={()=>fetchEmailHistory(r.id)} style={{ padding:"5px 10px", borderRadius:6, background:"rgba(13,115,119,0.08)", border:"1px solid rgba(13,115,119,0.2)", color:C.teal, fontWeight:700, fontSize:10, cursor:"pointer", fontFamily:"inherit", marginLeft:4 }}>📬 이력</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          </div>
          );
        })()}

        {tab === "relief" && (() => {
          const d = subs.relief;
          const statusCounts = [
            { label:"신규", count:d.filter(r=>r.status==="신규").length, color:C.red },
            { label:"진행중", count:d.filter(r=>r.status==="진행중").length, color:C.orange },
            { label:"완료", count:d.filter(r=>r.status==="완료").length, color:C.green },
          ];
          const trackCounts = [
            { label:"🛡️ 피해자 구제", count:d.filter(r=>r.trackId==="victim"||(!r.trackId&&!r.trackTitle)).length, color:C.teal },
            { label:"🩺 산재 신청", count:d.filter(r=>r.trackId==="sanjae").length, color:C.gold },
            { label:"⚖️ 피지목인 항변", count:d.filter(r=>r.trackId==="accused").length, color:"#A67C2E" },
            { label:"🏛️ 회사 조사처리", count:d.filter(r=>r.trackId==="company").length, color:"#3D5A80" },
          ];
          return (
          <div>
            {d.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:12 }}>
                  <StatCard icon="⚖️" label="총 접수" value={d.length+"건"} color={C.red} />
                  <StatCard icon="🛡️" label="피해자 구제" value={trackCounts[0].count+"건"} color={C.teal} />
                  <StatCard icon="⚖️" label="피지목인/산재" value={(trackCounts[1].count+trackCounts[2].count)+"건"} color={C.gold} />
                  <StatCard icon="✅" label="처리 완료" value={statusCounts[2].count+"건"} color={C.green} sub={`완료율 ${d.length?Math.round(statusCounts[2].count/d.length*100):0}%`} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                  <StatSection title="📋 트랙별 분포">
                    <BarChart items={trackCounts} total={d.length} />
                  </StatSection>
                  <StatSection title="📈 월별 접수 추이 (6개월)">
                    <MiniTrend data={getMonthly(d,6)} color={C.red} />
                  </StatSection>
                </div>
                <StatSection title="📊 처리 상태 현황">
                  <StatusPie items={statusCounts} total={d.length} />
                </StatSection>
              </div>
            )}
            <div style={cardStyle}>
              <h3 style={{ fontSize:15, fontWeight:800, color:C.navy, marginBottom:14 }}>⚖️ 해결 의뢰 접수 내역 ({d.length}건)</h3>
              {d.length === 0 ? <div style={{ textAlign:"center", padding:48, color:C.gray }}>📭 접수된 내역이 없습니다.</div> : (
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr>{["접수일시","성명","연락처","이메일","트랙","상태",""].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>{d.map((r,i)=>(
                    <tr key={r.id} style={{ background:i%2===0?"transparent":"rgba(10,22,40,0.015)" }}>
                      <td style={tdStyle}>{new Date(r.submittedAt).toLocaleString("ko-KR")}</td>
                      <td style={{ ...tdStyle, fontWeight:700 }}>{r.name||"-"}</td>
                      <td style={tdStyle}>{r.phone||"-"}</td>
                      <td style={tdStyle}>{r.email||"-"}</td>
                      <td style={tdStyle}><span style={{ padding:"3px 8px", borderRadius:4, fontSize:10, fontWeight:700, background: r.trackId==="accused"?"rgba(166,124,46,0.12)":r.trackId==="sanjae"?"rgba(201,168,76,0.12)":r.trackId==="company"?"rgba(61,90,128,0.12)":"rgba(13,115,119,0.12)", color: r.trackId==="accused"?"#A67C2E":r.trackId==="sanjae"?C.gold:r.trackId==="company"?"#3D5A80":C.teal, border:`1px solid ${r.trackId==="accused"?"rgba(166,124,46,0.3)":r.trackId==="sanjae"?"rgba(201,168,76,0.3)":r.trackId==="company"?"rgba(61,90,128,0.3)":"rgba(13,115,119,0.3)"}` }}>{r.trackTitle||"피해자 구제"}</span></td>
                      <td style={tdStyle}><select value={r.status||"신규"} onChange={e=>{r.status=e.target.value;updateSubmissionStatus(r.id,e.target.value);_store.listeners.forEach(fn=>fn());saveToStorage(_store.submissions);}} style={{ padding:"4px 8px", borderRadius:4, border:"1px solid rgba(10,22,40,0.15)", fontSize:11, fontFamily:"inherit" }}><option>신규</option><option>진행중</option><option>완료</option></select></td>
                      <td style={{ ...tdStyle, textAlign:"right" }}>
                        <button onClick={()=>setViewDetail(r)} style={{ ...btnPrimary, padding:"5px 12px", marginRight:6 }}>상세보기</button>
                        <button onClick={()=>setEmailCompose({ to:r.email||"", name:r.name||"", type:"relief", data:r, greeting:`${r.name||""} 님 안녕하세요,\n화율인사이드입니다.\n\n신청하신 ${r.trackTitle||"해결 의뢰"} 건에 대한 검토 결과를 안내드립니다.`, body:"" })} style={{ padding:"5px 12px", borderRadius:6, background:C.gold, border:"none", color:C.navy, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>📧 이메일</button>
                        <button onClick={()=>fetchEmailHistory(r.id)} style={{ padding:"5px 10px", borderRadius:6, background:"rgba(13,115,119,0.08)", border:"1px solid rgba(13,115,119,0.2)", color:C.teal, fontWeight:700, fontSize:10, cursor:"pointer", fontFamily:"inherit", marginLeft:4 }}>📬 이력</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          </div>
          );
        })()}

        {/* ── 결과지 발송 내역 ── */}
        {tab === "resultEmails" && (() => {
          const allSent = subs.resultEmails.filter(r => r.source !== "newsletter");
          const diagTypes = [
            { label:"🔍 괴롭힘 진단", count:allSent.filter(r=>r.type==="checklist").length, color:C.teal },
            { label:"🏛️ 조직문화 진단", count:allSent.filter(r=>r.type==="culture").length, color:C.purple },
          ];
          return (
          <div>
            {/* 통계 */}
            {allSent.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:12 }}>
                  <StatCard icon="📧" label="총 발송" value={allSent.length+"건"} color={C.blue} />
                  <StatCard icon="🔍" label="괴롭힘 진단" value={allSent.filter(r=>r.type==="checklist").length+"건"} color={C.teal} />
                  <StatCard icon="🏛️" label="조직문화 진단" value={allSent.filter(r=>r.type==="culture").length+"건"} color={C.purple} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                  <StatSection title="📊 진단 유형 분포">
                    <BarChart items={diagTypes} total={allSent.length} />
                  </StatSection>
                  <StatSection title="📈 월별 발송 추이 (6개월)">
                    <MiniTrend data={getMonthly(allSent, 6)} color={C.blue} />
                  </StatSection>
                </div>
              </div>
            )}

            <div style={cardStyle}>
              <h3 style={{ fontSize:15, fontWeight:800, color:C.navy, marginBottom:4 }}>📧 진단결과지 발송 이력 ({allSent.length}건)</h3>
              <p style={{ fontSize:12, color:C.gray, marginBottom:14 }}>진단 완료 후 사용자에게 즉시 발송된 결과지 내역입니다.</p>
              {allSent.length === 0
                ? <div style={{ textAlign:"center", padding:48, color:C.gray }}>📭 발송 내역이 없습니다.</div>
                : (
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr>{["발송일시","이름","이메일","진단 유형","결과지",""].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                    <tbody>{[...allSent].reverse().map((r,i)=>(
                      <tr key={r.id} style={{ background:i%2===0?"transparent":"rgba(10,22,40,0.015)" }}>
                        <td style={tdStyle}>{new Date(r.submittedAt).toLocaleString("ko-KR")}</td>
                        <td style={{ ...tdStyle, fontWeight:700 }}>{r.name||"-"}</td>
                        <td style={tdStyle}>{r.email||"-"}</td>
                        <td style={tdStyle}>
                          <span style={{ padding:"2px 8px", borderRadius:100, background:r.type==="checklist"?`${C.teal}15`:`${C.purple}15`, color:r.type==="checklist"?C.teal:C.purple, fontSize:10, fontWeight:700 }}>
                            {r.type==="checklist"?"🔍 괴롭힘 진단":"🏛️ 조직문화 진단"}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {r.resultHtml
                            ? <button onClick={()=>setViewResultHtml(r.resultHtml)} style={{ padding:"4px 10px", borderRadius:6, background:`${C.teal}12`, border:`1px solid ${C.teal}30`, color:C.teal, fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>📄 보기</button>
                            : <span style={{ fontSize:11, color:C.gray }}>-</span>}
                        </td>
                        <td style={{ ...tdStyle, textAlign:"right" }}>
                          <span style={{ padding:"2px 8px", borderRadius:100, background:"rgba(26,122,74,0.1)", color:C.green, fontSize:10, fontWeight:700 }}>✅ 발송완료</span>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                )
              }
            </div>
          </div>
          );
        })()}

        {/* ── 노무사 검토 리포트 ── */}
        {tab === "reviewRequests" && (() => {
          const d = subs.reviewRequests;
          const statusCounts = [
            { label:"신규", count:d.filter(r=>r.status==="신규").length, color:C.red },
            { label:"진행중", count:d.filter(r=>r.status==="진행중").length, color:C.orange },
            { label:"완료", count:d.filter(r=>r.status==="완료").length, color:C.green },
          ];
          const diagTypes = [
            { label:"🔍 괴롭힘 진단", count:d.filter(r=>r.type==="checklist").length, color:C.teal },
            { label:"🏛️ 조직문화 진단", count:d.filter(r=>r.type==="culture").length, color:C.purple },
          ];
          const userTypes = [
            { label:"👤 개인 피해자", count:d.filter(r=>r.userType!=="corporate").length, color:C.teal },
            { label:"🏢 기업 담당자", count:d.filter(r=>r.userType==="corporate").length, color:C.gold },
          ];
          return (
          <div>
            {d.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:12 }}>
                  <StatCard icon="📋" label="총 신청" value={d.length+"건"} color={C.purple} />
                  <StatCard icon="🔴" label="신규 대기" value={statusCounts[0].count+"건"} color={C.red} />
                  <StatCard icon="🟡" label="진행중" value={statusCounts[1].count+"건"} color={C.orange} />
                  <StatCard icon="✅" label="완료" value={statusCounts[2].count+"건"} color={C.green} sub={`완료율 ${d.length?Math.round(statusCounts[2].count/d.length*100):0}%`} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
                  <StatSection title="📊 진단 유형">
                    <BarChart items={diagTypes} total={d.length} />
                  </StatSection>
                  <StatSection title="👥 신청자 유형">
                    <BarChart items={userTypes} total={d.length} />
                  </StatSection>
                  <StatSection title="📈 월별 추이 (6개월)">
                    <MiniTrend data={getMonthly(d,6)} color={C.purple} />
                  </StatSection>
                </div>
              </div>
            )}
            <div style={cardStyle}>
              <h3 style={{ fontSize:15, fontWeight:800, color:C.navy, marginBottom:6 }}>📋 리포트 검토 요청 ({d.length}건)</h3>
              <p style={{ fontSize:12, color:C.gray, marginBottom:14 }}>전문 노무사 검토 리포트를 신청한 사용자 목록입니다. 검토 리포트를 작성하여 이메일로 발송하세요.</p>
              {d.length === 0 ? <div style={{ textAlign:"center", padding:48, color:C.gray }}>📭 신청 내역이 없습니다.</div> : (
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr>{["신청일시","성명","이메일","유형","진단","상세내용(요약)","상태",""].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>{d.map((r,i)=>(
                    <tr key={r.id} style={{ background:i%2===0?"transparent":"rgba(10,22,40,0.015)" }}>
                      <td style={tdStyle}>{new Date(r.submittedAt).toLocaleString("ko-KR")}</td>
                      <td style={{ ...tdStyle, fontWeight:700 }}>{r.name||"-"}</td>
                      <td style={tdStyle}>{r.email||"-"}</td>
                      <td style={tdStyle}>{r.userType==="corporate"?"🏢 기업":"👤 개인"}</td>
                      <td style={tdStyle}>{r.type==="checklist"?"괴롭힘":"조직문화"}</td>
                      <td style={{ ...tdStyle, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.detail?.slice(0,30)||"-"}</td>
                      <td style={tdStyle}><select value={r.status||"신규"} onChange={e=>{r.status=e.target.value;updateSubmissionStatus(r.id,e.target.value);_store.listeners.forEach(fn=>fn());saveToStorage(_store.submissions);}} style={{ padding:"4px 8px", borderRadius:4, border:"1px solid rgba(10,22,40,0.15)", fontSize:11, fontFamily:"inherit" }}><option>신규</option><option>진행중</option><option>완료</option></select></td>
                      <td style={{ ...tdStyle, textAlign:"right", whiteSpace:"nowrap" }}>
                        <button onClick={()=>setViewDetail(r)} style={{ ...btnPrimary, padding:"5px 10px", marginRight:4, fontSize:10 }}>상세</button>
                        {r.resultHtml && <button onClick={()=>setViewResultHtml(r.resultHtml)} style={{ padding:"5px 10px", borderRadius:6, background:"rgba(41,128,185,0.1)", border:"1px solid rgba(41,128,185,0.2)", color:"#2980B9", fontWeight:700, fontSize:10, cursor:"pointer", fontFamily:"inherit", marginRight:4 }}>결과지</button>}
                        <button onClick={()=>setReportWrite(r)} style={{ padding:"5px 10px", borderRadius:6, background:C.gold, border:"none", color:C.navy, fontWeight:700, fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>📋 검토리포트 작성</button>
                        <button onClick={()=>fetchEmailHistory(r.id)} style={{ padding:"5px 10px", borderRadius:6, background:"rgba(13,115,119,0.08)", border:"1px solid rgba(13,115,119,0.2)", color:C.teal, fontWeight:700, fontSize:10, cursor:"pointer", fontFamily:"inherit", marginLeft:4 }}>📬 이력</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          </div>
          );
        })()}

        {/* ── 전화상담·서비스 ── */}
        {tab === "services" && (() => {
          // 전화상담 예약 (free_consult_* source)
          const phoneCalls = subs.consulting.filter(r => r.source?.startsWith("free_consult")).map(r=>({...r,_type:"phone"}));
          // 강의·자문·일반교육
          const lectures  = subs.lectures.map(r=>({...r,_type:"lecture"}));
          const advisory  = subs.advisory.map(r=>({...r,_type:"advisory"}));
          const consulting = subs.consulting.filter(r => !r.source?.startsWith("free_consult")).map(r=>({...r,_type:"consulting"}));
          const bizServices = [...lectures, ...advisory, ...consulting].sort((a,b)=>new Date(b.submittedAt)-new Date(a.submittedAt));

          const phoneStatusCounts = [
            { label:"신규", count:phoneCalls.filter(r=>r.status==="신규").length, color:C.red },
            { label:"진행중", count:phoneCalls.filter(r=>r.status==="진행중").length, color:C.orange },
            { label:"완료", count:phoneCalls.filter(r=>r.status==="완료").length, color:C.green },
          ];
          const diagSrcCounts = [
            { label:"🔍 괴롭힘 진단", count:phoneCalls.filter(r=>r.diagType==="checklist"||r.source==="free_consult_checklist").length, color:C.teal },
            { label:"🏛️ 조직문화", count:phoneCalls.filter(r=>r.diagType==="culture"||r.source==="free_consult_culture").length, color:C.purple },
            { label:"⚖️ 산재계산기", count:phoneCalls.filter(r=>r.diagType==="workers"||r.source==="free_consult_workers").length, color:"#8E44AD" },
            { label:"🏢 컴플라이언스", count:phoneCalls.filter(r=>r.diagType==="compliance"||r.source==="free_consult_compliance").length, color:C.navy },
          ].filter(t=>t.count>0);

          const bizTypeLabel = { lecture:"🎓 강의", advisory:"💼 자문", consulting:"📚 교육" };
          const bizTypeColor = { lecture:"#2980B9", advisory:"#8E44AD", consulting:"#D35400" };

          return (
          <div>

            {/* ═══════════════ 전화상담 예약 섹션 ═══════════════ */}
            <div style={{ marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`${C.teal}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>📞</div>
                <h3 style={{ fontSize:15, fontWeight:800, color:C.navy }}>무료 전화상담 예약 ({phoneCalls.length}건)</h3>
              </div>

              {phoneCalls.length > 0 && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:10 }}>
                    <StatCard icon="📞" label="총 예약" value={phoneCalls.length+"건"} color={C.teal} />
                    <StatCard icon="🔴" label="신규" value={phoneStatusCounts[0].count+"건"} color={C.red} />
                    <StatCard icon="🟡" label="진행중" value={phoneStatusCounts[1].count+"건"} color={C.orange} />
                    <StatCard icon="✅" label="완료" value={phoneStatusCounts[2].count+"건"} color={C.green} />
                  </div>
                  {diagSrcCounts.length > 0 && (
                    <StatSection title="📊 상담 유입 경로 (진단 종류별)">
                      <BarChart items={diagSrcCounts} total={phoneCalls.length} />
                    </StatSection>
                  )}
                </div>
              )}

              <div style={cardStyle}>
                {phoneCalls.length === 0
                  ? <div style={{ textAlign:"center", padding:40, color:C.gray }}>📭 전화상담 예약 내역이 없습니다.</div>
                  : (
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <thead><tr>{["예약일시","신청자","연락처","이메일","희망일","희망시간","진단결과지","상태",""].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                      <tbody>{[...phoneCalls].sort((a,b)=>new Date(b.submittedAt)-new Date(a.submittedAt)).map((r,i)=>(
                        <tr key={r.id} style={{ background:i%2===0?"transparent":"rgba(10,22,40,0.015)" }}>
                          <td style={tdStyle}>{new Date(r.submittedAt).toLocaleString("ko-KR")}</td>
                          <td style={{ ...tdStyle, fontWeight:700 }}>{r.name||"-"}</td>
                          <td style={tdStyle}>{r.phone||"-"}</td>
                          <td style={tdStyle}>{r.email||"-"}</td>
                          <td style={{ ...tdStyle, fontWeight: r.prefDate?700:400, color: r.prefDate?C.navy:C.gray }}>
                            {r.prefDate || <span style={{ fontSize:11, color:C.gray }}>미지정</span>}
                          </td>
                          <td style={tdStyle}>
                            {r.prefTime
                              ? <span style={{ padding:"2px 7px", borderRadius:100, background:`${C.teal}12`, border:`1px solid ${C.teal}25`, color:C.teal, fontSize:10, fontWeight:700 }}>{r.prefTime}</span>
                              : <span style={{ fontSize:11, color:C.gray }}>미지정</span>}
                          </td>
                          <td style={tdStyle}>
                            {r.resultHtml
                              ? <button onClick={()=>setViewResultHtml(r.resultHtml)} style={{ padding:"4px 10px", borderRadius:6, background:`${C.teal}12`, border:`1px solid ${C.teal}30`, color:C.teal, fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>📄 보기</button>
                              : <span style={{ fontSize:11, color:C.gray }}>없음</span>}
                          </td>
                          <td style={tdStyle}>
                            <select value={r.status||"신규"} onChange={e=>{r.status=e.target.value;updateSubmissionStatus(r.id,e.target.value);_store.listeners.forEach(fn=>fn());saveToStorage(_store.submissions);}} style={{ padding:"4px 8px", borderRadius:4, border:"1px solid rgba(10,22,40,0.15)", fontSize:11, fontFamily:"inherit" }}>
                              <option>신규</option><option>진행중</option><option>완료</option>
                            </select>
                          </td>
                          <td style={{ ...tdStyle, textAlign:"right", whiteSpace:"nowrap" }}>
                            <button onClick={()=>setViewDetail(r)} style={{ ...btnPrimary, padding:"5px 10px", marginRight:4, fontSize:10 }}>상세</button>
                            <button onClick={()=>setEmailCompose({ to:r.email||"", name:r.name||"", type:"consulting", data:r, greeting:`${r.name||""} 님 안녕하세요,\n화율인사이드입니다.\n\n전화상담 예약을 확인하였습니다.${r.prefDate?"\n희망일: "+r.prefDate:""} ${r.prefTime?"/ "+r.prefTime:""}`, body:"" })} style={{ padding:"5px 10px", borderRadius:6, background:C.gold, border:"none", color:C.navy, fontWeight:700, fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>📧 이메일</button>
                            <button onClick={()=>fetchEmailHistory(r.id)} style={{ padding:"5px 8px", borderRadius:6, background:"rgba(13,115,119,0.08)", border:"1px solid rgba(13,115,119,0.2)", color:C.teal, fontWeight:700, fontSize:9, cursor:"pointer", fontFamily:"inherit", marginLeft:4 }}>📬 이력</button>
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )
                }
              </div>
            </div>

            {/* ═══════════════ 강의·자문·교육 섹션 ═══════════════ */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:"rgba(211,84,0,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🎓</div>
                <h3 style={{ fontSize:15, fontWeight:800, color:C.navy }}>강의·자문·교육 ({bizServices.length}건)</h3>
              </div>

              <div style={cardStyle}>
                <div style={{ fontSize:12, color:C.gray, marginBottom:12 }}>
                  <span style={{ marginRight:14 }}>🎓 강의 {lectures.length}건</span>
                  <span style={{ marginRight:14 }}>💼 자문 {advisory.length}건</span>
                  <span>📚 교육 {consulting.length}건</span>
                </div>
                {bizServices.length === 0
                  ? <div style={{ textAlign:"center", padding:40, color:C.gray }}>📭 접수된 내역이 없습니다.</div>
                  : (
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <thead><tr>{["요청일시","분류","신청자","기업명","이메일","연락처","요청내용(요약)","상태",""].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                      <tbody>{bizServices.map((r,i)=>(
                        <tr key={r.id} style={{ background:i%2===0?"transparent":"rgba(10,22,40,0.015)" }}>
                          <td style={tdStyle}>{new Date(r.submittedAt).toLocaleString("ko-KR")}</td>
                          <td style={tdStyle}><span style={{ padding:"2px 8px", borderRadius:100, background:bizTypeColor[r._type]+"15", color:bizTypeColor[r._type], fontSize:10, fontWeight:700, whiteSpace:"nowrap" }}>{bizTypeLabel[r._type]}</span></td>
                          <td style={{ ...tdStyle, fontWeight:700 }}>{r.name||"-"}</td>
                          <td style={tdStyle}>{r.company||"-"}</td>
                          <td style={tdStyle}>{r.email||"-"}</td>
                          <td style={tdStyle}>{r.phone||"-"}</td>
                          <td style={{ ...tdStyle, maxWidth:150, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.detail?.slice(0,25)||"-"}</td>
                          <td style={tdStyle}>
                            <select value={r.status||"신규"} onChange={e=>{r.status=e.target.value;updateSubmissionStatus(r.id,e.target.value);_store.listeners.forEach(fn=>fn());saveToStorage(_store.submissions);}} style={{ padding:"4px 8px", borderRadius:4, border:"1px solid rgba(10,22,40,0.15)", fontSize:11, fontFamily:"inherit" }}>
                              <option>신규</option><option>진행중</option><option>완료</option>
                            </select>
                          </td>
                          <td style={{ ...tdStyle, textAlign:"right", whiteSpace:"nowrap" }}>
                            <button onClick={()=>setViewDetail(r)} style={{ ...btnPrimary, padding:"5px 10px", marginRight:4, fontSize:10 }}>상세</button>
                            <button onClick={()=>setEmailCompose({ to:r.email||"", name:r.name||"", type:r._type, data:r, greeting:`${r.name||""} 님 (${r.company||""}) 안녕하세요,\n화율인사이드입니다.\n\n요청하신 ${bizTypeLabel[r._type].slice(2)} 건에 대해 안내드립니다.`, body:"" })} style={{ padding:"5px 10px", borderRadius:6, background:C.gold, border:"none", color:C.navy, fontWeight:700, fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>📧 이메일</button>
                            <button onClick={()=>fetchEmailHistory(r.id)} style={{ padding:"5px 8px", borderRadius:6, background:"rgba(13,115,119,0.08)", border:"1px solid rgba(13,115,119,0.2)", color:C.teal, fontWeight:700, fontSize:9, cursor:"pointer", fontFamily:"inherit", marginLeft:4 }}>📬 이력</button>
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )
                }
              </div>
            </div>
          </div>
          );
        })()}

        {/* ── 뉴스레터 관리 ── */}
        {tab === "newsletter" && (() => {
          const subscribers   = subs.newsletters || [];
          const sentList      = subs.sentNewsletters || [];

          // AI 자동 작성 함수 (웹서치 포함)
          const runAiGenerate = async () => {
            setNlAiLoading(true); setNlAiError("");
            const topicGuide = {
              "판례":      "최근 직장내 괴롭힘 관련 판례(대법원·고등법원·지방법원·노동위원회)를 중심으로 작성. 사건 개요, 법원 판단, 실무 시사점을 각 판례마다 기술.",
              "노동부뉴스": "고용노동부 최신 보도자료, 행정해석, 과태료·시정명령 사례를 중심으로 작성. 사업주·노동자 각각의 실무 영향을 함께 기술.",
              "지침변경":   "근로기준법·산업안전보건법·산업재해보상보험법 최신 개정 사항 및 고용노동부 고시·지침 변경 내용을 중심으로 작성. 시행일, 적용 대상, 변경 핵심을 명확히.",
              "종합":       "판례, 법령 개정, 노동부 뉴스, 실무 팁을 각 섹션으로 나누어 종합 정리."
            }[nlAiTopic];
            const ym = nlAiMonth || "최근";
            const keyword = nlAiKeyword.trim() ? `\n추가 키워드: ${nlAiKeyword}` : "";
            try {
              const res = await fetch("https://hwayul-backend-production-96cf.up.railway.app/api/claude", {
                method:"POST",
                body: JSON.stringify({
                  model:"claude-sonnet-4-6",
                  max_tokens:2000,
                  tools:[{ type:"web_search_20250305", name:"web_search" }],
                  system:`당신은 직장내 괴롭힘·노동법 전문 노무사 사무소(화율인사이드)의 뉴스레터 편집장입니다.
구독자는 피해 근로자, 인사담당자, 기업 법무팀입니다.

[최우선 원칙] 정확성 보장:
- 웹 검색으로 확인된 사실만 기술한다
- 확실하지 않은 판례번호·통계 수치·법조문 번호는 절대 만들어내지 않는다
- 검색으로 확인되지 않은 내용은 포함하지 않는다
- 존재하지 않는 판례·법률·기관을 언급하지 않는다

작성 원칙:
- 최신 정보를 웹 검색으로 확인 후 작성
- 섹션 제목은 ■ 기호로 시작
- 각 항목마다 날짜·출처·핵심 내용·실무 시사점 포함
- 어조: 전문적이나 읽기 쉽게, 불필요한 미사여구 없이
- 총 600~900자 (뉴스레터 본문만, 인사말·서명 제외)
- 마지막에 짧은 "이달의 노무사 한마디" 한 줄 추가`,
                  messages:[{ role:"user", content:
`${ym} 기준 화율인사이드 뉴스레터 본문을 작성해주세요.
주제: ${nlAiTopic}${keyword}
작성 지침: ${topicGuide}

웹 검색을 통해 실제 최신 정보를 반드시 확인하고 작성하세요.
형식:
■ [섹션명]
• [항목 제목] (날짜/출처)
  내용 및 실무 시사점

...반복...

💬 이달의 노무사 한마디: (한 줄)`}]
                })
              });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const d = await res.json();
              if (d.error) throw new Error(d.error.message);
              const text = d.content?.filter(b=>b.type==="text").map(b=>b.text).join("").trim() || "";
              if (!text) throw new Error("AI 응답이 비어 있습니다.");
              // 제목도 자동 생성
              const ymd = ym.replace("-","년 ")+"월";
              const topicKr = { "판례":"최신 판례", "노동부뉴스":"노동부 뉴스", "지침변경":"법령·지침 변경", "종합":"종합 정보" }[nlAiTopic]||nlAiTopic;
              setNlForm(f => ({
                ...f,
                title: `[화율인사이드] ${ymd} ${topicKr} 뉴스레터`,
                body: text
              }));
            } catch(e) {
              setNlAiError(e.message||"AI 생성 중 오류가 발생했습니다.");
            }
            setNlAiLoading(false);
          };

          // 발송 후 저장
          const handleSend = () => {
            const record = {
              id: Date.now(),
              title: nlForm.title,
              body: nlForm.body,
              greeting: nlForm.greeting,
              closing: nlForm.closing,
              topic: nlAiTopic,
              recipientCount: subscribers.length,
              sentAt: new Date().toISOString(),
            };
            addSubmission("sentNewsletters", record);
            setNlSent(true);
          };

          const nlHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;800&display=swap');
  body{font-family:'Noto Sans KR',sans-serif;margin:0;padding:0;background:#F5F3EF;}
  .wrap{max-width:640px;margin:0 auto;background:white;}
</style></head><body>
<div class="wrap">
  <div style="background:#0A1628;padding:28px 32px;text-align:center">
    <div style="font-size:20px;font-weight:800;font-family:'Noto Sans KR',sans-serif"><span style="color:#E8E5DE">화율</span> <span style="color:#4ECDC4">인사이드</span></div>
    <div style="font-size:9px;color:rgba(244,241,235,0.5);margin-top:2px;letter-spacing:1.5px">Hwayul Inside Newsletter</div>
  </div>
  <div style="padding:36px 32px">
    <h2 style="font-size:20px;font-weight:800;color:#0A1628;margin-bottom:20px;line-height:1.5">${nlForm.title||"(제목 없음)"}</h2>
    <div style="font-size:14px;color:#0A1628;line-height:1.9;white-space:pre-wrap;margin-bottom:24px">${nlForm.greeting}</div>
    <div style="font-size:14px;color:#0A1628;line-height:1.9;white-space:pre-wrap;margin-bottom:24px">${(nlForm.body||"").replace(/■/g,'<strong style="color:#0D7377">■</strong>').replace(/💬/g,'<span style="color:#C9A84C">💬</span>')}</div>
    <div style="border-top:1px solid #E8E5DE;padding-top:20px;font-size:13px;color:#8B8680;line-height:1.9;white-space:pre-wrap">${nlForm.closing}</div>
  </div>
  <div style="background:#0A1628;padding:20px 32px;text-align:center">
    <div style="font-size:10px;color:rgba(244,241,235,0.3);line-height:1.8">© 2025 화율인사이드 | hwayulinside@gmail.com<br/><a href="#" style="color:rgba(244,241,235,0.4);font-size:9px">수신 거부</a></div>
  </div>
</div></body></html>`;

          return (
          <div>
            {/* ── 상단 요약 카드 ── */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
              {[
                { label:"총 구독자", val:`${subscribers.length}명`, color:C.teal, icon:"📬" },
                { label:"발송 가능", val:`${subscribers.filter(r=>r.email).length}명`, color:C.green, icon:"✅" },
                { label:"발송 이력", val:`${sentList.length}건`, color:C.navy, icon:"📂" },
                { label:"이번 달", val:`${sentList.filter(r=>r.sentAt?.startsWith(new Date().toISOString().slice(0,7))).length}건`, color:C.gold, icon:"📅" },
              ].map(s => (
                <div key={s.label} style={cardStyle}>
                  <div style={{ fontSize:11, color:C.gray }}>{s.icon} {s.label}</div>
                  <div style={{ fontSize:24, fontWeight:900, color:s.color, marginTop:4 }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* ── 통계 (데이터 있을 때만) ── */}
            {(subscribers.length > 0 || sentList.length > 0) && (() => {
              const subMonthly = getMonthly(subscribers.map(r=>({submittedAt:r.submittedAt})),6);
              const sentMonthly = getMonthly(sentList.map(r=>({submittedAt:r.sentAt})),6);
              const topicCounts = ["판례","노동부뉴스","지침변경","종합"].map(t=>({
                label:{판례:"⚖️ 판례",노동부뉴스:"📢 노동부",지침변경:"📋 지침",종합:"📰 종합"}[t],
                count:sentList.filter(r=>r.topic===t).length,
                color:{판례:C.teal,노동부뉴스:C.gold,지침변경:C.purple,종합:"#D35400"}[t],
              })).filter(t=>t.count>0);
              return (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                  <StatSection title="📈 구독자 월별 증가 추이 (6개월)">
                    <MiniTrend data={subMonthly} color={C.teal} />
                  </StatSection>
                  <StatSection title="📧 발송 월별 추이 (6개월)">
                    <MiniTrend data={sentMonthly} color={C.gold} />
                  </StatSection>
                </div>
                {topicCounts.length > 0 && (
                  <StatSection title="📊 발송 주제 분포">
                    <BarChart items={topicCounts} total={sentList.length} />
                  </StatSection>
                )}
              </div>
              );
            })()}

            {/* ── 탭 네비 ── */}
            <div style={{ display:"flex", gap:8, marginBottom:18 }}>
              {[["list","📬 구독자"],["compose","✏️ 새 작성"],["history","📂 발송 이력"]].map(([m,label])=>(
                <button key={m} onClick={()=>{setNlMode(m);setNlSent(false);}} style={{ padding:"8px 18px", borderRadius:8, background:nlMode===m?C.navy:"rgba(10,22,40,0.05)", border:nlMode===m?"none":"1px solid rgba(10,22,40,0.1)", color:nlMode===m?"white":C.navy, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>{label}</button>
              ))}
            </div>

            {/* ── 구독자 목록 ── */}
            {nlMode === "list" && (
              <div>
                <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginBottom:14 }}>
                  <button onClick={()=>setNlMode("history")} style={{ padding:"8px 16px", borderRadius:6, border:"1px solid rgba(10,22,40,0.12)", background:"white", color:C.navy, fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>📋 발송 이력</button>
                  <button onClick={()=>setNlMode("compose")} style={{ padding:"8px 16px", borderRadius:6, background:C.teal, border:"none", color:"white", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>✏️ 새 뉴스레터 작성</button>
                </div>
                <div style={cardStyle}>
                  <h3 style={{ fontSize:15, fontWeight:800, color:C.navy, marginBottom:14 }}>📬 뉴스레터 구독자 목록</h3>
                {subscribers.length === 0
                  ? <div style={{ textAlign:"center", padding:48, color:C.gray }}>📭 구독자가 없습니다.</div>
                  : <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <thead><tr>{["구독일시","이메일","상태"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                      <tbody>{subscribers.map((r,i)=>(
                        <tr key={r.id} style={{ background:i%2===0?"transparent":"rgba(10,22,40,0.015)" }}>
                          <td style={tdStyle}>{new Date(r.submittedAt).toLocaleString("ko-KR")}</td>
                          <td style={{ ...tdStyle, fontWeight:700 }}>{r.email}</td>
                          <td style={tdStyle}><span style={{ padding:"2px 8px", borderRadius:100, background:"rgba(26,122,74,0.1)", color:C.green, fontSize:10, fontWeight:700 }}>구독중</span></td>
                        </tr>
                      ))}</tbody>
                    </table>
                }
                </div>
              </div>
            )}

            {/* ── 새 뉴스레터 작성 ── */}
            {(nlMode === "compose" || nlMode === "preview") && (
              <div style={cardStyle}>
                {nlMode === "compose" && (<>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                    <h3 style={{ fontSize:15, fontWeight:800, color:C.navy }}>✏️ 뉴스레터 작성</h3>
                  </div>

                  {/* ── AI 자동 생성 패널 ── */}
                  <div style={{ padding:"18px 20px", background:"linear-gradient(135deg,rgba(10,22,40,0.03),rgba(13,115,119,0.05))", border:"1.5px solid rgba(13,115,119,0.2)", borderRadius:12, marginBottom:20 }}>
                    <div style={{ fontSize:13, fontWeight:800, color:C.navy, marginBottom:12 }}>
                      ✨ AI 자동 생성
                      <span style={{ marginLeft:8, fontSize:10, padding:"2px 8px", borderRadius:100, background:"rgba(13,115,119,0.1)", color:C.teal, fontWeight:700 }}>웹 검색 포함</span>
                    </div>

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>주제 선택</label>
                        <select value={nlAiTopic} onChange={e=>setNlAiTopic(e.target.value)} style={{ width:"100%", padding:"9px 10px", borderRadius:7, border:"1.5px solid rgba(10,22,40,0.12)", fontSize:12, fontFamily:"inherit", outline:"none", background:"white" }}>
                          <option value="판례">⚖️ 최신 판례</option>
                          <option value="노동부뉴스">📢 노동부 뉴스</option>
                          <option value="지침변경">📋 법령·지침 변경</option>
                          <option value="종합">📰 종합 (판례+법령+뉴스)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>기준 월</label>
                        <input type="month" value={nlAiMonth} onChange={e=>setNlAiMonth(e.target.value)} style={{ width:"100%", padding:"9px 10px", borderRadius:7, border:"1.5px solid rgba(10,22,40,0.12)", fontSize:12, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>추가 키워드 (선택)</label>
                        <input value={nlAiKeyword} onChange={e=>setNlAiKeyword(e.target.value)} placeholder="예: 5인 미만 사업장, 원청 책임" style={{ width:"100%", padding:"9px 10px", borderRadius:7, border:"1.5px solid rgba(10,22,40,0.12)", fontSize:12, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
                      </div>
                    </div>

                    {nlAiError && <div style={{ padding:"8px 12px", background:"rgba(192,57,43,0.07)", borderRadius:7, marginBottom:10, fontSize:11, color:"#C0392B" }}>⚠️ {nlAiError}</div>}

                    {nlAiLoading
                      ? <div style={{ padding:"14px", background:"rgba(13,115,119,0.06)", borderRadius:9, textAlign:"center" }}>
                          <div style={{ fontSize:13, fontWeight:700, color:C.teal, marginBottom:4 }}>
                            <span style={{ display:"inline-block", animation:"spin 1s linear infinite", marginRight:6 }}>⟳</span>
                            웹 검색 후 뉴스레터 작성 중…
                          </div>
                          <div style={{ fontSize:11, color:C.gray }}>최신 판례·법령·노동부 소식을 검색하고 있습니다.</div>
                        </div>
                      : <button onClick={runAiGenerate} style={{ width:"100%", padding:"11px", borderRadius:9, background:`linear-gradient(135deg,${C.teal},${C.tealLight})`, border:"none", color:"white", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                          ✨ AI로 본문 자동 생성
                        </button>
                    }
                  </div>

                  {/* ── 직접 편집 영역 ── */}
                  <div style={{ padding:"12px 14px", background:"rgba(13,115,119,0.05)", borderRadius:8, marginBottom:16, fontSize:12, color:C.teal, fontWeight:600 }}>
                    📧 발송 대상: 뉴스레터 구독자 <strong>{subscribers.length}명</strong>
                    <span style={{ color:C.gray, fontWeight:400, marginLeft:8 }}>hwayulinside@gmail.com에서 일괄 발송됩니다.</span>
                  </div>

                  <div style={{ marginBottom:12 }}>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.gray, marginBottom:4, textTransform:"uppercase" }}>뉴스레터 제목</label>
                    <input value={nlForm.title} onChange={e=>setNlForm(f=>({...f,title:e.target.value}))} placeholder="예: [화율인사이드] 2026년 3월 직장내 괴롭힘 최신 판례 정리" style={{ width:"100%", padding:"11px 13px", borderRadius:8, border:`2px solid ${nlForm.title?"rgba(13,115,119,0.3)":"rgba(10,22,40,0.1)"}`, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
                  </div>

                  <div style={{ marginBottom:12 }}>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.gray, marginBottom:4, textTransform:"uppercase" }}>인사말</label>
                    <textarea value={nlForm.greeting} onChange={e=>setNlForm(f=>({...f,greeting:e.target.value}))} rows={2} style={{ width:"100%", padding:"9px 12px", borderRadius:6, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.7, boxSizing:"border-box" }} />
                  </div>

                  <div style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <label style={{ fontSize:11, fontWeight:700, color:C.gray, textTransform:"uppercase" }}>본문 내용</label>
                      {nlForm.body && <button onClick={runAiGenerate} disabled={nlAiLoading} style={{ fontSize:11, color:C.teal, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600, textDecoration:"underline" }}>↺ 재생성</button>}
                    </div>
                    {nlForm.body && (
                      <div style={{ padding:"8px 12px", background:"rgba(230,126,34,0.08)", border:"1px solid rgba(230,126,34,0.2)", borderRadius:6, marginBottom:8, fontSize:10, color:"#8B5A00", lineHeight:1.6 }}>
                        ⚠️ AI가 생성한 내용은 부정확할 수 있습니다. 판례번호·통계·법조문을 반드시 확인한 뒤 발송하세요.
                      </div>
                    )}
                    <textarea value={nlForm.body} onChange={e=>setNlForm(f=>({...f,body:e.target.value}))} rows={14} placeholder={"AI 자동 생성 버튼을 누르거나 직접 작성하세요.\n\n예시:\n■ 최신 판례\n• 광주지법, 회식 불참 질책 직장내 괴롭힘 인정 (2025.04.15)\n\n■ 법령 개정\n• 근로기준법 제76조의3 개정안 시행\n\n💬 이달의 노무사 한마디: ..."} style={{ width:"100%", padding:"10px 12px", borderRadius:6, border:`2px solid ${nlForm.body?"rgba(13,115,119,0.25)":"rgba(10,22,40,0.1)"}`, fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.75, boxSizing:"border-box" }} />
                    {nlForm.body && <div style={{ fontSize:11, color:C.gray, marginTop:4, textAlign:"right" }}>{nlForm.body.length}자</div>}
                  </div>

                  <div style={{ marginBottom:18 }}>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.gray, marginBottom:4, textTransform:"uppercase" }}>서명 / 맺음말</label>
                    <textarea value={nlForm.closing} onChange={e=>setNlForm(f=>({...f,closing:e.target.value}))} rows={3} style={{ width:"100%", padding:"9px 12px", borderRadius:6, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.7, boxSizing:"border-box", color:C.gray }} />
                  </div>

                  <div style={{ display:"flex", gap:10 }}>
                    <button
                      onClick={() => { setNlMode("preview"); setTimeout(()=>{ if(nlPreviewRef.current){ const doc=nlPreviewRef.current.contentDocument||nlPreviewRef.current.contentWindow.document; doc.open();doc.write(nlHtml);doc.close(); }},100); }}
                      disabled={!nlForm.title||!nlForm.body}
                      style={{ flex:2, padding:"13px", borderRadius:10, background:nlForm.title&&nlForm.body?C.teal:"rgba(10,22,40,0.06)", border:"none", color:nlForm.title&&nlForm.body?"white":C.gray, fontWeight:800, fontSize:14, cursor:nlForm.title&&nlForm.body?"pointer":"not-allowed", fontFamily:"inherit" }}
                    >👁 미리보기</button>
                    <button onClick={()=>{setNlMode("list");}} style={{ flex:1, padding:"13px", borderRadius:10, background:"transparent", border:"2px solid rgba(10,22,40,0.1)", color:C.gray, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>취소</button>
                  </div>
                  <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                </>)}

                {/* ── 미리보기 ── */}
                {nlMode === "preview" && (<>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <h3 style={{ fontSize:15, fontWeight:800, color:C.navy }}>👁 뉴스레터 미리보기</h3>
                    <button onClick={()=>setNlMode("compose")} style={{ padding:"6px 14px", borderRadius:6, background:"rgba(10,22,40,0.05)", border:"1px solid rgba(10,22,40,0.1)", color:C.navy, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>← 수정하기</button>
                  </div>

                  <div style={{ padding:"11px 14px", background:"rgba(201,168,76,0.06)", borderRadius:8, marginBottom:14, fontSize:12 }}>
                    <span style={{ fontWeight:700, color:C.gold }}>📧 발송 정보</span>
                    <span style={{ color:C.gray, marginLeft:10 }}>→ 구독자 {subscribers.length}명 &nbsp;|&nbsp; 제목: {nlForm.title}</span>
                  </div>

                  <div style={{ border:"1px solid rgba(10,22,40,0.1)", borderRadius:10, overflow:"hidden", marginBottom:18 }}>
                    <iframe ref={nlPreviewRef} style={{ width:"100%", height:500, border:"none" }} title="뉴스레터미리보기" />
                  </div>

                  {nlSent
                    ? <div style={{ padding:"16px 20px", background:"rgba(26,122,74,0.08)", borderRadius:10, textAlign:"center" }}>
                        <div style={{ fontSize:18, marginBottom:6 }}>✅</div>
                        <div style={{ fontSize:14, fontWeight:700, color:C.green }}>뉴스레터가 {subscribers.length}명에게 발송되었습니다!</div>
                        <div style={{ fontSize:12, color:C.gray, marginTop:4 }}>발송 이력에 저장되었습니다.</div>
                        <button onClick={()=>{ setNlMode("history"); setNlForm({title:"",greeting:"안녕하세요, 화율인사이드입니다.",body:"",closing:"감사합니다.\n\n화율인사이드\n대표 노무사 김재정\nhwayulinside@gmail.com"}); setNlSent(false); }} style={{ marginTop:12, padding:"8px 20px", borderRadius:6, background:C.teal, border:"none", color:"white", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>발송 이력 보기 →</button>
                      </div>
                    : <button onClick={handleSend} style={{ width:"100%", padding:"16px", borderRadius:10, background:C.teal, border:"none", color:"white", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>
                        ✉️ 구독자 {subscribers.length}명에게 발송하기
                      </button>
                  }
                </>)}
              </div>
            )}

            {/* ── 발송 이력 ── */}
            {nlMode === "history" && (
              <div style={cardStyle}>
                <h3 style={{ fontSize:15, fontWeight:800, color:C.navy, marginBottom:4 }}>📂 뉴스레터 발송 이력</h3>
                <p style={{ fontSize:12, color:C.gray, marginBottom:16 }}>발송된 뉴스레터를 열람하고 본문을 확인할 수 있습니다.</p>
                {sentList.length === 0
                  ? <div style={{ textAlign:"center", padding:"48px 0", color:C.gray }}>
                      <div style={{ fontSize:32, marginBottom:10 }}>📭</div>
                      <div>발송된 뉴스레터가 없습니다.</div>
                    </div>
                  : <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {[...sentList].reverse().map(r => (
                        <NlHistoryCard key={r.id} record={r} />
                      ))}
                    </div>
                }
              </div>
            )}
          </div>
          );
        })()}

      </div>
    </section>
  );
}


// ── 오른쪽 요청 사이드바 ─────────────────────────────────────────────────────
