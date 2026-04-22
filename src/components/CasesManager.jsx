import React, { useState, useEffect } from "react";
import { adminFetch } from "../utils/adminApi.js";

const API_URL = "https://hwayul-backend-production-96cf.up.railway.app/api/cases";

const CATEGORIES = [
  "부당해고", "직장 내 괴롭힘", "임금체불", "산업재해",
  "근로계약", "퇴직금", "성희롱", "부당노동행위", "기타"
];

export default function CasesManager() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("list"); // list, add, detail, edit
  const [selectedCase, setSelectedCase] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [form, setForm] = useState({
    title: "", category: "부당해고", summary: "",
    content: "", result: "", source: ""
  });

  // 목록 불러오기
  const fetchCases = async () => {
    setLoading(true);
    try {
      let url = API_URL;
      if (filterCategory) url += `?category=${encodeURIComponent(filterCategory)}`;
      const res = await fetch(url);
      const data = await res.json();
      setCases(data);
      setError("");
    } catch (e) {
      setError("데이터를 불러오는데 실패했습니다.");
    }
    setLoading(false);
  };

  // 검색
  const handleSearch = async () => {
    if (!searchKeyword.trim()) { fetchCases(); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/search/${encodeURIComponent(searchKeyword)}`);
      const data = await res.json();
      setCases(data);
    } catch (e) {
      setError("검색에 실패했습니다.");
    }
    setLoading(false);
  };

  // 새 자료 추가
  const handleAdd = async () => {
    if (!form.title.trim() || !form.category) {
      setError("제목과 카테고리는 필수입니다.");
      return;
    }
    try {
      const res = await adminFetch(API_URL, {
        method: "POST",
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ title: "", category: "부당해고", summary: "", content: "", result: "", source: "" });
        setView("list");
        fetchCases();
      } else {
        setError("저장에 실패했습니다.");
      }
    } catch (e) {
      setError("서버 오류가 발생했습니다.");
    }
  };

  // 수정
  const handleEdit = async () => {
    try {
      const res = await adminFetch(`${API_URL}/${selectedCase.id}`, {
        method: "PUT",
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setView("list");
        fetchCases();
      }
    } catch (e) {
      setError("수정에 실패했습니다.");
    }
  };

  // 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await adminFetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchCases();
      if (view === "detail") setView("list");
    } catch (e) {
      setError("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { fetchCases(); }, [filterCategory]);

  // ——— 스타일 ———
  const s = {
    wrap: { padding: "16px", maxWidth: 800, margin: "0 auto" },
    title: { fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 },
    btn: (bg) => ({
      padding: "8px 16px", background: bg || "#4a6cf7", color: "#fff",
      border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600
    }),
    btnSm: (bg) => ({
      padding: "4px 10px", background: bg || "#e8eaf6", color: bg ? "#fff" : "#333",
      border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12
    }),
    card: {
      background: "#fff", borderRadius: 12, padding: 16, marginBottom: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)", cursor: "pointer",
      border: "1px solid #eee", transition: "box-shadow 0.2s"
    },
    badge: (cat) => ({
      display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11,
      fontWeight: 600, marginRight: 8,
      background: cat === "부당해고" ? "#fee" : cat === "직장 내 괴롭힘" ? "#fef3e0" :
        cat === "임금체불" ? "#e3f2fd" : cat === "산업재해" ? "#fce4ec" : "#f3e5f5",
      color: cat === "부당해고" ? "#c62828" : cat === "직장 내 괴롭힘" ? "#e65100" :
        cat === "임금체불" ? "#1565c0" : cat === "산업재해" ? "#ad1457" : "#6a1b9a"
    }),
    input: {
      width: "100%", padding: "10px 12px", border: "1px solid #ddd",
      borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: "border-box"
    },
    textarea: {
      width: "100%", padding: "10px 12px", border: "1px solid #ddd",
      borderRadius: 8, fontSize: 14, marginBottom: 10, minHeight: 120,
      resize: "vertical", boxSizing: "border-box"
    },
    select: {
      padding: "10px 12px", border: "1px solid #ddd",
      borderRadius: 8, fontSize: 14, marginBottom: 10, background: "#fff"
    },
    searchWrap: {
      display: "flex", gap: 8, marginBottom: 16
    },
    filterWrap: {
      display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16
    },
    filterBtn: (active) => ({
      padding: "5px 12px", borderRadius: 20, border: active ? "2px solid #4a6cf7" : "1px solid #ddd",
      background: active ? "#e8eef9" : "#fff", color: active ? "#4a6cf7" : "#666",
      cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 400
    }),
    empty: { textAlign: "center", padding: 40, color: "#999" },
    back: {
      background: "none", border: "none", cursor: "pointer",
      fontSize: 14, color: "#4a6cf7", padding: 0, marginBottom: 12, fontWeight: 600
    },
    detailTitle: { fontSize: 20, fontWeight: 700, marginBottom: 8 },
    detailMeta: { fontSize: 13, color: "#888", marginBottom: 16 },
    detailSection: { marginBottom: 16 },
    detailLabel: { fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4 },
    detailContent: {
      background: "#f8f9fa", padding: 14, borderRadius: 8,
      fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap"
    },
    errMsg: { color: "#e53935", fontSize: 13, marginBottom: 10 }
  };

  // ——— 목록 뷰 ———
  if (view === "list") return (
    <div style={s.wrap}>
      <div style={s.title}>
        <span>📚</span> 판례 · 사례 자료실
        <span style={{ flex: 1 }} />
        <button style={s.btn()} onClick={() => { setForm({ title: "", category: "부당해고", summary: "", content: "", result: "", source: "" }); setView("add"); }}>
          + 새 자료 추가
        </button>
      </div>

      {/* 검색 */}
      <div style={s.searchWrap}>
        <input style={{ ...s.input, marginBottom: 0, flex: 1 }}
          placeholder="판례, 사례 검색..."
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
        />
        <button style={s.btn("#555")} onClick={handleSearch}>검색</button>
      </div>

      {/* 카테고리 필터 */}
      <div style={s.filterWrap}>
        <button style={s.filterBtn(!filterCategory)} onClick={() => setFilterCategory("")}>전체</button>
        {CATEGORIES.map(c => (
          <button key={c} style={s.filterBtn(filterCategory === c)} onClick={() => setFilterCategory(c)}>{c}</button>
        ))}
      </div>

      {error && <div style={s.errMsg}>{error}</div>}

      {loading ? <div style={s.empty}>로딩 중...</div> :
        cases.length === 0 ? <div style={s.empty}>등록된 자료가 없습니다.<br />위의 "새 자료 추가" 버튼을 눌러 첫 자료를 등록해보세요!</div> :
        cases.map(c => (
          <div key={c.id} style={s.card}
            onClick={() => { setSelectedCase(c); setView("detail"); }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <span style={s.badge(c.category)}>{c.category}</span>
              {c.result && <span style={{ fontSize: 12, color: "#4caf50", fontWeight: 600 }}>{c.result}</span>}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{c.title}</div>
            {c.summary && <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
              {c.summary.length > 100 ? c.summary.slice(0, 100) + "..." : c.summary}
            </div>}
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>
              {new Date(c.created_at).toLocaleDateString("ko-KR")}
            </div>
          </div>
        ))
      }
      <div style={{ fontSize: 12, color: "#aaa", textAlign: "center", marginTop: 16 }}>
        총 {cases.length}건의 자료
      </div>
    </div>
  );

  // ——— 추가/수정 뷰 ———
  if (view === "add" || view === "edit") return (
    <div style={s.wrap}>
      <button style={s.back} onClick={() => setView("list")}>← 목록으로</button>
      <div style={s.title}>{view === "add" ? "📝 새 자료 추가" : "✏️ 자료 수정"}</div>

      {error && <div style={s.errMsg}>{error}</div>}

      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#555" }}>제목 *</div>
      <input style={s.input} placeholder="예: 부당해고 판례 - 서울고법 2023나1234"
        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />

      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#555" }}>카테고리 *</div>
      <select style={s.select} value={form.category}
        onChange={e => setForm({ ...form, category: e.target.value })}>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#555" }}>요약</div>
      <textarea style={{ ...s.textarea, minHeight: 80 }} placeholder="핵심 내용을 간단히 요약해주세요"
        value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />

      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#555" }}>상세 내용</div>
      <textarea style={s.textarea} placeholder="판례 전문, 사건 경위, 법적 근거 등을 자세히 작성해주세요"
        value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />

      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#555" }}>판결/결과</div>
      <input style={s.input} placeholder="예: 근로자 승소, 합의 종결"
        value={form.result} onChange={e => setForm({ ...form, result: e.target.value })} />

      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#555" }}>출처</div>
      <input style={s.input} placeholder="예: 서울고등법원 2023나1234, 고용노동부 사례집"
        value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button style={s.btn()} onClick={view === "add" ? handleAdd : handleEdit}>
          {view === "add" ? "저장하기" : "수정 완료"}
        </button>
        <button style={s.btn("#999")} onClick={() => setView("list")}>취소</button>
      </div>
    </div>
  );

  // ——— 상세 뷰 ———
  if (view === "detail" && selectedCase) return (
    <div style={s.wrap}>
      <button style={s.back} onClick={() => setView("list")}>← 목록으로</button>

      <span style={s.badge(selectedCase.category)}>{selectedCase.category}</span>
      <div style={s.detailTitle}>{selectedCase.title}</div>
      <div style={s.detailMeta}>
        등록일: {new Date(selectedCase.created_at).toLocaleDateString("ko-KR")}
        {selectedCase.source && <> · 출처: {selectedCase.source}</>}
      </div>

      {selectedCase.result && (
        <div style={s.detailSection}>
          <div style={s.detailLabel}>판결/결과</div>
          <div style={{ ...s.detailContent, background: "#e8f5e9", color: "#2e7d32" }}>
            {selectedCase.result}
          </div>
        </div>
      )}

      {selectedCase.summary && (
        <div style={s.detailSection}>
          <div style={s.detailLabel}>요약</div>
          <div style={s.detailContent}>{selectedCase.summary}</div>
        </div>
      )}

      {selectedCase.content && (
        <div style={s.detailSection}>
          <div style={s.detailLabel}>상세 내용</div>
          <div style={s.detailContent}>{selectedCase.content}</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button style={s.btn("#ff9800")} onClick={() => {
          setForm({
            title: selectedCase.title, category: selectedCase.category,
            summary: selectedCase.summary || "", content: selectedCase.content || "",
            result: selectedCase.result || "", source: selectedCase.source || ""
          });
          setView("edit");
        }}>수정</button>
        <button style={s.btn("#e53935")} onClick={() => handleDelete(selectedCase.id)}>삭제</button>
      </div>
    </div>
  );

  return null;
}
