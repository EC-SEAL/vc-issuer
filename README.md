# vc-issuer
SSI Verifiable Credential Issuer for SEAL service

## Deployment
  ```
  uportissuer:
    image: endimion13/seal-issuer:0.0.3d
    environment:
      NODE_ENV: "production"
      ENDPOINT: https://dss1.aegean.gr
      HTTPS_COOKIES: "true"
      BASE_PATH: "issuer"
      SENDER_ID: "IdPms001"
      RECEIVER_ID: "IdPms001"
    ports:
      - 4000:3000
```

  ENDPOINT: the server the service is deployed at
  BASE_PATH: the base path, if for example deploying behind a reverse proxy (optional)
  SENDER_ID: SEAL MS id used for redirection token
  RECEIVER_ID: SEAL MS id used for redirection token
  