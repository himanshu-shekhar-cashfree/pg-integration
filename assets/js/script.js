document.addEventListener("DOMContentLoaded", function () {
  const payButton = document.getElementById("payButton");

  payButton.addEventListener("click", async function () {
    // Validate form
    const form = document.getElementById("paymentForm");
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const customer_id = document.getElementById("customer_id").value;

    if (!name || !email || !phone || !address || !customer_id) {
      alert("Please fill all the required fields");
      return;
    }

    const payData = {
      amount: "100000.00",
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      customer_address: address,
      customer_id,
    };

    try {
      payButton.disabled = true;
      payButton.textContent = "Processing...";

      const response = await fetch("/createOrder", {
        method: "POST",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify(payData),
      });

      const result = await response.json();
      // console.log(result);
      initializeCashfreePayment(result);
    } catch (err) {
      console.log(err);
    } finally {
      payButton.disabled = false;
      payButton.textContent = "Proceed to pay";
    }
  });

  function initializeCashfreePayment(result) {
    const cashfree = Cashfree({ mode: "sandbox" });
    const { payment_session_id } = result;

    const options = {
      paymentSessionId: payment_session_id,
      redirectTarget: "_self",
    };
    console.log(payment_session_id);
    cashfree.checkout(options);

    // showPaymentSuccess(paymentData);
  }

  function showPaymentSuccess(paymentData) {
    // Reset form
    document.getElementById("paymentForm").reset();
  }
});
