import { useState, useEffect } from "react";
import {
    MEMBERS_KEY, CONTENTS_KEY, DETAILS_KEY,
    loadFromStorage, saveToStorage,
    loadChecklist, loadCulture,
} from "./storage.js";
import { mockNews }         from "../data/mockNews.js";
import { contentDetails }   from "../data/contentDetails.js";
import { _defaultMembers }  from "../data/memberData.js";

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
    _store.submissions[type].push({
        ...data,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        submittedAt: new Date().toISOString(),
        status: "신규",
    });
    saveToStorage(_store.submissions);
    _store.listeners.forEach(fn => fn());
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

export function setContents(val) {
    _contents = val;
    // localStorage에도 저장 (백업)
    try { localStorage.setItem(CONTENTS_KEY, JSON.stringify(val)); } catch {}
    // 데이터베이스에도 저장
    saveContentsToDB(val);
}

// 데이터베이스에서 콘텐츠 불러오기
export async function loadContentsFromDB() {
    try {
        const res = await fetch(`${API_BASE}/contents`);
        if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
                _contents = data;
                try { localStorage.setItem(CONTENTS_KEY, JSON.stringify(data)); } catch {}
                return data;
            }
        }
    } catch (e) {
        console.log("DB 로드 실패, localStorage 사용:", e.message);
    }
    return _contents;
}

// 데이터베이스에 콘텐츠 저장
async function saveContentsToDB(contents) {
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
        await fetch(`${API_BASE}/contents/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: contents.map(c => ({
                type: c.type || "news",
                tag: c.tag || "",
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
