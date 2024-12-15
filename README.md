# Exchange

A cryptocurrency exchange platform built with **Next.js**, **Express**, **Redis**, **TimescaleDB**, and **WebSockets**. This project includes a fully functional backend to handle orders, trades, and user interactions, with a modern frontend for users to view live market data and place orders.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Setup and Installation](#setup-and-installation)
4. [Running the Application](#running-the-application)

---

## Features

- **Real-time Market Data**: Live updates of market prices, order books, and trade history.
- **Order Management**: Place buy and sell orders, with market and limit order types.
- **WebSocket Integration**: Real-time communication for bid/ask price updates, trades, and order matching.
- **Time-Series Data**: Market data stored efficiently using **TimescaleDB**.
- **Queue Management**: **Redis** for message queuing and pub/sub for communication between services.

---

## Tech Stack

- **Frontend**: 
  - **Next.js** (React-based framework for server-side rendering)
- **Backend**:
  - **Express** (Web framework for Node.js)
  - **WebSockets** (Real-time communication)
  - **Redis** (Message queuing and pub/sub)
- **Database**:
  - **PostgreSQL** with **TimescaleDB** (for time-series data storage)
- **Queue**:
  - **Redis Queue** (for managing async tasks)
- **Containerization**:
  - **Docker** (for local development)

---

## Running the application

- Frontend - npm run dev
- API server - tsc -b && node dist/index.js
- Engine - tsc -b && node dist/index.js
- WS - tsc - b && node dist/index.js
- database- tsc -b && node dist/index.js
- Run the redis and timescale db through docker images
