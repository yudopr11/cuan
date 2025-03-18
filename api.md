# yupi API Documentation

This document provides detailed information about all available endpoints in the Yupi API.

## Table of Contents

- [Authentication](#authentication)
  - [Register](#register)
  - [Login](#login)
  - [Refresh Token](#refresh-token)
  - [Logout](#logout)
  - [Forgot Password](#forgot-password)
  - [Reset Password](#reset-password)
  - [Get All Users](#get-all-users)
  - [Delete User](#delete-user)
- [Blog Management](#blog-management)
  - [Create Post](#create-post)
  - [Get Posts](#get-posts)
  - [Get Post by Slug](#get-post-by-slug)
  - [Update Post](#update-post)
  - [Delete Post](#delete-post)
- [Bill Splitting](#bill-splitting)
- [Personal Transactions](#personal-transactions)
  - [Account Management](#account-management)
  - [Category Management](#category-management)
  - [Transaction Management](#transaction-management)

## Authentication

All authenticated endpoints require a valid JWT token to be included in the request header. 

**Authorization Header Format**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Login

Log in to obtain an access token.

**URL**: `/auth/login`  
**Method**: `POST`  
**Auth required**: No  

**Request Body** (form data):
```
username=string&password=string
```

**Success Response**: `200 OK`
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

**Notes**:
- Access token is returned in the response
- Refresh token is set as an HTTP-only cookie

**Error Responses**:
- `401 Unauthorized` - Incorrect username or password
- `422 Unprocessable Entity` - Validation error

### Refresh Token

Get a new access token using the refresh token stored in cookies.

**URL**: `/auth/refresh`  
**Method**: `POST`  
**Auth required**: No (but requires refresh token cookie)  

**Success Response**: `200 OK`
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid refresh token
- `422 Unprocessable Entity` - Validation error

### Logout

Log out by clearing the refresh token cookie.

**URL**: `/auth/logout`  
**Method**: `POST`  
**Auth required**: No  

**Success Response**: `200 OK`
```json
{
  "message": "Successfully logged out"
}
```

## Personal Transactions

Manage personal financial transactions including accounts, categories, and transactions.

### Account Management

Endpoints for managing transaction accounts.

#### Create Account

Create a new transaction account.

**URL**: `/trx/accounts`  
**Method**: `POST`  
**Auth required**: Yes  

**Request Body**:
```json
{
  "name": "string",
  "type": "bank_account", // Can be "bank_account", "credit_card", or "other"
  "description": "string",
  "limit": 0
}
```

**Success Response**: `200 OK`
```json
{
  "data": {
    "name": "string",
    "type": "bank_account",
    "description": "string",
    "limit": "0",
    "account_id": 0,
    "uuid": "string",
    "user_id": 0,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  },
  "message": "Success"
}
```

#### Get Accounts

Get a list of transaction accounts with balances.

**URL**: `/trx/accounts`  
**Method**: `GET`  
**Auth required**: Yes  

**Success Response**: `200 OK`
```json
{
  "data": [
    {
      "name": "string",
      "type": "bank_account",
      "description": "string",
      "limit": "0",
      "account_id": 0,
      "uuid": "string",
      "user_id": 0,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "balance": "0.00"
    }
  ],
  "message": "Success"
}
```

### Category Management

Endpoints for managing transaction categories.

#### Create Category

Create a new transaction category.

**URL**: `/trx/categories`  
**Method**: `POST`  
**Auth required**: Yes  

**Request Body**:
```json
{
  "name": "string",
  "type": "income", // Can be "income", "expense", or "transfer"
  "icon": "string",
  "color": "string"
}
```

**Success Response**: `200 OK`
```json
{
  "data": {
    "name": "string",
    "type": "income",
    "icon": "string",
    "color": "string",
    "category_id": 0,
    "uuid": "string",
    "user_id": 0,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  },
  "message": "Success"
}
```

#### Get Categories

Get a list of transaction categories.

**URL**: `/trx/categories`  
**Method**: `GET`  
**Auth required**: Yes  

**Query Parameters**:
- `type` (string, optional) - Filter by type: 'income', 'expense', or 'transfer'

**Success Response**: `200 OK`
```json
{
  "data": [
    {
      "name": "string",
      "type": "income",
      "icon": "string",
      "color": "string",
      "category_id": 0,
      "uuid": "string",
      "user_id": 0,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "message": "Success"
}
```

### Transaction Management

Endpoints for managing financial transactions.

#### Create Transaction

Create a new financial transaction.

**URL**: `/trx/transactions`  
**Method**: `POST`  
**Auth required**: Yes  

**Request Body**:
```json
{
  "amount": "100.00",
  "type": "income", // Can be "income", "expense", or "transfer"
  "description": "string",
  "date": "2023-01-01T00:00:00.000Z",
  "account_id": 0,
  "category_id": 0,
  "transfer_account_id": 0, // Required only for transfer type
  "notes": "string"
}
```

**Success Response**: `200 OK`
```json
{
  "data": {
    "transaction_id": 0,
    "uuid": "string",
    "user_id": 0,
    "amount": "100.00",
    "type": "income",
    "description": "string",
    "date": "2023-01-01T00:00:00.000Z",
    "account_id": 0,
    "category_id": 0,
    "transfer_account_id": null,
    "notes": "string",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  },
  "message": "Success"
}
```

#### Get Transactions

Get a list of financial transactions with various filtering options.

**URL**: `/trx/transactions`  
**Method**: `GET`  
**Auth required**: Yes  

**Query Parameters**:
- `skip` (integer, default=0) - Number of items to skip
- `limit` (integer, default=50) - Number of items to return
- `start_date` (string, optional) - Filter by start date
- `end_date` (string, optional) - Filter by end date
- `account_id` (integer, optional) - Filter by account ID
- `category_id` (integer, optional) - Filter by category ID
- `type` (string, optional) - Filter by type: 'income', 'expense', or 'transfer'
- `search` (string, optional) - Search in description and notes

**Success Response**: `200 OK`
```json
{
  "data": [
    {
      "transaction_id": 0,
      "uuid": "string",
      "user_id": 0,
      "amount": "100.00",
      "type": "income",
      "description": "string",
      "date": "2023-01-01T00:00:00.000Z",
      "account_id": 0,
      "category_id": 0,
      "transfer_account_id": null,
      "notes": "string",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "account": {
        "name": "string",
        "type": "bank_account"
      },
      "category": {
        "name": "string",
        "type": "income",
        "icon": "string",
        "color": "string"
      },
      "transfer_account": null
    }
  ],
  "total": 100,
  "has_more": true,
  "message": "Success"
}
```

#### Get Transaction Trends

Get transaction trends over a specified period.

**URL**: `/trx/transactions/trends`  
**Method**: `GET`  
**Auth required**: Yes  

**Query Parameters**:
- `period` (string, default="month") - Period type: 'day', 'week', 'month', 'year', or 'all'
- `start_date` (string, optional) - Custom start date (overrides period)
- `end_date` (string, optional) - Custom end date (overrides period)
- `group_by` (string, default="day") - Group results by: 'day', 'week', 'month', or 'year'
- `account_id` (integer, optional) - Filter by account ID

**Success Response**: `200 OK`
```json
{
  "period": {
    "start_date": "2023-01-01T00:00:00Z",
    "end_date": "2023-01-31T23:59:59Z",
    "period_type": "month",
    "group_by": "day"
  },
  "trends": [
    {
      "date": "2023-01-01",
      "income": "500.0",
      "expense": "200.0",
      "transfer": "0.0",
      "net": "300.0"
    },
    {
      "date": "2023-01-02",
      "income": "0.0",
      "expense": "150.0",
      "transfer": "100.0",
      "net": "-150.0"
    }
  ]
}
```

## Security

The API uses OAuth2 with password flow for authentication. Security is implemented using:

```
OAuth2PasswordBearer: {
  "type": "oauth2",
  "flows": {
    "password": {
      "scopes": {},
      "tokenUrl": "auth/login"
    }
  }
}
```