# Backend Task

This project is a task management application built using Node.js, Express.js, JWT authentication, PostgreSQL, and Prisma ORM.

To Setup project in your machine hit below command
`npm install`

After this command create new file .env in root and paste .env.example file code to in this file and add your creds

## Database Setup

### Prerequisites

- PostgreSQL installed or cloud hosted URL
- Node.js and npm installed

### Setup

1. Create a PostgreSQL database.
2. Set up your Prisma environment variables in the `.env` file. (Refer to the .env.example file)
3. Run Prisma migrations to create the required tables:
   ```
   npx prisma migrate dev
   ```

## Cloudinary Setup

1. Create a Cloudinary account at [https://cloudinary.com/](https://cloudinary.com/).
2. Retrieve your Cloudinary credentials: `cloud_name`, `api_key`, `api_secret`.
3. Update the `.env` file with your Cloudinary credentials:
   ```dotenv
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## API Endpoints

### Prerequisites

1. Postman installed
2. Import the provided Postman collection: Postman Collection Link

Run the collection to test all API endpoints.
https://api.postman.com/collections/23763853-1c9537d1-a5d2-42bf-84ca-49c8197f463a?access_key=PMAT-01HRT13GWKY18THV4R2WKB5CMY

## Author
Aseem Asghar
