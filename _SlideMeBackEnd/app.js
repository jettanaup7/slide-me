import express from 'express'
import cors from 'cors'

import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import driversRouter from './routers/driversRouter.js'
import customersRouter from './routers/customersRouter.js'
import ordersRouter from './routers/ordersRouter.js'
import locationsRouter from './routers/locationsRouter.js'
import paymentsRouter from './routers/paymentRouter.js'
import chatsRouter from './routers/chatsRouter.js'

const host = 'localhost'
const port = 3000

// // swagger documentations
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '[Slide Me] API Document',
      description: `พวกเรากลุ่ม **25** จากสาขาวิชาวิทยาการคอมพิวเตอร์และนวัตกรรมการพัฒนาซอฟต์แวร์คณะเทคโนโลยีสารสนเทศ ปี 2 มหาวิทยาลัยศรีปทุม เป็นผู้สร้าง Back End API พร้อมจัดทำเอกสารฉบับนี้ ในโครงงาน **Slide Me** Version 1.0.0 ตามมาตรฐาน OpenAPI 3.0 โดขมีทั้งหมด 51 APIs ประกอบด้วย
      \n - Customers — จำนวน 5 APIs 
      \n - Drivers — จำนวน 10 APIs 
      \n - Locations — จำนวน 5 APIs 
      \n - Chats — จำนวน 3 APIs 
      \n - Orders — จำนวน 12 APIs 
      \n - Requests for Order — จำนวน 7 APIs
      \n - Payments — จำนวน 9 APIs
      \n ซึ่งมีผู้รับผิดชอบในการพัฒนาระบบดังนี้
      \n - นายเจตนะ เหลืองสอาด  (ผู้รับผิดชอบ Driver API)
      \n - นางสาวจิตติมา โอภาพ (ผู้รับผิดชอบ Customer API)
      \n - นายวรเดช อาจวิชัย (ผู้รับผิดชอบ Order, Request, Chat API)
      \n - นายอมรเศรษฐ์ ธนาปรีชาศิริ (ผู้รับผิดชอบ Payment API)
      \n - นายวรธนเวธน์ ณีศะนันท์ (ผู้รับผิดชอบ Location API) 
      \n โดยรายละเอียดของแต่ละ API แสดงไว้ตามด้านล่างนี้
    `,
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://${host}:${port}`,
        description: 'local server',
      },
    ],
    tags: [
      {
        name: 'Customers',
        description: 'Customer Operations',
      },
      {
        name: 'Drivers',
        description: 'Drivers Operations',
      },
      {
        name: 'Locations',
        description: 'Locations Operations',
      },
      {
        name: 'Chats',
        description: 'Chats Operations',
      },
      {
        name: 'Orders',
        description: 'Orders Operations',
      },
      {
        name: 'Requests for Order',
        description: 'Requests Operations'
      }
    ],
    components: {
      securitySchemes: {
          BearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
          },
      },
    },
  },
  apis: [
    './routers/driversRouter.js',
    './routers/customersRouter.js',
    './routers/paymentRouter.js',
    './routers/chatsRouter.js',
    './routers/locationsRouter.js',
    './routers/ordersRouter.js',
  ],
};

const specs = swaggerJsDoc(options);

// create express app
const app = express()

// middlewares
app.use(cors())
app.use(express.json())

// routers
app.use('/userDriver', driversRouter) // ผู้รับผิดชอบคือ นายเจตนะ
app.use('/userCustomer', customersRouter) // ผู้รับผิดชอบคือ นางสาวจิตติมา
app.use('/orders', ordersRouter) // ผู้รับผิดชอบคือ นายวรเดช
app.use('/locations', locationsRouter) // ผู้รับผิดชอบคือ นายวรธนเวธน์
app.use('/payments', paymentsRouter) // ผู้รับผิดชอบคือ นายอมรเศรษฐ์
app.use('/chats', chatsRouter)

// swagger documents
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// start server
app.listen(port, host, async () => {
  console.log(`Server started at http://${host}:${port}`)
})