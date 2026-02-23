'use server';

import { sendEmail } from '@/lib/email';

export async function sendOrderNotification(order: any, adminEmail: string = 'admin@clic7.com') {
    if (!order) return { success: false };

    const subject = `New Order Received: ${order.id}`;

    // Simple HTML Template
    const html = `
        <div style="font-family: Arial, sans-serif; background-color: #0B0B0F; color: white; padding: 20px;">
            <div style="border: 1px solid #333; padding: 20px; border-radius: 10px; background-color: #15151A;">
                <h1 style="color: #7c3aed;">New Order Received!</h1>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>Total:</strong> ${order.total} OMR</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <br />
                <p>Please check the admin panel to verify the receipt.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders" style="display: inline-block; background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order</a>
            </div>
        </div>
    `;

    // Simulate sending to admin
    await sendEmail({
        to: adminEmail,
        subject,
        html
    });

    return { success: true };
}

export async function sendOrderApprovalEmail(order: any, productKeys: string[] = [], whatsappNumber: string = '968') {
    if (!order) return { success: false };

    const subject = `Your Order is Ready! | طلبك مكتمل: ${order.id}`;

    const html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; background-color: #0B0B0F; color: #FFFFFF; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; background-color: #15151A; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .header { background: linear-gradient(135deg, #0070D1 0%, #003087 100%); padding: 60px 20px; text-align: center; }
                .logo { font-size: 42px; font-weight: 900; color: white; letter-spacing: -2px; font-style: italic; text-transform: uppercase; }
                .content { padding: 50px 40px; text-align: center; }
                .status-badge { display: inline-block; background: rgba(16, 185, 129, 0.1); color: #10B981; padding: 10px 20px; border-radius: 50px; font-weight: 800; font-size: 12px; margin-bottom: 30px; border: 1px solid rgba(16, 185, 129, 0.2); }
                .title { font-size: 28px; font-weight: 900; margin-bottom: 15px; color: white; line-height: 1.2; }
                .subtitle { color: #88888F; font-size: 16px; margin-bottom: 40px; font-weight: 500; }
                .key-container { background: #0B0B0F; border: 2px solid #0070D1; padding: 35px; border-radius: 24px; margin: 30px 0; position: relative; overflow: hidden; }
                .key-container::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 100%; background: linear-gradient(90deg, transparent, rgba(0, 112, 209, 0.05), transparent); animation: shimmer 2s infinite; }
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .key-label { font-size: 11px; color: #0070D1; font-weight: 900; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 2px; }
                .key-value { font-family: 'Mono', monospace; font-size: 26px; font-weight: 900; color: white; letter-spacing: 4px; }
                .thank-you { font-size: 14px; color: #88888F; margin: 40px 0; line-height: 1.6; }
                .footer { background: #0B0B0F; padding: 40px; text-align: center; font-size: 11px; color: #44444F; border-top: 1px solid rgba(255,255,255,0.05); }
                .btn { display: inline-block; background: #0070D1; color: white; padding: 18px 45px; border-radius: 16px; text-decoration: none; font-weight: 900; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease; }
                .lang-divider { width: 40px; hieght: 2px; background: rgba(255,255,255,0.1); margin: 25px auto; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">CLIC7</div>
                </div>
                <div class="content">
                    <div class="status-badge">PAYMENT VERIFIED • تم التحقق من الدفع</div>
                    
                    <h1 class="title">شكراً لثقتك بنا، ${order.customerName}!</h1>
                    <p class="subtitle">تمت معالجة طلبك رقم ${order.id} بنجاح.</p>

                    <div class="lang-divider"></div>

                    <h1 class="title" dir="ltr">THANK YOU, ${order.customerName.toUpperCase()}!</h1>
                    <p class="subtitle" dir="ltr">Your order #${order.id} has been processed successfully.</p>
                    
                    <div class="key-container">
                        <div class="key-label">Product Activation Key • مفتاح التفعيل</div>
                        ${productKeys.length > 0 ? productKeys.map(key => `
                            <div class="key-value">${key}</div>
                        `).join('') : `
                            <div class="key-value">PRE-ORDER / PENDING</div>
                        `}
                    </div>

                    <p class="thank-you">
                        استمتع بتجربة لعب لا تنسى! إذا واجهت أي مشكلة في التفعيل، فريق الدعم الفني جاهز لمساعدتك عبر الواتساب.<br><br>
                        <span dir="ltr">Enjoy your gaming experience! If you encounter any issues during activation, our technical support team is ready to assist you via WhatsApp.</span>
                    </p>
                    
                      <a href="https://wa.me/${whatsappNumber.replace(/\D/g, '')}" class="btn">Technical Support • الدعم الفني</a>

            <div style = "margin-top: 40px; padding: 25px; background: rgba(0, 112, 209, 0.1); border-radius: 20px; border: 1px dashed rgba(0, 112, 209, 0.3);">
                        <div style = "font-size: 11px; color: #0070D1; font-weight: 900; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px;">Loyalty Rewards • مكافآت الولاء</div>
        < div style = "font-size: 18px; font-weight: 900; color: white;" >
            لقد حصلت على ${Math.floor(order.total * 10)} نقطة! 🎁
    </div>
        < div style = "font-size: 12px; color: #88888F; margin-top: 5px;" >
            You earned ${Math.floor(order.total * 10)} points from this purchase.
                        </div>
                </div>
                </div>
                < div class="footer" >
                    & copy; ${new Date().getFullYear()} CLIC7 STORE.All Rights Reserved.<br>
                    You received this email because you made a purchase on CLIC7.<br>
                    سلطنة عمان - مسقط
        </div>
        </div>
        </body>
        </html>
            `;

    await sendEmail({
        to: order.email,
        subject,
        html
    });

    return { success: true };
}
