# tests/integration/post-fragments-unsupported-type.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a xml text fragment
Content-Type: text/xml
# Body of the request goes in ```...``` when it's a string
```<name>This is a fragment!</name>```

# 1. We expect to get back an HTTP 201
HTTP/1.1 415

# We have various assertions about the response that we want to check
[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect to get back a JSON response with {  "code": 415, ... }
jsonpath "$.error.code" == 415

