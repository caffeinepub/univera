import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Mail,
  MessageCircle,
  Search,
  Send,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const BUSINESS_EMAIL = "dating.univera@gmail.com";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  id: string;
  emoji: string;
  title: string;
  items: FaqItem[];
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "account",
    emoji: "✅",
    title: "Account & Verification",
    items: [
      {
        q: "How do I verify my account?",
        a: 'Go to your Profile tab, tap "Verify Profile", and follow the selfie verification steps. Once reviewed, you\'ll receive a blue checkmark badge. Only verified students with @dgu.ac.in emails can access UNIVÈRA.',
      },
      {
        q: "What email can I use to sign up?",
        a: "Only @dgu.ac.in university email addresses are accepted. This ensures all users are verified DBS Global University students.",
      },
      {
        q: "How long does verification take?",
        a: "Selfie verification is typically reviewed within 24 hours. You'll receive an in-app notification once approved.",
      },
    ],
  },
  {
    id: "swipes",
    emoji: "💘",
    title: "Swipes & Likes",
    items: [
      {
        q: "How do swipes work?",
        a: "Swipe right (or tap the heart button) to like someone, swipe left (or tap X) to pass. If they like you back, it's a match!",
      },
      {
        q: "How many likes do I get per day?",
        a: "Free users get 5 likes per day. You can earn bonus likes by watching short ads (up to 3 ads/day). Pro users get unlimited likes.",
      },
      {
        q: "What is a Super Like?",
        a: "A Super Like (star button) lets someone know you're especially interested. They'll see a special notification. Free users get 1 Super Like per day.",
      },
      {
        q: "Can I like a specific photo or prompt?",
        a: "Yes! Open someone's full profile, scroll to any photo or prompt, and tap the heart icon on that specific item. You can also add a comment.",
      },
    ],
  },
  {
    id: "billing",
    emoji: "💳",
    title: "Subscription & Billing",
    items: [
      {
        q: "What does UNIVÈRA Pro include?",
        a: "Pro includes unlimited likes, access to AI Matches, ad-free experience, and priority visibility on the swipe deck.",
      },
      {
        q: "How much does Pro cost?",
        a: "Pro is ₹199/month or ₹499/year (save ~79%). Payments are processed securely.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "You can cancel anytime from your Profile → Subscription page. Your Pro benefits continue until the end of the billing period.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. All payments are processed through secure payment gateways. We never store your card details.",
      },
    ],
  },
  {
    id: "safety",
    emoji: "🛡️",
    title: "Safety & Reporting",
    items: [
      {
        q: "How do I report a user?",
        a: 'Open their profile and tap the "..." menu, then select "Report". Choose a reason and submit. Our team reviews all reports within 24 hours.',
      },
      {
        q: "How do I block someone?",
        a: 'On any profile or in chat, tap the "..." menu and select "Block". Blocked users cannot see your profile or contact you.',
      },
      {
        q: "What happens after I report someone?",
        a: "Our moderation team reviews the report and may warn, suspend, or permanently ban the user depending on the violation.",
      },
    ],
  },
  {
    id: "chat",
    emoji: "💬",
    title: "Chat Rules",
    items: [
      {
        q: "Why can only girls message first?",
        a: "UNIVÈRA follows a Bumble-style chat rule: after a match, only the female user can send the first message. This creates a safer, more respectful environment.",
      },
      {
        q: "How long does a match last before chat expires?",
        a: "After matching, the female user has 24 hours to send the first message. If no message is sent within that time, the match expires.",
      },
      {
        q: "Can I extend the match timer?",
        a: "Pro users can extend match timers. Free users can upgrade to Pro to unlock this feature.",
      },
    ],
  },
  {
    id: "privacy",
    emoji: "🔒",
    title: "Privacy & Data",
    items: [
      {
        q: "Who can see my profile?",
        a: "Only verified UNIVÈRA users can view profiles. Your contact information is never shown to other users, even after matching.",
      },
      {
        q: "How is my data used?",
        a: "Your data is used only to power UNIVÈRA's matching and app features. We do not sell your data to third parties.",
      },
      {
        q: "Can I delete my account and data?",
        a: 'Yes. Go to Profile → Settings and select "Delete Account". All your data will be permanently removed within 30 days.',
      },
      {
        q: "Is my university email shared with matches?",
        a: "No. Your email address is never visible to other users. It's used only for verification purposes.",
      },
    ],
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  account: "✅",
  swipes: "💘",
  billing: "💳",
  safety: "🛡️",
  chat: "💬",
  privacy: "🔒",
};

function AccordionItem({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border border-border rounded-xl overflow-hidden"
      data-ocid="help.item"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3 hover:bg-muted/40 transition-colors"
        data-ocid="help.toggle"
      >
        <span className="text-sm font-semibold text-foreground">{item.q}</span>
        <span className="flex-shrink-0 text-muted-foreground">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function HelpCenter() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const query = search.trim().toLowerCase();

  const filteredSections = FAQ_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        !query ||
        item.q.toLowerCase().includes(query) ||
        item.a.toLowerCase().includes(query),
    ),
  })).filter((s) => s.items.length > 0);

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    const mailtoBody = `Name: ${name}%0AEmail: ${email}%0A%0A${encodeURIComponent(message)}`;
    const mailtoSubject = encodeURIComponent(`[UNIVÈRA Support] ${subject}`);
    window.open(
      `mailto:${BUSINESS_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`,
      "_blank",
    );
    toast.success("Opening your email client... Message ready to send! 💜");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="min-h-[100dvh] bg-app flex flex-col">
      {/* Header */}
      <header className="glass-dark px-4 py-4 flex items-center gap-3 flex-shrink-0 sticky top-0 z-20">
        <button
          type="button"
          onClick={() => navigate({ to: "/profile" })}
          className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="help.close_button"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <HelpCircle size={20} className="text-primary" />
          <h1 className="font-display text-xl font-black text-gradient-violet">
            Help Center
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div
          className="px-5 pt-6 pb-8 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(236,72,153,0.08) 100%)",
          }}
        >
          <div className="text-4xl mb-3">💜</div>
          <h2 className="font-display text-2xl font-black text-foreground mb-1">
            How can we help?
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Search our FAQ or browse by category
          </p>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search help articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl"
              data-ocid="help.search_input"
            />
          </div>
        </div>

        {/* Category Grid — hidden when searching */}
        {!query && (
          <div className="px-5 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Browse by category
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {FAQ_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className="glass-card rounded-xl p-4 flex items-center gap-3 text-left hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  data-ocid="help.tab"
                >
                  <span className="text-2xl">{CATEGORY_ICONS[section.id]}</span>
                  <span className="text-sm font-semibold text-foreground leading-tight">
                    {section.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Sections */}
        <div className="px-5 mb-6 space-y-8">
          {filteredSections.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
              data-ocid="help.empty_state"
            >
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-muted-foreground text-sm">
                No results for &ldquo;{search}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-3 text-primary text-sm font-semibold hover:underline"
              >
                Clear search
              </button>
            </motion.div>
          )}
          {filteredSections.map((section) => (
            <div
              key={section.id}
              ref={(el) => {
                sectionRefs.current[section.id] = el;
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{section.emoji}</span>
                <h3 className="font-display text-lg font-black text-foreground">
                  {section.title}
                </h3>
              </div>
              <div className="space-y-2">
                {section.items.map((item, idx) => (
                  <AccordionItem
                    key={`${section.id}-${idx}`}
                    item={item}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Us */}
        <div
          className="mx-5 mb-8 rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(124,58,237,0.2)",
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(236,72,153,0.06))",
          }}
          data-ocid="help.panel"
        >
          <div className="px-5 pt-6 pb-4 text-center">
            <MessageCircle size={28} className="text-primary mx-auto mb-2" />
            <h3 className="font-display text-xl font-black text-foreground">
              Still need help?
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Our support team usually responds within 24 hours.
            </p>
            <a
              href={`mailto:${BUSINESS_EMAIL}`}
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-primary hover:underline"
              data-ocid="help.link"
            >
              <Mail size={14} />
              {BUSINESS_EMAIL}
            </a>
          </div>

          <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="help-name" className="text-xs font-semibold">
                  Name
                </Label>
                <Input
                  id="help-name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                  data-ocid="help.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="help-email" className="text-xs font-semibold">
                  Email
                </Label>
                <Input
                  id="help-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                  data-ocid="help.input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="help-subject" className="text-xs font-semibold">
                Subject
              </Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger
                  id="help-subject"
                  className="rounded-xl"
                  data-ocid="help.select"
                >
                  <SelectValue placeholder="Choose a topic..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Account Issue">Account Issue</SelectItem>
                  <SelectItem value="Billing">Billing</SelectItem>
                  <SelectItem value="Report a User">Report a User</SelectItem>
                  <SelectItem value="Technical Problem">
                    Technical Problem
                  </SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="help-message" className="text-xs font-semibold">
                Message
              </Label>
              <Textarea
                id="help-message"
                placeholder="Describe your issue or question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="rounded-xl resize-none"
                data-ocid="help.textarea"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl font-bold py-3 h-auto"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                border: "none",
                color: "white",
              }}
              data-ocid="help.submit_button"
            >
              <Send size={16} className="mr-2" />
              Send Message
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 pb-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
