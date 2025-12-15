import { Link } from "react-router-dom";
import {
  ChefHat,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="text-[#f3f4f6] bg-[#30231d]"
    >
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div
                className="w-10 h-10 bg-[#df603a] rounded-xl flex items-center justify-center"
              >
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold playfair-font">
                Local Chef
                <span className="text-[#df603a]"> Bazaar</span>
              </span>
            </Link>

            <p
              className="text-sm leading-relaxed text-[#b7aba4]"
            >
              Connecting home cooks with food lovers. Fresh, homemade meals
              delivered to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {["Home", "Meals", "About Us", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase().replace(" ", "-")}`}
                    className="hover:underline text-[#AFA9A5]"
                    
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin
                  className="w-4 h-4 text-[#df603a]"
                />
                <span className="text-[#AFA9A5]">
                  123 Food Street, Dhaka, Bangladesh
                </span>
              </li>
              <li className="flex gap-3">
                <Phone
                  className="w-4 h-4 text-[#df603a]"
                />
                <span className="text-[#AFA9A5]">
                  +880 1234 567890
                </span>
              </li>
              <li className="flex gap-3">
                <Mail
                  className="w-4 h-4 text-[#df603a]"
                />
                <span className="text-[#AFA9A5]">
                  hello@localchefbazaar.com
                </span>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Working Hours</h4>
            <ul
              className="space-y-2 text-sm"
              
            >
              <li className="flex justify-between text-[#AFA9A5]">
                <span>Monday - Friday</span>
                <span>8:00 AM - 10:00 PM</span>
              </li>
              <li className="flex justify-between text-[#AFA9A5]">
                <span>Saturday</span>
                <span>9:00 AM - 11:00 PM</span>
              </li>
              <li className="flex justify-between text-[#AFA9A5]">
                <span>Sunday</span>
                <span>10:00 AM - 9:00 PM</span>
              </li>
            </ul>

            {/* Social */}
            <div className="flex gap-4 mt-6">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-[#df603a]"
                >
                  <Icon size={16} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-12 pt-8 text-center text-sm border-t border-gray-400/20 text-[#AFA9A5]"
        >
          © {new Date().getFullYear()} LocalChefBazaar. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
