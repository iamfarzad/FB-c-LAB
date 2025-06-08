# Google Translation API

The Google Translation API provides a simple programmatic interface for translating an arbitrary string into any supported language.

## Request

The API takes a POST request with the following parameters:

* `q` (required): The text to be translated.
* `target` (required): The language code of the target language (e.g., `es` for Spanish, `fr` for French).
* `source` (optional): The language code of the source language. If not provided, the API will attempt to detect the source language automatically.

Example request:

```
POST /language/translate/v2
{
  "q": "Hello world",
  "target": "es"
}
```

## Response

The API returns a JSON object with the following fields:

* `data`: An object containing the translations.
    * `translations`: An array of translation results.
        * `translatedText`: The translated text.
        * `detectedSourceLanguage` (optional): The detected source language code, only present if the `source` parameter was not provided in the request.

Example response:

```json
{
  "data": {
    "translations": [
      {
        "translatedText": "Hola mundo",
        "detectedSourceLanguage": "en"
      }
    ]
  }
}
```

## Error Handling

The API uses standard HTTP status codes to indicate errors. Some common error codes include:

* `400 Bad Request`: A required parameter is missing or invalid.
* `401 Unauthorized`: The API key is missing or invalid.
* `500 Internal Server Error`: An unexpected error occurred on the server.

## Supported Languages

A list of supported languages can be found at [https://cloud.google.com/translate/docs/languages](https://cloud.google.com/translate/docs/languages).
