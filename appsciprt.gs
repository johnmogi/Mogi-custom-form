function doPost(e) {
  Logger.log("doPost function called."); // Log function call

  var sheetName = e.parameter["sheet-name"];
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log("Sheet not found.");
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", message: "Sheet not found" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = headers.map((header) => {
    var value = e.parameter[header] ? e.parameter[header] : "";

    // Check if the header is for the phone number and ensure it's treated as a string
    if (header === "phone-number" && value) {
      value = "'" + value; // Prepend a single quote to force string interpretation
    }

    return value;
  });

  // Append the new row to the Sheet
  sheet.appendRow(newRow);

  var formIdentifier = e.parameter["form-identifier"]
    ? e.parameter["form-identifier"]
    : "UnknownForm";
  var submissionData = newRow.join(", "); // Using comma as a delimiter

  Logger.log("Form Identifier: " + formIdentifier); // Log form identifier
  Logger.log("Submission Data: " + submissionData); // Log submission data

  // Save to a designated text file
  saveToTextFile(formIdentifier, submissionData);

  // Send email
  var subject = "New lead from site: " + formIdentifier;
  var body = "New lead details:\n\n" + submissionData;
  sendEmail(subject, body);

  // Return a JSON response
  return ContentService.createTextOutput(
    JSON.stringify({ result: "success" })
  ).setMimeType(ContentService.MimeType.JSON);
}
