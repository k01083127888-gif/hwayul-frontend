// ── 전역 스토리지 키 ──────────────────────────────────────────────────────────
export const STORAGE_KEY   = "hwayul_submissions_v2";
export const CHECKLIST_KEY = "hwayul_checklist_v1";
export const CULTURE_KEY   = "hwayul_culture_v1";
export const ACCUSED_KEY   = "hwayul_accused_v1";
export const SANJAE_KEY    = "hwayul_sanjae_v1";
export const COMPANY_KEY   = "hwayul_company_v1";
export const CONTENTS_KEY  = "hwayul_contents_v1";
export const DETAILS_KEY   = "hwayul_details_v1";
export const MEMBERS_KEY   = "hwayul_members_v1";

// ── 제출 데이터 (localStorage 영속성) ───────────────────────────────────────
export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (!data.newsletters)     data.newsletters = [];
      if (!data.sentNewsletters) data.sentNewsletters = [];
      return data;
    }
  } catch {}
  return {
    reports:[], biz:[], relief:[], resultEmails:[],
    reviewRequests:[], lectures:[], advisory:[], consulting:[],
    newsletters:[], sentNewsletters:[]
  };
}

export function saveToStorage(submissions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions)); } catch {}
}

// ── 진단 중간저장 ─────────────────────────────────────────────────────────────
export function loadChecklist() {
  try { const r = localStorage.getItem(CHECKLIST_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
export function saveChecklist(data) {
  try {
    if (data) localStorage.setItem(CHECKLIST_KEY, JSON.stringify(data));
    else       localStorage.removeItem(CHECKLIST_KEY);
  } catch {}
}

export function loadCulture() {
  try { const r = localStorage.getItem(CULTURE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
export function saveCulture(data) {
  try {
    if (data) localStorage.setItem(CULTURE_KEY, JSON.stringify(data));
    else       localStorage.removeItem(CULTURE_KEY);
  } catch {}
}

export function loadAccused() {
  try { const r = localStorage.getItem(ACCUSED_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
export function saveAccused(data) {
  try {
    if (data) localStorage.setItem(ACCUSED_KEY, JSON.stringify(data));
    else       localStorage.removeItem(ACCUSED_KEY);
  } catch {}
}

export function loadSanjae() {
  try { const r = localStorage.getItem(SANJAE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
export function saveSanjae(data) {
  try {
    if (data) localStorage.setItem(SANJAE_KEY, JSON.stringify(data));
    else       localStorage.removeItem(SANJAE_KEY);
  } catch {}
}

export function loadCompany() {
  try { const r = localStorage.getItem(COMPANY_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
export function saveCompany(data) {
  try {
    if (data) localStorage.setItem(COMPANY_KEY, JSON.stringify(data));
    else       localStorage.removeItem(COMPANY_KEY);
  } catch {}
}

// ── 관리자 데이터 저장 ─────────────────────────────────────────────────────────
export function saveMembers(members) {
  try { localStorage.setItem(MEMBERS_KEY, JSON.stringify(members)); } catch {}
}

export function saveContents(contents) {
  try { localStorage.setItem(CONTENTS_KEY, JSON.stringify(contents)); } catch {}
}

export function saveDetails(contentDetails) {
  try { localStorage.setItem(DETAILS_KEY, JSON.stringify(contentDetails)); } catch {}
}
