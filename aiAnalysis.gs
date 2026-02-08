function analyzeMartReceiptContent(plainBody) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) { Logger.log('Run setupGeminiKey() first'); return; }
  
  const MODEL = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  
  const prompt = `From Grab mart receipt body, extract each item's name and price (e.g., "rice P25.00"). Ignore fees: Delivery Fee, Green Programme Fee, Foreign payment method fee, service charges. Categorize items (not fees): "definitely food categories" (groceries/snacks/drinks/fruits/veg), "pharm and toiletries" (meds/shampoo/soap/toothpaste/hygiene), "others". Body: ${plainBody}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          food: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                price: { type: 'string' }
              },
              required: ['name', 'price']
            }
          },
          pharm: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                price: { type: 'string' }
              },
              required: ['name', 'price']
            }
          },
          others: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                price: { type: 'string' }
              },
              required: ['name', 'price']
            }
          }
        },
        required: ['food', 'pharm', 'others']
      }
    }
  };
  
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    Logger.log('API Error: ' + response.getContentText());
    return;
  }
  
  const data = JSON.parse(response.getContentText());
  const rawText = data.candidates[0].content.parts[0].text;
  Logger.log('Raw LLM JSON: ' + rawText);
  
  const categories = JSON.parse(rawText);
  
  Logger.log('==AI Mart Categories==');
  Logger.log('Food: ' + (categories.food?.map(i => `${i.name}: ${i.price}`).join('; ') || 'none'));
  Logger.log('Pharm/Toiletries: ' + (categories.pharm?.map(i => `${i.name}: ${i.price}`).join('; ') || 'none'));
  Logger.log('Others: ' + (categories.others?.map(i => `${i.name}: ${i.price}`).join('; ') || 'none'));
}
