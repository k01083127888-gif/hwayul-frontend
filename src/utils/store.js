import { useState, useEffect } from "react";
import {
  MEMBERS_KEY, CONTENTS_KEY, DETAILS_KEY,
  loadFromStorage, saveToStorage,
  loadChecklist, loadCulture,
} from "./storage.js";
import { mockNews }       from "../data/mockNews.js";
import { contentDetails } from "../data/contentDetails.js";
import { _defaultMembers } from "../data/memberData.js";

// ── 제출 전역 스토어 ──────────────────────────────────────────────────────────
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

// ── 진단 중간저장 상태 ────────────────────────────────────────────────────────
export let _savedChecklist = loadChecklist();
export let _savedCulture   = loadCulture();

// ── 전문가 멤버 (localStorage 복원) ──────────────────────────────────────────
export let _members = (() => {
  try {
    const saved = localStorage.getItem(MEMBERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [..._defaultMembers];
})();

export function setMembers(val) { _members = val; }

// ── 콘텐츠 목록 (localStorage 복원) ─────────────────────────────────────────
export let _contents = (() => {
  try {
    const saved = localStorage.getItem(CONTENTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [...mockNews];
})();

export function setContents(val) { _contents = val; }

// ── contentDetails 복원 ───────────────────────────────────────────────────────
// contentDetails 객체는 data/contentDetails.js 에서 import 후
// localStorage 데이터로 덮어씁니다.
export function hydrateContentDetails() {
  try {
    const saved = localStorage.getItem(DETAILS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(contentDetails, parsed);
    }
  } catch {}
}

// 앱 초기화 시 한 번 실행
hydrateContentDetails();
