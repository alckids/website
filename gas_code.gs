// ============================================================
// アルクKiddyCAT市川菅野 - 無料体験申込フォーム処理
// ============================================================

// ▼ 設定項目 ▼ --------------------------------------------------------
const ADMIN_EMAIL   = 'alckids2018@gmail.com'; // 通知先メールアドレス
const SHEET_NAME    = '申込一覧';               // スプレッドシートのシート名
// -----------------------------------------------------------------------

/**
 * フォームからのPOSTリクエストを受け取るエントリーポイント
 */
function doPost(e) {
  try {
    const p = e.parameter;

    // 性別の値を日本語に変換
    const genderMap = { male: '男の子', female: '女の子', no_answer: '答えたくない' };
    const gender = genderMap[p.childGender] || '未回答';

    // コース名を日本語に変換
    const courseMap = {
      preschool:   '4〜5歳コース',
      elementary:  '小学生コース',
      junior_high: '中学生コース',
    };
    const course = courseMap[p.course] || p.course || '未選択';

    // 申込日時
    const now = new Date();

    // ── 1. スプレッドシートへ記録 ──────────────────────────────────────
    saveToSheet({
      timestamp:           now,
      childName:           p.childName           || '',
      childNameKana:       p.childNameKana        || '',
      childGender:         gender,
      childBirthdate:      p.childBirthdate       || '',
      childEnglishHistory: p.childEnglishHistory  || '',
      parentName:          p.parentName           || '',
      email:               p.email                || '',
      course:              course,
      message:             p.message              || '',
    });

    // ── 2. 管理者へ通知メール ──────────────────────────────────────────
    sendAdminNotification({
      now, childName: p.childName, childNameKana: p.childNameKana,
      gender, childBirthdate: p.childBirthdate,
      childEnglishHistory: p.childEnglishHistory,
      parentName: p.parentName, email: p.email,
      course, message: p.message,
    });

    // ── 3. 申込者へ自動返信メール ──────────────────────────────────────
    sendConfirmationEmail({
      email: p.email, parentName: p.parentName,
      childName: p.childName, course,
    });

    // 成功レスポンス（CORSヘッダー付き）
    return buildResponse({ result: 'success' });

  } catch (err) {
    console.error(err);
    return buildResponse({ result: 'error', message: err.message });
  }
}

// ============================================================
// スプレッドシートへ保存
// ============================================================
function saveToSheet(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  // シートがなければ新規作成してヘッダーを書く
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      '申込日時', 'お子様のお名前', 'ふりがな', '性別', '生年月日',
      '英語学習歴', '保護者様のお名前', 'メールアドレス',
      'ご希望のコース', 'ご質問・ご要望',
    ]);
    // ヘッダー行を固定・太字に
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
  }

  sheet.appendRow([
    data.timestamp,
    data.childName,
    data.childNameKana,
    data.childGender,
    data.childBirthdate,
    data.childEnglishHistory,
    data.parentName,
    data.email,
    data.course,
    data.message,
  ]);
}

// ============================================================
// 管理者への通知メール
// ============================================================
function sendAdminNotification(d) {
  const subject = `【無料体験申込】${d.childName} 様（${d.course}）`;

  const body = `
無料体験レッスンのお申し込みがありました。

■ お子様について
  お名前　　：${d.childName}（${d.childNameKana}）
  性　別　　：${d.gender}
  生年月日　：${d.childBirthdate}
  英語学習歴：${d.childEnglishHistory}

■ 保護者様のお名前
  ${d.parentName}

■ メールアドレス
  ${d.email}

■ ご希望のコース
  ${d.course}

■ ご質問・ご要望
  ${d.message || '（なし）'}

■ 申込日時
  ${Utilities.formatDate(d.now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss')}
`.trim();

  GmailApp.sendEmail(ADMIN_EMAIL, subject, body);
}

// ============================================================
// 申込者への自動返信メール
// ============================================================
function sendConfirmationEmail(d) {
  const subject = '【アルクKiddyCAT市川菅野】無料体験レッスンのお申し込みを受け付けました';

  const body = `
${d.parentName} 様

この度は、アルクKiddyCAT市川菅野へ無料体験レッスンのお申し込みをいただき、誠にありがとうございます。

以下の内容でお申し込みを受け付けました。

  お子様のお名前：${d.childName}
  ご希望のコース：${d.course}

担当者より3営業日以内にご連絡させていただきます。
しばらくお待ちください。

なお、このメールは自動送信です。返信はできませんのでご了承ください。
ご不明な点がございましたら、下記のメールアドレスへお問い合わせください。

─────────────────────────────
アルクKiddyCAT市川菅野
メール：alckids2018@gmail.com
住所　：千葉県市川市菅野5-10-22
─────────────────────────────
`.trim();

  GmailApp.sendEmail(d.email, subject, body);
}

// ============================================================
// CORSを許可したJSONレスポンスを返すヘルパー
// ============================================================
function buildResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
