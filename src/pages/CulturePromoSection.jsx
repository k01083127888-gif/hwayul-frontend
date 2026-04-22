import C from "../tokens/colors.js";

// ── 메인 페이지 조직문화 진단 소개 섹션 ────────────────────────────────────
export function CulturePromoSection({ setActive }) {
  return (
    <section style={{ padding:"80px 32px", background:`linear-gradient(180deg, ${C.navy} 0%, #0D1F33 100%)` }}>
      <div style={{ maxWidth:1000, margin:"0 auto" }}>

        {/* 헤더 */}
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.tealLight, letterSpacing:"3px", marginBottom:8 }}>ORGANIZATIONAL CULTURE DIAGNOSIS</div>
          <h2 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.6rem, 3vw, 2.3rem)", fontWeight:900, color:C.cream, lineHeight:1.35, marginBottom:16 }}>
            괴롭힘은 <span style={{ color:C.tealLight }}>개인의 문제가 아닙니다</span><br/>
            <span style={{ color:C.gold }}>조직문화</span>가 만들어낸 결과입니다
          </h2>
          <p style={{ fontSize:14, color:"rgba(244,241,235,0.55)", lineHeight:1.85, maxWidth:640, margin:"0 auto" }}>
            괴롭힘이 반복되는 조직에는 공통된 구조적 원인이 있습니다.<br/>
            뷰인사이드는 <strong style={{ color:C.tealLight }}>6개 핵심 영역</strong>을 진단하여 사전에 위험을 발견하고,<br/>
            전문 노무사의 리포트로 실질적인 개선 방향을 제시합니다.
          </p>
        </div>

        {/* 괴롭힘 ↔ 조직문화 관계 */}
        <div style={{ padding:"28px 32px", background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.2)", borderRadius:16, marginBottom:40 }}>
          <div style={{ fontFamily:"'Noto Serif KR', serif", fontSize:17, fontWeight:800, color:C.cream, textAlign:"center", marginBottom:20, lineHeight:1.6 }}>
            "괴롭힘이 발생하는 조직의 <strong style={{ color:C.gold }}>87%</strong>는<br/>구조적 문화 문제를 갖고 있습니다"
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:20, alignItems:"center" }}>
            <div style={{ padding:"16px 18px", background:"rgba(192,57,43,0.08)", border:"1px solid rgba(192,57,43,0.2)", borderRadius:12 }}>
              <div style={{ fontSize:12, fontWeight:800, color:"#FF8A80", marginBottom:8 }}>🚨 방치하면</div>
              <div style={{ fontSize:12, color:"rgba(244,241,235,0.65)", lineHeight:1.75 }}>
                • 괴롭힘 반복·확산<br/>
                • 핵심 인력 이탈<br/>
                • 산재·소송 리스크 증가<br/>
                • 기업 이미지 훼손<br/>
                • 과태료 부과 (500만원 이하)
              </div>
            </div>
            <div style={{ fontSize:24, color:"rgba(244,241,235,0.3)" }}>→</div>
            <div style={{ padding:"16px 18px", background:"rgba(13,115,119,0.08)", border:"1px solid rgba(13,115,119,0.2)", borderRadius:12 }}>
              <div style={{ fontSize:12, fontWeight:800, color:C.tealLight, marginBottom:8 }}>✅ 개선하면</div>
              <div style={{ fontSize:12, color:"rgba(244,241,235,0.65)", lineHeight:1.75 }}>
                • 괴롭힘 발생률 대폭 감소<br/>
                • 직원 만족도·생산성 향상<br/>
                • 법적 리스크 사전 차단<br/>
                • 조직 신뢰도·브랜드 가치 상승<br/>
                • ESG 경영 실천
              </div>
            </div>
          </div>
        </div>

        {/* 조직문화 개선이 필요한 순간들 */}
        <div style={{ marginBottom:40 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.tealLight, letterSpacing:"2px", textAlign:"center", marginBottom:8 }}>WHEN TO IMPROVE</div>
          <div style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.2rem, 2.3vw, 1.5rem)", fontWeight:800, color:C.cream, textAlign:"center", marginBottom:8 }}>이런 상황이라면 조직문화 개선이 필요합니다</div>
          <p style={{ fontSize:13, color:"rgba(244,241,235,0.5)", textAlign:"center", marginBottom:24, lineHeight:1.7 }}>
            괴롭힘 예방은 조직문화 개선의 한 부분일 뿐입니다.<br/>
            건강한 조직문화는 인재 유치·생산성·브랜드 가치까지 직결됩니다.
          </p>
          <div className="content-grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
            {[
              { icon:"👥", title:"MZ세대 이탈이 잦다", desc:"입사 1~2년 만에 나가는 직원이 많다면, 문제는 개인이 아닌 조직문화입니다.", color:"#E74C3C" },
              { icon:"🤝", title:"세대·부서 갈등이 심하다", desc:"관리자-실무자, 본사-현장, 세대 간 소통 단절이 반복되면 개선 신호입니다.", color:C.gold },
              { icon:"📣", title:"평가·보상에 불만이 크다", desc:"공정성 논란은 사기 저하와 집단 반발로 직결됩니다. 제도 재설계가 필요합니다.", color:C.blue },
              { icon:"🎯", title:"ESG·DEI 대응 필요", desc:"투자자·구직자가 기업 문화를 평가하는 시대. 체계적 대응이 필요합니다.", color:"#8E44AD" },
              { icon:"⚠️", title:"사건·사고가 반복된다", desc:"괴롭힘·성희롱·내부고발이 반복된다면 제도와 문화 양쪽 모두 점검이 필요합니다.", color:C.red },
              { icon:"📈", title:"급성장 스케일업 단계", desc:"인원이 빠르게 늘 때 기존 문화가 희석됩니다. 가치관·규범의 재정립이 필요합니다.", color:"#2ECC71" },
            ].map(item => (
              <div key={item.title} style={{
                padding:"22px 22px",
                background:`linear-gradient(135deg, ${item.color}18, rgba(255,255,255,0.03))`,
                border:`1.5px solid ${item.color}55`,
                borderRadius:14,
                transition:"all 0.25s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = `${item.color}AA`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = `${item.color}55`; }}
              >
                <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:44, height:44, borderRadius:"50%", background:`${item.color}25`, border:`1px solid ${item.color}60`, fontSize:22, marginBottom:12 }}>{item.icon}</div>
                <div style={{ fontSize:15, fontWeight:800, color:C.cream, marginBottom:8, lineHeight:1.4 }}>{item.title}</div>
                <div style={{ fontSize:12.5, color:"rgba(244,241,235,0.7)", lineHeight:1.75 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 기대 효과 */}
        <div style={{ marginBottom:40, padding:"28px 32px", background:"rgba(13,115,119,0.06)", border:"1px solid rgba(13,115,119,0.25)", borderRadius:16 }}>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.tealLight, letterSpacing:"2px", marginBottom:6 }}>EXPECTED OUTCOMES</div>
            <div style={{ fontFamily:"'Noto Serif KR', serif", fontSize:17, fontWeight:800, color:C.cream }}>조직문화 개선으로 얻는 변화</div>
          </div>
          <div className="content-grid-4" style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
            {[
              { metric:"이직률", change:"감소", desc:"우수 인력 유지", color:C.teal },
              { metric:"생산성", change:"향상", desc:"몰입도·효율성 증가", color:C.gold },
              { metric:"브랜드 가치", change:"상승", desc:"채용 경쟁력·ESG", color:"#8E44AD" },
              { metric:"법적 리스크", change:"차단", desc:"분쟁·과태료 예방", color:C.red },
            ].map(o => (
              <div key={o.metric} style={{ padding:"16px 14px", background:"rgba(10,22,40,0.5)", border:`1px solid ${o.color}40`, borderRadius:10, textAlign:"center" }}>
                <div style={{ fontSize:11, color:"rgba(244,241,235,0.5)", marginBottom:4 }}>{o.metric}</div>
                <div style={{ fontSize:18, fontWeight:900, color:o.color, marginBottom:4 }}>{o.change}</div>
                <div style={{ fontSize:10, color:"rgba(244,241,235,0.5)", lineHeight:1.5 }}>{o.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 6개 진단 영역 */}
        <div style={{ marginBottom:40 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.gold, letterSpacing:"2px", textAlign:"center", marginBottom:20 }}>6개 핵심 진단 영역</div>
          <div className="content-grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
            {[
              { icon:"🏗️", title:"조직 구조·권력 집중도", desc:"권한 집중과 견제 장치 부재가 괴롭힘의 온상이 됩니다", color:"#C0392B" },
              { icon:"💬", title:"소통·피드백 문화", desc:"일방적 지시와 소통 단절이 갈등을 키웁니다", color:"#E67E22" },
              { icon:"⚖️", title:"공정성·투명성", desc:"불공정한 평가·보상이 조직 내 불만을 증폭시킵니다", color:C.gold },
              { icon:"🛡️", title:"심리적 안전감", desc:"보복 두려움이 신고를 가로막고 문제를 은폐합니다", color:C.teal },
              { icon:"📋", title:"제도·규정 정비도", desc:"괴롭힘 예방 규정과 처리 절차의 실효성을 점검합니다", color:C.blue },
              { icon:"🎓", title:"교육·인식 수준", desc:"구성원의 괴롭힘 인식 수준이 예방의 첫걸음입니다", color:C.purple },
            ].map(item => (
              <div key={item.title} style={{ padding:"20px 18px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, borderTop:`3px solid ${item.color}` }}>
                <div style={{ fontSize:24, marginBottom:10 }}>{item.icon}</div>
                <div style={{ fontSize:13, fontWeight:800, color:C.cream, marginBottom:6 }}>{item.title}</div>
                <div style={{ fontSize:11.5, color:"rgba(244,241,235,0.55)", lineHeight:1.65 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 진단 → 리포트 플로우 */}
        <div style={{ padding:"24px 28px", background:"rgba(13,115,119,0.06)", border:"1.5px solid rgba(13,115,119,0.25)", borderRadius:16, marginBottom:40 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.tealLight, letterSpacing:"2px", textAlign:"center", marginBottom:20 }}>진단에서 개선까지</div>
          <div style={{ display:"flex", justifyContent:"center", gap:0, flexWrap:"wrap" }}>
            {[
              { step:"1", label:"무료 자가진단", desc:"6개 영역 30문항", icon:"📝" },
              { step:"2", label:"위험도 분석", desc:"영역별 등급 산출", icon:"📊" },
              { step:"3", label:"전문 리포트", desc:"노무사 검토 33만원", icon:"📄" },
              { step:"4", label:"개선 실행", desc:"우선순위별 로드맵", icon:"🎯" },
            ].map((s, i) => (
              <div key={s.step} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ textAlign:"center", minWidth:120, padding:"12px 8px" }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:C.teal, color:"white", fontWeight:800, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px" }}>{s.step}</div>
                  <div style={{ fontSize:13, fontWeight:800, color:C.cream, marginBottom:3 }}>{s.label}</div>
                  <div style={{ fontSize:10, color:"rgba(244,241,235,0.45)" }}>{s.desc}</div>
                </div>
                {i < 3 && <div style={{ width:24, height:2, background:`linear-gradient(90deg, ${C.teal}, ${C.gold})`, flexShrink:0 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign:"center" }}>
          <button
            onClick={() => setActive("culture")}
            style={{
              padding:"16px 48px", borderRadius:12,
              background:`linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
              border:"none", color:"white", fontWeight:800, fontSize:16,
              cursor:"pointer", fontFamily:"inherit",
              boxShadow:`0 8px 32px rgba(13,115,119,0.35)`,
              transition:"all 0.25s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(13,115,119,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 32px rgba(13,115,119,0.35)"; }}
          >
            🏢 조직문화 무료 자가진단 시작하기 →
          </button>
          <div style={{ marginTop:12, fontSize:11, color:"rgba(244,241,235,0.35)" }}>
            소요 시간 약 10분 · 결과 즉시 확인 · 전문 리포트(33만원) 별도 신청 가능
          </div>
        </div>
      </div>
    </section>
  );
}
