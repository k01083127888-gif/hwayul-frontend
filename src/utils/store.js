import { useState, useEffect } from "react";
import {
    MEMBERS_KEY, CONTENTS_KEY, DETAILS_KEY,
    loadFromStorage, saveToStorage,
    loadChecklist, loadCulture,
} from "./storage.js";
import { mockNews }         from "../data/mockNews.js";
import { contentDetails }   from "../data/contentDetails.js";
import { _defaultMembers }  from "../data/memberData.js";
import { adminFetch }       from "./adminApi.js";

const API_BASE = "https://hwayul-backend-production-96cf.up.railway.app/api";

// — 제출 전역 스토어
export const _store = { submissions: loadFromStorage(), listeners: [] };

export function useStore() {
    const [, setTick] = useState(0);
    useEffect(() => {
        const fn = () => setTick(t => t + 1);
        _store.listeners.push(fn);
        return () => { _store.listeners = _store.listeners.filter(l => l !== fn); };
    }, []);
    return _store;
}

export function addSubmission(type, data) {
    const newItem = {
        ...data,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        submittedAt: new Date().toISOString(),
        status: data.status || "신규",
    };
    _store.submissions[type].push(newItem);
    saveToStorage(_store.submissions);
    _store.listeners.forEach(fn => fn());
    // DB에도 저장 (비동기, 실패해도 localStorage에는 이미 저장됨)
    fetch(`${API_BASE}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: newItem.id, type, status: newItem.status, data: newItem, submitted_at: newItem.submittedAt })
    }).catch(e => console.log("DB 저장 실패(무시):", e.message));
}

// 접수 데이터 상태 변경 → DB 반영 (관리자 전용)
export function updateSubmissionStatus(submissionId, newStatus) {
    adminFetch(`${API_BASE}/submissions/${submissionId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
    }).catch(e => console.log("상태 DB 반영 실패:", e.message));
}

// DB에서 접수 데이터 불러오기 (관리자 전용)
export async function loadSubmissionsFromDB() {
    try {
        const res = await adminFetch(`${API_BASE}/submissions`);
        if (res.ok) {
            const dbData = await res.json();
            // DB에 데이터가 있으면 DB를 우선으로 사용
            const hasData = Object.values(dbData).some(arr => arr.length > 0);
            if (hasData) {
                _store.submissions = dbData;
                saveToStorage(dbData); // localStorage 백업도 갱신
                _store.listeners.forEach(fn => fn());
                return dbData;
            }
        }
    } catch (e) {
        console.log("DB 접수 로드 실패, localStorage 사용:", e.message);
    }
    return _store.submissions;
}

// localStorage → DB 일괄 동기화 (첫 마이그레이션)
export async function syncSubmissionsToDB() {
    try {
        const local = loadFromStorage();
        const hasLocal = Object.values(local).some(arr => arr.length > 0);
        if (!hasLocal) return; // localStorage에 데이터 없으면 스킵

        // DB에 이미 데이터가 있는지 확인 (관리자 전용)
        const res = await adminFetch(`${API_BASE}/submissions`);
        if (res.ok) {
            const dbData = await res.json();
            const dbCount = Object.values(dbData).reduce((sum, arr) => sum + arr.length, 0);
            if (dbCount > 0) return; // DB에 이미 있으면 스킵 (중복 방지)
        }

        // DB가 비어있고 localStorage에 데이터가 있으면 → 동기화 (관리자 전용)
        await adminFetch(`${API_BASE}/submissions/sync`, {
            method: "POST",
            body: JSON.stringify({ submissions: local })
        });
        console.log("✅ localStorage → DB 동기화 완료!");
    } catch (e) {
        console.log("동기화 실패(무시):", e.message);
    }
}

// — 진단 중간저장 상태
export let _savedChecklist = loadChecklist();
export let _savedCulture   = loadCulture();

// — 전문가 멤버 (localStorage 복원)
export let _members = (() => {
    try {
        const saved = localStorage.getItem(MEMBERS_KEY);
        if (saved) return JSON.parse(saved);
    } catch {}
    return [..._defaultMembers];
})();

export function setMembers(val) { _members = val; }

// — 콘텐츠 목록 (localStorage → 데이터베이스로 전환) ————————————

// 처음에는 localStorage 또는 mockNews에서 로드 (즉시 화면 표시용)
export let _contents = (() => {
    try {
        const saved = localStorage.getItem(CONTENTS_KEY);
        if (saved) return JSON.parse(saved);
    } catch {}
    return [...mockNews];
})();

let _dbReady = false;
export function setDbReady() { _dbReady = true; }
export function setContents(val) {
    _contents = val;
    // localStorage에도 저장 (백업)
    try { localStorage.setItem(CONTENTS_KEY, JSON.stringify(val)); } catch {}
    // DB 로드 완료 후에만 데이터베이스에 저장
    // DB 저장은 handleSave에서 직접 호출
}
// 데이터베이스에서 콘텐츠 불러오기
// - cache: "no-cache" 로 브라우저 304 캐시 이슈 회피 (항상 body 있는 200 응답 보장)
// - 성공/실패 관계없이 마지막에 리렌더 알림 (React 구독자 업데이트)
export async function loadContentsFromDB() {
    try {
        const res = await fetch(`${API_BASE}/contents`, { cache: "no-cache" });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                _contents = data;
                try { localStorage.setItem(CONTENTS_KEY, JSON.stringify(data)); } catch {}
                _dbReady = true;
            }
        }
    } catch (e) {
        console.log("DB 로드 실패, localStorage 사용:", e.message);
    }
    // ★ 성공·실패 상관없이 리렌더 알림
    // /content/:id 직접 진입 시 구독 컴포넌트가 업데이트되도록
    _store.listeners.forEach(fn => fn());
    return _contents;
}

// 단일 콘텐츠 fetch (리스트 로드 실패 시 폴백)
export async function loadSingleContentFromDB(id) {
    try {
        const res = await fetch(`${API_BASE}/contents/${id}`, { cache: "no-cache" });
        if (!res.ok) return null;
        const item = await res.json();
        if (!item || !item.id) return null;
        // 기존 _contents에 없으면 추가
        if (!_contents.find(c => c.id === item.id)) {
            _contents = [..._contents, item];
            try { localStorage.setItem(CONTENTS_KEY, JSON.stringify(_contents)); } catch {}
            _store.listeners.forEach(fn => fn());
        }
        return item;
    } catch (e) {
        console.log("단일 콘텐츠 로드 실패:", e.message);
        return null;
    }
}

// 데이터베이스에 콘텐츠 저장
export async function saveContentsToDB(contents) {
    const bodyByTitle = {};
    mockNews.forEach(n => {
        if (contentDetails[n.id]?.content) {
            bodyByTitle[n.title] = contentDetails[n.id].content;
        }
    });
    // DB에서 기존 첨부파일 보존
    let dbAttachments = {};
    try {
        const res = await fetch(`${API_BASE}/contents`);
        if (res.ok) {
            const dbData = await res.json();
            dbData.forEach(d => {
                if (d.attachments && d.attachments.length > 0) {
                    dbAttachments[d.title] = d.attachments;
                }
            });
        }
    } catch(e) {}
    try {
        await adminFetch(`${API_BASE}/contents/bulk`, {
            method: "POST",
            body: JSON.stringify({ contents: contents.map(c => ({
                type: c.type || "news",
                tag: c.tag || "",
                case_number: c.case_number || "",
                title: c.title || "",
                date: c.date || "",
                summary: c.summary || "",
                views: c.views || 0,
                hidden: c.hidden || false,
                body: c.body || bodyByTitle[c.title] || "",
                attachments: (c.attachments && c.attachments.length > 0) ? c.attachments : (dbAttachments[c.title] || [])
            }))})
        });
    } catch (e) {
        console.log("DB 저장 실패:", e.message);
    }
}

// — contentDetails 복원
export function hydrateContentDetails() {
    try {
        const saved = localStorage.getItem(DETAILS_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(contentDetails, parsed);
        }
    } catch {}
}
