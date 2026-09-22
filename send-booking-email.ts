// Supabase Edge Function to send booking confirmation emails
// This file goes in your Supabase project: supabase/functions/send-booking-email/index.ts

import "https://deno.land/std@0.190.0/dotenv/load.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the new appointment data from Supabase trigger
    const { record: appointment } = await req.json();

    console.log("Received appointment:", JSON.stringify(appointment));

    // Extract appointment details
    const {
      client_name,
      client_phone,
      client_email,
      service_name,
      appointment_date,
      appointment_time,
      client_notes,
      created_at,
    } = appointment;

    // If no email provided, just log and return
    if (!client_email || client_email.trim() === "") {
      console.log("No email provided for appointment, skipping email send");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No email provided, skipping send"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Format date nicely in Arabic
    const dateObj = new Date(appointment_date);
    const arabicDate = dateObj.toLocaleDateString("ar-SA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Format time
    const timeStr = appointment_time;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "صالون آية <bookings@ayasalon.com>",
      to: [client_email],
      subject: "✅ تم تأكيد موعدك في صالون آية",
      html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد الموعد - صالون آية</title>
    <style>
        body {
            font-family: 'Cairo', 'Tajawal', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            color: #b8627d;
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 10px;
        }
        .arabic-logo {
            color: #666;
            font-size: 18px;
            margin-bottom: 20px;
        }
        .checkmark {
            font-size: 48px;
            color: #16a34a;
            margin: 20px 0;
        }
        .receipt {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #e2e8f0;
        }
        .receipt-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px dashed #e2e8f0;
        }
        .receipt-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .label {
            color: #666;
            font-weight: 500;
        }
        .value {
            color: #111;
            font-weight: 700;
        }
        .notes {
            background: #fff7ed;
            border-right: 4px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .whatsapp-btn {
            display: inline-block;
            background: #25D366;
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 50px;
            font-weight: 700;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }
        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }
            .receipt {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Aya Salon</div>
            <div class="arabic-logo">✦ صالون آية ✦</div>
            <div class="checkmark">✅</div>
            <h1 style="color: #16a34a; margin: 10px 0;">تم تأكيد موعدك بنجاح</h1>
            <p style="color: #666; margin-bottom: 20px;">يسعدنا استقبالكِ في الاستوديو المنزلي الخاص بنا</p>
        </div>

        <div class="receipt">
            <h3 style="color: #b8627d; margin-top: 0;">📋 ملخص الموعد المحدد</h3>

            <div class="receipt-item">
                <span class="label">👤 الاسم الكريم:</span>
                <span class="value">${client_name}</span>
            </div>

            <div class="receipt-item">
                <span class="label">📱 رقم الجوال:</span>
                <span class="value">${client_phone}</span>
            </div>

            <div class="receipt-item">
                <span class="label">📅 التاريخ:</span>
                <span class="value">${arabicDate}</span>
            </div>

            <div class="receipt-item">
                <span class="label">⏰ الوقت:</span>
                <span class="value">${timeStr}</span>
            </div>

            <div class="receipt-item">
                <span class="label">💇‍♀️ الخدمة:</span>
                <span class="value">${service_name}</span>
            </div>

            <div class="receipt-item">
                <span class="label">📝 رقم الحجز:</span>
                <span class="value">#${Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
        </div>

        ${client_notes && client_notes.trim() !== "" ? `
        <div class="notes">
            <strong>📝 ملاحظاتك:</strong><br>
            ${client_notes}
        </div>
        ` : ""}

        <div style="text-align: center; margin: 25px 0;">
            <p style="margin-bottom: 15px;">للاستفسار أو التعديل، يمكنك التواصل معنا عبر:</p>
            <a href="https://api.whatsapp.com/send?phone=963982490737&text=السلام عليكم، لدي استفسار عن موعدي"
               class="whatsapp-btn" target="_blank">
                💬 تواصلي معنا عبر واتساب
            </a>
        </div>

        <div style="background: #f1f5f9; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <h4 style="color: #475569; margin-top: 0;">📍 موقع الصالون:</h4>
            <p style="margin: 5px 0;">استوديو منزلي خاص - حلب، سوريا</p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">(سيتم إرسال العنوان الدقيق قبل الموعد بيوم)</p>
        </div>

        <div class="footer">
            <p>شكراً لكِ على ثقتكِ بنا 💕</p>
            <p>صالون آية | استوديو تصفيف وصبغ الشعر للسيدات</p>
            <p style="font-size: 12px; color: #999;">هذا البريد أرسل آلياً، يرجى عدم الرد عليه.</p>
        </div>
    </div>
</body>
</html>
      `,
      text: `
✅ تم تأكيد موعدك في صالون آية

👤 الاسم: ${client_name}
📱 الجوال: ${client_phone}
📅 التاريخ: ${arabicDate}
⏰ الوقت: ${timeStr}
💇‍♀️ الخدمة: ${service_name}
📝 رقم الحجز: #${Math.floor(100000 + Math.random() * 900000)}

${client_notes && client_notes.trim() !== "" ? `📝 ملاحظاتك: ${client_notes}\n` : ""}

📍 الموقع: استوديو منزلي خاص - حلب، سوريا
(سيتم إرسال العنوان الدقيق قبل الموعد بيوم)

💬 للاستفسار أو التعديل:
https://api.whatsapp.com/send?phone=963982490737

شكراً لكِ على ثقتكِ بنا 💕
صالون آية | استوديو تصفيف وصبغ الشعر للسيدات
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data?.id);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: data?.id,
        message: "Email sent successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});