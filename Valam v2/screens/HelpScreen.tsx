import { useState } from 'react';
import { useApp } from '../context';
import { Card } from '../components/ui';
import { ScreenHeader } from '../components/Layout';

const FAQS = [
  { q: "How does the Crop Estimator work?", a: "The Estimator analyses your soil type, district weather data, and irrigation method to recommend the most profitable crops. It scores each crop 0–100 on suitability and shows estimated yield and revenue." },
  { q: "Is my farm data stored securely?", a: "Yes. All your farm data is stored locally on your device. VALAM does not share your personal or farm data with third parties without your consent." },
  { q: "How do I book a soil test?", a: "Go to Home screen and tap 'Book Soil Test', or open the Estimator and complete Step 5 (Soil Test). A certified TNAU officer will visit your farm within 3 business days." },
  { q: "What is the Provider Dashboard?", a: "Providers are verified agricultural service vendors (tractors, labour, inputs). They get a separate login with a Provider Access Code issued by VALAM after verification." },
  { q: "How do Scheme applications work?", a: "Tap 'Apply' on any eligible scheme — it redirects you to the official government portal where you can complete the application. VALAM does not process applications directly." },
  { q: "What happens when I send a market enquiry?", a: "Your interest (crop, quantity, mandi) is sent to the market provider's dashboard. They will call you within 24 hours to confirm the deal." },
  { q: "Can I use VALAM in Tamil or Hindi?", a: "Yes! Go to Profile → Language and switch to தமிழ் or हिंदी. The app will refresh immediately in your chosen language." },
];

export default function HelpScreen() {
  const { back, showToast } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!name.trim() || !message.trim()) {
      showToast('Please fill in your name and message', 'error');
      return;
    }
    setSent(true);
    showToast('Message sent! We will respond within 24 hours.', 'success');
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      <ScreenHeader title="Help & Contact" back={back} />

      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-4">

        {/* Contact options */}
        <div className="grid grid-cols-2 gap-3">
          <a href="tel:+918000123456" className="flex flex-col items-center gap-2 p-4 bg-white border border-border rounded-[16px] hover:border-primary/40 transition-colors">
            <span className="text-2xl">📞</span>
            <span className="text-sm font-bold text-text">Call Support</span>
            <span className="text-xs text-muted text-center">Mon–Sat 9am–6pm</span>
            <span className="text-xs font-semibold text-primary">1800-103-7693</span>
          </a>
          <a href="https://wa.me/918000123456" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-4 bg-white border border-border rounded-[16px] hover:border-green-400/60 transition-colors">
            <span className="text-2xl">💬</span>
            <span className="text-sm font-bold text-text">WhatsApp</span>
            <span className="text-xs text-muted text-center">Chat with us anytime</span>
            <span className="text-xs font-semibold text-green-600">Open WhatsApp</span>
          </a>
        </div>

        {/* FAQ */}
        <div>
          <h3 className="font-bold text-text mb-3">Frequently Asked Questions</h3>
          <div className="flex flex-col gap-2">
            {FAQS.map((faq, i) => (
              <Card key={i} padding="none" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span className="text-sm font-semibold text-text flex-1 text-left">{faq.q}</span>
                  <span className="text-muted text-sm flex-shrink-0">{openFaq === i ? '▲' : '▼'}</span>
                </div>
                {openFaq === i && (
                  <div className="px-4 pb-4 border-t border-border/50 pt-3">
                    <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div>
          <h3 className="font-bold text-text mb-3">Send us a Message</h3>
          {sent ? (
            <Card className="text-center py-8 bg-green-50 border-green-200">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-bold text-green-800">Message Sent!</p>
              <p className="text-sm text-green-600 mt-1">Our team will get back to you within 24 hours.</p>
            </Card>
          ) : (
            <Card>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Arjun Kumar"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-[12px] border border-border bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Describe your issue or question..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-[12px] border border-border bg-surface-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  />
                </div>
                <button
                  onClick={handleSend}
                  className="w-full py-3.5 bg-primary text-white font-bold rounded-[14px] hover:bg-primary-dark transition-colors"
                >
                  Send Message
                </button>
              </div>
            </Card>
          )}
        </div>

        <Card className="bg-surface-2" padding="sm">
          <p className="text-xs text-muted text-center">VALAM Support · support@valam.in · v1.0</p>
          <p className="text-xs text-muted text-center mt-0.5">Built for farmers of India 🇮🇳</p>
        </Card>
      </div>
    </div>
  );
}
