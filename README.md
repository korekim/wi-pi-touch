# Wi-Pi Touch

This is a wi-fi pentesting app made with [Next.js](https://nextjs.org) for the frontend, python for the backend, and bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It is designed for use with my custom built Wi-Pi Touch, a Raspberry Pi Pineapple-esque pentesting device.

---

To build:

`cd frontend`

`npm ci`
`npm run build`
`npx electron-builder --linux AppImage --arm64 -p never`
