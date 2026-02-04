function printGrabEmails() {
  // Edit these dates (YYYY/MM/DD format, Manila time assumed)
  var startDate = '2026/01/15';  // 15 Jan 00:00 Manila
  var endDate = '2026/01/31';    // 31 Jan 23:59:59 Manila
  var query = 'from:no-reply@grab.com after:' + startDate + ' before:' + endDate;
  
  var totals = { food_costs: 0.0, foodCount: 0, tip_costs: 0.0, tipCount: 0 };
  
  var threads = GmailApp.search(query, 0, 500);
  var messages = GmailApp.getMessagesForThreads(threads);
  for (var i = 0; i < messages.length; i++) {
    for (var j = 0; j < messages[i].length; j++) {
      var msg = messages[i][j];
      Logger.log('Subject: ' + msg.getSubject());
      Logger.log('From: ' + msg.getFrom());
      Logger.log('Date: ' + msg.getDate());
      
      handleReceiptType(msg, totals);
      
      Logger.log('---');
    }
  }
  Logger.log('Food: ' + totals.foodCount + ' orders, PHP ' + totals.food_costs.toFixed(2));
  Logger.log('Tips: ' + totals.tipCount + ', PHP ' + totals.tip_costs.toFixed(2));
}

function handleReceiptType(msg, totals) {
  var plainBody = msg.getPlainBody();
  
  if (plainBody.indexOf('Hope you enjoyed your food!') !== -1) {
    // Food order
    var foodResult = parseFoodReceipt(plainBody);
    if (foodResult && foodResult.valid) {
      totals.food_costs += foodResult.price;
      totals.foodCount += 1;
      Logger.log('Food Total: ' + foodResult.priceLine);
    } else {
      Logger.log('No food TOTAL line found');
      Logger.log('Plain Body: ' + plainBody);
    }
  } else if (plainBody.indexOf('Thanks! Your tip goes a long way for your driver.') !== -1) {
    // Tip receipt
    var tipResult = parseTipReceipt(plainBody);
    if (tipResult && tipResult.valid) {
      totals.tip_costs += tipResult.price;
      totals.tipCount += 1;
      Logger.log('Total');
      Logger.log(tipResult.priceLine);
    } else {
      Logger.log('No tip Total found');
      Logger.log('Plain Body: ' + plainBody);
    }
  } else {
    // Default: other receipts - full body
    Logger.log('Plain Body: ' + plainBody);
  }
}

function parseFoodReceipt(body) {
  var totalMatch = body.match(/TOTAL \(INCL\. TAX\)\s+(₱\s+\d+(?:\.\d{2})?)/i);
  if (totalMatch) {
    var priceLine = totalMatch[1];
    var priceStr = priceLine.replace(/[^0-9.]/g, '');
    var priceNum = parseFloat(priceStr);
    if (!isNaN(priceNum)) {
      return { valid: true, price: priceNum, priceLine: priceLine };
    }
  }
  return null;
}

function parseTipReceipt(body) {
  var lines = body.split('\n');
  for (var i = 0; i < lines.length - 1; i++) {
    if (lines[i].trim() === 'Total') {
      var priceLine = lines[i + 1].trim();
      var priceStr = priceLine.replace(/[^0-9.]/g, '');
      var priceNum = parseFloat(priceStr);
      if (!isNaN(priceNum)) {
        return { valid: true, price: priceNum, priceLine: priceLine };
      }
    }
  }
  return null;
}
