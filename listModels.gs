function listGeminiModels() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = UrlFetchApp.fetch(url);
  const data = JSON.parse(response.getContentText());
  Logger.log('Available models:');
  data.models.forEach(m => {
    if (m.supportedGenerationMethods.includes('generateContent')) {
      Logger.log(m.name + ' (' + m.displayName + ')');
    }
  });
}
