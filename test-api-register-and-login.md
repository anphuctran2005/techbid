# Thực hiện việc test API register and login với Postman

## register (POST http://localhost:5000/api/auth/register)
- **Method:** POST
- **URL:** http://localhost:5000/api/auth/register
- **Headers:** Content-Type: application/json
- **Body** (dạng raw JSON):

```json
{
    "email": "testabc@gmail.com",
    "password": "@Qvl2026@",
    "name": "Nguyễn Văn A"
}
```

**Output:**
Server trả về HTTP Status **201 Created** kèm chuỗi **token** JWT và thông tin user(ví ảo có sẵn **balance: "20000000"**).

```json
{
    "message": "Đăng ký tài khoản thành công",
    "user": {
    "id": "e9bf3915-6de1-4b07-acff-5efd1ccc8a76",
    "email": "testabc@gmail.com",
    "name": "Nguyễn Văn A",
    "balance": "20000000"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlOWJmMzkxNS02ZGUxLTRiMDctYWNmZi01ZWZkMWNjYzhhNzYiLCJlbWFpbCI6InRlc3RhYmNAZ21haWwuY29tIiwiaWF0IjoxNzkyMzk1OTExLCJleHAiOjE3OTMwMDA3MTF9.uhiVf8liF6b6Id4laO6G04Zpcx8rky9H-Pms8VADM4s"
}
```

## login (POST http://localhost:5000/api/auth/login)
- **Method:** POST
- **URL:** http://localhost:5000/api/auth/login
- **Body** (dạng raw JSON):

```json
{
    "email": "testabc@gmail.com",
    "password": "@Qvl2026@"
}
```

**Output:**
Server trả về HTTP Status **200 OK** kèm một chuỗi **token** JWT mới

```json
{
    "message": "Đăng nhập thành công",
    "user": {
    "id": "e9bf3915-6de1-4b07-acff-5efd1ccc8a76",
    "email": "testabc@gmail.com",
    "name": "Nguyễn Văn A",
    "balance": "20000000"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlOWJmMzkxNS02ZGUxLTRiMDctYWNmZi01ZWZkMWNjYzhhNzYiLCJlbWFpbCI6InRlc3RhYmNAZ21haWwuY29tIiwiaWF0IjoxNzkyMzk1OTQ1LCJleHAiOjE3OTMwMDA3NDV9.ucinqwZNfqkaOF3Jm5lzSxY8bMYJbiY7X2iqLU24hEI"
}
```
