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
      MEMCACHED_URL: memcached:11211
    ports:
      - 4000:3000

  memcached:
    image: sameersbn/memcached:1.5.6-2
    ports:
      - 11112:11211    
```
```
  ENDPOINT: the server the service is deployed at
  BASE_PATH: the base path, if for example deploying behind a reverse proxy (optional)
  SENDER_ID: SEAL MS id used for redirection token
  RECEIVER_ID: SEAL MS id used for redirection token

-- optional if not set default values are used
SEAL_SM_URI : defaults to 'vm.project-seal.eu'
SEAL_SM_PORT: defaults to '9090'
SEAL_EIDAS_URI: defaults to 'vm.project-seal.eu'
SEAL_EIDAS_PORT: defaults to '8091'
SEAL_EDUGAIN_URI: defaults to 'vm.project-seal.eu'
SEAL_EDUGAIN_PORT: defaults to ''


```
  