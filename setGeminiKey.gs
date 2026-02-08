function setupGeminiKey() {
  PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', 'AIza<your key here>');
  Logger.log('Key stored.');
}
