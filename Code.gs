// Config
const CONFIG = {
  START_DATE: '2026/01/15',
  END_DATE: '2026/01/31',
  QUERY_BASE: 'from:no-reply@grab.com after:${start} before:${end}',
  MAX_THREADS: 500
};

const CATEGORY_PARSERS = {
  food: { keyword: 'Hope you enjoyed your food!', parser: parseFoodReceipt },
  taxi: { keyword: 'Hope you enjoyed your ride!', parser: parseTaxiReceipt },
  tip: { keyword: 'Thanks! Your tip goes a long way for your driver.', parser: parseTipReceipt },
  mart: { keyword: 'Thanks for shopping with us!', parser: parseMartReceipt }
};

function analizeGrabEmails() {
  const totals = { foodCosts: 0, foodCount: 0, tipCosts: 0, tipCount: 0, taxiCosts: 0, taxiCount: 0, martCosts: 0, martCount: 0 };
  
  const query = CONFIG.QUERY_BASE.replace('${start}', CONFIG.START_DATE).replace('${end}', CONFIG.END_DATE);
  const threads = GmailApp.search(query, 0, CONFIG.MAX_THREADS);
  const messages = GmailApp.getMessagesForThreads(threads);
  
  messages.flat().forEach(msg => processMessage(msg, totals));
  
  logSummary(totals);
}

function processMessage(msg, totals) {
  const body = msg.getPlainBody();
  const category = findCategory(body);
  
  if (!category) {
    Logger.log(`Unknown: ${msg.getSubject()}`);
    return;
  }
  
  try {
    const result = category.parser(body);
    if (result?.valid) {
      totals[`${category.key}Costs`] += result.price;
      totals[`${category.key}Count`]++;
      logReceipt(category.key, result);
    }
  } catch (e) {
    Logger.log(`Parse error ${category.key}: ${e}`);
  }
}

function findCategory(body) {
  for (const [key, { keyword, parser }] of Object.entries(CATEGORY_PARSERS)) {
    if (body.includes(keyword)) return { key, parser };
  }
  return null;
}

function logReceipt(type, result) {
  Logger.log(`==${type.toUpperCase()}== ${result.priceLine} → PHP ${result.price.toFixed(2)}`);
}

function logSummary(totals) {
  Object.entries(totals).forEach(([key, value]) => {
    if (key.endsWith('Count') && value > 0) {
      const cat = key.replace('Count', '');
      Logger.log(`${cat}: ${value} , PHP ${totals[`${cat}Costs`].toFixed(2)}`);
    }
  });
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

function parseTaxiReceipt(body) {
  var lines = body.split('\n');
  for (var i = 0; i < lines.length - 1; i++) {
    if (lines[i].trim() === 'Total Paid') {
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

function parseMartReceipt(body) {
  var totalMatch = body.match(/Total \(Including tax\)\s+(₱\s+\d+(?:\.\d{2})?)/i);
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
