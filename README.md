# Wi-Pi Touch

This is a wi-fi pentesting app made with [Next.js](https://nextjs.org) for the frontend, python for the backend, and bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It is designed for use with my custom built Wi-Pi Touch, a Raspberry Pi Pineapple-esque pentesting device.

---

To build:

`cd frontend`

`docker run --rm -ti \
  -v "$PWD":/project \
  -e CSC_IDENTITY_AUTO_DISCOVERY=false \
  electronuserland/builder:latest \
  /bin/bash -lc "cd /project && npm ci && npm run dist:linux:arm64"`
