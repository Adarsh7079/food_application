import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import NewsLetterBox from "../components/NewsLetterBox";
import Title from "../components/Title";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // HANDLE FORM SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      await emailjs.send(
        "service_4p00v93",
        "template_wtul4vg",
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        },
        {
          publicKey: "oGiPupD0J8VKfoVl8",
        }
      );

      // Success
      setSuccess(true);

      // Clear form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("EmailJS Error:", error);

      setError(
        "Sorry, your message could not be sent. Please try again or contact us on WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // WHATSAPP
  // =====================================================

  const whatsappNumber = "919709628329";

  const whatsappMessage = encodeURIComponent(
    "Hello ZaykaNest! 👋\n\nI want to place an order. Please help me with the available food items and ordering process."
  );

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">

      {/* =====================================================
          PAGE TITLE
      ====================================================== */}

      <div className="text-center">
        <Title text1={"CONTACT"} text2={"US"} />

        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-[#52665d]">
          Have a question about your order, want to give us feedback,
          or planning a bulk order? We would love to hear from you.
        </p>
      </div>

      {/* =====================================================
          QUICK ORDER BANNER
      ====================================================== */}

      <div className="relative mt-8 overflow-hidden rounded-3xl border border-[#2d6756]/15 bg-linear-to-r from-[#123d30] via-[#1d4d3e] to-[#2d6756] p-5 text-center text-[#fffaf2] shadow-[0_20px_45px_-28px_rgba(18,61,48,0.55)] sm:p-8">

        <div className="absolute -right-10 -top-16 w-44 h-44 bg-white/10 rounded-full blur-2xl" />

        <div className="absolute -left-10 -bottom-20 h-52 w-52 rounded-full bg-[#f3d7a1]/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-5 px-6 py-6 sm:px-8">

          <div className="text-center md:text-left">

            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/20 px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest mb-2">
              ⚡ Quick Order
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              Abhi order karna hai? 😋
            </h2>

            <p className="text-white/90 text-xs sm:text-sm mt-1 max-w-lg">
              Aap humein directly{" "}
              <span className="font-bold">
                Call ya WhatsApp
              </span>{" "}
              karke bhi order de sakte hain.
              Fast response, fresh food & ghar jaisa swaad ❤️
            </p>

          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">

            {/* WHATSAPP */}

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f3d7a1] px-5 py-3 text-sm font-bold text-[#123d30] shadow-md transition-all hover:bg-[#d9a74a] hover:shadow-lg active:scale-95"
            >
              <span className="text-lg">
                💬
              </span>

              WhatsApp Order
            </a>

            {/* CALL */}

            <a
              href="tel:+919709628329"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white px-5 py-3 text-sm font-bold text-[#123d30] shadow-md transition-all hover:bg-[#f6eedb] active:scale-95"
            >
              <span className="text-lg">
                📞
              </span>

              Call Now
            </a>

          </div>

        </div>
      </div>

      {/* =====================================================
          MAIN CONTACT SECTION
      ====================================================== */}

      <div className="flex flex-col lg:flex-row gap-12 my-12 items-stretch">

        {/* ===================================================
            LEFT SIDE
        ==================================================== */}

        <div className="w-full lg:w-1/2 flex flex-col justify-between bg-[#f7f1e7] border border-[#d9c9ab] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

          <div className="relative h-64 sm:h-80 overflow-hidden">

            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop"
              alt="Cloud Kitchen Operations"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute top-4 left-4 bg-linear-to-r from-[#123d30] to-[#2d6756] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">
              Cloud Kitchen Hub
            </div>

            <div className="absolute bottom-4 left-4 right-4">

              <p className="text-white/80 text-[10px] uppercase tracking-widest font-semibold">
                Fresh • Authentic • Homemade
              </p>

              <h3 className="text-white text-xl sm:text-2xl font-black mt-1">
                Ghar Jaisa Swaad ❤️
              </h3>

            </div>

          </div>

          {/* CONTACT DETAILS */}

          <div className="p-6 sm:p-8 flex flex-col gap-4 text-[#365548] text-sm">

            <div>

              <p className="font-bold text-[#123d30] text-base mb-1">
                📍 Our Kitchen Location
              </p>

              <p className="text-[#52665d] leading-relaxed">
                U-59 Bali Apartment, DLF Phase-3,
                <br />
                Gurugram, Haryana 122002
              </p>

            </div>

            <hr className="my-1 border-[#d9c9ab]/70" />

            <div className="flex flex-col gap-3">

              {/* PHONE */}

              <p className="flex items-center gap-2 font-semibold text-[#2a1f1d]">

                <span>
                  📞 Tel:
                </span>

                <a
                  href="tel:+919709628329"
                  className="text-[#123d30] hover:text-[#1d4d3e] transition-colors"
                >
                  +91 97096 28329
                </a>

              </p>

              {/* EMAIL */}

              {/* <p className="text-gray-800 font-semibold flex items-center gap-2">

                <span>
                  ✉️ Email:
                </span>

                <a
                  href="mailto:araag.khana.khazana@gmail.com"
                  className="text-gray-600 hover:text-orange-600 transition-colors"
                >
                  araag.khana.khazana@gmail.com
                </a>

              </p> */}

              {/* HOURS */}

              <p className="flex items-start gap-2 font-semibold text-[#2a1f1d]">

                <span>
                  🕒 Hours:
                </span>

                <span className="font-normal text-[#52665d]">
                  Mon - Sun
                  {" "}
                  (10:00 AM - 11:30 PM)
                </span>

              </p>

            </div>

            {/* WHATSAPP */}

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#2d6756]/25 bg-[#e8f0e9] py-3 text-sm font-bold text-[#123d30] transition-all hover:bg-[#dce9df] active:scale-[0.98]"
            >
              💬 Chat with us on WhatsApp
            </a>

            <p className="text-center text-[11px] text-[#718078]">
              Need help choosing your meal? Just ask us! 😊
            </p>

          </div>
        </div>

        {/* ===================================================
            CONTACT FORM
        ==================================================== */}

        <div className="flex w-full flex-col justify-center rounded-3xl border border-[#d9c9ab]/70 bg-[#fffdf8] p-6 shadow-[0_16px_45px_-36px_rgba(18,61,48,0.35)] sm:p-8 lg:w-1/2">

          <div className="mb-6">

            <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-[#123d30] bg-[#dfeae4] px-3 py-1 rounded-full mb-2">
              We'd love to hear from you
            </span>

            <h3 className="text-xl font-bold text-[#123d30]">
              Send Us a Message
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-[#617168]">
              For catering inquiries, feedback, bulk orders,
              or any questions, drop us a message below.
            </p>

          </div>

          {/* SUCCESS MESSAGE */}

          {success && (
            <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3">

              <p className="text-sm font-semibold text-green-700">
                ✅ Message sent successfully!
              </p>

              <p className="text-xs text-green-600 mt-1">
                Thank you for contacting us. We'll get back to you soon.
              </p>

            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3">

              <p className="text-sm font-semibold text-red-700">
                ❌ Unable to send message
              </p>

              <p className="text-xs text-red-600 mt-1">
                {error}
              </p>

            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >

            {/* NAME */}

            <div>

              <label className="mb-1 block text-xs font-semibold text-[#3f554b]">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-[#d9c9ab] bg-[#fffefa] px-4 py-2.5 text-sm text-[#2a1f1d] placeholder:text-[#8b938b] transition-all focus:border-[#2d6756] focus:outline-none focus:ring-2 focus:ring-[#2d6756]/15"
              />

            </div>

            {/* EMAIL + PHONE */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>

                <label className="mb-1 block text-xs font-semibold text-[#3f554b]">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-[#d9c9ab] bg-[#fffefa] px-4 py-2.5 text-sm text-[#2a1f1d] placeholder:text-[#8b938b] transition-all focus:border-[#2d6756] focus:outline-none focus:ring-2 focus:ring-[#2d6756]/15"
                />

              </div>

              <div>

                <label className="mb-1 block text-xs font-semibold text-[#3f554b]">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full rounded-xl border border-[#d9c9ab] bg-[#fffefa] px-4 py-2.5 text-sm text-[#2a1f1d] placeholder:text-[#8b938b] transition-all focus:border-[#2d6756] focus:outline-none focus:ring-2 focus:ring-[#2d6756]/15"
                />

              </div>

            </div>

            {/* MESSAGE */}

            <div>

              <label className="mb-1 block text-xs font-semibold text-[#3f554b]">
                Message
              </label>

              <textarea
                name="message"
                rows="4"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you today?"
                className="w-full resize-none rounded-xl border border-[#d9c9ab] bg-[#fffefa] px-4 py-2.5 text-sm text-[#2a1f1d] placeholder:text-[#8b938b] transition-all focus:border-[#2d6756] focus:outline-none focus:ring-2 focus:ring-[#2d6756]/15"
              />

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className={`text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-sm text-sm mt-2 ${
                loading
                  ? "bg-[#2d6756] cursor-not-allowed"
                  : "bg-linear-to-r from-[#123d30] to-[#2d6756] active:scale-95"
              }`}
            >

              {loading
                ? "Sending..."
                : "Send Inquiry →"}

            </button>

          </form>

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#718078]">

            <span>
              🔒
            </span>

            <span>
              Your information is safe with us.
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          BOTTOM MESSAGE
      ====================================================== */}

      <div className="text-center mb-10">

        <p className="text-sm text-[#52665d]">
          Good food tastes better when shared. ❤️
        </p>

        <p className="mt-1 text-xs text-[#718078]">
          Thank you for choosing us for your meals.
        </p>

      </div>

      <NewsLetterBox />

    </main>
  );
};

export default Contact;
