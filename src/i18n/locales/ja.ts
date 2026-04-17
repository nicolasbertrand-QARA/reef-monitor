export default {
  tabs: { dashboard: 'ダッシュボード', log: '記録', trends: 'トレンド', settings: '設定' },
  params: { temperature: '水温', salinity: '塩分濃度', ph: 'pH', alkalinity: 'アルカリ度', calcium: 'カルシウム', magnesium: 'マグネシウム', nitrate: '硝酸塩', phosphate: 'リン酸塩' },
  dashboard: { waterChemistry: '水質', nutrients: '栄養塩', ratioNO3PO4: 'NO3:PO4比', ionicBalance: 'イオンバランス', noData: 'データなし' },
  log: { subtitle: 'パラメータをタップして記録', cancel: 'キャンセル', save: '保存', saving: '保存中...', step: 'ステップ' },
  timers: { title: 'Salifertタイマー', shake: '30秒振る', wait: '3分待つ', start: '開始', cancel: 'キャンセル', done: '完了' },
  trends: { consumptionRate: '消費速度', consumptionHigh: '高消費 — サンゴが活発に成長中', consumptionNormal: '正常 — 安定した吸収', consumptionStable: '安定 — 変化なし', consumptionRising: '上昇中 — 添加量を確認', history: '履歴', noReadings: 'この期間の測定値なし', deleteTitle: '測定値を削除', deleteMessage: '%{date}の%{value} %{unit}?', deleteConfirm: '削除' },
  chart: { noReadings: '測定値なし', noReadingsHint: '%{param}の最初の測定値を記録してトレンドを表示', current: '現在', min: '最小', max: '最大', avg: '平均' },
  settings: { thresholds: 'アラートしきい値', data: 'データ', dosingLog: '添加記録', exportCsv: 'CSVエクスポート', noDataExport: 'データなし', noDataExportMsg: 'エクスポートする測定値がありません。', save: '保存', warnLow: '警告下限', warnHigh: '警告上限', critLow: '危険下限', critHigh: '危険上限' },
  dosing: { title: '添加記録', add: '添加を記録', empty: '添加記録なし', emptyHint: '添加を記録してパラメータの変化と関連付けましょう', product: '製品', productPlaceholder: '製品名を入力...', amount: '量', notes: 'メモ', notesPlaceholder: '任意...', cancel: 'キャンセル', save: '保存', products: { kalkwasser: 'カルクワッサー', allForReef: 'All-for-Reef', caBalling: 'Ca（バリング）', alkBalling: 'Alk（バリング）', mgSupplement: 'Mg添加剤', aminoAcids: 'アミノ酸', coralFood: 'サンゴフード' } },
  ratios: { po4Undetectable: 'NO3上昇時にPO4検出不可 — シアノ/ディノリスク', no3Undetectable: 'PO4上昇時にNO3検出不可 — 栄養塩バランス不良', insufficientData: 'データ不足', ratioLow: 'NO3:PO4比が低い（%{ratio}:1）— リン酸塩過剰', ratioHigh: 'NO3:PO4比が高い（%{ratio}:1）— 硝酸塩過剰', ratioOk: 'NO3:PO4比 %{ratio}:1', mgLow: 'Caに対してMgが低すぎる — まずMgを上げる', mgHigh: 'Caに対してMgが高すぎる', mgInstability: 'Mg低下がCa/Alk不安定の原因の可能性', ionicOk: 'Ca/Alk/Mgバランス OK' },
};
