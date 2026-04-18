export default {
  tabs: { dashboard: '대시보드', log: '기록', trends: '추세', dosing: '보정', settings: '설정' },
  params: { temperature: '수온', salinity: '염도', ph: 'pH', alkalinity: '알칼리도', calcium: '칼슘', magnesium: '마그네슘', nitrate: '질산염', phosphate: '인산염' },
  dashboard: { waterChemistry: '수질', nutrients: '영양염', ratioNO3PO4: 'NO3:PO4 비율', ionicBalance: '이온 균형', noData: '데이터 없음' },
  log: { subtitle: '매개변수를 탭하여 기록', cancel: '취소', save: '저장', saving: '저장 중...', step: '단계' },
  timers: { title: 'Salifert 타이머', shake: '30초 흔들기', wait: '3분 대기', start: '시작', cancel: '취소', done: '완료' },
  trends: { consumptionRate: '소비율', consumptionHigh: '높은 소비 — 산호가 활발히 성장 중', consumptionNormal: '정상 — 안정적인 흡수', consumptionStable: '안정 — 순변화 없음', consumptionRising: '상승 중 — 첨가량 확인', history: '기록', noReadings: '이 기간에 측정값 없음', deleteTitle: '측정값 삭제', deleteMessage: '%{date}의 %{value} %{unit}?', deleteConfirm: '삭제' },
  chart: { noReadings: '측정값 없음', noReadingsHint: '%{param}의 첫 측정값을 기록하여 추세를 확인하세요', current: '현재', min: '최소', max: '최대', avg: '평균' },
  settings: { thresholds: '알림 임계값', data: '데이터', dosingLog: '첨가 기록', exportCsv: 'CSV 내보내기', noDataExport: '데이터 없음', noDataExportMsg: '내보낼 측정값이 없습니다.', save: '저장', importCsv: 'CSV 백업 가져오기', importSuccess: '가져오기 완료', importSuccessMsg: '%{count}개의 측정값을 가져왔습니다.', importError: '가져오기 실패', warnLow: '경고 하한', warnHigh: '경고 상한', critLow: '위험 하한', critHigh: '위험 상한' },
  dosing: { title: '첨가 기록', add: '첨가 추가', empty: '첨가 기록 없음', emptyHint: '첨가를 기록하여 매개변수 변화와 연관시키세요', product: '제품', productPlaceholder: '제품명 입력...', amount: '양', notes: '메모', notesPlaceholder: '선택사항...', cancel: '취소', save: '저장', products: { kalkwasser: 'Kalkwasser', allForReef: 'All-for-Reef', caBalling: 'Ca (발링)', alkBalling: 'Alk (발링)', mgSupplement: 'Mg 보충제', aminoAcids: '아미노산', coralFood: '산호 먹이' } },
  ratios: { po4Undetectable: 'NO3 상승 시 PO4 미검출 — 시아노/디노 위험', no3Undetectable: 'PO4 상승 시 NO3 미검출 — 영양염 불균형', insufficientData: '데이터 부족', ratioLow: 'NO3:PO4 비율 낮음 (%{ratio}:1) — 인산염 과잉', ratioHigh: 'NO3:PO4 비율 높음 (%{ratio}:1) — 질산염 과잉', ratioOk: 'NO3:PO4 비율 %{ratio}:1', mgLow: 'Ca 대비 Mg 너무 낮음 — Mg 먼저 올리기', mgHigh: 'Ca 대비 Mg 너무 높음', mgInstability: '낮은 Mg가 Ca/Alk 불안정을 유발할 수 있음', ionicOk: 'Ca/Alk/Mg 균형 OK' },
};
