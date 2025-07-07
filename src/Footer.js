import './App.css';
import './output.css';

const Footer = () => {
  return (
    <footer className="footer-babypink text-primary py-6 mt-10" style={{ background: 'var(--primary-pink)' }}>
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left side */}
        <div className="text-center md:text-left font-raleway">
          <div
            className="text-5xl mb-4 text-center font-bold cursor-pointer"
            style={{
              fontFamily: "'Irish Grover', system-ui",
              color: 'var(--text-accent)',
              WebkitTextStroke: '0.2px var(--accent-pink-dark)',
              textShadow: `0 0 4px #ffe4ec, 0 0 10px #ffe4ec, 0 0 20px #ffe4ec`,
              marginTop: '30px',
              transition: 'filter 0.7s ease-in-out, transform 0.7s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.2) saturate(1.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1) saturate(1)';
            }}
          >
            SafeSpace
          </div>
          <p className="text-3xl" style={{ fontFamily: 'Tilt Neon', color: 'var(--text-primary)' }}>
            Made with 💖 for your emotional well-being.
          </p>
        </div>

        {/* Right side */}
        <div className="flex space-x-4">
          <a
            href="/privacy-policy"
            className="text-2xl" style={{ fontFamily: 'Tilt Neon', color: 'var(--text-accent)' }}
          >
            Privacy Policy
          </a>
          <a
            href="/terms-of-service"
            className="text-2xl" style={{ fontFamily: 'Tilt Neon', color: 'var(--text-accent)' }}
          >
            Terms of Service
          </a>
          <a
            href="/contact"
            className="text-2xl" style={{ fontFamily: 'Tilt Neon', color: 'var(--text-accent)' }}
          >
            Contact Us
          </a>
        </div>
        <div>
          <p
            className="text-xs block"
            style={{ fontFamily: 'Tilt Neon', color: 'var(--text-muted)', marginBottom: '20px', marginTop: '40px' }}
          >
            &copy; 2025 SafeSpace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
