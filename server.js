const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/assets", express.static("assets"));

app.post("/createOrder", async (req, res) => {
  const { amount, customer_id, customer_phone, customer_name, customer_email } =
    req.body;

  const payload = {
    order_currency: "INR",
    order_amount: amount.toString(),
    customer_details: {
      customer_id,
      customer_phone,
      customer_name: customer_name || "",
      customer_email: customer_email || "",
    },
    order_meta: {
      return_url: "http://localhost:3000/return?order_id={order_id}",
    },
  };
  console.log(process.env.APP_ID);
  const options = {
    method: "POST",
    headers: {
      "x-api-version": "2025-01-01",
      "x-client-id": process.env.APP_ID,
      "x-client-secret": process.env.APP_SECRET,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  const CFresponse = await fetch(
    "https://sandbox.cashfree.com/pg/orders",
    options
  );
  const data = await CFresponse.json();

  const { payment_session_id, order_id } = data;
  const resToFront = { success: true, payment_session_id, order_id };
  res.send(resToFront);
});

app.get("/return", (req, res) => {
  res.sendFile(__dirname + "/public/return.html");
});

app.post("/verifyPayment", async (req, res) => {
  const { order_id } = req.body;
  const options = {
    method: "GET",
    headers: {
      "x-api-version": "2025-01-01",
      "x-client-id": "TEST1055024968f0e6fde20ede21146894205501",
      "x-client-secret":
        "cfsk_ma_test_5d71f2ea46b93f7ea1635c94ec3b80ab_4de6af65",
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(
      `https://sandbox.cashfree.com/pg/orders/${order_id}`,
      options
    );
    const data = await response.json();
    // console.log(response);
    if (!response.ok) {
      throw new Error(data.message || "Failed to verify payment");
    }

    res.json({ success: true, order_status: data.order_status });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, (req, res) => {
  console.log("Server running");
});
