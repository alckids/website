// ============================================================
// アルクKiddyCAT市川菅野 - 無料体験申込フォーム処理
// ============================================================

// ▼ 設定項目 ▼ --------------------------------------------------------
const ADMIN_EMAIL   = 'alckids2018@gmail.com'; // 通知先メールアドレス
const SHEET_NAME    = '申込一覧';               // スプレッドシートのシート名
const SPREADSHEET_ID = '';                      // バインド済みの場合は空欄で可
// -----------------------------------------------------------------------

/**
 * フォームからのPOSTリクエストを受け取るエントリーポイント
 */
function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    p.childName = trimValue(p.childName);
    p.childNameKana = trimValue(p.childNameKana);
    p.childBirthdate = trimValue(p.childBirthdate);
    p.childEnglishHistory = trimValue(p.childEnglishHistory);
    p.parentName = trimValue(p.parentName);
    p.email = trimValue(p.email).toLowerCase();
    p.course = trimValue(p.course);
    p.message = trimValue(p.message);

    const requiredFields = [
      ['childName', 'お子様のお名前'],
      ['childNameKana', 'ふりがな'],
      ['childBirthdate', '生年月日'],
      ['childEnglishHistory', '英語学習歴'],
      ['parentName', '保護者様のお名前'],
      ['email', 'メールアドレス'],
      ['course', 'ご希望のコース'],
    ];
    const missing = requiredFields
      .filter(([key]) => !p[key])
      .map(([, label]) => label);
    if (missing.length) {
      return buildResponse({ result: 'error', message: `未入力項目があります: ${missing.join('、')}` });
    }
    if (!isValidEmail(p.email)) {
      return buildResponse({ result: 'error', message: 'メールアドレスの形式が正しくありません' });
    }

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
    const adminSent = sendAdminNotification({
      now, childName: p.childName, childNameKana: p.childNameKana,
      gender, childBirthdate: p.childBirthdate,
      childEnglishHistory: p.childEnglishHistory,
      parentName: p.parentName, email: p.email,
      course, message: p.message,
    });

    // ── 3. 申込者へ自動返信メール ──────────────────────────────────────
    const confirmationSent = sendConfirmationEmail({
      email: p.email, parentName: p.parentName,
      childName: p.childName, course,
    });

    // 成功レスポンス（CORSヘッダー付き）
    return buildResponse({
      result: adminSent && confirmationSent ? 'success' : 'partial',
      adminSent,
      confirmationSent,
    });

  } catch (err) {
    console.error(err);
    return buildResponse({ result: 'error', message: err.message });
  }
}

function trimValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ============================================================
// スプレッドシートへ保存
// ============================================================
function saveToSheet(data) {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('スプレッドシートを開けません。GASをスプレッドシートに紐付けるか、SPREADSHEET_IDを設定してください');
  }
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

  try {
    GmailApp.sendEmail(ADMIN_EMAIL, subject, body, {
      name: 'アルクKiddyCAT市川菅野',
    });
    console.log(`管理者通知メール送信完了: ${ADMIN_EMAIL}`);
    return true;
  } catch (err) {
    console.error(`管理者通知メール送信失敗: ${err.message}`);
    return false;
  }
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

  try {
    GmailApp.sendEmail(d.email, subject, body, {
      name: 'アルクKiddyCAT市川菅野',
      replyTo: ADMIN_EMAIL,
    });
    console.log(`申込者への自動返信送信完了: ${d.email}`);
    return true;
  } catch (err) {
    console.error(`申込者への自動返信送信失敗: ${d.email}: ${err.message}`);
    return false;
  }
}

// ============================================================
// CORSを許可したJSONレスポンスを返すヘルパー
// ============================================================
function buildResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
