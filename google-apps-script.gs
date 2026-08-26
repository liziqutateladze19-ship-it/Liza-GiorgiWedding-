/**
 * ეს კოდი ჩასვი Google Sheet-ში:
 * Extensions -> Apps Script
 *
 * Sheet-ის სახელი ავტომატურად იქნება "RSVP".
 * სურვილის შემთხვევაში NOTIFY_EMAIL-ში ჩაწერე შენი ელფოსტა.
 */
const NOTIFY_EMAIL = ""; // მაგალითად: "yourname@gmail.com"

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("RSVP");

    if (!sheet) {
      sheet = ss.insertSheet("RSVP");
      sheet.appendRow([
        "დრო",
        "სახელი და გვარი",
        "პასუხი",
        "წყარო"
      ]);
      sheet.setFrozenRows(1);
    }

    const fullName = (e.parameter.fullName || "").trim();
    const attendance = (e.parameter.attendance || "").trim();
    const source = (e.parameter.source || "").trim();

    if (!fullName || !attendance) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "missing_fields" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([
      new Date(),
      fullName,
      attendance,
      source
    ]);

    if (NOTIFY_EMAIL && NOTIFY_EMAIL.includes("@")) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: "ახალი RSVP — " + fullName,
        body:
          "სახელი და გვარი: " + fullName + "\n" +
          "პასუხი: " + attendance + "\n" +
          "დრო: " + new Date().toLocaleString()
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
