// Google Fonts API에서 CSS를 읽어 현재 TTF URL 추출 후 다운로드
const https = require("https");
const fs = require("fs");
const path = require("path");

const FONT_DIR = path.join(__dirname, "..", "public", "fonts");
if (!fs.existsSync(FONT_DIR)) fs.mkdirSync(FONT_DIR, { recursive: true });

const fontFamilies = [
  { id: "BlackHanSans", family: "Black+Han+Sans" },
  { id: "Hahmlet", family: "Hahmlet:wght@900" },
  { id: "GowunBatang", family: "Gowun+Batang:wght@700" },
  { id: "SingleDay", family: "Single+Day" },
  { id: "Jua", family: "Jua" },
  { id: "EastSeaDokdo", family: "East+Sea+Dokdo" },
  { id: "NanumPenScript", family: "Nanum+Pen+Script" },
  { id: "Gugi", family: "Gugi" },
];

function fetch(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: opts.headers || { "User-Agent": "Mozilla/5.0" }
    }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetch(res.headers.location, opts).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      if (opts.binary) {
        const chunks = [];
        res.on("data", c => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      } else {
        let data = "";
        res.on("data", c => data += c);
        res.on("end", () => resolve(data));
      }
    });
    req.on("error", reject);
  });
}

(async () => {
  for (const { id, family } of fontFamilies) {
    process.stdout.write(`${id}... `);
    try {
      // 1) CSS 가져오기 (Korean subset 받으려면 UA가 필요)
      const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}&display=swap`);
      // 2) TTF URL 추출 — url(https://...ttf)
      const m = css.match(/url\((https:\/\/[^)]+\.ttf)\)/);
      if (!m) throw new Error("TTF URL 못 찾음");
      const ttfUrl = m[1];
      const ttfData = await fetch(ttfUrl, { binary: true });
      const dest = path.join(FONT_DIR, `${id}.ttf`);
      fs.writeFileSync(dest, ttfData);
      console.log(`✓ ${(ttfData.length / 1024).toFixed(1)} KB`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }
})();
