## SRS
See SRS: [SRS](SRS.pdf)

## Local Setup

### Installation

Install the dependencies:

```bash
npm install
```

### Development

#### Setup your local .env file

Duplicate `.env` file as `.env.local`, then enter your secrets and tokens.

```txt
MONGODB_URI=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
NEXTAUTH_URL_INTERNAL="http://127.0.0.1:3000"

```

#### To start the development server

```bash
npm run dev
```

Server will be ran at: [http://localhost:3000](http://localhost:3000)

Updates to files are automatically recompiled and changes shown in close to real-time in browser.

## Learn More

To learn more about MongoDB, check out the MongoDB documentation:

- [MongoDB Documentation](https://www.mongodb.com/docs/?utm_campaign=devrel&utm_source=third-party-content&utm_medium=cta&utm_content=template-nextjs-mongodb&utm_term=jesse.hall) - learn about MongoDB features and APIs
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/?utm_campaign=devrel&utm_source=third-party-content&utm_medium=cta&utm_content=template-nextjs-mongodb&utm_term=jesse.hall) - documentation for the official Node.js driver

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

Other Libraries: 
- [Mongoose Documentation](https://mongoosejs.com/docs/typescript.html) - documentation for how mongoose interfaces with MongoDB
- [Jest Setup](https://nextjs.org/docs/app/guides/testing/jest) - see how Jest is setup within the repo
- [Jest General Documentation](https://jestjs.io/docs/next/getting-started) - see how to make tests with Jest

## Deploy change

Create a new branch to make your changes on. When you're satisfied with your changes, make a PR.

Once approved, merge the PR with the main branch to automatically trigger a new deployment through vercel.