const Product = require("../model/product.model");
const nodeMailer = require("nodemailer");


const sendOrderConfirmationEmail = async (userEmail, checkout) => {
    console.log("Sending order confirmation email to:", userEmail);
    console.log("Order details:", checkout);
    const transporter = nodeMailer.createTransport({
        // host: process.env.SMPT_HOST,
        // port: process.env.SMPT_PORT,
        service: process.env.SMPT_SERVICE,
        auth: {
          user: process.env.SMPT_MAIL,
          pass: process.env.SMPT_PASSWORD,
        },
      });
    const orderDetails = {
        orderId: checkout._id,
        orderDate: new Date().toLocaleDateString(),
        customerName: "Customer Name", // Replace with actual customer name from the database
        address: `${checkout.address_id.street}, ${checkout.address_id.city}, ${checkout.address_id.state}, ${checkout.address_id.zip}`, // Example
        phoneNumber: "Customer Phone Number", // Replace with actual phone number from the database
        paymentInfo: `Payment via ${checkout.payment_method}`,
        items: await Promise.all(checkout.cart_item.map(async item => {
            const product = await Product.findById(item.product_id);
            return {
                name: product.name, // Make sure to get the product name
                description: product.description, // Get product description
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity,
            };
        })),
        subtotal: checkout.totalPrice - checkout.gst - checkout.shipping_Charge,
        discount: "10%", // Adjust as necessary
        tax: checkout.gst,
        grandTotal: checkout.totalPrice,
    };
    console.log(orderDetails)
    // Create HTML content for the email
    let itemsHtml = orderDetails.items.map(item => `
        <tr>
            <td class="tm_primary_color">${item.name}</td>
            <td>${item.description}</td>
            <td>${item.price}</td>
            <td>${item.quantity}</td>
            <td>${item.total}</td>
        </tr>
    `).join('');

    const emailHtml = `
        <!DOCTYPE html>
        <html class="no-js" lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
            /*** uncss> filename: C:/Users/admin/Desktop/backend_api/backend_api/profile/order_ summary/assets/css/style.css ***/
/*--------------------------------------------------------------
>> TABLE OF CONTENTS:
----------------------------------------------------------------
1. Normalize
2. Typography
3. Invoice General Style
--------------------------------------------------------------*/
/*--------------------------------------------------------------
2. Normalize
----------------------------------------------------------------*/
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&amp;display=swap");
*,
::after,
::before {
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
}

html {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
}

/* Sections
   ========================================================================== */
/**
 * Remove the margin in all browsers.
 */
body {
  margin: 0;
}

hr {
  -webkit-box-sizing: content-box;
          box-sizing: content-box; /* 1 */
  height: 0; /* 1 */
  overflow: visible; /* 2 */
}

a {
  background-color: transparent;
}


b {
  font-weight: bolder;
}
img {
  border-style: none;
}

button {
  font-family: inherit; /* 1 */
  font-size: 100%; /* 1 */
  line-height: 1.15; /* 1 */
  margin: 0; /* 2 */
}

button {
  /* 1 */
  overflow: visible;
}

button {
  /* 1 */
  text-transform: none;
}

/**
 * Correct the inability to style clickable types in iOS and Safari.
 */
button {
  -webkit-appearance: button;
}

/**
 * Remove the inner border and padding in Firefox.
 */
button::-moz-focus-inner {
  border-style: none;
  padding: 0;
}

/**
 * Restore the focus styles unset by the previous rule.
 */
button:-moz-focusring {
  outline: 1px dotted ButtonText;
}

/**
 * Correct the padding in Firefox.
 */
::-webkit-file-upload-button {
  -webkit-appearance: button; /* 1 */
  font: inherit; /* 2 */
}

/* Interactive
   ========================================================================== */
/*
 * Add the correct display in Edge, IE 10+, and Firefox.
 */

/*
 * Add the correct display in all browsers.
 */

/* Misc
   ========================================================================== */
/**
 * Add the correct display in IE 10+.
 */

/**
 * Add the correct display in IE 10.
 */

/*--------------------------------------------------------------
2. Typography
----------------------------------------------------------------*/
body,
html {
  color: #666;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6em;
  overflow-x: hidden;
  background-color: #f5f6fa;
}

p,
div {
  margin-top: 0;
  line-height: 1.5em;
}

p {
  margin-bottom: 15px;
}

img {
  border: 0;
  max-width: 100%;
  height: auto;
  vertical-align: middle;
}

a {
  color: inherit;
  text-decoration: none;
  -webkit-transition: all 0.3s ease;
  transition: all 0.3s ease;
}
a:hover {
  color: #007aff;
}

button {
  color: inherit;
  -webkit-transition: all 0.3s ease;
  transition: all 0.3s ease;
}

a:hover {
  text-decoration: none;
  color: inherit;
}

table {
  width: 100%;
  caption-side: bottom;
  border-collapse: collapse;
}

th {
  text-align: left;
}

td {
  border-top: 1px solid #dbdfea;
}

td {
  padding: 10px 15px;
  line-height: 1.55em;
}

th {
  padding: 10px 15px;
  line-height: 1.55em;
}

b {
  font-weight: bold;
}

a:hover {
  color: #007aff;
}

/*--------------------------------------------------------------
3. Invoice General Style
----------------------------------------------------------------*/

.tm_f16 {
  font-size: 16px;
}

.tm_f50 {
  font-size: 50px;
}

.tm_semi_bold {
  font-weight: 600;
}

.tm_bold {
  font-weight: 700;
}

.tm_m0 {
  margin: 0px;
}

.tm_mb2 {
  margin-bottom: 2px;
}

.tm_mb5 {
  margin-bottom: 5px;
}

.tm_mb10 {
  margin-bottom: 10px;
}

.tm_mb20 {
  margin-bottom: 20px;
}

.tm_pt0 {
  padding-top: 0;
}

.tm_radius_0 {
  border-radius: 0 !important;
}

.tm_width_1 {
  width: 8.33333333%;
}

.tm_width_2 {
  width: 16.66666667%;
}

.tm_width_3 {
  width: 25%;
}

.tm_width_4 {
  width: 33.33333333%;
}

.tm_border_top {
  border-top: 1px solid #dbdfea;
}

.tm_border_left {
  border-left: 1px solid #dbdfea;
}

.tm_border_right {
  border-right: 1px solid #dbdfea;
}

.tm_round_border {
  border: 1px solid #dbdfea;
  overflow: hidden;
  border-radius: 6px;
}

.tm_danger_color {
  color: red;
}

.tm_primary_color {
  color: #111;
}

.tm_ternary_color {
  color: #b5b5b5;
}

.tm_gray_bg {
  background: #f5f6fa;
}

.tm_invoice_in {
  position: relative;
  z-index: 100;
}

.tm_container {
  max-width: 880px;
  padding: 30px 15px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.tm_text_center {
  text-align: center;
}

.tm_text_uppercase {
  text-transform: uppercase;
}

.tm_text_right {
  text-align: right;
}

.tm_align_center {
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
}

.tm_border_top_0 {
  border-top: 0;
}

.tm_table_baseline {
  vertical-align: baseline;
}

.tm_border_none {
  border: none !important;
}

.tm_table_responsive {
  overflow-x: auto;
}
.tm_table_responsive > table {
  min-width: 600px;
}

hr {
  background: #dbdfea;
  height: 1px;
  border: none;
  margin: 0;
}

.tm_invoice {
  background: #fff;
  border-radius: 10px;
  padding: 50px;
}

.tm_invoice_footer {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
.tm_invoice_footer table {
  margin-top: -1px;
}
.tm_invoice_footer .tm_left_footer {
  width: 58%;
  padding: 10px 15px;
  -webkit-box-flex: 0;
      -ms-flex: none;
          flex: none;
}
.tm_invoice_footer .tm_right_footer {
  width: 42%;
}

.tm_invoice.tm_style1 .tm_invoice_right {
  -webkit-box-flex: 0;
      -ms-flex: none;
          flex: none;
  width: 60%;
}
.tm_invoice.tm_style1 .tm_invoice_head {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: justify;
      -ms-flex-pack: justify;
          justify-content: space-between;
}
.tm_invoice.tm_style1 .tm_invoice_head .tm_invoice_right div {
  line-height: 1em;
}
.tm_invoice.tm_style1 .tm_invoice_info {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  -webkit-box-pack: justify;
      -ms-flex-pack: justify;
          justify-content: space-between;
}
.tm_invoice.tm_style1 .tm_invoice_seperator {
  min-height: 18px;
  border-radius: 1.6em;
  -webkit-box-flex: 1;
      -ms-flex: 1;
          flex: 1;
  margin-right: 20px;
}
.tm_invoice.tm_style1 .tm_invoice_info_list {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
.tm_invoice.tm_style1 .tm_invoice_info_list > *:not(:last-child) {
  margin-right: 20px;
}
.tm_invoice.tm_style1 .tm_logo img {
  max-height: 50px;
}

.tm_invoice_wrap {
  position: relative;
}

@media (min-width: 1000px) {
  .tm_invoice_btns {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
        -ms-flex-direction: column;
            flex-direction: column;
    -webkit-box-pack: center;
        -ms-flex-pack: center;
            justify-content: center;
    margin-top: 0px;
    margin-left: 20px;
    position: absolute;
    left: 100%;
    top: 0;
    -webkit-box-shadow: -2px 0 24px -2px rgba(43, 55, 72, 0.05);
            box-shadow: -2px 0 24px -2px rgba(43, 55, 72, 0.05);
    border: 3px solid #fff;
    border-radius: 6px;
    background-color: #fff;
  }
  .tm_invoice_btn {
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
    border: none;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    background-color: transparent;
    position: relative;
  }
  .tm_invoice_btn svg {
    width: 24px;
  }
  .tm_invoice_btn .tm_btn_icon {
    padding: 0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    height: 42px;
    width: 42px;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
    -webkit-box-pack: center;
        -ms-flex-pack: center;
            justify-content: center;
  }
  .tm_invoice_btn .tm_btn_text {
    position: absolute;
    left: 100%;
    background-color: #111;
    color: #fff;
    padding: 3px 12px;
    display: inline-block;
    margin-left: 10px;
    border-radius: 5px;
    top: 50%;
    -webkit-transform: translateY(-50%);
            transform: translateY(-50%);
    font-weight: 500;
    min-height: 28px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
    opacity: 0;
    visibility: hidden;
  }
  .tm_invoice_btn .tm_btn_text:before {
    content: "";
    height: 10px;
    width: 10px;
    position: absolute;
    background-color: #111;
    -webkit-transform: rotate(45deg);
            transform: rotate(45deg);
    left: -3px;
    top: 50%;
    margin-top: -6px;
    border-radius: 2px;
  }
  .tm_invoice_btn:hover .tm_btn_text {
    opacity: 1;
    visibility: visible;
  }
  .tm_invoice_btn:not(:last-child) {
    margin-bottom: 3px;
  }
  .tm_invoice_btn.tm_color1 {
    background-color: rgba(0, 122, 255, 0.1);
    color: #007aff;
    border-radius: 5px 5px 0 0;
  }
  .tm_invoice_btn.tm_color1:hover {
    background-color: rgba(0, 122, 255, 0.2);
  }
  .tm_invoice_btn.tm_color2 {
    background-color: rgba(52, 199, 89, 0.1);
    color: #34c759;
    border-radius: 0 0 5px 5px;
  }
  .tm_invoice_btn.tm_color2:hover {
    background-color: rgba(52, 199, 89, 0.2);
  }
}
@media (max-width: 999px) {
  .tm_invoice_btns {
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-pack: center;
        -ms-flex-pack: center;
            justify-content: center;
    margin-top: 0px;
    margin-top: 20px;
    -webkit-box-shadow: -2px 0 24px -2px rgba(43, 55, 72, 0.05);
            box-shadow: -2px 0 24px -2px rgba(43, 55, 72, 0.05);
    border: 3px solid #fff;
    border-radius: 6px;
    background-color: #fff;
    position: relative;
    left: 50%;
    -webkit-transform: translateX(-50%);
            transform: translateX(-50%);
  }
  .tm_invoice_btn {
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
    border: none;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    background-color: transparent;
    position: relative;
    border-radius: 5px;
    padding: 6px 15px;
  }
  .tm_invoice_btn svg {
    width: 24px;
  }
  .tm_invoice_btn .tm_btn_icon {
    padding: 0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
    -webkit-box-pack: center;
        -ms-flex-pack: center;
            justify-content: center;
    margin-right: 8px;
  }
  .tm_invoice_btn:not(:last-child) {
    margin-right: 3px;
  }
  .tm_invoice_btn.tm_color1 {
    background-color: rgba(0, 122, 255, 0.1);
    color: #007aff;
  }
  .tm_invoice_btn.tm_color1:hover {
    background-color: rgba(0, 122, 255, 0.2);
  }
  .tm_invoice_btn.tm_color2 {
    background-color: rgba(52, 199, 89, 0.1);
    color: #34c759;
  }
  .tm_invoice_btn.tm_color2:hover {
    background-color: rgba(52, 199, 89, 0.2);
  }
}
@media (max-width: 767px) {
  .tm_invoice {
    padding: 30px 20px;
  }
  .tm_invoice .tm_right_footer {
    width: 100%;
  }
  .tm_invoice_footer {
    -webkit-box-orient: vertical;
    -webkit-box-direction: reverse;
        -ms-flex-direction: column-reverse;
            flex-direction: column-reverse;
  }
  .tm_invoice_footer .tm_left_footer {
    width: 100%;
    border-top: 1px solid #dbdfea;
    margin-top: -1px;
    padding: 15px 0;
  }
  .tm_border_left_none_md {
    border-left-width: 0;
  }
  .tm_padd_left_15_md {
    padding-left: 15px !important;
  }
}
@media (max-width: 500px) {
  .tm_invoice.tm_style1 .tm_logo {
    margin-bottom: 10px;
  }
  .tm_invoice.tm_style1 .tm_invoice_head {
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
        -ms-flex-direction: column;
            flex-direction: column;
  }
  .tm_invoice.tm_style1 .tm_invoice_head .tm_invoice_left,
  .tm_invoice.tm_style1 .tm_invoice_head .tm_invoice_right {
    width: 100%;
  }
  .tm_invoice.tm_style1 .tm_invoice_head .tm_invoice_right {
    text-align: left;
  }
  .tm_invoice.tm_style1 .tm_invoice_left {
    max-width: 100%;
  }
  .tm_f50 {
    font-size: 30px;
  }
  .tm_invoice.tm_style1 .tm_invoice_info {
    -webkit-box-orient: vertical;
    -webkit-box-direction: reverse;
        -ms-flex-direction: column-reverse;
            flex-direction: column-reverse;
  }
  .tm_invoice.tm_style1 .tm_invoice_seperator {
    -webkit-box-flex: 0;
        -ms-flex: none;
            flex: none;
    width: 100%;
    margin-right: 0;
    min-height: 5px;
  }
  .tm_invoice.tm_style1 .tm_invoice_info_list {
    width: 100%;
    -ms-flex-wrap: wrap;
        flex-wrap: wrap;
  }
  .tm_invoice.tm_style1 .tm_invoice_seperator + .tm_invoice_info_list {
    margin-bottom: 5px;
  }
}
/*--------------------------------------------------------------
  Will apply only print window
----------------------------------------------------------------*/
@media print {
  .tm_gray_bg {
    background-color: #f5f6fa !important;
    -webkit-print-color-adjust: exact;
  }
  .tm_ternary_color {
    color: #b5b5b5 !important;
    -webkit-print-color-adjust: exact;
  }
  .tm_hide_print {
    display: none !important;
  }
  hr {
    background: #dbdfea !important;
    -webkit-print-color-adjust: exact;
  }
  .tm_mb2 {
    margin-bottom: 2px;
  }
  .tm_mb5 {
    margin-bottom: 5px;
  }
  .tm_mb10 {
    margin-bottom: 10px;
  }
  .tm_mb20 {
    margin-bottom: 20px;
  }
  .tm_invoice {
    padding: 10px;
  }
  .tm_invoice .tm_right_footer {
    width: 42%;
  }
  .tm_invoice_footer {
    -webkit-box-orient: initial;
    -webkit-box-direction: initial;
        -ms-flex-direction: initial;
            flex-direction: initial;
  }
  .tm_invoice_footer .tm_left_footer {
    width: 58%;
    padding: 10px 15px;
    -webkit-box-flex: 0;
        -ms-flex: none;
            flex: none;
    border-top: none;
    margin-top: 0px;
  }
  .tm_round_border {
    border-top-width: 2px;
  }
  .tm_border_left_none_md {
    border-left-width: 1px;
  }
}/*# sourceMappingURL=style.css.map */
            </style>
        </head>
        <body>
            <div class="tm_container">
                <div class="tm_invoice_wrap">
                    <div class="tm_invoice tm_style1">
                        <div class="tm_invoice_in">
                            <div class="tm_invoice_head tm_align_center tm_mb20">
                                <div class="tm_invoice_left">
                                    <div class="tm_logo"><img src="assets/img/logo.svg" alt="Logo"></div>
                                </div>
                                <div class="tm_invoice_right tm_text_right">
                                    <div class="tm_primary_color tm_f50 tm_text_uppercase">ORDER SUMMARY</div>
                                </div>
                            </div>
                            <div class="tm_invoice_info tm_mb20">
                                <div class="tm_invoice_info_list">
                                    <p class="tm_invoice_number tm_m0">ORDER No: <b class="tm_primary_color">${orderDetails.orderId}</b></p>
                                    <p class="tm_invoice_date tm_m0">Date: <b class="tm_primary_color">${orderDetails.orderDate}</b></p>
                                </div>
                            </div>
                            <div class="tm_invoice_head tm_mb10">
                                <div class="tm_invoice_left">
                                    <p class="tm_mb2"><b class="tm_primary_color">Order Address To:</b></p>
                                    <p>
                                        ${orderDetails.customerName} <br>
                                        ${orderDetails.address} <br>
                                        Phone Number: ${orderDetails.phoneNumber}
                                    </p>
                                </div>
                                <div class="tm_invoice_right tm_text_right">
                                    <p class="tm_mb2"><b class="tm_primary_color">Pay To:</b></p>
                                    <p>${orderDetails.paymentInfo}</p>
                                </div>
                            </div>
                            <div class="tm_table tm_style1">
                                <div class="tm_table_responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th class="tm_width_3 tm_semi_bold tm_primary_color tm_gray_bg">Item</th>
                                                <th class="tm_width_4 tm_semi_bold tm_primary_color tm_gray_bg">Description</th>
                                                <th class="tm_width_2 tm_semi_bold tm_primary_color tm_gray_bg">Price</th>
                                                <th class="tm_width_1 tm_semi_bold tm_primary_color tm_gray_bg">Qty</th>
                                                <th class="tm_width_2 tm_semi_bold tm_primary_color tm_gray_bg tm_text_right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${itemsHtml}
                                        </tbody>
                                    </table>
                                </div>
                                <div class="tm_invoice_footer">
                                    <div class="tm_left_footer">
                                        <p class="tm_mb2"><b class="tm_primary_color">Payment info:</b></p>
                                        <p>Amount: ${orderDetails.grandTotal}</p>
                                    </div>
                                    <div class="tm_right_footer">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td class="tm_primary_color tm_bold">Subtotal</td>
                                                    <td class="tm_text_right">${orderDetails.subtotal}</td>
                                                </tr>
                                                <tr>
                                                    <td class="tm_primary_color">Discount <span class="tm_ternary_color">(10%)</span></td>
                                                    <td class="tm_text_right">${orderDetails.discount}</td>
                                                </tr>
                                                <tr>
                                                    <td class="tm_primary_color">Tax</td>
                                                    <td class="tm_text_right">${orderDetails.tax}</td>
                                                </tr>
                                                <tr>
                                                    <td class="tm_bold tm_f16 tm_primary_color">Grand Total</td>
                                                    <td class="tm_bold tm_f16 tm_primary_color tm_text_right">${orderDetails.grandTotal}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="tm_text_center">
                                <p class="tm_mb5"><b class="tm_primary_color">Terms & Conditions:</b></p>
                                <p>Your use of the Website shall be deemed to constitute your understanding and approval of, and agreement to be bound by, the Privacy Policy.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

  
    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: userEmail,
        subject: 'Order Confirmation',
        html: emailHtml,
      };
      try {
        await transporter.sendMail(mailOptions);
        return true;
      } catch (error) {
          console.error('Error sending email:', error);
          return false; // Indicate failure
      }
    
};

module.exports = sendOrderConfirmationEmail