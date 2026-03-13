import C from "../../tokens/colors.js";

export function PrivacyPolicyModal({ isOpen, onClose, dark=false }) {
  if (!isOpen) return null;
  const sections = [
    { t:"제1조 (수집하는 개인정보 항목)", c:"화율인사이드는 서비스 제공을 위해 다음의 개인정보를 수집합니다.\n\n• 필수항목: 성명, 이메일 주소, 연락처(전화번호)\n• 선택항목: 소속 기업/기관명, 직위, 기업 규모, 상담 내용, 피해 상황 기술\n• 자동 수집 항목: 서비스 이용 기록, 접속 일시, IP 주소" },
    { t:"제2조 (개인정보의 수집 및 이용 목적)", c:"수집된 개인정보는 다음 목적을 위해 이용됩니다.\n\n• 진단 결과 리포트 발송 및 전문 노무사 검토 리포트 제공\n• 상담 예약 확인 및 노무사 배정\n• 피해자 구제 신청 접수 및 진행 상황 안내\n• 서비스 개선을 위한 통계 분석 (비식별 처리)\n• 마케팅 정보 수신 동의자에 한한 교육·세미나·법령 개정 안내" },
    { t:"제3조 (개인정보의 보유 및 이용 기간)", c:"개인정보는 수집·이용 목적이 달성된 후 다음과 같이 보유됩니다.\n\n• 상담·진단 관련 정보: 수집일로부터 1년\n• 계약 또는 청약 철회에 관한 기록: 5년 (전자상거래법)\n• 본인 확인에 관한 기록: 6개월 (정보통신망법)\n• 이용자는 언제든 개인정보 삭제를 요청할 수 있으며, 요청 즉시 처리됩니다." },
    { t:"제4조 (개인정보의 제3자 제공)", c:"화율인사이드는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 다음의 경우에는 예외로 합니다.\n\n• 이용자가 사전에 동의한 경우\n• 법령의 규정에 의하거나 수사·조사 목적으로 법령에 정해진 절차에 따라 요청이 있는 경우\n• 담당 노무사에 한하여 상담·구제 목적으로 열람 (노무사법 제37조 비밀유지 의무 적용)" },
    { t:"제5조 (개인정보의 파기 절차 및 방법)", c:"개인정보는 보유 기간 경과 후 지체 없이 파기합니다.\n\n• 전자적 파일: 복원 불가능한 방법으로 영구 삭제\n• 종이 문서: 분쇄기로 분쇄 또는 소각 처리" },
    { t:"제6조 (이용자의 권리와 행사 방법)", c:"이용자는 다음의 권리를 행사할 수 있습니다.\n\n• 개인정보 열람, 정정, 삭제, 처리 정지 요청\n• 동의 철회 요청\n• 요청 방법: 이메일(hwayulinside@gmail.com) 또는 전화(02-2088-1767)\n• 요청 접수 후 10일 이내 처리 완료" },
    { t:"제7조 (개인정보 보호책임자)", c:"성명: 김재정 (대표 노무사)\n이메일: hwayulinside@gmail.com\n전화: 02-2088-1767\n\n개인정보 관련 불만·피해구제는 한국인터넷진흥원(KISA) 개인정보침해신고센터(118), 개인정보분쟁조정위원회(1833-6972)에 신고하실 수 있습니다." },
    { t:"제8조 (시행일)", c:"본 개인정보 처리방침은 2025년 1월 1일부터 시행합니다." },
  ];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.7)", backdropFilter:"blur(6px)", zIndex:10001, display:"flex", alignItems:"center", justifyContent:"center", padding:32 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="modal-box" style={{ background:dark ? C.navyMid : "white", borderRadius:16, padding:36, maxWidth:680, width:"100%", maxHeight:"85vh", overflow:"auto", boxShadow:"0 24px 80px rgba(10,22,40,0.3)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:"2px", color:C.teal, fontWeight:700, textTransform:"uppercase" }}>Privacy Policy</div>
            <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:20, fontWeight:900, color:dark ? C.cream : C.navy, marginTop:4 }}>개인정보 처리방침</h3>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, color:dark ? "rgba(244,241,235,0.4)" : C.gray, cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ padding:"12px 16px", background:dark ? "rgba(13,115,119,0.08)" : "rgba(13,115,119,0.05)", borderRadius:8, marginBottom:24, borderLeft:`3px solid ${C.teal}` }}>
          <p style={{ fontSize:12, color:dark ? "rgba(244,241,235,0.6)" : C.gray, lineHeight:1.7, margin:0 }}>
            화율인사이드(이하 "회사")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>
        </div>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom:20, paddingBottom:20, borderBottom:i < sections.length-1 ? `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(10,22,40,0.06)"}` : "none" }}>
            <h4 style={{ fontSize:14, fontWeight:800, color:dark ? C.cream : C.navy, marginBottom:8 }}>{s.t}</h4>
            <div style={{ fontSize:12, color:dark ? "rgba(244,241,235,0.55)" : C.gray, lineHeight:1.85, whiteSpace:"pre-wrap" }}>{s.c}</div>
          </div>
        ))}
        <button onClick={onClose} style={{ width:"100%", padding:14, borderRadius:10, background:C.teal, border:"none", color:"white", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit", marginTop:8 }}>확인</button>
      </div>
    </div>
  );
}
